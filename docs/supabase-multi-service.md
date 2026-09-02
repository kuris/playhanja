# 한 Supabase 프로젝트에서 여러 서비스 운영하기

이 Supabase 프로젝트(`ybhiznlelnpwaicyoifa`)는 **여러 서비스가 계정을 함께 쓰고, 데이터는 따로 보관**합니다.

```
auth.users                     ← 계정 (모든 서비스 공통, Supabase 제공)
public.service_members         ← 서비스별 가입 여부 · 상태 · 권한
│
├── hanja.*                    ← 한자야 놀자 전용 데이터
│     profiles, learn_progress, quiz_results, srs_cards, study_log
│
└── public.admins / public.saves  ← justseoul (아직 public에 있음)
      → 나중에 justseoul.* 스키마로 옮기는 것을 권장
```

## 왜 이렇게 했나

| 방식 | 계정 | 데이터 | 판단 |
|---|---|---|---|
| 프로젝트를 서비스마다 분리 | 완전 별개 | 완전 별개 | 회원관리 일원화 불가 → ✗ |
| 한 프로젝트 + public에 몰아넣기 | 공통 | 뒤섞임 | 테이블 이름 충돌 위험 → ✗ |
| **한 프로젝트 + 서비스별 스키마** | 공통 | 완전 분리 | ✅ 현재 방식 |

## 핵심 규칙 3가지

### 1. 계정은 공유, 데이터는 스키마로 분리
같은 이메일은 프로젝트 전체에서 **하나의 계정**입니다.
justseoul에 가입한 사람은 한자야 놀자에 **다시 가입할 수 없고, 그럴 필요도 없습니다.**
대신 각 서비스의 데이터는 자기 스키마에만 저장되어 서로 보이지 않습니다.

### 2. 서비스 가입은 `public.service_members`로 관리
계정이 만들어졌다고 모든 서비스에 자동 가입되지 않습니다.
사용자가 그 서비스를 **처음 이용할 때** 행이 하나 생깁니다.

```sql
-- 서비스별 회원 수
select service, status, count(*) from public.service_members group by 1,2 order by 1,2;

-- 특정 회원을 한 서비스에서만 정지 (다른 서비스는 그대로)
update public.service_members
   set status = 'suspended', updated_at = now()
 where service = 'hanja' and user_id = '...';
```

`status`: `active` / `suspended` / `withdrawn` · `role`: `member` / `admin`
서비스마다 **다른 별명(nickname)** 을 쓸 수도 있습니다.

### 3. 가입 트리거는 서비스명을 붙인다
`auth.users`는 공유 테이블이라 트리거 이름이 겹치면 서로 덮어씁니다.
범용 이름(`on_auth_user_created`)은 쓰지 말고 `on_auth_user_created_<서비스>` 형태로 만드세요.
(현재는 트리거 없이, 각 서비스가 첫 이용 시 클라이언트에서 가입 처리합니다.)

---

## 새 서비스 추가 절차

```sql
-- 1) 전용 스키마
create schema if not exists myservice;
grant usage on schema myservice to anon, authenticated, service_role;

-- 2) 테이블 만들기 (반드시 RLS 켜기)
create table myservice.something (
  user_id uuid not null references auth.users on delete cascade,
  ...
);
alter table myservice.something enable row level security;
create policy "own_rows" on myservice.something
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) 권한
grant all on all tables in schema myservice to anon, authenticated, service_role;
alter default privileges in schema myservice grant all on tables to anon, authenticated, service_role;
```

**4) API에 스키마 노출** — Supabase 대시보드 → Settings → API → Exposed schemas 에 추가
(또는 Management API `PATCH /v1/projects/{ref}/postgrest` 의 `db_schema`)

**5) 클라이언트에서 스키마 지정**
```js
createClient(url, key, { db: { schema: 'myservice' } })
```

**6) 첫 이용 시 가입 처리**
```js
await sb.schema('public').from('service_members')
  .insert({ user_id: user.id, service: 'myservice', nickname: nick });
```

---

## justseoul을 옮길 때 (준비되면)

```sql
create schema if not exists justseoul;
grant usage on schema justseoul to anon, authenticated, service_role;
alter table public.admins set schema justseoul;
alter table public.saves  set schema justseoul;
grant all on all tables in schema justseoul to anon, authenticated, service_role;
alter default privileges in schema justseoul grant all on tables to anon, authenticated, service_role;

-- 기존 이용자를 justseoul 회원으로 소급 등록
insert into public.service_members (user_id, service)
select distinct user_id, 'justseoul' from justseoul.saves
on conflict (user_id, service) do nothing;
```

⚠️ **주의**: 스키마를 옮기면 justseoul 클라이언트도 `db: { schema: 'justseoul' }` 로 바꿔야 합니다.
그 전까지 `public.saves`를 부르던 코드는 404가 납니다. **배포와 동시에 진행**하세요.
당장 급하지 않다면 public에 두어도 동작에는 문제가 없습니다.

---

## 이미 계정이 있는 사용자 응대 (UX)

계정을 공유하므로 "다른 서비스 회원이 우리 서비스에서 가입 시도"하는 일이 반드시 생깁니다.
한자야 놀자는 이렇게 처리합니다 ([js/auth.js](../js/auth.js), [js/login.js](../js/login.js)):

| 상황 | 처리 |
|---|---|
| 이미 계정 있음 + **입력한 비밀번호가 맞음** | 조용히 로그인시키고 "이미 만들어 두신 계정으로 시작했어요 🎉" 안내 |
| 이미 계정 있음 + **비밀번호가 다름** | 로그인 탭으로 전환 + 이메일 자동 입력 + "기존 비밀번호로 로그인하면 돼요" 안내 |
| 이 서비스 첫 방문 | `service_members`에 가입 행 생성 + 환영 배너 표시 |

"이미 존재하는 이메일입니다" 같은 **에러 메시지를 그대로 보여주지 않는 것**이 핵심입니다.

## 구글 로그인

구글 로그인은 **계정 단위**라 한 번 켜면 모든 서비스에서 쓸 수 있습니다.
서비스마다 도메인이 다르므로, Supabase → Authentication → URL Configuration 의
Redirect URLs 에 **각 서비스 주소를 모두** 등록해야 합니다.
설정 방법은 [google-login-setup.md](google-login-setup.md) 참고.
