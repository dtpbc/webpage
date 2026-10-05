-- DTPBC Supabase Auth migration
-- Uses the EXISTING public.profiles table.

alter table public.profiles
  add column if not exists member_id text,
  add column if not exists student_id text,
  add column if not exists grade text,
  add column if not exists email text,
  add column if not exists skill_level text,
  add column if not exists join_date text;

create unique index if not exists profiles_member_id_unique
  on public.profiles(member_id)
  where member_id is not null;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('member', 'executive', 'sponsor_teacher'));

create or replace function public.generate_dtpbc_member_id()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := 'PB-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    exit when not exists (
      select 1 from public.profiles where member_id = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function public.handle_new_dtpbc_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
  full_name text;
begin
  candidate := public.generate_dtpbc_member_id();
  full_name := coalesce(new.raw_user_meta_data ->> 'name', 'DTPBC Member');

  insert into public.profiles (
    id, first_name, last_name, role, member_id, student_id, grade,
    email, skill_level, join_date
  )
  values (
    new.id,
    split_part(full_name, ' ', 1),
    nullif(trim(substr(full_name, strpos(full_name, ' ') + 1)), ''),
    'member',
    candidate,
    new.raw_user_meta_data ->> 'studentId',
    coalesce(new.raw_user_meta_data ->> 'grade', 'Grade 10'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'skillLevel', 'Beginner (Learning Rules)'),
    to_char(current_date, 'FMMonth YYYY')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_dtpbc_auth_user_created on auth.users;
create trigger on_dtpbc_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_dtpbc_profile();

update public.profiles
set member_id = public.generate_dtpbc_member_id()
where id = 'a41392d9-14c3-4f40-a21b-e6b32e5b9765'
  and (member_id is null or trim(member_id) = '');

update public.profiles
set role = 'executive'
where role = 'admin';

update public.profiles
set role = 'executive'
where id = 'a41392d9-14c3-4f40-a21b-e6b32e5b9765';

-- Verify:
-- select id, first_name, last_name, role, member_id, student_id, grade, email
-- from public.profiles;


-- Production-safe profile lookup for signed-in users.
-- This also repairs older Auth accounts that were created before the
-- DTPBC profile trigger existed. It does not expose other members.
create or replace function public.get_or_create_dtpbc_profile()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_id uuid;
  auth_email text;
  metadata jsonb;
  full_name text;
  profile_row jsonb;
begin
  auth_id := auth.uid();

  if auth_id is null then
    return null;
  end if;

  select u.email, u.raw_user_meta_data
    into auth_email, metadata
  from auth.users u
  where u.id = auth_id;

  if not found then
    return null;
  end if;

  full_name := coalesce(metadata ->> 'name', 'DTPBC Member');

  insert into public.profiles (
    id, first_name, last_name, role, member_id, student_id, grade,
    email, skill_level, join_date
  )
  values (
    auth_id,
    split_part(full_name, ' ', 1),
    nullif(trim(substr(full_name, strpos(full_name, ' ') + 1)), ''),
    'member',
    public.generate_dtpbc_member_id(),
    metadata ->> 'studentId',
    coalesce(metadata ->> 'grade', 'Grade 10'),
    auth_email,
    coalesce(metadata ->> 'skillLevel', 'Beginner (Learning Rules)'),
    to_char(current_date, 'FMMonth YYYY')
  )
  on conflict (id) do nothing;

  select to_jsonb(p)
    into profile_row
  from public.profiles p
  where p.id = auth_id;

  return profile_row;
end;
$$;

revoke all on function public.get_or_create_dtpbc_profile() from public;
grant execute on function public.get_or_create_dtpbc_profile() to authenticated;


-- Staff-only member roster. Only real student members are returned;
-- executive officers and the teacher sponsor remain staff accounts.
create or replace function public.get_dtpbc_roster()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text;
  roster jsonb;
begin
  select p.role into caller_role from public.profiles p where p.id = auth.uid();
  if caller_role not in ('executive', 'sponsor_teacher') then
    raise exception 'Executive or teacher sponsor access required';
  end if;

  select coalesce(jsonb_agg(to_jsonb(p) order by
    case when p.role = 'member' then 1 when p.role = 'executive' then 2 else 3 end,
    lower(p.first_name), lower(p.last_name)
  ), '[]'::jsonb)
    into roster
  from public.profiles p;

  return roster;
end;
$$;

revoke all on function public.get_dtpbc_roster() from public;
grant execute on function public.get_dtpbc_roster() to authenticated;

-- Delete a member's DTPBC profile and Supabase Auth account.
-- Only an executive or teacher sponsor can do this, and nobody can delete themselves.
create or replace function public.delete_dtpbc_member(target_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text;
  target_role text;
begin
  select p.role into caller_role from public.profiles p where p.id = auth.uid();
  if caller_role not in ('executive', 'sponsor_teacher') then
    return jsonb_build_object('success', false, 'message', 'Executive or teacher sponsor access required.');
  end if;

  if target_member_id = auth.uid() then
    return jsonb_build_object('success', false, 'message', 'You cannot delete your own account.');
  end if;

  select p.role into target_role from public.profiles p where p.id = target_member_id;
  if target_role is null then
    return jsonb_build_object('success', false, 'message', 'Member not found.');
  end if;
  if target_role <> 'member' then
    return jsonb_build_object('success', false, 'message', 'Only regular member accounts can be deleted here.');
  end if;

  delete from public.profiles where id = target_member_id;
  delete from auth.users where id = target_member_id;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.delete_dtpbc_member(uuid) from public;
grant execute on function public.delete_dtpbc_member(uuid) to authenticated;


-- Promote a regular member to executive. Only an existing executive or teacher
-- sponsor may perform this action.
create or replace function public.promote_dtpbc_member_to_executive(target_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text;
  target_role text;
begin
  select p.role into caller_role from public.profiles p where p.id = auth.uid();
  if caller_role not in ('executive', 'sponsor_teacher') then
    return jsonb_build_object('success', false, 'message', 'Executive or teacher sponsor access required.');
  end if;

  select p.role into target_role from public.profiles p where p.id = target_member_id;
  if target_role is null then
    return jsonb_build_object('success', false, 'message', 'Member not found.');
  end if;
  if target_role <> 'member' then
    return jsonb_build_object('success', false, 'message', 'Only regular members can be promoted here.');
  end if;

  update public.profiles
  set role = 'executive'
  where id = target_member_id;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.promote_dtpbc_member_to_executive(uuid) from public;
grant execute on function public.promote_dtpbc_member_to_executive(uuid) to authenticated;



-- Shared staff-role helper for RLS policies.
create or replace function public.is_dtpbc_staff()
returns boolean
language sql stable security definer
set search_path = public
as $
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('executive','sponsor_teacher'));
$;
revoke all on function public.is_dtpbc_staff() from public;
grant execute on function public.is_dtpbc_staff() to authenticated;

-- Attendance policy helper. SECURITY DEFINER avoids depending on the caller's
-- direct/RLS visibility into profiles while evaluating attendance policies.
create or replace function public.get_dtpbc_current_profile()
returns table(member_id text, role text)
language sql
stable
security definer
set search_path = public
as $
  select p.member_id, p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$;

revoke all on function public.get_dtpbc_current_profile() from public;
grant execute on function public.get_dtpbc_current_profile() to authenticated;

-- Attendance records are stored by event so the same student can attend
-- multiple different events while duplicate check-ins are prevented per event.
create table if not exists public.attendance (
  id text primary key,
  member_id text not null,
  student_id text not null,
  student_name text not null,
  grade text not null,
  timestamp text not null,
  scanned_by text not null,
  event_id text not null,
  event_title text not null,
  created_at timestamptz not null default now()
);

alter table public.attendance enable row level security;

drop policy if exists "DTPBC authenticated attendance read" on public.attendance;
create policy "DTPBC authenticated attendance read"
on public.attendance for select
to authenticated
using (
  member_id = (select cp.member_id from public.get_dtpbc_current_profile() cp)
  or (select cp.role from public.get_dtpbc_current_profile() cp)
     in ('executive', 'sponsor_teacher')
);

drop policy if exists "DTPBC authenticated attendance insert" on public.attendance;
create policy "DTPBC authenticated attendance insert"
on public.attendance for insert
to authenticated
with check (
  (select cp.role from public.get_dtpbc_current_profile() cp)
    in ('executive', 'sponsor_teacher')
);

drop policy if exists "DTPBC authenticated attendance delete" on public.attendance;
create policy "DTPBC authenticated attendance delete"
on public.attendance for delete
to authenticated
using (
  (select cp.role from public.get_dtpbc_current_profile() cp)
    in ('executive', 'sponsor_teacher')
);

create index if not exists attendance_event_id_idx
on public.attendance(event_id);

create index if not exists attendance_student_event_idx
on public.attendance(event_id, student_id);


-- Public fundraising information. No checkout/payment data is stored here.
create table if not exists public.fundraising_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price text not null,
  source text not null,
  how_to_get text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fundraising_items enable row level security;

drop policy if exists "DTPBC public fundraising read" on public.fundraising_items;
create policy "DTPBC public fundraising read"
on public.fundraising_items for select
to anon, authenticated
using (active = true);

create or replace function public.get_dtpbc_fundraising_items()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(f) order by f.created_at desc), '[]'::jsonb)
  from public.fundraising_items f
  where f.active = true;
