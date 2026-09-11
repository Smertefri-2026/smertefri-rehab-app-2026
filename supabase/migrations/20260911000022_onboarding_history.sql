-- ============================================================================
-- 0022: onboarding_history — endringshistorikk for «Min kartlegging»
--
-- Kartleggingen skal kunne åpnes og oppdateres igjen, uten at vanlige
-- endringer ødelegger historiske data. Løsning: den fullførte
-- onboarding_assessments-raden oppdateres i ro (samme rad, stabil id — andre
-- deler av systemet leser «siste fullførte kartlegging» av den), men FØR hver
-- oppdatering snapshottes forrige tilstand hit. Rene ja/nei-rødt-lys-svar
-- endres aldri stille — det håndteres i appen (samme blokkerings-UX som ved
-- førstegangs kartlegging) og skrives kun hit når det faktisk er avklart.
-- ============================================================================

create table onboarding_history (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references onboarding_assessments(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  snapshot jsonb not null,
  changed_fields text[] not null default '{}',
  changed_at timestamptz not null default now()
);

create index onboarding_history_client_idx
  on onboarding_history(client_id, changed_at desc);

alter table onboarding_history enable row level security;

create policy onboarding_history_select_own
  on onboarding_history for select
  using (client_id = auth.uid());

create policy onboarding_history_select_assigned_trainer
  on onboarding_history for select
  using (is_assigned_trainer_of(client_id));

create policy onboarding_history_select_admin
  on onboarding_history for select
  using (is_admin());

-- Kunden logger sin egen historikk selv (samme mønster som zone_insert_own —
-- ingen privilegie-kryssing, RLS på onboarding_assessments dekker allerede
-- selve oppdateringen).
create policy onboarding_history_insert_own
  on onboarding_history for insert
  with check (client_id = auth.uid());
