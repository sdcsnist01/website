-- Follow-up to 20261103000000_membership_fee_settings.sql (already applied).
-- 1. Audit history for enabling/disabling membership payments.
-- 2. update_membership_settings() raises an error if the settings row is missing,
--    and records payment enable/disable changes alongside fee changes.

create table if not exists public.membership_payment_status_history (
  id bigint generated always as identity primary key,
  settings_id text not null default 'default' references public.membership_settings (id),
  previous_payments_enabled boolean not null,
  new_payments_enabled boolean not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now(),
  check (previous_payments_enabled <> new_payments_enabled)
);

create index if not exists membership_payment_status_history_changed_at_idx
  on public.membership_payment_status_history (changed_at desc);

alter table public.membership_payment_status_history enable row level security;

-- Service role API only, matching the other membership settings tables.
revoke all on table public.membership_payment_status_history from anon, authenticated;
grant select, insert, update, delete on table public.membership_payment_status_history to service_role;

-- Same signature as before, so existing grants and callers are unaffected;
-- they are restated below anyway.
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

  if not found then
    raise exception 'membership_settings default row is missing'
      using errcode = 'P0002',
            hint = 'Re-run the seed insert from 20261103000000_membership_fee_settings.sql.';
  end if;

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

  if current_row.payments_enabled <> updated_row.payments_enabled then
    insert into public.membership_payment_status_history
      (settings_id, previous_payments_enabled, new_payments_enabled, changed_by)
    values ('default', current_row.payments_enabled, updated_row.payments_enabled, p_changed_by);
  end if;

  return updated_row;
end;
$$;

revoke execute on function public.update_membership_settings(integer, boolean, uuid) from public, anon, authenticated;
grant execute on function public.update_membership_settings(integer, boolean, uuid) to service_role;
