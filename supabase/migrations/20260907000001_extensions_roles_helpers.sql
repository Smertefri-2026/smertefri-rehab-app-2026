-- ============================================================================
-- 0001: Extensions, roles, and shared trigger helper
--
-- Design note (see Master Build Plan pkt. 12/13): this is a deliberately
-- fresh, normalized schema for nye SmerteFri — not a blind reconstruction
-- of the old (deleted) database. Table/column names are chosen for the new
-- product, informed by what the old codebase's queries needed, not copied
-- verbatim from it.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------------------
-- Trainers are no longer a self-service marketplace role a user can just
-- pick at signup (see pkt. 3/4 of the plan) — every new user starts as a
-- client; becoming a trainer requires an approved application (0003).
create type app_role as enum ('client', 'trainer', 'admin');

-- ----------------------------------------------------------------------------
-- updated_at trigger helper (reused by every table below with an updated_at
-- column, so we don't repeat this function per-table)
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- NB: the RLS helper functions (current_app_role(), is_admin(),
-- is_assigned_trainer_of()) are NOT defined here even though they're
-- conceptually "shared helpers" — PostgreSQL validates a LANGUAGE SQL
-- function's body against the catalog at CREATE FUNCTION time, and none
-- of the tables they query (profiles, client_trainer_assignments) exist
-- yet at this point in the migration order. current_app_role()/is_admin()
-- are defined in 0002 right after `profiles` is created;
-- is_assigned_trainer_of() is defined in 0003 after
-- client_trainer_assignments exists.
