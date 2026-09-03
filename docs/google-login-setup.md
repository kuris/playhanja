# 구글 로그인 연동 설정 가이드

한자야 놀자!(playhanja)에 **구글 로그인**을 붙이기 위해 필요한 설정을 정리한 문서입니다.
코드는 이미 준비되어 있으므로, **아래 1~3단계 설정만 마치면 로그인 화면에 구글 버튼이 자동으로 나타납니다.**

- 코드 위치: [`js/auth.js`](../js/auth.js) 의 `signInWithGoogle()`
- 버튼: [`login.html`](../login.html) — Supabase에서 구글 provider가 켜져 있을 때만 표시됨
- 소요 시간: 약 15분

---

## ⚠️ 도메인 변경됨 (2026-09)

서비스 주소가 `playhanja.vercel.app` → **`hanja.chatgpts.kr`** 로 바뀌었습니다.
구글 로그인을 붙이기 전에 **Supabase의 허용 리디렉션 주소부터** 새 도메인으로 갱신해야 합니다.
(갱신 전에는 비밀번호 재설정 메일 링크도 동작하지 않습니다)

## 준비물

| 항목 | 값 |
|---|---|
| Supabase 프로젝트 URL | `https://ybhiznlelnpwaicyoifa.supabase.co` |
| Supabase 콜백 URL | `https://ybhiznlelnpwaicyoifa.supabase.co/auth/v1/callback` |
| 서비스 주소(운영) | `https://hanja.chatgpts.kr` |
| 서비스 주소(로컬 테스트) | `http://localhost:8899` (포트는 쓰는 것에 맞게) |

> ⚠️ **Supabase 콜백 URL**을 구글에 등록해야 합니다. 우리 사이트 주소가 아닙니다.
> 구글 → Supabase → 우리 사이트 순서로 되돌아오는 구조이기 때문입니다.

---

## 1단계. 구글 클라우드 콘솔에서 OAuth 클라이언트 만들기

### 1-1. 프로젝트 준비
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단 프로젝트 선택 → **새 프로젝트** (이름 예: `playhanja`)

### 1-2. OAuth 동의 화면(Branding) 설정
1. 좌측 메뉴 **API 및 서비스 → OAuth 동의 화면**
2. User Type: **외부(External)** 선택 → 만들기
3. 앱 정보 입력
   - 앱 이름: `한자야 놀자!`
   - 사용자 지원 이메일 / 개발자 연락처 이메일: 본인 이메일
   - 앱 로고(선택): 사이트 로고
4. **승인된 도메인**에 추가
   - `vercel.app`
   - `supabase.co`
5. 범위(Scopes): 기본값 그대로 (`email`, `profile`, `openid`)
6. 테스트 사용자: 앱이 **테스트 모드**인 동안에는 여기에 등록된 계정만 로그인할 수 있습니다.
   본인 지메일 주소를 추가해 두세요.

> 📌 **공개(게시) 여부**
> - 테스트 모드: 등록한 테스트 사용자(최대 100명)만 로그인 가능 — 개발·검증 단계에 적합
> - 프로덕션으로 게시: 누구나 로그인 가능. `email`/`profile` 범위만 쓰면 별도 심사 없이 게시할 수 있습니다.

### 1-3. 사용자 인증 정보(Credentials) 만들기
1. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
2. 애플리케이션 유형: **웹 애플리케이션**
3. 이름: `playhanja-web`
4. **승인된 자바스크립트 원본(Authorized JavaScript origins)**
   ```
   https://hanja.chatgpts.kr
   http://localhost:8899
   ```
5. **승인된 리디렉션 URI(Authorized redirect URIs)** — ⭐ 가장 중요
   ```
   https://ybhiznlelnpwaicyoifa.supabase.co/auth/v1/callback
   ```
6. 만들기 → **클라이언트 ID**와 **클라이언트 보안 비밀번호(Client Secret)** 복사

> 🔐 클라이언트 보안 비밀번호는 **절대 프론트엔드 코드나 깃 저장소에 넣지 마세요.**
> Supabase 대시보드에만 입력합니다.

---

