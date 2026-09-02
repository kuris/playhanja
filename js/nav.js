/* ============================================================
   한자야 놀자! - 공통 상단 내비게이션 (모바일 햄버거 메뉴) 제어
   - 헤더 높이에 딱 맞춰 열리는 드롭다운 (top 위치 하드코딩 제거)
   - 메뉴 항목 클릭 / 바깥 영역 터치 / ESC / 화면 회전 시 자동 닫힘
   - 열려 있는 동안 배경 스크롤 잠금 & 아이콘(≡ ↔ ✕) 전환
   ============================================================ */

(function () {
  function initNav() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const header = document.querySelector('.site-header');
    if (!navToggle || !mainNav) return;

    const icon = navToggle.querySelector('i');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'main-nav');

    function isMobile() {
      return window.matchMedia('(max-width: 1024px)').matches;
    }

    function openNav() {
      mainNav.classList.add('open');
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', '메뉴 닫기');
      if (icon) icon.className = 'fa-solid fa-xmark';
    }

    function closeNav() {
      mainNav.classList.remove('open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', '메뉴 열기');
      if (icon) icon.className = 'fa-solid fa-bars';
    }

    function toggleNav() {
      if (mainNav.classList.contains('open')) closeNav();
      else openNav();
    }

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleNav();
    });

    // 메뉴 항목을 누르면 바로 닫히도록 (같은 페이지 앵커 이동 대응)
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // 메뉴 바깥(본문) 터치 시 닫기
    document.addEventListener('click', function (e) {
      if (!mainNav.classList.contains('open')) return;
      if (mainNav.contains(e.target)) return;
      if (header && header.contains(e.target)) return;
      closeNav();
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    // 데스크톱 폭으로 넓어지거나 화면을 회전하면 상태 초기화
    window.addEventListener('resize', function () {
      if (!isMobile()) closeNav();
    });
    window.addEventListener('orientationchange', closeNav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
