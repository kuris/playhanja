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

  function markLearned(id) {
    const list = getLearnedIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }

  function unmarkLearned(id) {
    const list = getLearnedIds().filter(x => x !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function toggleLearned(id) {
    if (isLearned(id)) { unmarkLearned(id); return false; }
    markLearned(id); return true;
  }

  window.HanziProgress = { getLearnedIds, isLearned, markLearned, unmarkLearned, toggleLearned };
})();
