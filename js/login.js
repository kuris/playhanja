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
      const email = document.getElementById('signup-email').value.trim();
      const res = await AUTH.signUp(
        email,
        document.getElementById('signup-password').value,
        document.getElementById('signup-nickname').value.trim()
      );
      if (res.existingAccount) {
        // 다른 서비스에서 이미 만든 계정으로 자연스럽게 이어진 경우
        showMsg('이미 만들어 두신 계정이 있어서 <strong>그 계정으로 시작</strong>했어요! 🎉<br>'
              + '<small>저희 서비스들은 계정을 함께 써서, 한 번 가입하면 모두 이용할 수 있어요.</small>', 'ok');
      } else if (res.needsEmailConfirm) {
        showMsg('가입 확인 메일을 보냈어요! 📧<br>메일함에서 링크를 눌러 인증한 뒤 로그인해 주세요.', 'ok');
      } else {
        showMsg('가입 완료! 바로 시작할게요 🎉', 'ok');
      }
    } catch (err) {
      if (err && err.code === 'EXISTING_ACCOUNT') {
        // 이미 계정이 있는데 비밀번호가 달라 자동 로그인에 실패한 경우
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        document.getElementById('login-email').value = err.email || '';
        document.getElementById('login-password').focus();
        showMsg('이 이메일로 만든 계정이 <strong>이미 있어요</strong> 🙂<br>'
              + '저희 서비스들은 계정을 함께 쓰기 때문에, <strong>기존 비밀번호로 로그인</strong>하면 바로 시작할 수 있어요.<br>'
              + '<small>비밀번호가 기억나지 않으면 아래 “비밀번호를 잊으셨나요?”를 눌러주세요.</small>', 'info');
      } else {
        showMsg(translateError(err), 'error');
      }
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
    if (m.includes('already registered') || m.includes('already been registered'))
      return '이 이메일로 만든 계정이 이미 있어요. 기존 비밀번호로 로그인해 주세요.';
    if (m.includes('password should be')) return '비밀번호는 6자 이상이어야 해요.';
    if (m.includes('email not confirmed')) return '이메일 인증이 아직 안 됐어요. 메일함을 확인해 주세요.';
    if (m.includes('unable to validate email') || m.includes('invalid email')) return '이메일 형식을 다시 확인해 주세요.';
    if (m.includes('rate limit') || m.includes('too many')) return '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.';
    return '문제가 생겼어요: ' + (err.message || '알 수 없는 오류');
  }

  // ---------- 구글 로그인 (Supabase에서 provider를 켜면 자동 노출) ----------
  const oauthBox = document.getElementById('auth-oauth');
  const googleBtn = document.getElementById('google-login-btn');

  async function setupGoogleLogin() {
    if (!oauthBox || !googleBtn || !window.SUPABASE_URL) return;
    try {
      const res = await fetch(window.SUPABASE_URL + '/auth/v1/settings', {
        headers: { apikey: window.SUPABASE_PUBLISHABLE_KEY }
      });
      const settings = await res.json();
      if (settings && settings.external && settings.external.google) {
        oauthBox.style.display = 'block';
      }
    } catch (e) {
      // 설정을 확인하지 못하면 버튼을 숨긴 채로 둡니다 (이메일 로그인은 정상 동작)
    }
  }

  googleBtn && googleBtn.addEventListener('click', async () => {
    try {
      showMsg('구글 로그인 창으로 이동할게요...', 'info');
      await AUTH.signInWithGoogle();
    } catch (err) {
      showMsg(translateError(err), 'error');
    }
  });

  setupGoogleLogin();

  // ---------- 대시보드 ----------
  function countLearned(prefixTest) {
    return PROGRESS.getLearnedIds().filter(prefixTest).length;
  }

  async function renderDashboard(membership) {
    authView.style.display = 'none';
    dashView.style.display = 'block';
    document.getElementById('dash-greeting').textContent = `${AUTH.displayName()}님, 반가워요! 👋`;

    // 다른 서비스 계정으로 처음 들어온 경우 안내
    const welcome = document.getElementById('service-welcome');
    if (welcome) {
      if (membership && membership.isNew) {
        welcome.style.display = 'block';
        welcome.innerHTML = '🎉 <strong>한자야 놀자에 오신 걸 환영해요!</strong> 기존 계정으로 바로 시작했어요. '
                          + '학습 기록은 이 서비스에만 저장되니 안심하세요.';
      } else {
        welcome.style.display = 'none';
      }
    }

    const ids = PROGRESS.getLearnedIds();
    const hanziTotal = (window.HANZI_DATA || []).length;
    const gradeTotal = (window.GRADE_HANJA || []).length;
    const idiomTotal = (window.IDIOMS || []).length;
    const hanziDone = ids.filter(i => i.startsWith('h_')).length;
    const gradeDone = ids.filter(i => /^g\d/.test(i)).length;
    const idiomDone = ids.filter(i => i.startsWith('idiom_')).length;

    const wrongCount = window.HanjaWrongNotes ? window.HanjaWrongNotes.count() : 0;
    document.getElementById('dash-stats').innerHTML = [
      { icon: '📚', label: '생활 한자', done: hanziDone, total: hanziTotal, href: 'learn.html' },
      { icon: '🏅', label: '급수 한자', done: gradeDone, total: gradeTotal, href: 'grade.html' },
      { icon: '📖', label: '고사성어', done: idiomDone, total: idiomTotal, href: 'idiom.html' },
      { icon: '📒', label: '복습할 오답', done: wrongCount, total: null, href: 'quiz.html' }
    ].map(s => `
      <a class="dash-stat" href="${s.href}">
        <span class="ds-icon">${s.icon}</span>
        <span class="ds-num">${s.done}${s.total ? `<small>/${s.total}</small>` : '<small>개</small>'}</span>
        <span class="ds-label">${s.label}</span>
        <span class="ds-bar"><span style="width:${s.total ? Math.round(s.done / s.total * 100) : (s.done ? 100 : 0)}%"></span></span>
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
    if (e.detail && e.detail.user) renderDashboard(e.detail.membership);
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
