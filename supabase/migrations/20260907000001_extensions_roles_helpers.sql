-- ============================================================================
-- 0001: Extensions, roles, and shared helper functions
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

-- ----------------------------------------------------------------------------
-- RLS helpers
--
-- These are STABLE (not SECURITY DEFINER) — they only ever read data the
-- calling user is already allowed to see via other policies, or they read
-- from `profiles`/`client_trainer_assignments` under RLS themselves. Using
-- plain functions (not SECURITY DEFINER) here avoids accidentally granting
-- broader read access than intended; the actual privilege-crossing writes
-- (assignment, approval, zone overrides) go through explicit SECURITY
-- DEFINER RPCs defined in their own migrations instead.
-- ----------------------------------------------------------------------------

create or replace function current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

-- NB: `is_assigned_trainer_of(uuid)` is defined in migration 0003, once
-- client_trainer_assignments exists — kept there so migrations never
-- forward-reference a table that hasn't been created yet.
