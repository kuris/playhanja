/* ============================================================
   한자야 놀자! - login.html 로그인/회원가입 & 내 학습 기록 대시보드
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const AUTH = window.HanjaAuth;
  const PROGRESS = window.HanziProgress;

  const authView = document.getElementById('auth-view');
  const dashView = document.getElementById('dash-view');
  const msgBox = document.getElementById('auth-msg');
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  function showMsg(text, type) {
    msgBox.className = 'auth-msg show ' + (type || 'info');
    msgBox.innerHTML = text;
  }
  function clearMsg() { msgBox.className = 'auth-msg'; msgBox.innerHTML = ''; }

  // ---------- 탭 전환 ----------
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      loginForm.style.display = isLogin ? 'flex' : 'none';
      signupForm.style.display = isLogin ? 'none' : 'flex';
      clearMsg();
    });
  });

  // ---------- 로그인 ----------
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('.auth-submit');
    btn.disabled = true;
    showMsg('로그인 중이에요...', 'info');
    try {
      await AUTH.signIn(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value
      );
      showMsg('로그인 성공! 학습 기록을 불러오는 중이에요...', 'ok');
    } catch (err) {
      showMsg(translateError(err), 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- 회원가입 ----------
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = signupForm.querySelector('.auth-submit');
    btn.disabled = true;
    showMsg('가입 처리 중이에요...', 'info');
    try {
      const res = await AUTH.signUp(
        document.getElementById('signup-email').value.trim(),
        document.getElementById('signup-password').value,
        document.getElementById('signup-nickname').value.trim()
      );
      if (res.needsEmailConfirm) {
        showMsg('가입 확인 메일을 보냈어요! 📧<br>메일함에서 링크를 눌러 인증한 뒤 로그인해 주세요.', 'ok');
      } else {
        showMsg('가입 완료! 바로 시작할게요 🎉', 'ok');
      }
    } catch (err) {
      showMsg(translateError(err), 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- 비밀번호 재설정 ----------
  document.getElementById('forgot-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    if (!email) { showMsg('먼저 이메일을 입력해 주세요.', 'error'); return; }
    try {
      await AUTH.resetPassword(email);
      showMsg('비밀번호 재설정 메일을 보냈어요! 📧', 'ok');
    } catch (err) {
      showMsg(translateError(err), 'error');
    }
  });

  // ---------- 로그아웃 ----------
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await AUTH.signOut();
    location.reload();
  });

  // ---------- 오류 메시지 한글화 ----------
  function translateError(err) {
    const m = (err && (err.message || err.error_description) || '').toLowerCase();
    if (m.includes('invalid login')) return '이메일 또는 비밀번호가 올바르지 않아요.';
    if (m.includes('already registered') || m.includes('already been registered')) return '이미 가입된 이메일이에요. 로그인해 주세요.';
    if (m.includes('password should be')) return '비밀번호는 6자 이상이어야 해요.';
    if (m.includes('email not confirmed')) return '이메일 인증이 아직 안 됐어요. 메일함을 확인해 주세요.';
    if (m.includes('unable to validate email') || m.includes('invalid email')) return '이메일 형식을 다시 확인해 주세요.';
    if (m.includes('rate limit') || m.includes('too many')) return '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.';
    return '문제가 생겼어요: ' + (err.message || '알 수 없는 오류');
  }

  // ---------- 대시보드 ----------
  function countLearned(prefixTest) {
    return PROGRESS.getLearnedIds().filter(prefixTest).length;
  }

  async function renderDashboard() {
    authView.style.display = 'none';
    dashView.style.display = 'block';
    document.getElementById('dash-greeting').textContent = `${AUTH.displayName()}님, 반가워요! 👋`;

    const ids = PROGRESS.getLearnedIds();
    const hanziTotal = (window.HANZI_DATA || []).length;
    const gradeTotal = (window.GRADE_HANJA || []).length;
    const idiomTotal = (window.IDIOMS || []).length;
    const hanziDone = ids.filter(i => i.startsWith('h_')).length;
    const gradeDone = ids.filter(i => /^g\d/.test(i)).length;
    const idiomDone = ids.filter(i => i.startsWith('idiom_')).length;

    document.getElementById('dash-stats').innerHTML = [
      { icon: '📚', label: '생활 한자', done: hanziDone, total: hanziTotal, href: 'learn.html' },
      { icon: '🏅', label: '급수 한자', done: gradeDone, total: gradeTotal, href: 'grade.html' },
      { icon: '📖', label: '고사성어', done: idiomDone, total: idiomTotal, href: 'idiom.html' }
    ].map(s => `
      <a class="dash-stat" href="${s.href}">
        <span class="ds-icon">${s.icon}</span>
        <span class="ds-num">${s.done}<small>/${s.total}</small></span>
        <span class="ds-label">${s.label}</span>
        <span class="ds-bar"><span style="width:${s.total ? Math.round(s.done / s.total * 100) : 0}%"></span></span>
      </a>
    `).join('');

    // 급수별 최고 점수 (로컬 저장 + 서버 기록 통합)
    let best = {};
    try { best = JSON.parse(localStorage.getItem('hanzi_grade_best_scores') || '{}'); } catch (e) {}

    const results = await AUTH.fetchQuizResults(30);
    results.forEach(r => {
      if (r.mode === 'grade' && r.grade) {
        if (best[r.grade] == null || r.percent > best[r.grade]) best[r.grade] = r.percent;
      }
    });

    const gradeBox = document.getElementById('dash-grade-scores');
    const levels = window.GRADE_LEVELS || [];
    const rows = levels.filter(g => best[g.id] != null);
    gradeBox.innerHTML = rows.length
      ? rows.map(g => `
          <div class="dash-score-row">
            <span>${g.badge} ${g.name} <small>${g.title}</small></span>
            <span class="dash-score ${best[g.id] >= 70 ? 'pass' : ''}">${best[g.id]}점 ${best[g.id] >= 70 ? '✅' : ''}</span>
          </div>
        `).join('')
      : '<p class="dash-empty">아직 응시한 급수 시험이 없어요. <a href="quiz.html">모의시험 보러 가기</a></p>';

    // 최근 시험 기록
    const hist = document.getElementById('dash-history');
    hist.innerHTML = results.length
      ? results.slice(0, 8).map(r => {
          const d = new Date(r.created_at);
          const label = r.mode === 'grade' ? `${r.grade}급 시험`
            : (r.mode === 'idiom' ? '고사성어 문제은행' : '주제별 퀴즈');
          return `
            <div class="dash-hist-row">
              <span class="dh-date">${d.getMonth() + 1}/${d.getDate()}</span>
              <span class="dh-label">${label}</span>
              <span class="dh-score ${r.percent >= 70 ? 'pass' : ''}">${r.score}/${r.total} · ${r.percent}점</span>
            </div>
          `;
        }).join('')
      : '<p class="dash-empty">아직 시험 기록이 없어요.</p>';
  }

  // ---------- 로그인 상태 반영 ----------
  document.addEventListener('hanja:auth-changed', (e) => {
    if (e.detail && e.detail.user) renderDashboard();
    else { authView.style.display = 'block'; dashView.style.display = 'none'; }
  });
  document.addEventListener('hanja:progress-synced', () => {
    if (AUTH.isLoggedIn()) renderDashboard();
  });
  document.addEventListener('hanja:progress-changed', () => {
    if (AUTH.isLoggedIn()) renderDashboard();
  });

  if (AUTH && AUTH.isLoggedIn()) renderDashboard();
});
