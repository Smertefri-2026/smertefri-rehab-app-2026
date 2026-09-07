-- ============================================================================
-- 0007: Kalender/booking — kept near-unchanged (revisjonen: the single
-- most complete, reusable engine in the old codebase). The only real
-- change is *why* a client_id/trainer_id pair is valid: it must now come
-- from an active client_trainer_assignment, not an open marketplace pick.
-- ============================================================================

create type booking_status as enum ('planned', 'confirmed', 'completed', 'cancelled');
create type booking_repeat as enum ('none', 'weekly', 'biweekly');

create table bookings (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  client_id uuid not null references profiles(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration integer not null check (duration in (15, 25, 50)),
  status booking_status not null default 'planned',
  repeat booking_repeat not null default 'none',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_time_order check (end_time > start_time)
);

create trigger bookings_set_updated_at
  before update on bookings
  for each row execute function set_updated_at();

create index bookings_trainer_idx on bookings(trainer_id, start_time);
create index bookings_client_idx on bookings(client_id, start_time);

alter table bookings enable row level security;

create policy bookings_select_own_client on bookings for select using (client_id = auth.uid());
create policy bookings_select_own_trainer on bookings for select using (trainer_id = auth.uid());
create policy bookings_select_admin on bookings for select using (is_admin());

-- Helper for the insert policy below: checks the pairing from the
-- client's side without assuming auth.uid() is the trainer.
create or replace function is_assigned_trainer_of_by_client(p_trainer_id uuid, p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from client_trainer_assignments
    where client_id = p_client_id
      and trainer_id = p_trainer_id
      and status = 'active'
  );
$$;

-- A booking may only be created between a client and a trainer they are
-- actively assigned to (or by admin, for manual scheduling).
create policy bookings_insert
  on bookings for insert
  with check (
    is_admin()
    or (client_id = auth.uid() and is_assigned_trainer_of_by_client(trainer_id, client_id))
    or (trainer_id = auth.uid() and is_assigned_trainer_of(client_id))
  );

create policy bookings_update
  on bookings for update
  using (client_id = auth.uid() or trainer_id = auth.uid() or is_admin())
  with check (client_id = auth.uid() or trainer_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- calendar_blocks — trainer's own manual holds (vacation, other
-- appointments) — kept from the old codebase's `calendar_blocks` idea.
-- ----------------------------------------------------------------------------
create table calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint calendar_blocks_time_order check (end_time > start_time)
);

create trigger calendar_blocks_set_updated_at
  before update on calendar_blocks
  for each row execute function set_updated_at();

create index calendar_blocks_trainer_idx on calendar_blocks(trainer_id, start_time);

alter table calendar_blocks enable row level security;

create policy calendar_blocks_select
  on calendar_blocks for select
  using (trainer_id = auth.uid() or is_admin());
create policy calendar_blocks_write
  on calendar_blocks for all
  using (trainer_id = auth.uid() or is_admin())
  with check (trainer_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- trainer_weekly_availability
-- ----------------------------------------------------------------------------
create table trainer_weekly_availability (
  trainer_id uuid primary key references profiles(id) on delete cascade,
  availability jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger trainer_weekly_availability_set_updated_at
  before update on trainer_weekly_availability
  for each row execute function set_updated_at();

alter table trainer_weekly_availability enable row level security;

create policy availability_select
  on trainer_weekly_availability for select
  using (true);  -- any authenticated user needs to see a trainer's open slots

create policy availability_write
  on trainer_weekly_availability for all
  using (trainer_id = auth.uid() or is_admin())
  with check (trainer_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- Realtime — enabled on the same tables as the old app (revisjonen pkt. 6)
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table calendar_blocks;
