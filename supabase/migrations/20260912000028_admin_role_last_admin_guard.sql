-- ============================================================================
-- 0028: Erstatt selv-redigering-sperren med en generell "siste admin"-sperre.
--
-- Tidligere (0026/0027) kunne en admin ikke endre sin EGEN rad
-- (p_user_id = auth.uid()). I praksis ga dette inntrykk av at én bestemt
-- konto (den som satt logget inn) var "låst" som admin, selv om sperren
-- egentlig ikke var knyttet til noen bestemt e-post/identitet.
--
-- Ny regel: enhver bruker kan redigeres fritt — inkludert admin som endrer
-- sin egen rad — men systemet kan aldri ende opp med null admins. Dette
-- håndheves dynamisk (teller gjenværende admins ved hver nedgradering), så
-- beskyttelsen følger hvem som faktisk er siste admin til enhver tid,
-- fremfor å hardkode én bestemt konto.
-- ============================================================================

create or replace function admin_set_user_role(p_user_id uuid, p_new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_role text;
  v_other_admins int;
begin
  if not is_admin() then
    raise exception 'kun admin kan endre brukerroller';
  end if;

  if p_new_role not in ('client', 'trainer', 'admin') then
    raise exception 'ugyldig rolle: %', p_new_role;
  end if;

  select role into v_old_role from profiles where id = p_user_id;
  if v_old_role is null then
    raise exception 'fant ingen bruker med denne iden';
  end if;

  if v_old_role = p_new_role then
    return;
  end if;

  if v_old_role = 'admin' and p_new_role <> 'admin' then
    select count(*) into v_other_admins
    from profiles
    where role = 'admin' and id <> p_user_id;

    if v_other_admins = 0 then
      raise exception 'kan ikke fjerne admin-rollen — dette er siste admin i systemet';
    end if;
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
