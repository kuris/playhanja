/* ============================================================
   한자야 놀자! - 학습 진도 저장(localStorage) 공용 유틸
   ============================================================ */

(function () {
  const STORAGE_KEY = 'hanzi_learned_ids';

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
