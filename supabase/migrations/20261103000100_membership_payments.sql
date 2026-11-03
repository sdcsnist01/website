-- Membership payment transactions. One row per payment attempt, for audit and
-- admin reporting. The amount is copied from the fee in effect when the order
-- was created, so later fee changes never alter existing payments.
-- NOTE: created in Stage 1 but written to by the Stage 2 Cashfree integration.

create table if not exists public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  member_row_id uuid references public.sdc_members (id) on delete set null,
  full_name text not null,
  email text not null,
  roll_number text not null,
  membership_year integer,
  gateway text not null default 'cashfree' check (gateway in ('cashfree', 'razorpay')),
  gateway_order_id text not null,
  gateway_payment_id text,
  payment_method text,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed', 'cancelled')),
  status_detail text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A gateway order can only be recorded once per gateway (webhook/retry safety).
  constraint membership_payments_gateway_order_key unique (gateway, gateway_order_id)
);

-- A gateway payment ID maps to exactly one transaction row.
create unique index if not exists membership_payments_gateway_payment_key
  on public.membership_payments (gateway, gateway_payment_id)
  where gateway_payment_id is not null;

create index if not exists membership_payments_created_at_idx on public.membership_payments (created_at desc);
create index if not exists membership_payments_status_idx on public.membership_payments (status);
create index if not exists membership_payments_user_id_idx on public.membership_payments (user_id);
create index if not exists membership_payments_roll_number_idx on public.membership_payments (roll_number);
create index if not exists membership_payments_email_idx on public.membership_payments (email);

alter table public.membership_payments enable row level security;

-- Service role API only: students and anon users never read payment records directly.
revoke all on table public.membership_payments from anon, authenticated;
grant select, insert, update, delete on table public.membership_payments to service_role;

-- Backfill historical Razorpay memberships so they appear in the admin payment history.
-- Existing sdc_members rows are read only; their status and IDs are not changed.
insert into public.membership_payments (
  user_id, member_row_id, full_name, email, roll_number, membership_year,
  gateway, gateway_order_id, gateway_payment_id, amount_paise, currency,
  status, paid_at, created_at, updated_at
)
select
  m.id, m.id, m.full_name, m.email, m.roll_number, m.membership_year,
  'razorpay', m.razorpay_order_id, m.razorpay_payment_id, m.amount_paise, m.currency,
  case m.status when 'active' then 'successful' when 'failed' then 'failed' else 'pending' end,
  case when m.status = 'active' then m.updated_at end,
  m.created_at, m.updated_at
from public.sdc_members m
where m.razorpay_order_id is not null
on conflict (gateway, gateway_order_id) do nothing;