$$;

revoke all on function public.get_dtpbc_fundraising_items() from public;
grant execute on function public.get_dtpbc_fundraising_items() to anon, authenticated;

create or replace function public.manage_dtpbc_fundraising_item(item_id uuid, action text, item_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('executive', 'sponsor_teacher') then
    return jsonb_build_object('success', false, 'message', 'Executive or teacher sponsor access required.');
  end if;

  if action = 'create' then
    insert into public.fundraising_items (title, description, price, source, how_to_get, active)
    values (
      trim(item_data->>'title'), coalesce(item_data->>'description',''),
      trim(item_data->>'price'), trim(item_data->>'source'),
      trim(item_data->>'how_to_get'), coalesce((item_data->>'active')::boolean, true)
    );
  elsif action = 'update' and item_id is not null then
    update public.fundraising_items set
      title=trim(item_data->>'title'), description=coalesce(item_data->>'description',''),
      price=trim(item_data->>'price'), source=trim(item_data->>'source'),
      how_to_get=trim(item_data->>'how_to_get'),
      active=coalesce((item_data->>'active')::boolean, true), updated_at=now()
    where id=item_id;
  elsif action = 'delete' and item_id is not null then
    delete from public.fundraising_items where id=item_id;
  else
    return jsonb_build_object('success', false, 'message', 'Invalid fundraising request.');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.manage_dtpbc_fundraising_item(uuid, text, jsonb) from public;
grant execute on function public.manage_dtpbc_fundraising_item(uuid, text, jsonb) to authenticated;


-- Schedule source of truth.
-- The website reads/writes these tables instead of placeholder/local-only events.
create table if not exists public.sessions (
  id text primary key,
  title text not null,
    date text,
  time text not null,
  location text not null,
  "gymLayout" text not null default '4 Portable Pickleball Courts (Main Gym)',
  description text not null default '',
  "spotsOpen" text not null default '',
  coordinator text not null default '',
  status text not null default 'Open'
);

alter table public.sessions drop column if exists day;

create table if not exists public.events (
  id text primary key,
  title text not null,
  date text not null,
  time text not null,
  location text not null,
  category text not null default '',
  "registeredCount" integer not null default 0,
  "maxTeams" integer not null default 0,
  description text not null default ''
);

alter table public.sessions enable row level security;
alter table public.events enable row level security;

drop policy if exists "DTPBC public schedule read" on public.sessions;
create policy "DTPBC public schedule read"
on public.sessions for select
to anon, authenticated
using (true);

drop policy if exists "DTPBC admin schedule insert" on public.sessions;
create policy "DTPBC admin schedule insert" on public.sessions for insert to authenticated with check (public.is_dtpbc_staff());

drop policy if exists "DTPBC admin schedule update" on public.sessions;
create policy "DTPBC admin schedule update" on public.sessions for update to authenticated using (public.is_dtpbc_staff()) with check (public.is_dtpbc_staff());

drop policy if exists "DTPBC admin schedule delete" on public.sessions;
create policy "DTPBC admin schedule delete" on public.sessions for delete to authenticated using (public.is_dtpbc_staff());

drop policy if exists "DTPBC public events read" on public.events;
create policy "DTPBC public events read"
on public.events for select
to anon, authenticated
using (true);

drop policy if exists "DTPBC admin events insert" on public.events;
create policy "DTPBC admin events insert" on public.events for insert to authenticated with check (public.is_dtpbc_staff());

drop policy if exists "DTPBC admin events update" on public.events;
create policy "DTPBC admin events update" on public.events for update to authenticated using (public.is_dtpbc_staff()) with check (public.is_dtpbc_staff());

drop policy if exists "DTPBC admin events delete" on public.events;
create policy "DTPBC admin events delete" on public.events for delete to authenticated using (public.is_dtpbc_staff());

-- Normalize legacy schedule/event IDs to text.
-- Older versions of the site could have created these IDs as UUIDs, while
-- the current app uses IDs such as "session-123" and "event-123".
alter table public.sessions
  alter column id type text using id::text;

alter table public.events
  alter column id type text using id::text;

-- Remove old placeholder rows from the current text-based tables.
delete from public.sessions
where id in ('session-1','session-2','session-3','session-4');

delete from public.events
where id in ('event-1','event-2','event-3');

notify pgrst, 'reload schema';
