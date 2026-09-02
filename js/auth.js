/* ============================================================
   한자야 놀자! - 회원가입/로그인 & 학습 데이터 동기화 (auth.js)
   - Supabase 이메일 회원가입/로그인 (추후 구글 로그인 확장 가능)
   - 로그인하면 학습 진도·퀴즈 결과가 계정에 저장되어 다른 기기에서도 이어집니다
   - 비로그인 상태에서는 기존처럼 브라우저(localStorage)에만 저장됩니다
   ============================================================ */

(function () {
  const LOCAL_KEY = 'hanzi_learned_ids';
  const BEST_KEY = 'hanzi_grade_best_scores';
  const SERVICE = 'hanja';   // 이 프로젝트는 여러 서비스가 계정을 공유합니다

  let currentUser = null;
  let currentProfile = null;
  let syncing = false;

  function sb() { return window.sb || null; }
  function isReady() { return !!sb(); }

  // ---------- 로컬 진도 유틸 ----------
  function localIds() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function setLocalIds(ids) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(new Set(ids)))); } catch (e) {}
  }

  // ---------- 인증 ----------
  async function signUp(email, password, nickname) {
    if (!isReady()) throw new Error('서버 연결을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.');
    const { data, error } = await sb().auth.signUp({
      email: email,
      password: password,
      options: { data: { nickname: nickname || email.split('@')[0] } }
    });

    if (error) {
      // 다른 서비스(예: justseoul)에서 이미 같은 이메일로 계정을 만든 경우
      // 계정은 함께 쓰므로, 입력한 비밀번호로 바로 로그인을 시도해 자연스럽게 이어줍니다.
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already exists')) {
        try {
          await signIn(email, password);
          return { existingAccount: true, joinedNow: true, user: currentUser };
        } catch (e2) {
          // 비밀번호가 달라 로그인에 실패한 경우 - 안내만 하고 로그인 탭으로 유도
          const err = new Error('EXISTING_ACCOUNT');
          err.code = 'EXISTING_ACCOUNT';
          err.email = email;
          throw err;
        }
      }
      throw error;
    }

    // 이메일 인증이 켜져 있으면 세션 없이 확인 메일만 발송됩니다
    return { needsEmailConfirm: !!(data.user && !data.session), user: data.user };
  }

  async function signIn(email, password) {
    if (!isReady()) throw new Error('서버 연결을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.');
    const { data, error } = await sb().auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    return data.user;
  }

  async function signInWithGoogle() {
    if (!isReady()) throw new Error('서버 연결을 준비하지 못했어요.');
    const { error } = await sb().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + '/login.html' }
    });
    if (error) throw error;
  }

  async function signOut() {
    if (!isReady()) return;
    await sb().auth.signOut();
    currentUser = null;
    currentProfile = null;
    renderAuthBox();
    document.dispatchEvent(new CustomEvent('hanja:auth-changed', { detail: { user: null } }));
  }

  // 메일 링크로 들어와 새 비밀번호를 저장
  async function updatePassword(newPassword) {
    if (!isReady()) throw new Error('서버 연결을 준비하지 못했어요.');
    const { error } = await sb().auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }

  async function resetPassword(email) {
    if (!isReady()) throw new Error('서버 연결을 준비하지 못했어요.');
    const { error } = await sb().auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + '/login.html'
    });
    if (error) throw error;
  }

  // ---------- 서비스 멤버십 ----------
  // 계정은 여러 서비스가 공유하므로, "이 서비스에 처음 들어왔는지"를 여기서 판단합니다.
  let joinedNow = false;

  async function ensureMembership() {
    if (!currentUser || !isReady()) return { isNew: false, status: 'active' };
    try {
      const { data: rows } = await sb().schema('public').from('service_members')
        .select('*').eq('user_id', currentUser.id).eq('service', SERVICE);

      const existing = rows && rows[0];
      if (existing) {
        joinedNow = false;
        // 접속 시각만 갱신
        sb().schema('public').from('service_members')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('user_id', currentUser.id).eq('service', SERVICE)
          .then(() => {}, () => {});
        return { isNew: false, status: existing.status, role: existing.role };
      }

      // 이 서비스에는 처음 - 지금 가입 처리
      const meta = currentUser.user_metadata || {};
      const nick = meta.nickname || (currentUser.email || '').split('@')[0];
      await sb().schema('public').from('service_members').insert({
        user_id: currentUser.id,
        service: SERVICE,
        nickname: nick,
        last_seen_at: new Date().toISOString()
      });
      // 서비스 전용 프로필도 함께 생성
      await sb().from('profiles').upsert({ id: currentUser.id, nickname: nick }, { onConflict: 'id' });
      joinedNow = true;
      return { isNew: true, status: 'active' };
    } catch (e) {
      console.warn('[한자야 놀자] 서비스 가입 확인 실패:', e.message || e);
      return { isNew: false, status: 'active' };
    }
  }

  // ---------- 프로필 ----------
  async function loadProfile() {
    if (!currentUser) return null;
    const { data } = await sb().from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
    currentProfile = data || null;
    return currentProfile;
  }

  async function updateNickname(nickname) {
    if (!currentUser) return;
    const { error } = await sb().from('profiles')
      .upsert({ id: currentUser.id, nickname: nickname, updated_at: new Date().toISOString() });
    if (error) throw error;
    if (currentProfile) currentProfile.nickname = nickname;
    renderAuthBox();
  }

  function displayName() {
    if (!currentUser) return '';
    if (currentProfile && currentProfile.nickname) return currentProfile.nickname;
    const meta = currentUser.user_metadata || {};
    return meta.nickname || (currentUser.email || '').split('@')[0];
  }

  // ---------- 학습 진도 동기화 ----------
  // 로그인 시: 로컬 + 서버 진도를 합쳐(union) 양쪽에 반영
  async function syncProgressOnLogin() {
    if (!currentUser || syncing) return;
    syncing = true;
    try {
      const local = localIds();
      const { data, error } = await sb().from('learn_progress').select('item_id').eq('user_id', currentUser.id);
      if (error) throw error;
      const remote = (data || []).map(r => r.item_id);
      const merged = Array.from(new Set(local.concat(remote)));

      // 서버에 없는 로컬 진도를 업로드
      const toUpload = local.filter(id => remote.indexOf(id) === -1);
      if (toUpload.length > 0) {
        const rows = toUpload.map(id => ({ user_id: currentUser.id, item_id: id }));
        await sb().from('learn_progress').upsert(rows, { onConflict: 'user_id,item_id' });
      }

      setLocalIds(merged);

      // 서버에 저장된 시험 기록의 오답을 오답 노트로 합치기
      if (window.HanjaWrongNotes) {
        const results = await fetchQuizResults(30);
        window.HanjaWrongNotes.mergeFromResults(results);
      }

      // 복습 카드 상태와 학습 달력 동기화
      if (window.HanjaSRS && window.HanjaSRS.syncWithServer) {
        await window.HanjaSRS.syncWithServer();
      }

      // 학습 목표(프로필)를 기기에 반영
      if (currentProfile && currentProfile.grade_goal) {
        try {
          const localGoal = JSON.parse(localStorage.getItem('hanzi_study_goal') || 'null');
          if (!localGoal) {
            localStorage.setItem('hanzi_study_goal', JSON.stringify({
              grade: currentProfile.grade_goal,
              daily: currentProfile.daily_goal || 5,
              idiom: currentProfile.idiom_goal != null ? currentProfile.idiom_goal : 1,
              startedAt: Date.now()
            }));
          }
        } catch (e) {}
      }

      document.dispatchEvent(new CustomEvent('hanja:progress-synced', { detail: { count: merged.length } }));
    } catch (e) {
      console.warn('[한자야 놀자] 진도 동기화 실패:', e.message || e);
    } finally {
      syncing = false;
    }
  }

  // 개별 항목 변경 시 서버 반영 (progress.js에서 호출)
  async function syncItem(itemId, learned) {
    if (!currentUser || !isReady()) return;
    try {
      if (learned) {
        await sb().from('learn_progress')
          .upsert({ user_id: currentUser.id, item_id: itemId }, { onConflict: 'user_id,item_id' });
      } else {
        await sb().from('learn_progress')
          .delete().eq('user_id', currentUser.id).eq('item_id', itemId);
      }
    } catch (e) {
      console.warn('[한자야 놀자] 진도 저장 실패:', e.message || e);
    }
  }

  // ---------- 퀴즈 결과 저장 ----------
  async function saveQuizResult(result) {
    if (!currentUser || !isReady()) return;
    try {
      await sb().from('quiz_results').insert({
        user_id: currentUser.id,
        mode: result.mode,
        grade: result.grade || null,
        level: result.level != null ? String(result.level) : null,
        total: result.total,
        score: result.score,
        percent: result.percent,
        passed: !!result.passed,
        wrong: result.wrong || []
      });
    } catch (e) {
      console.warn('[한자야 놀자] 시험 결과 저장 실패:', e.message || e);
    }
  }

  async function fetchQuizResults(limit) {
    if (!currentUser || !isReady()) return [];
    const { data, error } = await sb().from('quiz_results')
      .select('*').eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }).limit(limit || 20);
    if (error) return [];
    return data || [];
  }

  // ---------- 헤더 로그인 버튼 ----------
  function renderAuthBox() {
    const wrap = document.querySelector('.site-header .nav-wrap');
    if (!wrap) return;
    let box = wrap.querySelector('.auth-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'auth-box';
      const toggle = wrap.querySelector('.nav-toggle');
      if (toggle) wrap.insertBefore(box, toggle);
      else wrap.appendChild(box);
    }

    if (currentUser) {
      box.innerHTML = `
        <a class="auth-user" href="login.html" title="내 학습 기록 보기">
          <span class="auth-avatar">${(displayName()[0] || '한').toUpperCase()}</span>
          <span class="auth-name">${displayName()}</span>
        </a>
      `;
    } else {
      box.innerHTML = `<a class="auth-login-btn" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> 로그인</a>`;
    }
  }

  // ---------- 초기화 ----------
  async function init() {
    renderAuthBox();
    if (!isReady()) return;

    const { data } = await sb().auth.getSession();
    if (data && data.session) {
      currentUser = data.session.user;
      const membership = await ensureMembership();
      await loadProfile();
      renderAuthBox();
      await syncProgressOnLogin();
      document.dispatchEvent(new CustomEvent('hanja:auth-changed', {
        detail: { user: currentUser, membership: membership }
      }));
    }

    sb().auth.onAuthStateChange(async (event, session) => {
      // 비밀번호 재설정 메일 링크로 들어온 경우
      if (event === 'PASSWORD_RECOVERY') {
        currentUser = session ? session.user : null;
        document.dispatchEvent(new CustomEvent('hanja:password-recovery', { detail: { user: currentUser } }));
        return;
      }

      const prevId = currentUser && currentUser.id;
      currentUser = session ? session.user : null;
      let membership = null;
      if (currentUser && currentUser.id !== prevId) {
        membership = await ensureMembership();
        await loadProfile();
        await syncProgressOnLogin();
      }
      renderAuthBox();
      document.dispatchEvent(new CustomEvent('hanja:auth-changed', {
        detail: { user: currentUser, membership: membership }
      }));
    });
  }

  window.HanjaAuth = {
    signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword,
    updateNickname, loadProfile, fetchQuizResults, saveQuizResult,
    syncItem, syncProgressOnLogin, ensureMembership,
    isNewToService: () => joinedNow,
    SERVICE: SERVICE,
    getUser: () => currentUser,
    getProfile: () => currentProfile,
    displayName: displayName,
    isLoggedIn: () => !!currentUser
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
