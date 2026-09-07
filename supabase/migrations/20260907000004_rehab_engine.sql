-- ============================================================================
-- 0004: The rehab engine — onboarding, Sonen, Trappen
--
-- Sonen and Kalibratoren are deliberately NOT stored as opaque scores
-- computed by a black box: `zone_history` stores both the result (zone)
-- and the input snapshot that produced it, so any zone can always be
-- explained after the fact (Master Build Plan pkt. 4/5).
-- ============================================================================

create type calibration_profile as enum ('forsiktig', 'standard', 'aktiv');
create type zone as enum ('green', 'yellow', 'red');
create type trapp_stage as enum ('ro', 'kontroll', 'styrke', 'robusthet', 'frihet');

-- ----------------------------------------------------------------------------
-- onboarding_assessments — kartlegging (one per client; re-assessment
-- creates a new row rather than overwriting, so history is preserved)
-- ----------------------------------------------------------------------------
create table onboarding_assessments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,

  -- Rødt lys-screening — asked first, per pkt. 2 of the plan.
  red_flags jsonb not null default '{}'::jsonb,
  red_flag_cleared boolean not null default false,

  -- Hva ønsker du hjelp med / mål
  goal text,
  problem_area text,
  problem_duration text,
  limiting_factors text,

  -- Smerte og kontekst
  pain_intensity_now integer check (pain_intensity_now between 0 and 10),
  aggravating_factors text,
  relieving_factors text,

  -- Biopsykososialt
  activity_level text,
  fear_of_movement_score integer check (fear_of_movement_score between 0 and 10),
  sleep_quality text,
  stress_level text,

  -- Historikk
  previous_injuries text,
  previous_treatment text,

  -- Resultat av kartleggingen
  calibration_profile calibration_profile not null default 'standard',

  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger onboarding_assessments_set_updated_at
  before update on onboarding_assessments
  for each row execute function set_updated_at();

create index onboarding_assessments_client_idx on onboarding_assessments(client_id, created_at desc);

alter table onboarding_assessments enable row level security;

create policy onboarding_select_own
  on onboarding_assessments for select
  using (client_id = auth.uid());

create policy onboarding_select_assigned_trainer
  on onboarding_assessments for select
  using (is_assigned_trainer_of(client_id));

create policy onboarding_select_admin
  on onboarding_assessments for select
  using (is_admin());

create policy onboarding_insert_own
  on onboarding_assessments for insert
  with check (client_id = auth.uid());

create policy onboarding_update_own
  on onboarding_assessments for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- ----------------------------------------------------------------------------
-- daily_checkins — feeds Sonen (pkt. 4). Deliberately lightweight (~30s).
-- ----------------------------------------------------------------------------
create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  checkin_date date not null default current_date,
  pain_now integer check (pain_now between 0 and 10),
  sleep text check (sleep in ('dårlig', 'ok', 'bra')),
  energy text check (energy in ('lavt', 'ok', 'høyt')),
  new_symptom boolean not null default false,
  new_symptom_note text,
  completed_planned_activity text check (completed_planned_activity in ('ja', 'delvis', 'nei')),
  afraid_to_train boolean not null default false,
  created_at timestamptz not null default now(),

  unique (client_id, checkin_date)
);

create index daily_checkins_client_idx on daily_checkins(client_id, checkin_date desc);

alter table daily_checkins enable row level security;

create policy checkins_select_own
  on daily_checkins for select
  using (client_id = auth.uid());

create policy checkins_select_assigned_trainer
  on daily_checkins for select
  using (is_assigned_trainer_of(client_id));

create policy checkins_select_admin
  on daily_checkins for select
  using (is_admin());

create policy checkins_insert_own
  on daily_checkins for insert
  with check (client_id = auth.uid());

create policy checkins_update_own
  on daily_checkins for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- ----------------------------------------------------------------------------
