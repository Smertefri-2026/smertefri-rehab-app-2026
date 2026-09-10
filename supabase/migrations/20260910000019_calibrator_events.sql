-- ============================================================================
-- 0019: calibrator_events — beslutningslogg for Kalibratoren
--
-- Kalibratoren er en ren, forklarbar regelmotor (src/lib/calibrator/). Den
-- *anvender* aldri et forslag selv. Hver gang treneren ser et forslag og tar
-- stilling til det, logges det her: forslaget, datagrunnlaget og trenerens
-- avgjørelse. Dette gir et ærlig revisjonsspor nå, og datagrunnlag for et
-- eventuelt framtidig, egentrent forbedringssteg (Master Build Plan pkt. 5).
-- ============================================================================

create table calibrator_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,

  -- Forslaget slik regelmotoren ga det
  suggestion_kind text not null check (suggestion_kind in ('expand', 'retreat', 'hold')),
  suggestion_rule text not null,
  headline text not null,
  reasoning text not null,
  input_snapshot jsonb not null,          -- hele CalibratorInput som lå til grunn
  fired_signals text[] not null default '{}',

  -- Trenerens avgjørelse (null = sett, men ikke tatt stilling til ennå)
  trainer_decision text check (trainer_decision in ('followed', 'dismissed')),
  trainer_id uuid references profiles(id),
  trainer_note text,
  decided_at timestamptz,

  created_at timestamptz not null default now()
);

create index calibrator_events_client_idx
  on calibrator_events(client_id, created_at desc);

alter table calibrator_events enable row level security;

-- Kunden kan lese sine egne (innsyn), men ikke skrive.
create policy calibrator_events_select_own
  on calibrator_events for select
  using (client_id = auth.uid());

create policy calibrator_events_select_assigned_trainer
  on calibrator_events for select
  using (is_assigned_trainer_of(client_id));

create policy calibrator_events_select_admin
  on calibrator_events for select
  using (is_admin());

-- Bare tildelt trener / admin skriver.
create policy calibrator_events_insert_assigned_trainer
  on calibrator_events for insert
  with check (is_assigned_trainer_of(client_id) or is_admin());

create policy calibrator_events_update_assigned_trainer
  on calibrator_events for update
  using (is_assigned_trainer_of(client_id) or is_admin())
  with check (is_assigned_trainer_of(client_id) or is_admin());
