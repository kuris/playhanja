/* ============================================================
   한자야 놀자! - 간격 반복 복습 엔진 (srs.js)
   - 앙키(Anki)식 SM-2 간소화 알고리즘
   - 카드마다 "다음에 언제 다시 보여줄지(due)"를 기억합니다
     모르겠어요 → 오늘 다시 / 알쏭달쏭 → 짧게 / 알아요 → 점점 길게
   - 저장은 기기(localStorage) 기준, 로그인 시 학습 진도와 함께 쓰입니다
   ============================================================ */

(function () {
  const KEY = 'hanzi_srs_cards';
  const LOG_KEY = 'hanzi_study_log';   // 날짜별 학습 기록 (스트릭·플래너용)
  const DAY = 24 * 60 * 60 * 1000;

  // 등급: 0=모르겠어요 1=알쏭달쏭 2=알아요
  const GRADE = { AGAIN: 0, HARD: 1, GOOD: 2 };

  function loadAll() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return (raw && typeof raw === 'object') ? raw : {};
    } catch (e) { return {}; }
  }
  function saveAll(map) {
    try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('hanja:srs-changed'));
  }

  // 로그인 상태면 카드 한 장을 서버에 반영
  function pushCard(card) {
    if (!window.HanjaAuth || !window.HanjaAuth.isLoggedIn() || !window.sb) return;
    const user = window.HanjaAuth.getUser();
    window.sb.from('srs_cards').upsert({
      user_id: user.id,
      card_id: card.id,
      kind: card.kind || null,
      char_text: card.char || null,
      interval_days: card.interval || 0,
      ease: card.ease || 2.3,
      reps: card.reps || 0,
      lapses: card.lapses || 0,
      due: new Date(card.due || Date.now()).toISOString(),
      last_at: card.lastAt ? new Date(card.lastAt).toISOString() : null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,card_id' }).then(() => {}, () => {});
  }

  // 로그인 상태면 오늘 학습량을 서버에 반영
  // 짧은 시간에 여러 번 기록될 수 있으므로 묶어서(디바운스) 한 번만 보냅니다.
  let logPushTimer = null;
  let pendingLogDay = null;

  function flushLogPush() {
    if (logPushTimer) { clearTimeout(logPushTimer); logPushTimer = null; }
    if (!pendingLogDay) return;
    if (!window.HanjaAuth || !window.HanjaAuth.isLoggedIn() || !window.sb) { pendingLogDay = null; return; }

    const day = pendingLogDay;
    pendingLogDay = null;
    const rec = loadLog()[day] || { new: 0, review: 0, quiz: 0 };
    const user = window.HanjaAuth.getUser();
    window.sb.from('study_log').upsert({
      user_id: user.id,
      day: day,
      new_count: rec.new || 0,
      review_count: rec.review || 0,
      quiz_count: rec.quiz || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,day' }).then(() => {}, () => {});
  }

  function pushLog(dayKey) {
    if (!window.HanjaAuth || !window.HanjaAuth.isLoggedIn() || !window.sb) return;
    pendingLogDay = dayKey;
    if (logPushTimer) clearTimeout(logPushTimer);
    logPushTimer = setTimeout(flushLogPush, 700);
  }

  // 페이지를 벗어나기 직전에 남은 기록을 즉시 전송
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushLogPush(); });
  window.addEventListener('pagehide', flushLogPush);

  function todayKey(d) {
    const t = d ? new Date(d) : new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  // ---------- 날짜별 학습 로그 (스트릭/플래너) ----------
  function loadLog() {
    try {
      const raw = JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
      return (raw && typeof raw === 'object') ? raw : {};
    } catch (e) { return {}; }
  }
  function saveLog(log) {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('hanja:log-changed'));
  }
  // kind: 'new'(새 한자) | 'review'(복습) | 'quiz'(퀴즈 문항)
  function addLog(kind, n) {
    const log = loadLog();
    const k = todayKey();
    if (!log[k]) log[k] = { new: 0, review: 0, quiz: 0 };
    log[k][kind] = (log[k][kind] || 0) + (n || 1);
    saveLog(log);
    pushLog(k);
  }
  function getLog() { return loadLog(); }
  function getTodayLog() { return loadLog()[todayKey()] || { new: 0, review: 0, quiz: 0 }; }

  // 연속 학습 일수 (오늘 또는 어제까지 이어진 기록)
  function streak() {
    const log = loadLog();
    let count = 0;
    const cur = new Date();
    // 오늘 기록이 없으면 어제부터 세되, 어제도 없으면 0
    if (!log[todayKey(cur)]) cur.setTime(cur.getTime() - DAY);
    while (log[todayKey(cur)]) {
      const day = log[todayKey(cur)];
      if ((day.new || 0) + (day.review || 0) + (day.quiz || 0) <= 0) break;
      count++;
      cur.setTime(cur.getTime() - DAY);
    }
    return count;
  }

  // ---------- 카드 상태 ----------
  function getCard(id) {
    return loadAll()[id] || null;
  }

  function isDue(card, now) {
    if (!card) return true;                 // 아직 안 본 카드는 항상 대상
    return (card.due || 0) <= (now || Date.now());
  }

  /**
   * 카드 채점 후 다음 복습 시점 계산
   * @returns {{interval:number, due:number, label:string}}
   */
  function review(id, grade, meta) {
    const map = loadAll();
    const now = Date.now();
    const card = map[id] || { id: id, interval: 0, ease: 2.3, reps: 0, lapses: 0, kind: (meta && meta.kind) || 'hanja' };

    let interval;   // 단위: 일
    if (grade === GRADE.AGAIN) {
      card.lapses = (card.lapses || 0) + 1;
      card.ease = Math.max(1.3, (card.ease || 2.3) - 0.2);
      interval = 0;                                   // 오늘 다시
    } else if (grade === GRADE.HARD) {
      card.ease = Math.max(1.3, (card.ease || 2.3) - 0.05);
      interval = card.interval > 0 ? Math.max(1, Math.round(card.interval * 1.2)) : 1;
    } else {
      if (!card.interval) interval = 1;               // 처음 맞히면 내일
      else if (card.interval === 1) interval = 3;     // 그다음 3일
      else interval = Math.round(card.interval * (card.ease || 2.3));
      card.ease = Math.min(2.8, (card.ease || 2.3) + 0.05);
    }
    interval = Math.min(interval, 180);               // 최대 6개월

    card.interval = interval;
    card.reps = (card.reps || 0) + 1;
    card.lastAt = now;
    card.due = interval === 0 ? now : now + interval * DAY;
    if (meta && meta.kind) card.kind = meta.kind;
    if (meta && meta.char) card.char = meta.char;

    map[id] = card;
    saveAll(map);
    pushCard(card);

    return {
      interval: interval,
      due: card.due,
      label: interval === 0 ? '오늘 다시' : (interval === 1 ? '내일 다시' : interval + '일 뒤 다시')
    };
  }

  // 다음 복습까지 남은 표시용 문구
  function previewIntervals(id) {
    const card = getCard(id);
    const base = card && card.interval ? card.interval : 0;
    const ease = (card && card.ease) || 2.3;
    const good = !base ? 1 : (base === 1 ? 3 : Math.round(base * ease));
    const hard = base > 0 ? Math.max(1, Math.round(base * 1.2)) : 1;
    return {
      again: '오늘 다시',
      hard: hard === 1 ? '내일' : hard + '일 뒤',
      good: good === 1 ? '내일' : good + '일 뒤'
    };
  }

  // ---------- 덱 만들기 ----------
  /**
   * 카드 목록 생성
   * @param {String} deck  'grade:7' | 'idiom' | 'idiom:1' | 'hanja' | 'wrong' | 'due'
   * @param {Object} opts  { limit, onlyDue }
   */
  function buildDeck(deck, opts) {
    opts = opts || {};
    const now = Date.now();
    let items = [];

    function fromGrade(gradeId) {
      const all = window.GRADE_HANJA || [];
      const list = gradeId ? all.filter(h => h.grade === Number(gradeId)) : all;
      return list.map(h => ({
        id: h.id, kind: 'grade', char: h.char,
        front: h.char,
        back: `${h.meaning} ${h.sound}`,
        sub: `${window.getGradeInfo ? window.getGradeInfo(h.grade).name : ''}`
      }));
    }
    function fromHanja() {
      return (window.HANZI_DATA || []).map(h => ({
        id: h.id, kind: 'hanja', char: h.char,
        front: h.char,
        back: `${h.meaning} (${h.sound})`,
        sub: `${h.strokes}획`,
        extra: h.story
      }));
    }
    function fromIdiom(level) {
      const all = window.IDIOMS || [];
      const list = level ? all.filter(i => i.level === Number(level)) : all;
      return list.map(i => ({
        id: i.id, kind: 'idiom', char: i.idiom,
        front: i.idiom,
        back: `${i.reading} — ${i.meaning}`,
        sub: i.tag,
        extra: i.lesson
      }));
    }

    if (deck.startsWith('grade')) {
      items = fromGrade(deck.split(':')[1]);
    } else if (deck.startsWith('idiom')) {
      items = fromIdiom(deck.split(':')[1]);
    } else if (deck === 'hanja') {
      items = fromHanja();
    } else if (deck === 'wrong') {
      const notes = window.HanjaWrongNotes ? window.HanjaWrongNotes.list() : [];
      const pool = fromGrade().concat(fromHanja(), fromIdiom());
      const byId = {};
      pool.forEach(c => { byId[c.id] = c; });
      items = notes.map(n => byId[n.id]).filter(Boolean);
    } else if (deck === 'due') {
      // 오늘 복습할 카드: 이미 한 번 이상 본 카드 중 기한이 된 것
      const map = loadAll();
      const pool = fromGrade().concat(fromHanja(), fromIdiom());
      const byId = {};
      pool.forEach(c => { byId[c.id] = c; });
      items = Object.keys(map)
        .filter(id => (map[id].due || 0) <= now && byId[id])
        .map(id => byId[id]);
    }

    if (opts.onlyDue) {
      const map = loadAll();
      items = items.filter(c => isDue(map[c.id], now));
    }
    if (opts.shuffle !== false) items = shuffle(items);
    if (opts.limit) items = items.slice(0, opts.limit);
    return items;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- 통계 ----------
  function stats() {
    const map = loadAll();
    const now = Date.now();
    const ids = Object.keys(map);
    return {
      total: ids.length,
      due: ids.filter(id => (map[id].due || 0) <= now).length,
      learned: ids.filter(id => (map[id].interval || 0) >= 7).length,   // 7일 이상 = 익힘
      tomorrow: ids.filter(id => {
        const d = map[id].due || 0;
        return d > now && d <= now + DAY;
      }).length
    };
  }

  function reset() { saveAll({}); }

  /**
   * 로그인 시 서버와 병합
   * - 카드: 더 최근에 복습한 쪽(lastAt)을 채택
   * - 학습 로그: 날짜별로 큰 값을 채택 (기기 두 대에서 각각 공부한 경우 대비)
   */
  async function syncWithServer() {
    if (!window.HanjaAuth || !window.HanjaAuth.isLoggedIn() || !window.sb) return;
    const user = window.HanjaAuth.getUser();

    try {
      // ---- 카드 상태 ----
      const local = loadAll();
      const { data: rows } = await window.sb.from('srs_cards').select('*').eq('user_id', user.id);
      const merged = Object.assign({}, local);

      (rows || []).forEach(r => {
        const remote = {
          id: r.card_id,
          kind: r.kind,
          char: r.char_text,
          interval: r.interval_days || 0,
          ease: r.ease || 2.3,
          reps: r.reps || 0,
          lapses: r.lapses || 0,
          due: new Date(r.due).getTime(),
          lastAt: r.last_at ? new Date(r.last_at).getTime() : 0
        };
        const mine = merged[r.card_id];
        if (!mine || (remote.lastAt || 0) > (mine.lastAt || 0)) merged[r.card_id] = remote;
      });
      saveAll(merged);

      // 서버에 없거나 오래된 카드 올리기
      const remoteMap = {};
      (rows || []).forEach(r => { remoteMap[r.card_id] = new Date(r.last_at || 0).getTime(); });
      const toPush = Object.keys(merged)
        .filter(id => (merged[id].lastAt || 0) > (remoteMap[id] || 0))
        .map(id => merged[id]);
      if (toPush.length) {
        await window.sb.from('srs_cards').upsert(toPush.map(c => ({
          user_id: user.id, card_id: c.id, kind: c.kind || null, char_text: c.char || null,
          interval_days: c.interval || 0, ease: c.ease || 2.3, reps: c.reps || 0, lapses: c.lapses || 0,
          due: new Date(c.due || Date.now()).toISOString(),
          last_at: c.lastAt ? new Date(c.lastAt).toISOString() : null,
          updated_at: new Date().toISOString()
        })), { onConflict: 'user_id,card_id' });
      }

      // ---- 학습 로그 ----
      const localLog = loadLog();
      const { data: logRows } = await window.sb.from('study_log').select('*').eq('user_id', user.id);
      const mergedLog = Object.assign({}, localLog);

      (logRows || []).forEach(r => {
        const cur = mergedLog[r.day] || { new: 0, review: 0, quiz: 0 };
        mergedLog[r.day] = {
          new: Math.max(cur.new || 0, r.new_count || 0),
          review: Math.max(cur.review || 0, r.review_count || 0),
          quiz: Math.max(cur.quiz || 0, r.quiz_count || 0)
        };
      });
      saveLog(mergedLog);

      const logToPush = Object.keys(mergedLog).map(day => ({
        user_id: user.id, day: day,
        new_count: mergedLog[day].new || 0,
        review_count: mergedLog[day].review || 0,
        quiz_count: mergedLog[day].quiz || 0,
        updated_at: new Date().toISOString()
      }));
      if (logToPush.length) {
        await window.sb.from('study_log').upsert(logToPush, { onConflict: 'user_id,day' });
      }

      document.dispatchEvent(new CustomEvent('hanja:srs-synced'));
    } catch (e) {
      console.warn('[한자야 놀자] 복습 카드 동기화 실패:', e.message || e);
    }
  }

  window.HanjaSRS = {
    GRADE, review, getCard, isDue, buildDeck, previewIntervals, stats, reset,
    addLog, getLog, getTodayLog, streak, todayKey, syncWithServer
  };
})();
