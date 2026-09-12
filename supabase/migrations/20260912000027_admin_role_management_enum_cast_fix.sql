-- ============================================================================
-- 0027: Fiks admin_set_user_role (0026) — profiles.role er typen app_role
-- (enum), ikke text. UPDATE-setningen manglet cast og feilet med
-- "column "role" is of type app_role but expression is of type text".
-- ============================================================================

create or replace function admin_set_user_role(p_user_id uuid, p_new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_role text;
begin
  if not is_admin() then
    raise exception 'kun admin kan endre brukerroller';
  end if;

  if p_new_role not in ('client', 'trainer', 'admin') then
    raise exception 'ugyldig rolle: %', p_new_role;
  end if;

  if p_user_id = auth.uid() then
    raise exception 'kan ikke endre din egen rolle her — be en annen admin gjøre det';
  end if;

  select role into v_old_role from profiles where id = p_user_id;
  if v_old_role is null then
    raise exception 'fant ingen bruker med denne iden';
  end if;

  if v_old_role = p_new_role then
    return;
  end if;

  update profiles set role = p_new_role::app_role where id = p_user_id;

  if p_new_role = 'trainer' then
    insert into trainer_profiles (trainer_id)
    values (p_user_id)
    on conflict (trainer_id) do nothing;
  end if;

  perform log_admin_action(
    'user_role_changed',
    'profile',
    p_user_id,
    jsonb_build_object('from_role', v_old_role, 'to_role', p_new_role)
  );
end;
$$;