## 2단계. Supabase에 구글 provider 등록

1. [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택
2. **Authentication → Sign In / Providers → Google**
3. **Enable Sign in with Google** 켜기
4. 1단계에서 받은 값 입력
   - Client ID (for OAuth)
   - Client Secret (for OAuth)
5. 저장(Save)

### 2-1. 리디렉션 허용 주소 등록
**Authentication → URL Configuration**

| 항목 | 값 |
|---|---|
| Site URL | `https://hanja.chatgpts.kr` |
| Redirect URLs | `https://hanja.chatgpts.kr/login.html`<br>`https://hanja.chatgpts.kr/**`<br>`http://localhost:8899/login.html` |

> 코드에서 `redirectTo`를 `login.html`로 지정하고 있으므로(`js/auth.js`), 이 주소가 목록에 없으면
> 로그인 후 사이트로 돌아오지 못하고 오류가 납니다.

---

## 3단계. 동작 확인

1. `https://hanja.chatgpts.kr/login.html` 접속
2. **"구글로 로그인"** 버튼이 보이는지 확인
   (Supabase에서 provider를 켜면 자동으로 나타납니다. 안 보이면 새로고침)
3. 버튼 클릭 → 구글 계정 선택 → 사이트로 되돌아와 로그인 완료
4. 헤더에 닉네임이 표시되고, 학습 기록 대시보드가 열리면 성공

### 확인용 명령 (선택)
provider가 실제로 켜졌는지 터미널에서 바로 확인할 수 있습니다.
```bash
curl -s https://ybhiznlelnpwaicyoifa.supabase.co/auth/v1/settings \
  -H "apikey: sb_publishable_H4gFRiLEjE8h8s_EX4tKzg__ZKpsBR1" \
  | python3 -c "import json,sys; print('google:', json.load(sys.stdin)['external']['google'])"
```
`google: True` 가 나오면 설정이 반영된 것입니다.

---

## 자주 만나는 오류

| 증상 | 원인 | 해결 |
|---|---|---|
| `redirect_uri_mismatch` | 구글에 등록한 리디렉션 URI가 다름 | 1-3의 **Supabase 콜백 URL**을 정확히 등록했는지 확인 (끝에 `/auth/v1/callback`) |
| 로그인 후 빈 화면 / 홈으로만 이동 | Supabase Redirect URLs 미등록 | 2-1의 Redirect URLs에 `.../login.html` 추가 |
| `Unsupported provider: provider is not enabled` | Supabase에서 구글 provider 꺼짐 | 2단계 Enable 후 저장 |
| `403 access_denied` | 앱이 테스트 모드인데 테스트 사용자 미등록 | 1-2에서 해당 계정을 테스트 사용자에 추가하거나 앱을 게시 |
| 로그인은 되는데 닉네임이 이메일 앞부분으로 표시됨 | 구글 계정 메타데이터 키가 다름 | 정상 동작입니다. 필요하면 `profiles.nickname`을 직접 수정 |

---

## 참고: 기존 이메일 계정과의 관계

- Supabase는 **같은 이메일이면 같은 사용자로 연결**됩니다(Link identity 설정에 따름).
  이메일로 가입한 사용자가 나중에 같은 주소의 구글 계정으로 로그인하면 기존 학습 기록이 그대로 유지됩니다.
- 학습 진도·시험 기록은 `auth.users.id` 기준으로 저장되므로([`supabase/schema.sql`](../supabase/schema.sql)),
  로그인 수단이 바뀌어도 별도 마이그레이션이 필요 없습니다.

## 참고: 카카오 로그인도 붙이려면

같은 구조로 provider만 바꾸면 됩니다.
1. [카카오 개발자센터](https://developers.kakao.com)에서 앱 생성 → REST API 키 발급
2. 카카오 Redirect URI에 `https://ybhiznlelnpwaicyoifa.supabase.co/auth/v1/callback` 등록
3. Supabase → Authentication → Providers → **Kakao** 활성화 후 키 입력
4. 코드는 `js/auth.js`의 `signInWithGoogle()`을 복사해 `provider: 'kakao'`로 바꾸면 됩니다.
