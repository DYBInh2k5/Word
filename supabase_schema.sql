-- WordFlow Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users profile (auto-created on signup) ──────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Documents ────────────────────────────────────────────────────────
create table if not exists public.documents (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null default 'Tài liệu không có tiêu đề',
  content     text default '',
  word_count  integer default 0,
  char_count  integer default 0,
  is_public   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.documents enable row level security;

create policy "Users can CRUD own docs"
  on public.documents for all using (auth.uid() = user_id);

create policy "Anyone can read public docs"
  on public.documents for select using (is_public = true);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger docs_updated_at
  before update on public.documents
  for each row execute procedure public.handle_updated_at();

-- ── Storage bucket for images ────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('doc-images', 'doc-images', true)
on conflict do nothing;

create policy "Anyone can view doc images"
  on storage.objects for select
  using (bucket_id = 'doc-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'doc-images' and auth.role() = 'authenticated');

create policy "Users can delete own images"
  on storage.objects for delete
  using (bucket_id = 'doc-images' and auth.uid()::text = (storage.foldername(name))[1]);
