-- ============================================================
-- 한자야 놀자! - 플래너 & 복습 카드 기기 간 동기화 마이그레이션
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- 기존 테이블(profiles / learn_progress / quiz_results)은 건드리지 않습니다.
-- ============================================================

-- ---------- 1) 학습 목표 (profiles에 컬럼 추가) ----------
-- grade_goal(목표 급수)은 최초 스키마에 이미 있으므로 나머지만 추가합니다.
alter table public.profiles
  add column if not exists daily_goal int  default 5,   -- 하루에 배울 새 한자 수
  add column if not exists idiom_goal int  default 1;   -- 하루에 배울 고사성어 수

-- ---------- 2) 복습 카드 상태 (간격 반복) ----------
-- card_id 예: 'g9_一'(급수 한자), 'h_day'(생활 한자), 'idiom_1'(고사성어)
-- 주의: interval 은 예약어라 interval_days 로, char 는 타입명이라 char_text 로 씁니다.
create table if not exists public.srs_cards (
  user_id        uuid        not null references auth.users on delete cascade,
  card_id        text        not null,
  kind           text,                                   -- 'grade' | 'hanja' | 'idiom'
  char_text      text,                                   -- 표시용 한자/성어
  interval_days  int         not null default 0,         -- 다음 복습까지 간격(일)
  ease           real        not null default 2.3,       -- 난이도 계수
  reps           int         not null default 0,         -- 총 복습 횟수
  lapses         int         not null default 0,         -- 틀린 횟수
  due            timestamptz not null default now(),     -- 다음 복습 예정 시각
  last_at        timestamptz,
  updated_at     timestamptz not null default now(),
  primary key (user_id, card_id)
);
create index if not exists srs_cards_due_idx on public.srs_cards (user_id, due);

-- ---------- 3) 날짜별 학습 기록 (스트릭 · 달력) ----------
create table if not exists public.study_log (
  user_id       uuid        not null references auth.users on delete cascade,
  day           date        not null,
  new_count     int         not null default 0,          -- 새로 배운 한자 수
  review_count  int         not null default 0,          -- 복습한 카드 수
  quiz_count    int         not null default 0,          -- 푼 퀴즈 문항 수
  updated_at    timestamptz not null default now(),
  primary key (user_id, day)
);
create index if not exists study_log_day_idx on public.study_log (user_id, day desc);

-- ============================================================
-- RLS (본인 데이터만 접근)
-- ============================================================
alter table public.srs_cards enable row level security;
alter table public.study_log enable row level security;

drop policy if exists "srs_all_own" on public.srs_cards;
create policy "srs_all_own" on public.srs_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "log_all_own" on public.study_log;
create policy "log_all_own" on public.study_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- (선택) 확인용 쿼리 - 실행 후 아래로 결과를 볼 수 있습니다
-- ============================================================
-- 내 복습 카드 중 오늘 볼 것
--   select card_id, char_text, interval_days, due
--     from public.srs_cards
--    where due <= now()
--    order by due;
--
-- 최근 30일 학습 기록
--   select day, new_count, review_count, quiz_count
--     from public.study_log
--    order by day desc limit 30;
--
-- 연속 학습일 계산
--   with days as (
--     select day, row_number() over (order by day desc) as rn
--       from public.study_log
--      where new_count + review_count + quiz_count > 0
--   )
--   select count(*) as streak
--     from days
--    where day = current_date - (rn - 1) * interval '1 day';
