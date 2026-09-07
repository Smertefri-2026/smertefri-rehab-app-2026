-- ============================================================================
-- 0006: Smerte-logg, tester, kosthold
--
-- These three were among the best-built parts of the old codebase
-- (revisjonen pkt. 11) — KEPT in shape, redefined cleanly here rather than
-- reconstructed from old queries verbatim.
-- ============================================================================

create type pain_quality as enum ('murrende', 'stikkende', 'brennende', 'strålende', 'verkende', 'strammende');
create type pain_pattern as enum ('konstant', 'episodisk', 'ved_belastning', 'morgenverst', 'etter_trening');
create type test_category as enum ('bodyweight', 'strength', 'cardio');

-- ----------------------------------------------------------------------------
-- pain_entries
-- ----------------------------------------------------------------------------
create table pain_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  area_key text not null,
  area_label text not null,
  intensity integer not null check (intensity between 0 and 10),
  quality pain_quality[] not null default '{}',
  pattern pain_pattern[] not null default '{}',
  provokes text[] not null default '{}',
  relieves text[] not null default '{}',
  function_note text,
  note text,
  is_active boolean not null default true,
  entry_date date not null default current_date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),

  unique (client_id, area_key, entry_date)
);

create index pain_entries_client_idx on pain_entries(client_id, entry_date desc);

alter table pain_entries enable row level security;

create policy pain_select_own on pain_entries for select using (client_id = auth.uid());
create policy pain_select_assigned_trainer on pain_entries for select using (is_assigned_trainer_of(client_id));
create policy pain_select_admin on pain_entries for select using (is_admin());
create policy pain_write_own on pain_entries for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());
create policy pain_write_assigned_trainer on pain_entries for all
  using (is_assigned_trainer_of(client_id))
  with check (is_assigned_trainer_of(client_id));

-- ----------------------------------------------------------------------------
-- test_sessions / test_entries
-- ----------------------------------------------------------------------------
create table test_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  category test_category not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table test_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references test_sessions(id) on delete cascade,
  metric_key text not null,
  value numeric not null,
  unit text not null,
  sort integer not null default 0,

  unique (session_id, metric_key)
);

create index test_sessions_client_idx on test_sessions(client_id, created_at desc);

alter table test_sessions enable row level security;
alter table test_entries enable row level security;

create policy test_sessions_select_own on test_sessions for select using (client_id = auth.uid());
create policy test_sessions_select_assigned_trainer on test_sessions for select using (is_assigned_trainer_of(client_id));
create policy test_sessions_select_admin on test_sessions for select using (is_admin());
create policy test_sessions_write_own on test_sessions for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());
create policy test_sessions_write_assigned_trainer on test_sessions for all
  using (is_assigned_trainer_of(client_id))
  with check (is_assigned_trainer_of(client_id));

create policy test_entries_select
  on test_entries for select
  using (
    exists (
      select 1 from test_sessions s
      where s.id = test_entries.session_id
        and (s.client_id = auth.uid() or is_assigned_trainer_of(s.client_id) or is_admin())
    )
  );
create policy test_entries_write
  on test_entries for all
  using (
    exists (
      select 1 from test_sessions s
      where s.id = test_entries.session_id
        and (s.client_id = auth.uid() or is_assigned_trainer_of(s.client_id))
    )
  )
  with check (
    exists (
      select 1 from test_sessions s
      where s.id = test_entries.session_id
        and (s.client_id = auth.uid() or is_assigned_trainer_of(s.client_id))
    )
  );

-- ----------------------------------------------------------------------------
-- nutrition_* — kept in schema per plan pkt. 12 ("parkert"), not central
-- to the V1 UI but not removed either.
-- ----------------------------------------------------------------------------
create table nutrition_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  sex text check (sex in ('male', 'female')),
  age_years integer,
  height_cm numeric,
  weight_kg numeric,
  job_activity text check (job_activity in ('low', 'medium', 'high')),
  training_activity text check (training_activity in ('none', 'light', 'moderate', 'high')),
  goal text check (goal in ('lose_fat', 'gain_muscle', 'maintain')),
  updated_at timestamptz not null default now()
);

create trigger nutrition_profiles_set_updated_at
  before update on nutrition_profiles
  for each row execute function set_updated_at();

create table nutrition_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  day_date date not null default current_date,
  calories_kcal numeric not null default 0,
  protein_g numeric not null default 0,
  fat_g numeric not null default 0,
  carbs_g numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, day_date)
);

create trigger nutrition_days_set_updated_at
  before update on nutrition_days
  for each row execute function set_updated_at();

create table nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references nutrition_days(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  meal_time timestamptz,
  source text not null default 'manual' check (source in ('manual', 'ai')),
  raw_text text,
  calories_kcal numeric not null default 0,
  protein_g numeric not null default 0,
  fat_g numeric not null default 0,
  carbs_g numeric not null default 0,
  confidence numeric,
  assumption text,
  created_at timestamptz not null default now()
);

alter table nutrition_profiles enable row level security;
alter table nutrition_days enable row level security;
alter table nutrition_meals enable row level security;

create policy nutrition_profiles_own on nutrition_profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy nutrition_profiles_assigned_trainer on nutrition_profiles for select
  using (is_assigned_trainer_of(user_id));
create policy nutrition_profiles_admin on nutrition_profiles for select using (is_admin());

create policy nutrition_days_own on nutrition_days for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy nutrition_days_assigned_trainer on nutrition_days for select
  using (is_assigned_trainer_of(user_id));
create policy nutrition_days_admin on nutrition_days for select using (is_admin());

create policy nutrition_meals_own on nutrition_meals for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy nutrition_meals_assigned_trainer on nutrition_meals for select
  using (is_assigned_trainer_of(user_id));
create policy nutrition_meals_admin on nutrition_meals for select using (is_admin());
