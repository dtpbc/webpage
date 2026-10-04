-- DTPBC Supabase Auth + member profiles
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  member_id text not null unique,
  name text not null,
  student_id text not null unique,
  grade text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('member', 'executive', 'sponsor_teacher')),
  skill_level text not null default 'Beginner (Learning Rules)',
  join_date text not null default to_char(current_date, 'FMMonth YYYY')
);

alter table public.members enable row level security;

grant select, insert, update on public.members to authenticated;

drop policy if exists "Members can view their own profile" on public.members;
create policy "Members can view their own profile"
on public.members for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Members can create their own profile" on public.members;
create policy "Members can create their own profile"
on public.members for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Members can update their own profile" on public.members;
create policy "Members can update their own profile"
on public.members for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_dtpbc_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_member_id text;
begin
  generated_member_id := 'PB-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

  insert into public.members (
    id,
    member_id,
    name,
    student_id,
    grade,
    email,
    role,
    skill_level,
    join_date
  )
  values (
    new.id,
    generated_member_id,
    coalesce(new.raw_user_meta_data ->> 'name', 'David Thompson Student'),
    coalesce(new.raw_user_meta_data ->> 'studentId', '0000000'),
    coalesce(new.raw_user_meta_data ->> 'grade', 'Grade 10'),
    new.email,
    'member',
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
  for each row execute function public.handle_new_dtpbc_user();

create or replace function public.protect_dtpbc_member_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.id := old.id;
  new.member_id := old.member_id;
  new.student_id := old.student_id;
  new.email := old.email;
  new.role := old.role;
  new.join_date := old.join_date;
  return new;
end;
$$;

drop trigger if exists protect_dtpbc_member_fields on public.members;
create trigger protect_dtpbc_member_fields
  before update on public.members
  for each row execute function public.protect_dtpbc_member_fields();
