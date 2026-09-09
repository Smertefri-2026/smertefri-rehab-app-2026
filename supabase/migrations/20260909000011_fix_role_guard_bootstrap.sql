-- ============================================================================
-- 0011: Fix role/status guard triggers to allow service-role bootstrap
--
-- Found during verification: prevent_self_role_change() and
-- prevent_self_status_change() check is_admin(), which resolves via
-- auth.uid() — but a service-role connection (used to bootstrap the very
-- first admin, since nobody can self-promote by design) has no
-- auth.uid() at all. The guard blocked even that, with no way to ever
-- create a first admin.
--
-- Fix: also allow the change when auth.uid() IS NULL, i.e. there is no
-- authenticated end-user session at all — a backend/service-role/
-- migration context, which already requires infrastructure-level access
-- far beyond anything a client-side attacker could reach. The guard's
-- actual purpose (stop a logged-in non-admin user from self-promoting)
-- is unaffected: any real end-user request always has a non-null
-- auth.uid().
-- ============================================================================

create or replace function prevent_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then
    raise exception 'role kan kun endres av admin eller godkjenningsflyten';
  end if;
  return new;
end;
$$;

create or replace function prevent_self_status_change()
returns trigger
language plpgsql
as $$
begin
  if (new.status is distinct from old.status or new.max_clients is distinct from old.max_clients)
     and auth.uid() is not null and not is_admin() then
    raise exception 'status/max_clients kan kun endres av admin';
  end if;
  return new;
end;
$$;
