/* ============================================================
   한자야 놀자! - 학습 진도 저장(localStorage) 공용 유틸
   ============================================================ */

(function () {
  const STORAGE_KEY = 'hanzi_learned_ids';
  const MIGRATION_KEY = 'hanzi_id_migration_v2';

  // 급수 체계 개편(어문회 기준)으로 급수 한자 id가 g9_一 → gh_一 로 바뀌었습니다.
  // 기존 학습 기록이 사라지지 않도록 최초 1회 변환합니다.
  (function migrateIds() {
    try {
      if (localStorage.getItem(MIGRATION_KEY)) return;
      const conv = (id) => {
        const m = /^g\d+_(.)$/.exec(id || '');
        return m ? 'gh_' + m[1] : id;
      };
      // 학습 진도
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(raw)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(raw.map(conv)))));
      }
      // 오답 노트
      const notes = JSON.parse(localStorage.getItem('hanzi_wrong_notes') || '[]');
      if (Array.isArray(notes)) {
        notes.forEach(n => { if (n && n.id) n.id = conv(n.id); });
        localStorage.setItem('hanzi_wrong_notes', JSON.stringify(notes));
      }
      // 복습 카드
      const srs = JSON.parse(localStorage.getItem('hanzi_srs_cards') || '{}');
      if (srs && typeof srs === 'object') {
        const next = {};
        Object.keys(srs).forEach(k => {
          const nk = conv(k);
          srs[k].id = nk;
          next[nk] = srs[k];
        });
        localStorage.setItem('hanzi_srs_cards', JSON.stringify(next));
      }
      // 학습 목표(급수 번호 → 급수 id)
      const goal = JSON.parse(localStorage.getItem('hanzi_study_goal') || 'null');
      if (goal && typeof goal.grade === 'number') {
        const map = { 9: 'g8', 8: 'g8', 7: 'g7', 6: 'g6', 5: 'g5', 4: 'g4', 3: 'adv', 2: 'adv', 1: 'adv' };
        goal.grade = map[goal.grade] || 'g8';
        localStorage.setItem('hanzi_study_goal', JSON.stringify(goal));
      }
      localStorage.setItem(MIGRATION_KEY, String(Date.now()));
      console.info('[한자야 놀자] 급수 체계 개편에 맞춰 학습 기록을 옮겼습니다.');
    } catch (e) {
      console.warn('[한자야 놀자] 학습 기록 변환 실패:', e);
    }
  })();

  function getLearnedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function isLearned(id) {
    return getLearnedIds().includes(id);
  }

  // 로그인 상태면 서버(Supabase)에도 반영 - 비로그인이면 아무 일도 하지 않음
  function syncToCloud(id, learned) {
    if (window.HanjaAuth && window.HanjaAuth.isLoggedIn()) {
      window.HanjaAuth.syncItem(id, learned);
    }
    // 대시보드 등 다른 화면이 즉시 갱신할 수 있도록 알림
    document.dispatchEvent(new CustomEvent('hanja:progress-changed', { detail: { id: id, learned: learned } }));
  }

  function markLearned(id) {
    const list = getLearnedIds();
    const isNew = !list.includes(id);
    if (isNew) {
      list.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      // 플래너 스트릭/달력을 위해 날짜별 학습 기록 남기기
      if (window.HanjaSRS) window.HanjaSRS.addLog('new', 1);
    }
    syncToCloud(id, true);
  }

  function unmarkLearned(id) {
    const list = getLearnedIds().filter(x => x !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    syncToCloud(id, false);
  }

  function toggleLearned(id) {
    if (isLearned(id)) { unmarkLearned(id); return false; }
    markLearned(id); return true;
  }

  window.HanziProgress = { getLearnedIds, isLearned, markLearned, unmarkLearned, toggleLearned };
})();
