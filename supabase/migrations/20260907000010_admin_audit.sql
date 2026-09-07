-- ============================================================================
-- 0010: Admin — audit log
--
-- Every admin action that crosses a privilege boundary in this schema
-- already goes through a SECURITY DEFINER RPC (review_trainer_application,
-- set_trainer_status, assign_trainer, end_assignment, transition_trapp_stage
-- for trainer-triggered cases). This table gives those actions a durable,
-- queryable trail — important given how health-adjacent this data is
-- (Master Build Plan pkt. 10).
-- ============================================================================

create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_actor_idx on admin_audit_log(actor_id, created_at desc);
create index admin_audit_log_target_idx on admin_audit_log(target_type, target_id);

alter table admin_audit_log enable row level security;

create policy admin_audit_log_select_admin
  on admin_audit_log for select
  using (is_admin());

-- Written only through this helper, called from inside the other
-- SECURITY DEFINER RPCs (or directly by admin-only app code) — never a
-- direct client insert.
create or replace function log_admin_action(
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into admin_audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_metadata);
end;
$$;

-- Wire logging into the existing pipeline RPCs from migration 0003, now
-- that log_admin_action() exists. Redefined with `create or replace`
-- rather than editing 0003 directly, so migration history stays linear
-- and replayable.
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

  perform log_admin_action(
    case when p_approve then 'trainer_application_approved' else 'trainer_application_rejected' end,
    'trainer_application',
    p_application_id,
    jsonb_build_object('applicant_id', v_applicant_id, 'notes', p_notes)
  );
end;
$$;

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

  perform log_admin_action('trainer_status_changed', 'trainer_profile', p_trainer_id,
    jsonb_build_object('new_status', p_status));
end;
$$;

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

  perform log_admin_action('trainer_assigned', 'client_trainer_assignment', v_new_id,
    jsonb_build_object('client_id', p_client_id, 'trainer_id', p_trainer_id, 'reason', p_reason));

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

  perform log_admin_action('assignment_ended', 'client', p_client_id,
    jsonb_build_object('reason', p_reason));
end;
$$;
