-- ============================================================================
-- 0015: La kunden re-beregne sin egen Sone samme dag
--
-- zone_history har unik (client_id, zone_date) og fra 0004 kun
-- zone_insert_own + zone_update_assigned_trainer. Hvis kunden retter den
-- daglige innsjekken sin fem minutter senere, må Sonen kunne regnes på
-- nytt — men kun så lenge en trener ikke allerede har overstyrt den.
--
-- Samtidig: 0014-triggeren stemplet overridden_by = auth.uid() på ENHVER
-- update. Det er feil når det er kunden selv som re-beregner. Triggeren
-- skiller nå på hvem som oppdaterer:
--   - trener/admin  → markeres som overstyring (trainer_overridden, by)
--   - kunden selv   → ingen stempling; overstyrings­feltene låses til
--                     forrige verdi (kunden kan ikke sette dem selv)
-- ============================================================================

create or replace function zone_history_set_override_meta()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and auth.uid() <> new.client_id then
    -- Assignert trener (eneste andre som har UPDATE-tilgang) — en overstyring.
    new.trainer_overridden := true;
    new.overridden_by := auth.uid();
  else
    -- Kundens egen re-beregning: overstyrings­feltene er ikke kundens å endre.
    new.trainer_overridden := old.trainer_overridden;
    new.overridden_by := old.overridden_by;
    new.trainer_override_note := old.trainer_override_note;
  end if;
  return new;
end;
$$;

create policy zone_update_own
  on zone_history for update
  using (client_id = auth.uid() and not trainer_overridden)
  with check (client_id = auth.uid());
