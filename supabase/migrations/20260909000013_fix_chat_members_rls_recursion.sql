-- ============================================================================
-- 0013: Fix infinite RLS recursion on chat_members
--
-- Found during verification: chat_members_select's policy did a self-join
-- against chat_members from within chat_members' own policy
--   using (exists (select 1 from chat_members m2 where m2.thread_id = ...))
-- Evaluating that policy re-triggers itself (Postgres must apply RLS to
-- the inner `chat_members m2` scan too), producing infinite recursion
-- (SQLSTATE 42P17). This also broke chat_threads_select/chat_messages_select/
-- chat_messages_insert, since all three subquery chat_members and therefore
-- re-trigger its broken policy.
--
-- Fix: route the membership check through a SECURITY DEFINER helper, the
-- same pattern already used for is_admin()/is_assigned_trainer_of() —
-- a SECURITY DEFINER function's internal reads run as the function's
-- (table-owning) role, which is not subject to RLS on that table by
-- default, so the check no longer recurses through chat_members' own
-- policy.
-- ============================================================================

create or replace function is_chat_thread_member(p_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from chat_members
    where thread_id = p_thread_id and user_id = auth.uid()
  );
$$;

drop policy if exists chat_threads_select on chat_threads;
create policy chat_threads_select
  on chat_threads for select
  using (is_chat_thread_member(chat_threads.id));

drop policy if exists chat_members_select on chat_members;
create policy chat_members_select
  on chat_members for select
  using (is_chat_thread_member(chat_members.thread_id));

drop policy if exists chat_messages_select on chat_messages;
create policy chat_messages_select
  on chat_messages for select
  using (is_chat_thread_member(chat_messages.thread_id));

drop policy if exists chat_messages_insert on chat_messages;
create policy chat_messages_insert
  on chat_messages for insert
  with check (
    sender_id = auth.uid()
    and is_chat_thread_member(chat_messages.thread_id)
  );
