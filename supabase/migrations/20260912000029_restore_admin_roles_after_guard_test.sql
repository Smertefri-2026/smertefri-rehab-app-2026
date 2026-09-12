-- ============================================================================
-- 0029: Gjenopprett admin-rollen for admin@example.com og
-- oistein.solheim@gmail.com etter en manuell, reversibel verifisering av
-- "siste admin"-sperren i admin_set_user_role (0028). Begge ble midlertidig
-- satt til 'client' som del av testen; post@smertefri.no ble aldri rørt og
-- forble admin gjennom hele testen. Ren datagjenoppretting, ingen
-- funksjonsendring.
-- ============================================================================

update profiles
set role = 'admin'
where id in (
  '7d9b560b-df6e-45e1-a080-4c94e8d6cb6d', -- admin@example.com
  '22bc1c94-d5a9-42d8-b6a9-59a33cb8e1a2'  -- oistein.solheim@gmail.com
)
and role <> 'admin';
