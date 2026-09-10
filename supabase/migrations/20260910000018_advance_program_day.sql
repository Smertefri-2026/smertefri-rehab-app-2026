-- ============================================================================
-- 0018: advance_program_day() — la kunden gå videre til neste programdag
--
-- workout_completions har completions_insert_own (kunden logger selv), men
-- program_assignments har bare assignments_write_assigned_trainer. Kunden
-- kunne derfor logge en økt uten at «dagens dag» beveget seg. Denne RPC-en
-- flytter current_day_index framover (syklisk), og kan kalles av kunden for
-- egen aktiv tildeling — eller av trener/admin.
-- ============================================================================

create or replace function advance_program_day(p_assignment_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid;
  v_program uuid;
  v_current integer;
  v_count integer;
  v_next integer;
begin
  select client_id, program_id, current_day_index
    into v_client, v_program, v_current
  from program_assignments
  where id = p_assignment_id and status = 'active';

  if v_client is null then
    raise exception 'fant ingen aktiv tildeling';
  end if;

  if not (v_client = auth.uid() or is_assigned_trainer_of(v_client) or is_admin()) then
    raise exception 'ingen tilgang til denne tildelingen';
  end if;

  select count(*) into v_count from program_days where program_id = v_program;
  if v_count = 0 then
    v_count := 1;
  end if;

  v_next := (v_current % v_count) + 1;

  update program_assignments
  set current_day_index = v_next
  where id = p_assignment_id;

  return v_next;
end;
$$;

revoke execute on function advance_program_day(uuid) from anon;
