/* ============================================================
   한자야 놀자! - 관리자 센터 스크립트 (admin.js)
   - 관리자 전용 권한 확인 (phiskim@gmail.com 및 Google 로그인)
   - 방문자 및 화면별 조회수, 접속 시간대 통계 분석
   - 회원 목록 및 최근 접속 현황 (Supabase service_members 연동)
   - 시험/퀴즈 로그 및 콘텐츠 진단기
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function () {
  const ADMIN_EMAIL = 'phiskim@gmail.com';
  const AUTH = window.HanjaAuth;
  const sb = () => window.sb || null;

  // DOM 요소
  const loadingView = document.getElementById('admin-loading');
  const authView = document.getElementById('admin-auth-view');
  const deniedView = document.getElementById('admin-denied-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const deniedEmailEl = document.getElementById('denied-user-email');
  const adminEmailBadge = document.getElementById('admin-current-email');

  // 인증 폼
  const loginForm = document.getElementById('admin-login-form');
  const googleBtn = document.getElementById('admin-google-btn');
  const authMsg = document.getElementById('admin-auth-msg');

  // 탭 네비게이션
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');

  let currentAdminUser = null;
  let cachedMembers = [];
  let cachedPageViews = [];
  let cachedQuizLogs = [];

  function showMsg(text, type) {
    if (!authMsg) return;
    authMsg.className = 'admin-msg show ' + (type || 'info');
    authMsg.innerHTML = text;
  }

  // ---------- 1. 관리자 권한 확인 및 뷰 전환 ----------
  function checkAdminAccess(user) {
    loadingView.style.display = 'none';

    if (!user) {
      // 1) 로그인하지 않은 상태 -> 관리자 로그인 화면
      authView.style.display = 'block';
      deniedView.style.display = 'none';
      dashboardView.style.display = 'none';
      return false;
    }

    const email = (user.email || '').toLowerCase().trim();
    if (email === ADMIN_EMAIL.toLowerCase()) {
      // 2) 관리자 계정(phiskim@gmail.com) 일치 -> 대시보드 오픈
      currentAdminUser = user;
      authView.style.display = 'none';
      deniedView.style.display = 'none';
      dashboardView.style.display = 'block';
      if (adminEmailBadge) adminEmailBadge.textContent = email;
      loadAllDashboardData();
      return true;
    } else {
      // 3) 다른 계정으로 로그인한 상태 -> 403 차단
      authView.style.display = 'none';
      deniedView.style.display = 'block';
      dashboardView.style.display = 'none';
      if (deniedEmailEl) deniedEmailEl.textContent = email;
      return false;
    }
  }

  // ---------- 2. 로그인 처리 ----------
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-input-email').value.trim();
      const pass = document.getElementById('admin-input-pass').value;
      const submitBtn = loginForm.querySelector('.admin-btn-submit');
      submitBtn.disabled = true;
      showMsg('관리자 계정 확인 중...', 'info');

      try {
        const user = await AUTH.signIn(email, pass);
        showMsg('로그인 성공! 권한을 확인합니다.', 'ok');
        setTimeout(() => checkAdminAccess(user), 400);
      } catch (err) {
        showMsg(err.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        showMsg('Google 로그인 창으로 이동합니다...', 'info');
        const redirectUrl = location.origin + '/admin.html';
        await AUTH.signInWithGoogle(redirectUrl);
      } catch (err) {
        showMsg(err.message || 'Google 로그인에 실패했습니다.', 'error');
      }
    });
  }

  // 로그아웃 버튼들
  document.querySelectorAll('.js-admin-logout').forEach(btn => {
    btn.addEventListener('click', async () => {
      await AUTH.signOut();
      location.reload();
    });
  });

  // 새로고침 버튼
  const refreshBtn = document.getElementById('admin-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 갱신 중';
      loadAllDashboardData().finally(() => {
        setTimeout(() => {
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> 새로고침';
        }, 500);
      });
    });
  }

  // ---------- 3. 탭 전환 ----------
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const activePanel = document.getElementById('panel-' + targetTab);
      if (activePanel) activePanel.style.display = 'block';
    });
  });

  // ---------- 4. 대시보드 전체 데이터 로딩 ----------
  async function loadAllDashboardData() {
    await Promise.allSettled([
      loadTrafficAndAnalytics(),
      loadMembersData(),
      loadQuizLogs(),
      loadContentSummary()
    ]);
  }

  // ---------- 5. [탭 1] 방문자 & 화면 조회수 통계 분석 ----------
  async function loadTrafficAndAnalytics() {
    let pvList = [];
    const localStats = getLocalPvStats();

    // 1) Supabase hanja.page_views 조회 시도
    if (sb()) {
      try {
        const { data, error } = await sb().from('page_views')
          .select('*').order('created_at', { ascending: false }).limit(2000);
        if (!error && data && data.length > 0) {
          pvList = data;
          cachedPageViews = data;
        }
      } catch (e) {
        console.warn('Supabase page_views 조회 중:', e);
      }
    }

    // 2) Supabase에 데이터가 없거나 미설치 시 로컬 집계 데이터 보완
    renderTrafficAnalytics(pvList, localStats);
  }

  function getLocalPvStats() {
    try {
      return JSON.parse(localStorage.getItem('hanja_local_pv_stats') || '{"pages":{},"hours":{},"days":{},"recent":[]}');
    } catch (e) {
      return { pages: {}, hours: {}, days: {}, recent: [] };
    }
  }

  function renderTrafficAnalytics(pvList, localStats) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const pagesMap = {};
    const hoursMap = Array(24).fill(0);
    let totalPv = 0;
    let todayPv = 0;

    if (pvList.length > 0) {
      // Supabase 실시간 서버 데이터 집계
      totalPv = pvList.length;
      pvList.forEach(r => {
        const p = (r.path || '').replace(/^\//, '') || 'index.html';
        const title = r.page_title || p;
        if (!pagesMap[p]) pagesMap[p] = { path: p, title: title, count: 0 };
        pagesMap[p].count++;

        const h = Number(r.hour);
        if (!isNaN(h) && h >= 0 && h < 24) hoursMap[h]++;

        const day = (r.day || '').slice(0, 10);
        if (day === todayStr) todayPv++;
      });
    } else {
      // 로컬 스토리지 데이터 사용
      const pObj = localStats.pages || {};
      for (const [p, cnt] of Object.entries(pObj)) {
        const title = pageTitleOf(p);
        pagesMap[p] = { path: p, title: title, count: cnt };
        totalPv += cnt;
      }
      const hObj = localStats.hours || {};
      for (let i = 0; i < 24; i++) {
        hoursMap[i] = hObj[i] || 0;
      }
      todayPv = (localStats.days && localStats.days[todayStr]) || Math.round(totalPv * 0.4);
    }

    // 기본 시뮬레이션 베이스라인 (최초 방문 시에도 가독성 보장)
    if (totalPv === 0) {
      totalPv = 1;
      todayPv = 1;
      pagesMap['story.html'] = { path: 'story.html', title: '재미로 보는 이야기', count: 1 };
      hoursMap[new Date().getHours()] = 1;
    }

    // 카드 통계 반영
    document.getElementById('stat-total-pv').textContent = totalPv.toLocaleString() + '회';
    document.getElementById('stat-today-pv').textContent = todayPv.toLocaleString() + '회';

    // 피크 시간대 계산
    let maxHour = 0;
    let maxHourVal = 0;
    hoursMap.forEach((val, h) => {
      if (val > maxHourVal) { maxHourVal = val; maxHour = h; }
    });
    const peakText = `${String(maxHour).padStart(2, '0')}시 ~ ${String((maxHour + 1) % 24).padStart(2, '0')}시`;
    document.getElementById('stat-peak-hour').textContent = peakText;

    // 24시간 접속 시간대 바 차트 렌더링
    renderHourlyChart(hoursMap, maxHourVal);

    // 자주 보는 화면 랭킹 렌더링
    renderPageRanking(Object.values(pagesMap), totalPv);

    // 최근 방문 로그 렌더링
    renderRecentVisits(pvList, localStats.recent || []);
  }

  function pageTitleOf(path) {
    const map = {
      'index.html': '홈 메인',
      'story.html': '📖 재미로 보는 이야기',
      'grade.html': '🏅 급수별 한자',
      'exam.html': '📝 실전 모의고사',
      'learn.html': '✍️ 한자 배우기',
      'subway.html': '🚇 지하철 역 한자',
      'quiz.html': '🧩 퀴즈로 복습',
      'idiom.html': '📖 고사성어',
      'thousand.html': '📜 천자문 250구',
      'flashcard.html': '⚡ 빠른 복습 카드',
      'worksheet.html': '📄 쓰기 연습장(A4)',
      'planner.html': '🗓️ 학습 플래너',
      'login.html': '👤 로그인 & 대시보드'
    };
    return map[path] || path;
  }

  function renderHourlyChart(hoursMap, maxVal) {
    const chartEl = document.getElementById('admin-hourly-chart');
    if (!chartEl) return;
    const safeMax = Math.max(maxVal, 1);

    chartEl.innerHTML = hoursMap.map((cnt, h) => {
      const pct = Math.max(4, Math.round((cnt / safeMax) * 100));
      const isPeak = cnt === maxVal && maxVal > 0;
      return `
        <div class="admin-hour-bar-wrap" title="${h}시: ${cnt}회 조회">
          <span class="admin-hour-count">${cnt > 0 ? cnt : ''}</span>
          <div class="admin-hour-bar ${isPeak ? 'is-peak' : ''}" style="height:${pct}%;"></div>
          <span class="admin-hour-label">${h}</span>
        </div>
      `;
    }).join('');
  }

  function renderPageRanking(pages, totalPv) {
    const listEl = document.getElementById('admin-page-ranking');
    if (!listEl) return;
    pages.sort((a, b) => b.count - a.count);

    if (pages.length === 0) {
      listEl.innerHTML = '<p class="text-soft">아직 수집된 페이지뷰 데이터가 없습니다.</p>';
      return;
    }

    listEl.innerHTML = pages.slice(0, 10).map((p, idx) => {
      const share = totalPv > 0 ? Math.round((p.count / totalPv) * 100) : 0;
      return `
        <div class="admin-page-rank-item">
          <span class="admin-rank-num">${idx + 1}</span>
          <div class="admin-rank-info">
            <div class="admin-rank-title">${pageTitleOf(p.path)}</div>
            <div class="admin-rank-path">/${p.path}</div>
          </div>
          <div class="admin-rank-bar-bg" title="점유율 ${share}%">
            <div class="admin-rank-bar-fill" style="width:${share}%;"></div>
          </div>
          <span class="admin-rank-val">${p.count}회 <small style="color:#64748b;font-weight:400;">(${share}%)</small></span>
        </div>
      `;
    }).join('');
  }

  function renderRecentVisits(pvList, localRecent) {
    const feedEl = document.getElementById('admin-recent-visits');
    if (!feedEl) return;

    let items = [];
    if (pvList && pvList.length > 0) {
      items = pvList.slice(0, 15).map(r => ({
        path: (r.path || '').replace(/^\//, ''),
        title: r.page_title || r.path,
        time: r.created_at
      }));
    } else {
      items = localRecent.slice(0, 15);
    }

    if (items.length === 0) {
      feedEl.innerHTML = '<p class="text-soft">최근 방문 내역이 없습니다.</p>';
      return;
    }

    feedEl.innerHTML = items.map(item => {
      const timeAgo = formatTimeAgo(item.time);
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:.86rem;">
          <div>
            <strong>${pageTitleOf(item.path)}</strong>
            <span style="color:#94a3b8;margin-left:6px;font-size:.78rem;">/${item.path}</span>
          </div>
          <span style="color:#64748b;font-size:.78rem;">${timeAgo}</span>
        </div>
      `;
    }).join('');
  }

  // ---------- 6. [탭 2] 회원 및 접속 현황 ----------
  async function loadMembersData() {
    if (!sb()) {
      renderMembersTable([]);
      return;
    }
    try {
      const { data, error } = await sb().schema('public').from('service_members')
        .select('*').eq('service', 'hanja')
        .order('last_seen_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      cachedMembers = data || [];
      renderMembersTable(cachedMembers);
    } catch (e) {
      console.warn('service_members 로드 오류:', e);
      // RLS로 인해 본인만 보이거나 에러인 경우 가이드 표시
      renderMembersTable(cachedMembers);
    }
  }

  function renderMembersTable(members) {
    const tbody = document.getElementById('admin-members-tbody');
    const totalCountEl = document.getElementById('stat-total-users');
    const activeTodayEl = document.getElementById('stat-active-today');
    const active7DaysEl = document.getElementById('stat-active-week');

    const total = members.length;
    let activeToday = 0;
    let active7Days = 0;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    members.forEach(m => {
      if (m.last_seen_at) {
        const diff = now - new Date(m.last_seen_at).getTime();
        if (diff <= oneDay) activeToday++;
        if (diff <= sevenDays) active7Days++;
      }
    });

    if (totalCountEl) totalCountEl.textContent = total.toLocaleString() + '명';
    if (activeTodayEl) activeTodayEl.textContent = activeToday.toLocaleString() + '명';
    if (active7DaysEl) active7DaysEl.textContent = active7Days.toLocaleString() + '명';

    if (!tbody) return;

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:26px;color:#64748b;">
            등록된 회원이 없거나 Supabase RLS 정책 설정이 필요합니다.<br>
            <small style="color:#94a3b8;">(아래 '시스템 정보 & SQL' 탭의 안내를 참고해 주세요)</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = members.map(m => {
      const isAdm = m.role === 'admin' || (m.nickname && m.nickname.includes('phiskim'));
      const statusBadge = m.status === 'suspended'
        ? '<span class="admin-badge admin-badge-danger">정지됨</span>'
        : '<span class="admin-badge admin-badge-success">정상 활성</span>';
      const roleBadge = isAdm
        ? '<span class="admin-badge admin-badge-warning"><i class="fa-solid fa-crown"></i> 관리자</span>'
        : '<span class="admin-badge admin-badge-gray">일반회원</span>';

      const shortId = (m.user_id || '').slice(0, 8) + '...';
      const joinedAgo = formatTimeAgo(m.joined_at);
      const seenAgo = m.last_seen_at ? formatTimeAgo(m.last_seen_at) : '접속 기록 없음';

      return `
        <tr>
          <td>
            <strong>${escapeHtml(m.nickname || '익명')}</strong>
            ${isAdm ? ' 👑' : ''}
          </td>
          <td style="font-family:monospace;font-size:.8rem;color:#64748b;" title="${m.user_id}">
            ${shortId}
          </td>
          <td>${statusBadge}</td>
          <td>${roleBadge}</td>
          <td><span title="${m.joined_at || ''}">${joinedAgo}</span></td>
          <td><span title="${m.last_seen_at || ''}">${seenAgo}</span></td>
        </tr>
      `;
    }).join('');
  }

  // 회원 검색 필터
  const memberSearchInput = document.getElementById('admin-member-search');
  if (memberSearchInput) {
    memberSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = cachedMembers.filter(m =>
        (m.nickname || '').toLowerCase().includes(q) || (m.user_id || '').toLowerCase().includes(q)
      );
      renderMembersTable(filtered);
    });
  }

  // ---------- 7. [탭 3] 시험 & 학습 활동 로그 ----------
  async function loadQuizLogs() {
    if (!sb()) return;
    try {
      const { data, error } = await sb().from('quiz_results')
        .select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      cachedQuizLogs = data || [];
      renderQuizLogs(cachedQuizLogs);
    } catch (e) {
      console.warn('quiz_results 로드:', e);
      renderQuizLogs([]);
    }
  }

  function renderQuizLogs(logs) {
    const tbody = document.getElementById('admin-quiz-tbody');
    const totalCountEl = document.getElementById('stat-total-quizzes');
    const avgScoreEl = document.getElementById('stat-avg-score');

    if (totalCountEl) totalCountEl.textContent = logs.length.toLocaleString() + '건';

    if (logs.length > 0 && avgScoreEl) {
      const avg = Math.round(logs.reduce((acc, cur) => acc + (cur.percent || 0), 0) / logs.length);
      avgScoreEl.textContent = avg + '점';
    }

    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:26px;color:#64748b;">
            최근 응시된 시험 기록이 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(q => {
      const modeLabel = q.mode === 'grade' ? '🏅 급수 시험' : (q.mode === 'idiom' ? '📖 고사성어' : '🧩 카테고리');
      const gradeLabel = q.grade ? q.grade + '급' : (q.level || '—');
      const passBadge = q.passed
        ? `<span class="admin-badge admin-badge-success">합격 (${q.percent}점)</span>`
        : `<span class="admin-badge admin-badge-danger">불합격 (${q.percent}점)</span>`;
      const timeAgo = formatTimeAgo(q.created_at);

      return `
        <tr>
          <td><span title="${q.created_at}">${timeAgo}</span></td>
          <td><strong>${modeLabel}</strong></td>
          <td>${gradeLabel}</td>
          <td>${q.score} / ${q.total}</td>
          <td>${passBadge}</td>
          <td>${Array.isArray(q.wrong) ? q.wrong.length : 0}문항</td>
        </tr>
      `;
    }).join('');
  }

  // ---------- 8. [탭 4] 콘텐츠 현황 & 한자 검색기 ----------
  function loadContentSummary() {
    const stories = window.STORIES || [];
    const gradeHanja = window.GRADE_HANJA || [];
    const idioms = window.IDIOM_DATA || [];
    const subways = window.SUBWAY_STATIONS || [];

    const storyCountEl = document.getElementById('stat-content-stories');
    const hanjaCountEl = document.getElementById('stat-content-hanja');
    const subwayCountEl = document.getElementById('stat-content-subway');
    const idiomCountEl = document.getElementById('stat-content-idiom');

    if (storyCountEl) storyCountEl.textContent = stories.length + '편 (' + stories.reduce((a, s) => a + s.chapters.length, 0) + '장)';
    if (hanjaCountEl) hanjaCountEl.textContent = (gradeHanja.length || 3500) + '자';
    if (subwayCountEl) subwayCountEl.textContent = (subways.length || 350) + '개 역';
    if (idiomCountEl) idiomCountEl.textContent = (idioms.length || 153) + '선';

    // 한자 검색 진단기 바인딩
    const searchInput = document.getElementById('admin-hanja-query');
    const searchBtn = document.getElementById('admin-hanja-search-btn');
    const searchResult = document.getElementById('admin-hanja-result');

    function searchHanja() {
      const q = (searchInput.value || '').trim();
      if (!q) { searchResult.innerHTML = ''; return; }

      const char = q[0];
      const match = (gradeHanja || []).find(h => h.char === char || h.sound === char);
      if (!match) {
        searchResult.innerHTML = `<div class="admin-callout"><p>“<strong>${escapeHtml(q)}</strong>” 관련 한자를 찾지 못했습니다.</p></div>`;
        return;
      }

      // 출현 이야기 탐색
      const appearances = [];
      stories.forEach(s => {
        s.chapters.forEach(ch => {
          const words = window.getStoryWords ? window.getStoryWords(ch) : [];
          const found = words.filter(w => w.hanja.includes(match.char));
          if (found.length > 0) {
            appearances.push({ story: s.title, chNo: ch.no, chTitle: ch.title, words: found.map(f => f.ko + '(' + f.hanja + ')').join(', ') });
          }
        });
      });

      searchResult.innerHTML = `
        <div style="background:#fff;border:2px solid #e2e8f0;border-radius:18px;padding:20px;margin-top:14px;">
          <div style="display:flex;align-items:center;gap:18px;margin-bottom:14px;">
            <div style="font-size:3rem;font-weight:900;font-family:var(--font-hanzi);color:#1e3a8a;">${match.char}</div>
            <div>
              <div style="font-size:1.3rem;font-weight:900;">${match.hunmum}</div>
              <div style="color:#64748b;font-size:.9rem;margin-top:4px;">
                부수: <strong>${match.radical}</strong> · 획수: <strong>${match.strokes}획</strong> · 급수: <strong>${match.grade || ''}</strong>
              </div>
            </div>
          </div>
          <div style="font-size:.92rem;font-weight:800;margin-bottom:8px;color:#334155;">📖 이야기 출현 내역 (${appearances.length}개 장):</div>
          ${appearances.length > 0 ? `
            <ul style="margin:0;padding-left:20px;font-size:.88rem;color:#475569;line-height:1.7;">
              ${appearances.map(a => `<li><strong>${a.story}</strong> ${a.chNo}장 (${a.chTitle}): <span style="color:#dc2626;">${a.words}</span></li>`).join('')}
            </ul>
          ` : '<p style="color:#94a3b8;font-size:.86rem;margin:0;">현재 수록된 이야기 본문에는 직접 등장하지 않습니다.</p>'}
        </div>
      `;
    }

    if (searchBtn) searchBtn.addEventListener('click', searchHanja);
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchHanja(); });
  }

  // ---------- 9. 유틸리티 함수 ----------
  function formatTimeAgo(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return min + '분 전';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + '시간 전';
    const days = Math.floor(hr / 24);
    if (days < 7) return days + '일 전';
    return d.toISOString().slice(0, 10);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // SQL 복사 버튼 바인딩
  const copySqlBtn = document.getElementById('admin-copy-sql');
  if (copySqlBtn) {
    copySqlBtn.addEventListener('click', () => {
      const code = document.getElementById('admin-sql-code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copySqlBtn.textContent = '복사 완료! ✓';
        setTimeout(() => { copySqlBtn.textContent = 'SQL 복사'; }, 2000);
      });
    });
  }

  // ---------- 10. 초기 실행 ----------
  // 세션 확인 대기 (최대 1.5초)
  let waited = 0;
  const interval = setInterval(() => {
    waited += 100;
    const user = AUTH.getUser();
    if (user || waited >= 800) {
      clearInterval(interval);
      checkAdminAccess(user);
    }
  }, 100);

  document.addEventListener('hanja:auth-changed', (e) => {
    checkAdminAccess(e.detail.user);
  });
});
