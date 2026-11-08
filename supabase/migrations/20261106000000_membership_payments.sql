-- Stage 2: membership payment transactions (Cashfree), webhook audit log, and the
-- single function that applies a verified payment status and activates membership.
-- Depends on 20261103000000_membership_fee_settings.sql. Service role access only.

-- One row per gateway order. The amount is copied from membership_settings when
-- the order is created, so later fee changes never alter existing orders.
create table if not exists public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  member_id text not null,
  full_name text not null,
  email text not null,
  roll_number text not null,
  membership_year integer not null,
  gateway text not null default 'cashfree' check (gateway in ('cashfree', 'razorpay')),
  gateway_order_id text not null,
  gateway_cf_order_id text,
  gateway_payment_id text,
  payment_session_id text,
  order_expires_at timestamptz,
  payment_method text,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed', 'cancelled')),
  status_detail text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_payments_gateway_order_key unique (gateway, gateway_order_id)
);

-- A gateway payment ID can only ever be attached to one transaction row.
create unique index if not exists membership_payments_gateway_payment_key
  on public.membership_payments (gateway, gateway_payment_id)
  where gateway_payment_id is not null;

create index if not exists membership_payments_created_at_idx on public.membership_payments (created_at desc);
create index if not exists membership_payments_status_idx on public.membership_payments (status);
create index if not exists membership_payments_user_id_idx on public.membership_payments (user_id);
create index if not exists membership_payments_roll_number_idx on public.membership_payments (roll_number);
create index if not exists membership_payments_email_idx on public.membership_payments (email);

-- Every webhook delivery, for audit. Duplicate deliveries of the same event update
-- the existing row instead of adding a new one. No customer data is stored here.
create table if not exists public.membership_payment_webhook_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  gateway_order_id text not null,
  gateway_payment_id text,
  deliveries integer not null default 1,
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  constraint membership_payment_webhook_events_key
    unique nulls not distinct (event_type, gateway_order_id, gateway_payment_id)
);

create index if not exists membership_payment_webhook_events_order_idx
  on public.membership_payment_webhook_events (gateway_order_id);

alter table public.membership_payments enable row level security;
alter table public.membership_payment_webhook_events enable row level security;

revoke all on table public.membership_payments from anon, authenticated;
revoke all on table public.membership_payment_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.membership_payments to service_role;
grant select, insert, update, delete on table public.membership_payment_webhook_events to service_role;

-- Backfill completed historical Razorpay memberships so they appear in payment
-- history. sdc_members is only read; its rows, statuses and Razorpay IDs are unchanged.
-- Abandoned Razorpay attempts (status pending) are not copied.
insert into public.membership_payments (
  user_id, member_id, full_name, email, roll_number, membership_year,
  gateway, gateway_order_id, gateway_payment_id, amount_paise, currency,
  status, paid_at, created_at, updated_at
)
select
  m.id, m.member_id, m.full_name, m.email, m.roll_number, m.membership_year,
  'razorpay', m.razorpay_order_id, m.razorpay_payment_id, m.amount_paise, m.currency,
  'successful', m.updated_at, m.created_at, m.updated_at
from public.sdc_members m
where m.status = 'active'
  and m.razorpay_order_id is not null
on conflict (gateway, gateway_order_id) do nothing;

-- Records one webhook delivery. A repeat delivery of the same event increments
-- `deliveries` instead of inserting a duplicate row.
create or replace function public.record_membership_webhook_event(
  p_event_type text,
  p_gateway_order_id text,
  p_gateway_payment_id text
)
returns bigint
language plpgsql
set search_path = public
as $$
declare
  event_id bigint;
begin
  insert into public.membership_payment_webhook_events (event_type, gateway_order_id, gateway_payment_id)
  values (p_event_type, p_gateway_order_id, p_gateway_payment_id)
  on conflict on constraint membership_payment_webhook_events_key
  do update set deliveries = membership_payment_webhook_events.deliveries + 1,
                last_received_at = now()
  returning id into event_id;
  return event_id;
end;
$$;

-- Applies a status that the server has already verified with Cashfree's API.
-- Idempotent: once a row is 'successful' it never changes again, and membership is
-- activated at most once. Runs in one transaction with row locks, so a webhook and
-- the browser's return page can arrive at the same time safely.
create or replace function public.apply_membership_payment(
  p_gateway_order_id text,
  p_status text,
  p_gateway_payment_id text,
  p_payment_method text,
  p_paid_at timestamptz,
  p_status_detail text
)
returns table (final_status text, activated boolean, already_active boolean, user_id uuid)
language plpgsql
set search_path = public
as $$
declare
  payment public.membership_payments;
  member_status text;
begin
  if p_status not in ('pending', 'successful', 'failed', 'cancelled') then
    raise exception 'invalid payment status: %', p_status using errcode = '22023';
  end if;

  select * into payment
  from public.membership_payments mp
  where mp.gateway = 'cashfree' and mp.gateway_order_id = p_gateway_order_id
  for update;

  if not found then
    raise exception 'membership payment % not found', p_gateway_order_id using errcode = 'P0002';
  end if;

  -- Terminal: a successful payment is never downgraded or re-applied.
  if payment.status = 'successful' then
    return query select 'successful'::text, false, false, payment.user_id;
    return;
  end if;

  if p_status <> 'successful' then
    update public.membership_payments mp
    set status = p_status,
        gateway_payment_id = coalesce(p_gateway_payment_id, mp.gateway_payment_id),
        payment_method = coalesce(p_payment_method, mp.payment_method),
        status_detail = p_status_detail,
        updated_at = now()
    where mp.id = payment.id;
    return query select p_status, false, false, payment.user_id;
    return;
  end if;

  update public.membership_payments mp
  set status = 'successful',
      gateway_payment_id = coalesce(p_gateway_payment_id, mp.gateway_payment_id),
      payment_method = coalesce(p_payment_method, mp.payment_method),
      paid_at = coalesce(p_paid_at, now()),
      status_detail = p_status_detail,
      updated_at = now()
  where mp.id = payment.id;

  select m.status into member_status
  from public.sdc_members m
  where m.id = payment.user_id
  for update;

  if member_status = 'active' then
    -- Paid again for a membership that is already active (e.g. two open orders).
    -- The money was taken, so record it and flag it for a refund.
    update public.membership_payments mp
    set status_detail = 'Duplicate payment: membership was already active. Refund required.'
    where mp.id = payment.id;
    return query select 'successful'::text, false, true, payment.user_id;
    return;
  end if;

  update public.sdc_members m
  set status = 'active',
      amount_paise = payment.amount_paise,
      currency = payment.currency
  where m.id = payment.user_id;

  return query select 'successful'::text, true, false, payment.user_id;
end;
$$;

revoke execute on function public.record_membership_webhook_event(text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_membership_webhook_event(text, text, text) to service_role;

revoke execute on function public.apply_membership_payment(text, text, text, text, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.apply_membership_payment(text, text, text, text, timestamptz, text)
  to service_role;
