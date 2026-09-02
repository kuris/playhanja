-- ============================================================
-- 서비스별 스키마 분리 마이그레이션
--   auth.users(계정)는 공통으로 두고, 서비스마다 전용 스키마를 사용합니다.
--     hanja.*      → 한자야 놀자
--     justseoul.*  → justseoul 게임 (이 파일에서는 건드리지 않음)
-- ============================================================

-- ---------- 1) 한자야 놀자 전용 스키마 ----------
create schema if not exists hanja;

grant usage on schema hanja to anon, authenticated, service_role;

-- ---------- 2) 기존 테이블을 hanja 스키마로 이동 ----------
-- (RLS 정책·인덱스·제약조건은 테이블과 함께 따라갑니다)
alter table if exists public.profiles       set schema hanja;
alter table if exists public.learn_progress set schema hanja;
alter table if exists public.quiz_results   set schema hanja;
alter table if exists public.srs_cards      set schema hanja;
alter table if exists public.study_log      set schema hanja;

-- ---------- 3) 권한 부여 (행 보호는 RLS가 담당) ----------
grant all on all tables    in schema hanja to anon, authenticated, service_role;
grant all on all sequences in schema hanja to anon, authenticated, service_role;
alter default privileges in schema hanja grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema hanja grant all on sequences to anon, authenticated, service_role;

-- ---------- 4) 가입 트리거를 서비스별로 구분 ----------
-- auth.users는 모든 서비스가 공유하므로, 트리거·함수 이름에 서비스명을 붙입니다.
-- (기존의 범용 이름 on_auth_user_created / handle_new_user 는 제거)
drop trigger  if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function hanja.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = hanja, public
as $$
begin
  insert into hanja.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_hanja
  after insert on auth.users
  for each row execute function hanja.handle_new_user();

-- ============================================================
-- 참고: 앞으로 새 서비스를 추가할 때 (예: justseoul)
-- ============================================================
--   create schema if not exists justseoul;
--   grant usage on schema justseoul to anon, authenticated, service_role;
--   alter table public.admins set schema justseoul;
--   alter table public.saves  set schema justseoul;
--   grant all on all tables in schema justseoul to anon, authenticated, service_role;
--   alter default privileges in schema justseoul grant all on tables to anon, authenticated, service_role;
--
--   -- 가입 시 처리할 게 있으면 서비스명을 붙인 트리거를 따로 만듭니다
--   create trigger on_auth_user_created_justseoul
--     after insert on auth.users
--     for each row execute function justseoul.handle_new_user();
--
--   ※ 스키마를 옮기면 그 서비스의 클라이언트 코드도 함께 바꿔야 합니다:
--       createClient(url, key, { db: { schema: 'justseoul' } })
--     그리고 Supabase 설정 > API > Exposed schemas 에 스키마를 추가해야 합니다.
