-- Shared hackathon countdown state. One row per event; the big-screen display
-- and the organizer controls both read this row via /api/hackathon-timer.
create table if not exists public.hackathon_timers (
  id text primary key,
  status text not null default 'idle' check (status in ('idle', 'running', 'paused')),
  duration_ms bigint not null check (duration_ms >= 0),
  remaining_ms bigint not null check (remaining_ms >= 0),
  ends_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.hackathon_timers enable row level security;

-- Reads and writes go through the service role API only; no anon policies.
revoke all on table public.hackathon_timers from anon, authenticated;
grant select, insert, update, delete on table public.hackathon_timers to service_role;

-- UXplosion 3.0: 8-hour build window.
insert into public.hackathon_timers (id, status, duration_ms, remaining_ms)
values ('uxplosion-3.0', 'idle', 28800000, 28800000)
on conflict (id) do nothing;
