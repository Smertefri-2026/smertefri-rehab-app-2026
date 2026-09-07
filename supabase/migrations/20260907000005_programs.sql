-- ============================================================================
-- 0005: Program-/øvelsesmotor
--
-- Did not exist at all in the old codebase (confirmed in the revisjon).
-- V1 is deliberately a small library of SmerteFri-standard templates a
-- trainer assigns and lightly adapts, not a from-scratch program builder
-- (Master Build Plan pkt. 7).
-- ============================================================================

create type completion_status as enum ('ja', 'delvis', 'nei');

-- ----------------------------------------------------------------------------
-- exercises — the shared library
-- ----------------------------------------------------------------------------
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  media_url text,
  instruction text,
  default_sets integer,
  default_reps integer,
  default_duration_sec integer,
  body_areas text[] not null default '{}',
  purposes text[] not null default '{}',       -- e.g. mobilitet, styrke, kondisjon
  relevant_stages trapp_stage[] not null default '{}',
  regression_of uuid references exercises(id),
  progression_of uuid references exercises(id),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger exercises_set_updated_at
  before update on exercises
  for each row execute function set_updated_at();

alter table exercises enable row level security;

-- Exercise library is readable by any authenticated user (it's reference
-- content, not personal data) — only trainers/admin can author it.
create policy exercises_select_authenticated
  on exercises for select
  using (auth.uid() is not null);

create policy exercises_write_trainer_or_admin
  on exercises for all
  using (current_app_role() in ('trainer', 'admin'))
  with check (current_app_role() in ('trainer', 'admin'));

-- ----------------------------------------------------------------------------
-- programs / program_days / program_day_exercises — templates
-- ----------------------------------------------------------------------------
create table programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_template boolean not null default true,
  relevant_stage trapp_stage,
  body_area text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger programs_set_updated_at
  before update on programs
  for each row execute function set_updated_at();

create table program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  day_index integer not null,
  title text,
  unique (program_id, day_index)
);

create table program_day_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references program_days(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  sort_order integer not null default 0,
  sets integer,
  reps integer,
  duration_sec integer,
  load_note text
);

alter table programs enable row level security;
alter table program_days enable row level security;
alter table program_day_exercises enable row level security;

create policy programs_select_authenticated on programs for select using (auth.uid() is not null);
create policy programs_write_trainer_or_admin on programs for all
  using (current_app_role() in ('trainer', 'admin'))
  with check (current_app_role() in ('trainer', 'admin'));

create policy program_days_select_authenticated on program_days for select using (auth.uid() is not null);
create policy program_days_write_trainer_or_admin on program_days for all
  using (current_app_role() in ('trainer', 'admin'))
  with check (current_app_role() in ('trainer', 'admin'));

create policy program_day_exercises_select_authenticated on program_day_exercises for select using (auth.uid() is not null);
create policy program_day_exercises_write_trainer_or_admin on program_day_exercises for all
  using (current_app_role() in ('trainer', 'admin'))
  with check (current_app_role() in ('trainer', 'admin'));

-- ----------------------------------------------------------------------------
-- program_assignments / workout_completions — per-client instance
-- ----------------------------------------------------------------------------
create table program_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references programs(id),
  assigned_by uuid references profiles(id),
  assigned_at timestamptz not null default now(),
  current_day_index integer not null default 1,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  updated_at timestamptz not null default now()
);

create trigger program_assignments_set_updated_at
  before update on program_assignments
  for each row execute function set_updated_at();

create unique index program_assignments_one_active_per_client
  on program_assignments(client_id)
  where status = 'active';

create table workout_completions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references program_assignments(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  completion_date date not null default current_date,
  day_index integer not null,
  status completion_status not null,
  rpe integer check (rpe between 0 and 10),
  pain_during integer check (pain_during between 0 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create index workout_completions_client_idx on workout_completions(client_id, completion_date desc);

alter table program_assignments enable row level security;
alter table workout_completions enable row level security;

create policy assignments_select_own on program_assignments for select using (client_id = auth.uid());
create policy assignments_select_assigned_trainer on program_assignments for select using (is_assigned_trainer_of(client_id));
create policy assignments_select_admin on program_assignments for select using (is_admin());
create policy assignments_write_assigned_trainer on program_assignments for all
  using (is_assigned_trainer_of(client_id) or is_admin())
  with check (is_assigned_trainer_of(client_id) or is_admin());

create policy completions_select_own on workout_completions for select using (client_id = auth.uid());
create policy completions_select_assigned_trainer on workout_completions for select using (is_assigned_trainer_of(client_id));
create policy completions_select_admin on workout_completions for select using (is_admin());
create policy completions_insert_own on workout_completions for insert with check (client_id = auth.uid());
