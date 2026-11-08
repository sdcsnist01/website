-- Membership fee configuration and fee change history.
-- The amount is stored in paise (₹199 = 19900). Reads and writes go through the
-- service role API only; no anon or authenticated policies are created.

create table if not exists public.membership_settings (
  id text primary key default 'default' check (id = 'default'),
  fee_paise integer not null check (fee_paise between 100 and 10000000),
  currency text not null default 'INR' check (currency = 'INR'),
  payments_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.membership_fee_history (
  id bigint generated always as identity primary key,
  settings_id text not null default 'default' references public.membership_settings (id),
  previous_fee_paise integer not null check (previous_fee_paise > 0),
  new_fee_paise integer not null check (new_fee_paise > 0),
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now(),
  check (previous_fee_paise <> new_fee_paise)
);

create index if not exists membership_fee_history_changed_at_idx
  on public.membership_fee_history (changed_at desc);

alter table public.membership_settings enable row level security;
alter table public.membership_fee_history enable row level security;

revoke all on table public.membership_settings from anon, authenticated;
revoke all on table public.membership_fee_history from anon, authenticated;
grant select, insert, update, delete on table public.membership_settings to service_role;
grant select, insert, update, delete on table public.membership_fee_history to service_role;

-- Initial membership fee: ₹199.
insert into public.membership_settings (id, fee_paise, payments_enabled)
values ('default', 19900, true)
on conflict (id) do nothing;

-- Updates the settings row and writes a history row in one transaction.
-- The row lock keeps concurrent admin edits from losing a history entry.
create or replace function public.update_membership_settings(
  p_fee_paise integer,
  p_payments_enabled boolean,
  p_changed_by uuid
)
returns public.membership_settings
language plpgsql
set search_path = public
as $$
declare
  current_row public.membership_settings;
  updated_row public.membership_settings;
begin
  select * into current_row
  from public.membership_settings
  where id = 'default'
  for update;

  update public.membership_settings
  set fee_paise = p_fee_paise,
      payments_enabled = p_payments_enabled,
      updated_at = now(),
      updated_by = p_changed_by
  where id = 'default'
  returning * into updated_row;

  if current_row.fee_paise <> updated_row.fee_paise then
    insert into public.membership_fee_history (settings_id, previous_fee_paise, new_fee_paise, changed_by)
    values ('default', current_row.fee_paise, updated_row.fee_paise, p_changed_by);
  end if;

  return updated_row;
end;
$$;

revoke execute on function public.update_membership_settings(integer, boolean, uuid) from public, anon, authenticated;
grant execute on function public.update_membership_settings(integer, boolean, uuid) to service_role;
