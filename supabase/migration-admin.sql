-- ============================================================
-- 한자야 놀자! - 관리자 권한, RLS 정책 및 접속/조회수 분석 테이블
-- 관리자: phiskim@gmail.com
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- ============================================================

-- ---------- 1) service_members 테이블: phiskim@gmail.com 에 role='admin' 부여 ----------
update public.service_members sm
set role = 'admin', updated_at = now()
from auth.users u
where sm.user_id = u.id
  and lower(u.email) = 'phiskim@gmail.com'
  and sm.service = 'hanja';

-- ---------- 2) public.service_members: 관리자는 모든 회원 조회 및 상태 변경 가능 ----------
drop policy if exists "members_select_admin" on public.service_members;
create policy "members_select_admin" on public.service_members
  for select using (
    (auth.jwt()->>'email' = 'phiskim@gmail.com')
  );

drop policy if exists "members_update_admin" on public.service_members;
create policy "members_update_admin" on public.service_members
  for update using (
    (auth.jwt()->>'email' = 'phiskim@gmail.com')
  );

-- ---------- 3) hanja.quiz_results: 관리자는 전체 시험 결과 조회 가능 ----------
drop policy if exists "quiz_select_admin" on hanja.quiz_results;
create policy "quiz_select_admin" on hanja.quiz_results
  for select using (
    (auth.jwt()->>'email' = 'phiskim@gmail.com')
  );

-- ---------- 4) hanja.learn_progress: 관리자는 전체 학습 진도 조회 가능 ----------
drop policy if exists "progress_select_admin" on hanja.learn_progress;
create policy "progress_select_admin" on hanja.learn_progress
  for select using (
    (auth.jwt()->>'email' = 'phiskim@gmail.com')
  );

-- ---------- 5) hanja.profiles: 관리자는 전체 프로필 조회 가능 ----------
drop policy if exists "profiles_select_admin" on hanja.profiles;
create policy "profiles_select_admin" on hanja.profiles
  for select using (
    (auth.jwt()->>'email' = 'phiskim@gmail.com')
  );

-- ---------- 6) hanja.page_views: 사용자 화면 조회수 및 접속 시간대 통계 테이블 ----------
create table if not exists hanja.page_views (
  id bigint generated always as identity primary key,
  path text not null,                -- 화면 경로 (예: '/story.html', '/index.html')
  page_title text,                   -- 화면 명칭
  referrer text,
  user_id uuid references auth.users on delete set null,
  hour int not null default extract(hour from (now() at time zone 'Asia/Seoul')), -- KST 0~23시
  day date not null default (current_date at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now()
);

create index if not exists page_views_day_idx on hanja.page_views (day desc, hour);
create index if not exists page_views_path_idx on hanja.page_views (path);

alter table hanja.page_views enable row level security;

-- 누구나 페이지 조회 기록 전송(insert) 가능
drop policy if exists "page_views_insert_all" on hanja.page_views;
create policy "page_views_insert_all" on hanja.page_views
  for insert with check (true);

-- 관리자(phiskim@gmail.com)만 전체 통계 조회(select) 가능
drop policy if exists "page_views_select_admin" on hanja.page_views;
create policy "page_views_select_admin" on hanja.page_views
  for select using (
    (auth.jwt()->>'email' = 'phiskim@gmail.com')
  );

grant all on table hanja.page_views to anon, authenticated, service_role;
grant usage, select on all sequences in schema hanja to anon, authenticated, service_role;
