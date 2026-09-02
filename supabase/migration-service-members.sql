-- ============================================================
-- 서비스별 회원 관리 레이어
--   계정(auth.users)은 프로젝트 전체가 공유하고,
--   "어느 서비스에 가입했는지 / 그 서비스에서의 상태"는 여기서 관리합니다.
-- ============================================================

create table if not exists public.service_members (
  user_id      uuid        not null references auth.users on delete cascade,
  service      text        not null,                       -- 'hanja' | 'justseoul' | ...
  status       text        not null default 'active',      -- active | suspended | withdrawn
  role         text        not null default 'member',      -- member | admin
  nickname     text,                                       -- 서비스별로 다른 별명 사용 가능
  joined_at    timestamptz not null default now(),
  last_seen_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, service),
  constraint service_members_status_chk check (status in ('active','suspended','withdrawn'))
);

create index if not exists service_members_service_idx on public.service_members (service, status);

-- ---------- RLS: 본인 것만 조회/가입/수정 ----------
alter table public.service_members enable row level security;

drop policy if exists "members_select_own" on public.service_members;
create policy "members_select_own" on public.service_members
  for select using (auth.uid() = user_id);

drop policy if exists "members_join_own" on public.service_members;
create policy "members_join_own" on public.service_members
  for insert with check (auth.uid() = user_id);

-- 사용자가 스스로 바꿀 수 있는 건 별명·접속시각까지.
-- status/role 변경은 관리자(service_role 키)만 하도록 별도 운영에서 처리합니다.
drop policy if exists "members_update_own" on public.service_members;
create policy "members_update_own" on public.service_members
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- 가입 트리거 제거 ----------
-- 계정이 만들어졌다고 모든 서비스에 자동 가입되면 안 되므로,
-- 각 서비스는 "처음 이용할 때" 자기 서비스에 가입 처리(upsert)합니다.
drop trigger  if exists on_auth_user_created_hanja on auth.users;
drop function if exists hanja.handle_new_user();

-- ---------- 운영용 조회 (service_role 키로 실행) ----------
-- 서비스별 회원 수
--   select service, status, count(*) from public.service_members group by 1,2 order by 1,2;
-- 특정 회원 정지시키기
--   update public.service_members set status='suspended', updated_at=now()
--    where service='hanja' and user_id='...';
