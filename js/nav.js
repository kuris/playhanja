/* ============================================================
   한자야 놀자! - 공통 상단 내비게이션 (nav.js)
   - 메뉴가 11개로 늘어 가로 배치가 깨지던 문제 해결
   - PC: 5개 그룹 + 드롭다운 / 태블릿·모바일: 햄버거 서랍(그룹 제목 포함)
   - 메뉴 구조를 한 곳에서 관리하므로 페이지마다 수정할 필요가 없습니다
   ============================================================ */

(function () {
  const MENU = [
    { label: '홈', href: 'index.html', icon: '🏠' },
    {
      label: '배우기', icon: '📚',
      children: [
        { label: '한자 배우기', href: 'learn.html', icon: '✍️', desc: '부수 애니메이션과 어원 이야기' },
        { label: '급수별 한자', href: 'grade.html', icon: '🏅', desc: '어문회 8급~4급 1,000자' },
        { label: '고사성어', href: 'idiom.html', icon: '📖', desc: '유래 일화와 함께 111선' },
        { label: '천자문 250구', href: 'thousand.html', icon: '📜', desc: '천자문 1,000자 완주' },
        { label: '재미로 보는 이야기', href: 'story.html', icon: '🌟', desc: '이야기 속 한자어를 눌러서' },
        { label: '재미로 보는 지하철 한자', href: 'subway.html', icon: '🚇', desc: '1~9호선 역이름 속 한자' }
      ]
    },
    {
      label: '연습', icon: '⚡',
      children: [
        { label: '빠른 복습 카드', href: 'flashcard.html', icon: '⚡', desc: '카드를 넘기며 간격 반복' },
        { label: '쓰기 연습장(A4)', href: 'worksheet.html', icon: '📄', desc: '인쇄해서 손으로 쓰기' }
      ]
    },
    {
      label: '시험', icon: '📝',
      children: [
        { label: '실전 모의고사', href: 'exam.html', icon: '📝', desc: '어문회 출제기준 그대로' },
        { label: '퀴즈로 복습', href: 'quiz.html', icon: '🧩', desc: '주제별·급수별·오답 복습' }
      ]
    },
    { label: '학습 플래너', href: 'planner.html', icon: '🗓️' }
  ];

  function currentFile() {
    const f = location.pathname.split('/').pop() || 'index.html';
    return f === '' ? 'index.html' : f;
  }

  function buildDesktop(here) {
    return MENU.map(function (item, i) {
      if (!item.children) {
        const active = item.href === here ? ' class="active"' : '';
        return `<li><a href="${item.href}"${active}>${item.icon} ${item.label}</a></li>`;
      }
      const active = item.children.some(c => c.href === here);
      return `
        <li class="nav-group">
          <button class="nav-group-btn${active ? ' active' : ''}" aria-expanded="false" data-group="${i}">
            ${item.icon} ${item.label} <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="nav-dropdown">
            ${item.children.map(c => `
              <a href="${c.href}" class="${c.href === here ? 'current' : ''}">
                <span class="nd-icon">${c.icon}</span>
                <span class="nd-body"><strong>${c.label}</strong><small>${c.desc || ''}</small></span>
              </a>`).join('')}
          </div>
        </li>`;
    }).join('');
  }

  function buildMobile(here) {
    return MENU.map(function (item) {
      if (!item.children) {
        return `<li><a href="${item.href}"${item.href === here ? ' class="active"' : ''}>${item.icon} ${item.label}</a></li>`;
      }
      return `
        <li class="m-group">
          <span class="m-group-title">${item.icon} ${item.label}</span>
          <ul class="m-sub">
            ${item.children.map(c => `<li><a href="${c.href}"${c.href === here ? ' class="active"' : ''}>${c.icon} ${c.label}</a></li>`).join('')}
          </ul>
        </li>`;
    }).join('');
  }

  function initNav() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const header = document.querySelector('.site-header');
    if (!navToggle || !mainNav) return;

    const here = currentFile();
    // 메뉴를 스크립트에서 생성 (모든 페이지 공통)
    mainNav.innerHTML = `
      <ul class="nav-desktop">${buildDesktop(here)}</ul>
      <ul class="nav-mobile">${buildMobile(here)}</ul>
    `;

    const icon = navToggle.querySelector('i');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'main-nav');

    function closeAllDropdowns() {
      mainNav.querySelectorAll('.nav-group.open').forEach(function (g) {
        g.classList.remove('open');
        const b = g.querySelector('.nav-group-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
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
      closeAllDropdowns();
    }

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      mainNav.classList.contains('open') ? closeNav() : openNav();
    });

    // PC 드롭다운
    mainNav.querySelectorAll('.nav-group-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const group = btn.closest('.nav-group');
        const wasOpen = group.classList.contains('open');
        closeAllDropdowns();
        if (!wasOpen) {
          group.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    document.addEventListener('click', function (e) {
      if (mainNav.contains(e.target) || (header && header.contains(e.target))) return;
      closeAllDropdowns();
      if (mainNav.classList.contains('open')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAllDropdowns(); closeNav(); }
    });

    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 1024px)').matches) closeNav();
      else closeAllDropdowns();
    });
    window.addEventListener('orientationchange', closeNav);
  }

  // ---------- 화면 조회수 및 접속 시간대 통계 수집 ----------
  function trackPageView() {
    try {
      const f = location.pathname.split('/').pop() || 'index.html';
      if (f === 'admin.html') return; // 관리자 페이지는 집계 제외
      const title = document.title.replace(' - 한자야 놀자!', '').trim() || f;
      const now = new Date();
      const hour = now.getHours();
      const day = now.toISOString().slice(0, 10);

      // 1) 브라우저 로컬 통계 (오프라인/즉시 분석용)
      try {
        const STATS_KEY = 'hanja_local_pv_stats';
        const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"pages":{},"hours":{},"days":{},"recent":[]}');
        stats.pages[f] = (stats.pages[f] || 0) + 1;
        stats.hours[hour] = (stats.hours[hour] || 0) + 1;
        stats.days[day] = (stats.days[day] || 0) + 1;
        stats.recent = (stats.recent || []).slice(0, 29);
        stats.recent.unshift({ path: f, title: title, time: now.toISOString() });
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      } catch (e) {}

      // 2) Supabase 실시간 서버 통계 (비동기 전송)
      function sendToSupabase() {
        if (!window.sb) return;
        const uid = window.HanjaAuth && window.HanjaAuth.getUser ? (window.HanjaAuth.getUser() || {}).id : null;
        window.sb.from('page_views').insert({
          path: '/' + f,
          page_title: title,
          referrer: document.referrer || null,
          user_id: uid || null,
          hour: hour,
          day: day
        }).then(() => {}, () => {});
      }

      if (window.sb) {
        sendToSupabase();
      } else {
        window.addEventListener('load', () => setTimeout(sendToSupabase, 600), { once: true });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initNav(); trackPageView(); });
  } else {
    initNav();
    trackPageView();
  }
})();
