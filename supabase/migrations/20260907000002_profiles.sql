-- ============================================================================
-- 0002: profiles
--
-- One row per auth.users row, auto-created on signup (no client-side insert
-- exists anywhere in the app, by design — matches the pattern the old
-- codebase already relied on). Every new user starts as 'client'; the
-- 'trainer' role is only ever set by admin approval (0003), never at signup.
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  birth_date date,
  avatar_url text,
  address text,
  postal_code text,
  city text,
  role app_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;

-- Everyone can read their own profile.
create policy profiles_select_own
  on profiles for select
  using (id = auth.uid());

-- A trainer can read the profile of a client they're actively assigned to
-- (policy added in 0003, after client_trainer_assignments exists — see
-- profiles_select_assigned_client below in that migration).

-- Admins can read every profile.
create policy profiles_select_admin
  on profiles for select
  using (is_admin());

-- Users can update their own profile fields. `role` itself is additionally
-- guarded below by a trigger, so this policy being row-level (not
-- column-level) doesn't allow a client to self-promote.
create policy profiles_update_own
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_update_admin
  on profiles for update
  using (is_admin());

-- Guard: prevent a client from setting their own `role` via a direct
-- profiles UPDATE (only SECURITY DEFINER functions running as the table
-- owner should ever change it).
create or replace function prevent_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'role kan kun endres av admin eller godkjenningsflyten';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on profiles
  for each row execute function prevent_self_role_change();
