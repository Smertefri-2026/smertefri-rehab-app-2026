-- ============================================================================
-- 0020: set_calibration_profile — trener kan justere kalibreringsprofilen
--
-- Kalibreringsprofilen foreslås ved kartleggingen ut fra screeningsvar, men
-- er «justerbar av trener» (Master Build Plan pkt. 5). onboarding_assessments
-- kan bare skrives av kunden selv (RLS), så trener-justeringen går gjennom
-- denne SECURITY DEFINER-RPC-en — samme mønster som Trapp-overganger.
-- ============================================================================

create or replace function set_calibration_profile(
  p_client_id uuid,
  p_profile calibration_profile
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_id uuid;
begin
  if not (is_assigned_trainer_of(p_client_id) or is_admin()) then
    raise exception 'kun tildelt rehabtrener eller admin kan endre kalibreringsprofilen';
  end if;

  select id into v_row_id
  from onboarding_assessments
  where client_id = p_client_id and completed_at is not null
  order by created_at desc
  limit 1;

  if v_row_id is null then
    raise exception 'kunden har ingen fullført kartlegging å justere';
  end if;

  update onboarding_assessments
  set calibration_profile = p_profile,
      updated_at = now()
  where id = v_row_id;
end;
$$;

revoke execute on function set_calibration_profile(uuid, calibration_profile) from anon;
