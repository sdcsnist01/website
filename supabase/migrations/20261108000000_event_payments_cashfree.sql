-- Paid event registration moves from Razorpay to Cashfree.
-- event_registrations was created outside this migrations folder, so this file
-- only adds columns; existing rows and their Razorpay IDs are kept as they are.
-- Depends on 20261106000000_membership_payments.sql (shared webhook event log).

alter table public.event_registrations
  add column if not exists gateway text not null default 'razorpay',
  add column if not exists cashfree_order_id text,
  add column if not exists cashfree_cf_order_id text,
  add column if not exists cashfree_payment_id text,
  add column if not exists payment_session_id text,
  add column if not exists order_expires_at timestamptz,
  add column if not exists payment_method text,
  add column if not exists status_detail text,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- New rows are Cashfree; the default above only labels existing (Razorpay) rows.
alter table public.event_registrations alter column gateway set default 'cashfree';

create unique index if not exists event_registrations_cashfree_order_key
  on public.event_registrations (cashfree_order_id) where cashfree_order_id is not null;
create unique index if not exists event_registrations_cashfree_payment_key
  on public.event_registrations (cashfree_payment_id) where cashfree_payment_id is not null;
create index if not exists event_registrations_event_email_idx
  on public.event_registrations (event_id, lower(email));

-- Allow 'failed' and 'cancelled' alongside 'pending' and 'paid'. Any existing
-- status check is replaced; the new one is NOT VALID so old rows are never rejected.
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.event_registrations'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.event_registrations drop constraint %I', c.conname);
  end loop;
end;
$$;

alter table public.event_registrations
  add constraint event_registrations_status_check
  check (status in ('pending', 'paid', 'failed', 'cancelled')) not valid;

-- Applies a status the server has already verified with Cashfree's API.
-- Idempotent: once 'paid' a registration never changes, and the event's attendee
-- count is incremented exactly once, atomically, in the same transaction.
create or replace function public.apply_event_payment(
  p_cashfree_order_id text,
  p_status text,
  p_payment_id text,
  p_payment_method text,
  p_paid_at timestamptz,
  p_status_detail text
)
returns table (final_status text, confirmed boolean)
language plpgsql
set search_path = public
as $$
declare
  reg public.event_registrations;
begin
  if p_status not in ('pending', 'paid', 'failed', 'cancelled') then
    raise exception 'invalid registration status: %', p_status using errcode = '22023';
  end if;

  select * into reg
  from public.event_registrations er
  where er.cashfree_order_id = p_cashfree_order_id
  for update;

  if not found then
    raise exception 'event registration % not found', p_cashfree_order_id using errcode = 'P0002';
  end if;

  if reg.status = 'paid' then
    return query select 'paid'::text, false;
    return;
  end if;

  update public.event_registrations er
  set status = p_status,
      cashfree_payment_id = coalesce(p_payment_id, er.cashfree_payment_id),
      payment_method = coalesce(p_payment_method, er.payment_method),
      paid_at = case when p_status = 'paid' then coalesce(p_paid_at, now()) else er.paid_at end,
      status_detail = p_status_detail,
      updated_at = now()
  where er.id = reg.id;

  if p_status = 'paid' then
    update public.events e
    set attendees = coalesce(e.attendees, 0) + 1
    where e.id = reg.event_id;
    return query select 'paid'::text, true;
    return;
  end if;

  return query select p_status, false;
end;
$$;

revoke execute on function public.apply_event_payment(text, text, text, text, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.apply_event_payment(text, text, text, text, timestamptz, text)
  to service_role;
