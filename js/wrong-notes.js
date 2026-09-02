/* ============================================================
   한자야 놀자! - 누적 오답 노트 저장소 (wrong-notes.js)
   - 퀴즈·급수 시험·고사성어 문제에서 틀린 항목을 기기에 누적 저장
   - 같은 문제를 또 틀리면 횟수가 올라가고, 맞히면 횟수가 줄어 0이 되면 졸업!
   - 로그인 상태면 서버에 저장된 시험 기록(quiz_results.wrong)에서도 불러와 합칩니다
   ============================================================ */

(function () {
  const KEY = 'hanzi_wrong_notes';

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('hanja:wrong-changed', { detail: { count: list.length } }));
  }

  // entry: { id, kind: 'hanja'|'grade'|'idiom', char, answer, type }
  function addWrong(entry) {
    if (!entry || !entry.id) return;
    const list = load();
    const found = list.find(w => w.id === entry.id);
    if (found) {
      found.count = (found.count || 1) + 1;
      found.lastAt = Date.now();
      found.type = entry.type || found.type;
      found.answer = entry.answer || found.answer;
    } else {
      list.push({
        id: entry.id,
        kind: entry.kind || 'hanja',
        char: entry.char,
        answer: entry.answer,
        type: entry.type,
        count: 1,
        lastAt: Date.now()
      });
    }
    save(list);
  }

  // 맞히면 횟수를 줄이고, 0이 되면 오답 노트에서 졸업
  function markCorrect(id) {
    const list = load();
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) return false;
    list[idx].count = (list[idx].count || 1) - 1;
    let graduated = false;
    if (list[idx].count <= 0) { list.splice(idx, 1); graduated = true; }
    save(list);
    return graduated;
  }

  function list() {
    return load().sort((a, b) => (b.count - a.count) || (b.lastAt - a.lastAt));
  }
  function listByKind(kind) {
    return list().filter(w => kind === 'all' || w.kind === kind);
  }
  function remove(id) { save(load().filter(w => w.id !== id)); }
  function clear() { save([]); }
  function count() { return load().length; }
  function has(id) { return load().some(w => w.id === id); }

  // 서버에 저장된 시험 기록의 오답을 로컬 노트에 합치기 (로그인 시 1회)
  function mergeFromResults(results) {
    if (!Array.isArray(results) || results.length === 0) return;
    const list = load();
    const byId = {};
    list.forEach(w => { byId[w.id] = w; });

    results.forEach(r => {
      (r.wrong || []).forEach(w => {
        if (!w || !w.id) return;
        if (byId[w.id]) return;   // 이미 있으면 그대로 둠(횟수 중복 방지)
        const entry = {
          id: w.id,
          kind: w.kind || 'hanja',
          char: w.char,
          answer: w.answer,
          type: w.type,
          count: 1,
          lastAt: new Date(r.created_at || Date.now()).getTime()
        };
        byId[w.id] = entry;
        list.push(entry);
      });
    });
    save(list);
  }

  window.HanjaWrongNotes = {
    addWrong, markCorrect, list, listByKind, remove, clear, count, has, mergeFromResults
  };
})();
