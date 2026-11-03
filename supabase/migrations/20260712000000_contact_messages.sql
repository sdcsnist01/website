create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Public inserts go through service role API only; no anon policies.
revoke all on table public.contact_messages from anon, authenticated;
grant select, insert, update, delete on table public.contact_messages to service_role;

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