-- zone_history — Sonen's daily, explainable output
-- ----------------------------------------------------------------------------
create table zone_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  zone_date date not null default current_date,
  zone zone not null,
  computed_reason text not null,       -- human-readable: which rule fired
  inputs_snapshot jsonb not null,      -- the daily_checkin + baseline used
  trainer_overridden boolean not null default false,
  trainer_override_note text,
  overridden_by uuid references profiles(id),
  created_at timestamptz not null default now(),

  unique (client_id, zone_date)
);

create index zone_history_client_idx on zone_history(client_id, zone_date desc);

alter table zone_history enable row level security;

create policy zone_select_own
  on zone_history for select
  using (client_id = auth.uid());

create policy zone_select_assigned_trainer
  on zone_history for select
  using (is_assigned_trainer_of(client_id));

create policy zone_select_admin
  on zone_history for select
  using (is_admin());

-- Zone rows are written server-side by the Kalibrator rule engine
-- (src/lib/calibrator/, running with the caller's own session — a client
-- computing their own day's zone is legitimate) or by a trainer applying
-- an override.
create policy zone_insert_own
  on zone_history for insert
  with check (client_id = auth.uid());

create policy zone_update_assigned_trainer
  on zone_history for update
  using (is_assigned_trainer_of(client_id))
  with check (is_assigned_trainer_of(client_id));

-- ----------------------------------------------------------------------------
-- trapp_state — current stage + history of transitions
-- ----------------------------------------------------------------------------
create table trapp_state (
  client_id uuid primary key references profiles(id) on delete cascade,
  current_stage trapp_stage not null default 'ro',
  is_maintenance_mode boolean not null default false,
  entered_stage_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trapp_state_set_updated_at
  before update on trapp_state
  for each row execute function set_updated_at();

create table trapp_stage_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  from_stage trapp_stage,
  to_stage trapp_stage not null,
  reason text not null,             -- e.g. "bestått bevegelseskvalitetstest", "retrettregel"
  triggered_by uuid references profiles(id),  -- null = automatisk
  created_at timestamptz not null default now()
);

create index trapp_stage_history_client_idx on trapp_stage_history(client_id, created_at desc);

alter table trapp_state enable row level security;
alter table trapp_stage_history enable row level security;

create policy trapp_state_select_own on trapp_state for select using (client_id = auth.uid());
create policy trapp_state_select_assigned_trainer on trapp_state for select using (is_assigned_trainer_of(client_id));
create policy trapp_state_select_admin on trapp_state for select using (is_admin());

create policy trapp_history_select_own on trapp_stage_history for select using (client_id = auth.uid());
create policy trapp_history_select_assigned_trainer on trapp_stage_history for select using (is_assigned_trainer_of(client_id));
create policy trapp_history_select_admin on trapp_stage_history for select using (is_admin());

-- Stage transitions always go through this RPC so trapp_state and
-- trapp_stage_history never drift apart, and so we can enforce "any
-- regression or Trappen-trinn change requires trener-bekreftelse" later
-- by gating who's allowed to call it with which reason (see Kalibratoren
-- V1, pkt. 5 — the app layer decides when a transition needs trainer
-- confirmation before calling this; this function just applies it once
-- decided).
create or replace function transition_trapp_stage(
  p_client_id uuid,
  p_to_stage trapp_stage,
  p_reason text,
  p_maintenance_mode boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_stage trapp_stage;
  v_is_self boolean;
begin
  v_is_self := (p_client_id = auth.uid());

  if not (v_is_self or is_assigned_trainer_of(p_client_id) or is_admin()) then
    raise exception 'ingen tilgang til å endre denne kundens Trapp-trinn';
  end if;

  select current_stage into v_from_stage from trapp_state where client_id = p_client_id;

  insert into trapp_state (client_id, current_stage, is_maintenance_mode, entered_stage_at)
  values (p_client_id, p_to_stage, p_maintenance_mode, now())
  on conflict (client_id) do update
    set current_stage = excluded.current_stage,
        is_maintenance_mode = excluded.is_maintenance_mode,
        entered_stage_at = now();

  insert into trapp_stage_history (client_id, from_stage, to_stage, reason, triggered_by)
  values (p_client_id, v_from_stage, p_to_stage, p_reason, auth.uid());
end;
$$;
