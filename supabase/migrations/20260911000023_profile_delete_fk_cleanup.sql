-- ============================================================================
-- 0023: Fix missing ON DELETE actions on FKs to profiles(id) so a user can
-- actually be deleted (GDPR "rett til sletting") without manual SQL surgery
-- first. Found live: deleting a test profile failed twice in a row on
-- bookings_client_id_fkey, then chat_threads_created_by_fkey.
--
-- Two categories:
--  - Core relationship columns (booking parties, message sender, order
--    owner): CASCADE — the row has no meaning without this person.
--  - Attribution/audit columns (who approved/assigned/triggered/overrode
--    something): SET NULL — keep the historical row, just anonymize who
--    did it. All of these were already nullable.
-- ============================================================================

do $$
declare
  fk record;
  spec record;
begin
  for spec in
    select * from (values
      ('bookings', 'trainer_id', 'cascade'),
      ('bookings', 'client_id', 'cascade'),
      ('chat_messages', 'sender_id', 'cascade'),
      ('orders', 'client_id', 'cascade'),
      ('exercises', 'created_by', 'set null'),
      ('programs', 'created_by', 'set null'),
      ('program_assignments', 'assigned_by', 'set null'),
      ('pain_entries', 'created_by', 'set null'),
      ('test_sessions', 'created_by', 'set null'),
      ('trainer_applications', 'reviewed_by', 'set null'),
      ('client_trainer_assignments', 'assigned_by', 'set null'),
      ('zone_history', 'overridden_by', 'set null'),
      ('trapp_stage_history', 'triggered_by', 'set null'),
      ('admin_audit_log', 'actor_id', 'set null'),
      ('chat_threads', 'created_by', 'set null'),
      ('calibrator_events', 'trainer_id', 'set null')
    ) as t(tbl, col, action)
  loop
    for fk in
      select con.conname
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_attribute att
        on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
      where con.contype = 'f'
        and rel.relname = spec.tbl
        and att.attname = spec.col
        and con.confrelid = 'profiles'::regclass
    loop
      execute format('alter table %I drop constraint %I', spec.tbl, fk.conname);
    end loop;

    execute format(
      'alter table %I add constraint %I foreign key (%I) references profiles(id) on delete %s',
      spec.tbl, spec.tbl || '_' || spec.col || '_fkey', spec.col, spec.action
    );
  end loop;
end $$;
