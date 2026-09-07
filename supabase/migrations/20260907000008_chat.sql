-- ============================================================================
-- 0008: Chat — kept structurally unchanged from the old codebase (it was
-- fully real and worked well). Only difference: a client can only ever
-- start a direct thread with their assigned trainer, not any user.
-- ============================================================================

create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  title text,
  last_message_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table chat_members (
  thread_id uuid not null references chat_threads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table chat_thread_reads (
  thread_id uuid not null references chat_threads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create index chat_messages_thread_idx on chat_messages(thread_id, created_at);
create index chat_members_user_idx on chat_members(user_id);

alter table chat_threads enable row level security;
alter table chat_members enable row level security;
alter table chat_messages enable row level security;
alter table chat_thread_reads enable row level security;

-- Membership-gated reads throughout — a user can only see threads/messages
-- for threads they belong to.
create policy chat_threads_select
  on chat_threads for select
  using (exists (select 1 from chat_members m where m.thread_id = chat_threads.id and m.user_id = auth.uid()));

create policy chat_members_select
  on chat_members for select
  using (exists (select 1 from chat_members m2 where m2.thread_id = chat_members.thread_id and m2.user_id = auth.uid()));

create policy chat_messages_select
  on chat_messages for select
  using (exists (select 1 from chat_members m where m.thread_id = chat_messages.thread_id and m.user_id = auth.uid()));

create policy chat_messages_insert
  on chat_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (select 1 from chat_members m where m.thread_id = chat_messages.thread_id and m.user_id = auth.uid())
  );

create policy chat_thread_reads_select
  on chat_thread_reads for select
  using (user_id = auth.uid());

create policy chat_thread_reads_upsert
  on chat_thread_reads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No direct insert policy on chat_threads/chat_members: thread creation
-- always goes through the RPCs below, which is also where we enforce
-- "a client may only start a thread with their assigned trainer."

create or replace function chat_ensure_direct_thread(p_other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_thread_id uuid;
  v_me_role app_role;
begin
  select role into v_me_role from profiles where id = v_me;

  -- A client may only message their currently assigned trainer; a trainer
  -- may only message clients assigned to them. Admins can message anyone.
  if v_me_role = 'client' and not is_assigned_trainer_of_by_client(p_other, v_me) then
    raise exception 'du kan kun starte en samtale med din tildelte rehabtrener';
  end if;
  if v_me_role = 'trainer' and not is_assigned_trainer_of(p_other) then
    raise exception 'du kan kun starte en samtale med dine tildelte kunder';
  end if;

  select t.id into v_thread_id
  from chat_threads t
  where (select count(*) from chat_members m where m.thread_id = t.id) = 2
    and exists (select 1 from chat_members m where m.thread_id = t.id and m.user_id = v_me)
    and exists (select 1 from chat_members m where m.thread_id = t.id and m.user_id = p_other)
  limit 1;

  if v_thread_id is not null then
    return v_thread_id;
  end if;

  insert into chat_threads (created_by) values (v_me) returning id into v_thread_id;
  insert into chat_members (thread_id, user_id) values (v_thread_id, v_me), (v_thread_id, p_other);

  return v_thread_id;
end;
$$;

create or replace function chat_search_users(p_query text)
returns table (id uuid, first_name text, last_name text, role app_role, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  -- A client searching only ever needs to find their own assigned
  -- trainer (surfaced by the app, not a general directory); a trainer
  -- searches within their assigned clients. Kept simple: scope to people
  -- the caller has an active assignment with, plus admins search everyone.
  select p.id, p.first_name, p.last_name, p.role, p.avatar_url
  from profiles p
  where (p.first_name ilike '%' || p_query || '%' or p.last_name ilike '%' || p_query || '%')
    and (
      is_admin()
      or exists (
        select 1 from client_trainer_assignments a
        where a.status = 'active'
          and ((a.client_id = auth.uid() and a.trainer_id = p.id)
            or (a.trainer_id = auth.uid() and a.client_id = p.id))
      )
    )
  limit 20;
$$;

-- Realtime — same tables as the old app.
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_thread_reads;
