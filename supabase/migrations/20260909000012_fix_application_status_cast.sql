-- ============================================================================
-- 0012: Fix enum cast bug in review_trainer_application()
--
-- Found during verification: the CASE expression's string literal
-- branches default to `text`, and Postgres doesn't implicitly cast that
-- to the `trainer_application_status` enum in an UPDATE ... SET context
-- inside a function body. Explicit cast fixes it.
-- ============================================================================

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
  set status = (case when p_approve then 'approved' else 'rejected' end)::trainer_application_status,
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
