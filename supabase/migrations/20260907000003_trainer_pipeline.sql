-- ============================================================================
-- 0003: Trainer pipeline — application, approval, and client assignment
--
-- This is the replacement for the old open marketplace (listTrainers /
-- set_my_trainer, where any user could self-register as a bookable trainer
-- and any client could browse and pick one). Nye SmerteFri instead:
--   søker -> admin vurderer -> godkjent -> aktiv/inaktiv -> klienttildeling
-- No client ever chooses their own trainer; SmerteFri assigns one.
-- ============================================================================

create type trainer_application_status as enum ('pending', 'approved', 'rejected');
create type trainer_status as enum ('active', 'inactive');
create type assignment_status as enum ('active', 'ended');

-- ----------------------------------------------------------------------------
-- trainer_applications — søker
-- ----------------------------------------------------------------------------
create table trainer_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references profiles(id) on delete cascade,
  education text,               -- e.g. "PT", "PT + Rehab Trainer"
  certifications text,
  bio text,
  years_experience integer,
  submitted_at timestamptz not null default now(),
  status trainer_application_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trainer_applications_set_updated_at
  before update on trainer_applications
  for each row execute function set_updated_at();

create index trainer_applications_status_idx on trainer_applications(status);

alter table trainer_applications enable row level security;

create policy trainer_applications_select_own
  on trainer_applications for select
  using (applicant_id = auth.uid());

create policy trainer_applications_select_admin
  on trainer_applications for select
  using (is_admin());

create policy trainer_applications_insert_own
  on trainer_applications for insert
  with check (applicant_id = auth.uid());

-- Deliberately no direct UPDATE policy: only the SECURITY DEFINER
-- review_trainer_application() RPC below can move an application out of
-- 'pending' — an applicant can't approve their own application, and an
-- admin's review is recorded consistently through one code path.

