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
