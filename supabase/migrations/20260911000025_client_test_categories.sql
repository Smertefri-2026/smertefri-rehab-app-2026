-- ============================================================================
-- 0025: Rehabtrener aktiverer relevante testkategorier per kunde, i stedet
-- for at alle tre (kroppsvekt/styrke/kondisjon) alltid ligger åpne for
-- alle. Ingen data slettes eller skjules bakover i tid: en kunde som
-- allerede har test_sessions i en kategori beholder tilgang til den
-- (se bruk i TestsPage), selv uten en eksplisitt aktivering.
-- ============================================================================

create table client_test_categories (
  client_id uuid not null references profiles(id) on delete cascade,
  category test_category not null,
  enabled_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),

  primary key (client_id, category)
);

create index client_test_categories_client_idx on client_test_categories(client_id);

alter table client_test_categories enable row level security;

create policy client_test_categories_select_own
  on client_test_categories for select using (client_id = auth.uid());

create policy client_test_categories_select_assigned_trainer
  on client_test_categories for select using (is_assigned_trainer_of(client_id));

create policy client_test_categories_select_admin
  on client_test_categories for select using (is_admin());

create policy client_test_categories_write_trainer_or_admin
  on client_test_categories for all
  using (is_assigned_trainer_of(client_id) or is_admin())
  with check (is_assigned_trainer_of(client_id) or is_admin());