-- ----------------------------------------------------------------------------
-- Trainer-specific profile fields (competence, not marketplace visibility)
--
-- Kept separate from `profiles` rather than bolted onto it, since these
-- columns are meaningless for clients/admins and this keeps `profiles`
-- lean. One row per trainer, created when an application is approved.
-- ----------------------------------------------------------------------------
create table trainer_profiles (
  trainer_id uuid primary key references profiles(id) on delete cascade,
  bio text,
  specialties text[] not null default '{}',
  certifications text,
  status trainer_status not null default 'active',
  max_clients integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trainer_profiles_set_updated_at
  before update on trainer_profiles
  for each row execute function set_updated_at();

alter table trainer_profiles enable row level security;

-- A trainer can read/update their own competence profile (not their
-- status/max_clients — those are admin-controlled, guarded below).
create policy trainer_profiles_select_own
  on trainer_profiles for select
  using (trainer_id = auth.uid());

create policy trainer_profiles_select_admin
  on trainer_profiles for select
  using (is_admin());

-- Clients need to be able to read the profile of their own assigned
-- trainer ("Din rehabtrener") — added once client_trainer_assignments
-- exists, later in this same migration.

create policy trainer_profiles_update_own
  on trainer_profiles for update
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy trainer_profiles_update_admin
  on trainer_profiles for update
  using (is_admin());

create or replace function prevent_self_status_change()
returns trigger
language plpgsql
as $$
begin
  if (new.status is distinct from old.status or new.max_clients is distinct from old.max_clients)
     and not is_admin() then
    raise exception 'status/max_clients kan kun endres av admin';
  end if;
  return new;
end;
$$;

create trigger trainer_profiles_guard_status
  before update on trainer_profiles
  for each row execute function prevent_self_status_change();

-- ----------------------------------------------------------------------------
-- client_trainer_assignments — klienttildeling
--
-- Replaces the old client-initiated trainer_links/set_my_trainer. Rows
-- are only ever created by assign_trainer() (SECURITY DEFINER, below) —
-- never a direct client insert.
-- ----------------------------------------------------------------------------
create table client_trainer_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  trainer_id uuid not null references profiles(id) on delete cascade,
  status assignment_status not null default 'active',
  assigned_by uuid references profiles(id),
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger client_trainer_assignments_set_updated_at
  before update on client_trainer_assignments
  for each row execute function set_updated_at();

-- A client has at most one *active* assignment at a time.
create unique index client_trainer_assignments_one_active_per_client
  on client_trainer_assignments(client_id)
  where status = 'active';

create index client_trainer_assignments_trainer_idx
  on client_trainer_assignments(trainer_id) where status = 'active';

alter table client_trainer_assignments enable row level security;

create policy assignments_select_own_client
  on client_trainer_assignments for select
  using (client_id = auth.uid());

create policy assignments_select_own_trainer
  on client_trainer_assignments for select
  using (trainer_id = auth.uid());

create policy assignments_select_admin
  on client_trainer_assignments for select
  using (is_admin());

-- No direct insert/update policies — only assign_trainer()/end_assignment()
-- (SECURITY DEFINER, below) can create or change assignments.

-- Now that the table exists, define the RLS helper referenced by every
-- later migration's policies.
create or replace function is_assigned_trainer_of(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from client_trainer_assignments
    where client_id = target_client_id
      and trainer_id = auth.uid()
      and status = 'active'
  );
$$;

-- Now that is_assigned_trainer_of() exists, add the cross-role read
-- policies that depend on it.
create policy profiles_select_assigned_client
  on profiles for select
  using (is_assigned_trainer_of(id));

create policy trainer_profiles_select_assigned
  on trainer_profiles for select
  using (
    exists (
      select 1 from client_trainer_assignments
      where trainer_id = trainer_profiles.trainer_id
        and client_id = auth.uid()
        and status = 'active'
    )
  );

-- ----------------------------------------------------------------------------
-- RPCs — the only way privilege boundaries get crossed for this pipeline
-- ----------------------------------------------------------------------------

-- Admin reviews a pending application. On approval: sets profiles.role to
-- 'trainer' and creates the trainer_profiles row.
create or replace function review_trainer_application(
  p_application_id uuid,
  p_approve boolean,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_applicant_id uuid;
begin
  if not is_admin() then
    raise exception 'kun admin kan vurdere trenersøknader';
  end if;

  select applicant_id into v_applicant_id
  from trainer_applications
  where id = p_application_id and status = 'pending';

  if v_applicant_id is null then
    raise exception 'fant ingen ventende søknad med denne iden';
  end if;

  update trainer_applications
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_notes = p_notes
  where id = p_application_id;

  if p_approve then
    update profiles set role = 'trainer' where id = v_applicant_id;
    insert into trainer_profiles (trainer_id)
    values (v_applicant_id)
    on conflict (trainer_id) do nothing;
  end if;
end;
$$;

-- Admin activates/deactivates an already-approved trainer (e.g. temporary
-- leave) without re-running the whole application flow.
create or replace function set_trainer_status(p_trainer_id uuid, p_status trainer_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'kun admin kan endre trenerstatus';
  end if;

  update trainer_profiles set status = p_status where trainer_id = p_trainer_id;
end;
$$;

-- Assigns (or reassigns) a client to a trainer. Ends any existing active
-- assignment for that client first, so the "one active assignment" rule
-- always holds. Callable by admin, or by the system's own simple
-- assignment logic (see plan pkt. 3/16) running as an authenticated
-- admin-equivalent service call — never by a client choosing for
-- themselves.
create or replace function assign_trainer(
  p_client_id uuid,
  p_trainer_id uuid,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_id uuid;
begin
  if not is_admin() then
    raise exception 'kun admin/systemet kan tildele rehabtrener';
  end if;

  if not exists (
    select 1 from trainer_profiles
    where trainer_id = p_trainer_id and status = 'active'
  ) then
    raise exception 'trener er ikke aktiv';
  end if;

  update client_trainer_assignments
  set status = 'ended', ended_at = now()
  where client_id = p_client_id and status = 'active';

  insert into client_trainer_assignments (client_id, trainer_id, assigned_by, reason)
  values (p_client_id, p_trainer_id, auth.uid(), p_reason)
  returning id into v_new_id;

  return v_new_id;
end;
$$;

create or replace function end_assignment(p_client_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'kun admin/systemet kan avslutte en tildeling';
  end if;

  update client_trainer_assignments
  set status = 'ended', ended_at = now(), reason = coalesce(p_reason, reason)
  where client_id = p_client_id and status = 'active';
end;
$$;
