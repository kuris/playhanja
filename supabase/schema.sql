-- ============================================================
-- 한자야 놀자! Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- (RLS로 각 사용자는 자기 데이터만 읽고 쓸 수 있습니다)
-- ============================================================

-- ---------- 1) 프로필 ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  nickname    text,
  grade_goal  int,                       -- 목표 급수 (예: 7)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2) 학습 진도 (한자·급수·고사성어 공통) ----------
-- item_id 예: 'h_day'(생활 한자), 'g9_一'(급수 한자), 'idiom_1'(고사성어)
create table if not exists public.learn_progress (
  user_id     uuid not null references auth.users on delete cascade,
  item_id     text not null,
  learned_at  timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists learn_progress_user_idx on public.learn_progress (user_id);

-- ---------- 3) 퀴즈·급수 시험 결과 ----------
create table if not exists public.quiz_results (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users on delete cascade,
  mode        text not null,             -- 'category' | 'grade' | 'idiom'
  grade       int,                       -- 급수 시험일 때 1~9
  level       text,                      -- 성어 난이도 또는 카테고리
  total       int  not null,
  score       int  not null,
  percent     int  not null,
  passed      boolean not null default false,
  wrong       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists quiz_results_user_idx on public.quiz_results (user_id, created_at desc);

-- ============================================================
-- RLS (Row Level Security) - 본인 데이터만 접근
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.learn_progress enable row level security;
alter table public.quiz_results   enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "progress_all_own" on public.learn_progress;
create policy "progress_all_own" on public.learn_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quiz_select_own" on public.quiz_results;
create policy "quiz_select_own" on public.quiz_results
  for select using (auth.uid() = user_id);
drop policy if exists "quiz_insert_own" on public.quiz_results;
create policy "quiz_insert_own" on public.quiz_results
  for insert with check (auth.uid() = user_id);
