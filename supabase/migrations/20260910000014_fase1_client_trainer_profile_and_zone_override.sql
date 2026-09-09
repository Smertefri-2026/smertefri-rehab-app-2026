-- ============================================================================
-- 0014: Fase 1 — client reads assigned trainer's profile + zone override attribution
--
-- Found while transforming the marketplace UI to the assignment model:
--
-- 1) There was no RLS policy letting a CLIENT read their assigned TRAINER's
--    `profiles` row at all — only the reverse (profiles_select_assigned_client
--    lets a trainer read an assigned client's profile, from migration 0003).
--    "Min rehabtrener" needs the client to see the trainer's name/photo/phone.
--
-- 2) trainer_overridden zone_history updates relied on the UI remembering to
--    send `overridden_by: auth.uid()` in the PATCH payload — easy to forget,
--    silently leaves the audit field null. Since zone_history's only UPDATE
--    policy (zone_update_assigned_trainer) means every UPDATE is, by RLS
--    design, performed by the assigned trainer, we can stamp this server-side
--    unconditionally instead of trusting the caller.
-- ============================================================================

create policy profiles_select_own_trainer
  on profiles for select
  using (
    exists (
      select 1 from client_trainer_assignments
      where trainer_id = profiles.id
        and client_id = auth.uid()
        and status = 'active'
    )
  );

create or replace function zone_history_set_override_meta()
returns trigger
language plpgsql
as $$
begin
  -- Only the assigned trainer can ever reach this trigger (RLS permits no
  -- other UPDATE path on zone_history), so every UPDATE is an override —
  -- attribute it to the real caller regardless of what the client sent.
  if auth.uid() is not null then
    new.overridden_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger zone_history_override_meta
  before update on zone_history
  for each row execute function zone_history_set_override_meta();
