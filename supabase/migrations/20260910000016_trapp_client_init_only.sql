-- ============================================================================
-- 0016: Kunden kan bare initialisere sin egen Trapp, ikke flytte seg selv
--
-- transition_trapp_stage tillot v_is_self for enhver overgang. Per
-- produktmodellen (Master Build Plan pkt. 5/6) krever ethvert trinnbytte
-- i Trappen en trener/admin. Kunden får bare sette startpunktet (Ro) én
-- gang, når de ikke har noen state fra før.
-- ============================================================================

create or replace function transition_trapp_stage(
  p_client_id uuid,
  p_to_stage trapp_stage,
  p_reason text,
  p_maintenance_mode boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_stage trapp_stage;
  v_is_self boolean;
begin
  v_is_self := (p_client_id = auth.uid());

  select current_stage into v_from_stage from trapp_state where client_id = p_client_id;

  if is_assigned_trainer_of(p_client_id) or is_admin() then
    -- fri tilgang
    null;
  elsif v_is_self and v_from_stage is null and p_to_stage = 'ro' then
    -- kunden setter startpunktet sitt
    null;
  else
    raise exception 'kun rehabtrener/admin kan endre Trapp-trinn';
  end if;

  insert into trapp_state (client_id, current_stage, is_maintenance_mode, entered_stage_at)
  values (p_client_id, p_to_stage, p_maintenance_mode, now())
  on conflict (client_id) do update
    set current_stage = excluded.current_stage,
        is_maintenance_mode = excluded.is_maintenance_mode,
        entered_stage_at = now();

  insert into trapp_stage_history (client_id, from_stage, to_stage, reason, triggered_by)
  values (p_client_id, v_from_stage, p_to_stage, p_reason, auth.uid());
end;
$$;
