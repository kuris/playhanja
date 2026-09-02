/* ============================================================
   한자야 놀자! - Supabase 클라이언트 설정 (supabase-client.js)
   - publishable(anon) 키는 브라우저에 공개되어도 되는 키입니다.
     실제 데이터 보호는 Supabase의 RLS 정책이 담당합니다. (supabase/schema.sql 참고)
   ============================================================ */

const SUPABASE_URL = 'https://ybhiznlelnpwaicyoifa.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_H4gFRiLEjE8h8s_EX4tKzg__ZKpsBR1';

(function () {
  if (typeof window === 'undefined') return;

  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;

  // supabase-js UMD 번들이 로드되면 전역 client 생성
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } else {
    console.warn('[한자야 놀자] supabase-js 로드 실패 - 로그인 없이 로컬 저장 모드로 동작합니다.');
    window.sb = null;
  }
})();
