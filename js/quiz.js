/* ============================================================
   한자야 놀자! - quiz.html 전용 스크립트
   1) 주제별 뜻 맞히기 퀴즈
   2) 급수별(1급~9급) 모의시험 - 혼합 출제 유형 + 오답 노트 + 최고 점수 저장
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const DATA = window.HANZI_DATA || [];
  const CATEGORIES = window.CATEGORIES || [];
  const GRADE_LEVELS = window.GRADE_LEVELS || [];
  const GRADE_HANJA = window.GRADE_HANJA || [];
  const IDIOMS = window.IDIOMS || [];
  const IDIOM_LEVELS = window.IDIOM_LEVELS || [];
  const NOTES = window.HanjaWrongNotes;
  const PROGRESS = window.HanziProgress;

  const BEST_KEY = 'hanzi_grade_best_scores';
  const PASS_SCORE = 70;

  // 상단 내비게이션(햄버거 메뉴)은 js/nav.js에서 공통 처리합니다.

  const modeTabs = document.querySelectorAll('.quiz-mode-tab');
  const setupCategory = document.getElementById('setup-category');
  const setupGrade = document.getElementById('setup-grade');
  const setupIdiom = document.getElementById('setup-idiom');
  const setupReview = document.getElementById('setup-review');
  const reviewListBox = document.getElementById('review-list');
  const reviewKindFilter = document.getElementById('review-kind-filter');
  const idiomFilterBox = document.getElementById('idiom-level-filter-quiz');
  const idiomCount = document.getElementById('idiom-count');
  const idiomQtype = document.getElementById('idiom-qtype');
  const catFilterBox = document.getElementById('quiz-category-filter');
  const gradePicker = document.getElementById('quiz-grade-picker');
  const countSelect = document.getElementById('quiz-count');
  const qtypeSelect = document.getElementById('quiz-qtype');
  const startBtn = document.getElementById('start-quiz-btn');
  const rangeInfo = document.getElementById('quiz-range-info');
  const setupBox = document.getElementById('quiz-setup');
  const playBox = document.getElementById('quiz-play');
  const resultBox = document.getElementById('quiz-result');

  const quizProgress = document.getElementById('quiz-progress');
  const quizTypeBadge = document.getElementById('quiz-type-badge');
  const quizChar = document.getElementById('quiz-char');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const retryBtn = document.getElementById('retry-quiz-btn');
  const passBadge = document.getElementById('result-pass-badge');
  const wrongNote = document.getElementById('wrong-note');
  const wrongList = document.getElementById('wrong-list');
  const resultLearnLink = document.getElementById('result-learn-link');
  const resultPrintLink = document.getElementById('result-print-link');

  let mode = 'category';        // 'category' | 'grade' | 'idiom' | 'review'
  let idiomLevel = 'all';
  let reviewKind = 'all';
  let selectedCat = 'all';
  let selectedGrade = 'g8';
  let quizPool = [];
  let quizQueue = [];
  let qIndex = 0;
  let score = 0;
  let locked = false;
  let wrongAnswers = [];

  // ---------- 최고 점수 저장 ----------
  function getBestScores() {
    try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  // 반환값: 이전 기록이 있는 상태에서 점수를 경신했을 때만 true
  function saveBestScore(gradeId, pct) {
    const best = getBestScores();
    const prev = best[gradeId];
    if (prev == null || pct > prev) {
      best[gradeId] = pct;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (e) {}
      return prev != null;
    }
    return false;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- 모드 전환 ----------
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = tab.dataset.mode;
      setupCategory.style.display = mode === 'category' ? 'block' : 'none';
      setupGrade.style.display = mode === 'grade' ? 'block' : 'none';
      if (setupIdiom) setupIdiom.style.display = mode === 'idiom' ? 'block' : 'none';
      if (setupReview) setupReview.style.display = mode === 'review' ? 'block' : 'none';
      if (mode === 'grade') startBtn.innerHTML = '<i class="fa-solid fa-file-pen"></i> 급수 시험 시작!';
      else if (mode === 'idiom') startBtn.innerHTML = '<i class="fa-solid fa-book-open"></i> 성어 문제 풀기!';
      else if (mode === 'review') startBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> 오답만 다시 풀기!';
      else startBtn.innerHTML = '<i class="fa-solid fa-play"></i> 퀴즈 시작!';
      startBtn.disabled = false;
      if (mode === 'review') renderReviewList();
      updateRangeInfo();
    });
  });

  // ---------- 주제별 카테고리 선택 UI ----------
  function renderCatFilter() {
    let html = `<button class="filter-chip active" data-cat="all"><span class="chip-icon">🗂️</span> 전체 한자 (${DATA.length}자)</button>`;
    CATEGORIES.forEach(c => {
      const count = DATA.filter(h => h.category === c.id).length;
      html += `<button class="filter-chip" data-cat="${c.id}"><span class="chip-icon">${c.icon}</span> ${c.name} (${count}자)</button>`;
    });
    catFilterBox.innerHTML = html;
    catFilterBox.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        catFilterBox.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCat = btn.dataset.cat;
        updateRangeInfo();
      });
    });
  }

  // ---------- 급수 선택 UI ----------
  function renderGradePicker() {
    if (!gradePicker) return;
    const best = getBestScores();
    gradePicker.innerHTML = GRADE_LEVELS.map(g => {
      const total = GRADE_HANJA.filter(h => h.grade === g.id).length;
      const b = best[g.id];
      return `
        <button class="grade-card ${g.id === selectedGrade ? 'active' : ''}" data-grade="${g.id}" style="--grade-color:${g.color};">
          <span class="grade-badge">${g.badge}</span>
          <span class="grade-name">${g.name}</span>
          <span class="grade-title">${g.title}</span>
          <span class="grade-count">${total}자</span>
          <span class="grade-done">${b != null ? '최고 ' + b + '점' : '&nbsp;'}</span>
        </button>
      `;
    }).join('');
    gradePicker.querySelectorAll('.grade-card').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedGrade = btn.dataset.grade;
        renderGradePicker();
        updateRangeInfo();
      });
    });
  }

  // ---------- 고사성어 난이도 필터 ----------
  function renderIdiomFilter() {
    if (!idiomFilterBox) return;
    let html = `<button class="filter-chip ${idiomLevel === 'all' ? 'active' : ''}" data-lv="all"><span class="chip-icon">📚</span> 전체 (${IDIOMS.length}개)</button>`;
    IDIOM_LEVELS.forEach(l => {
      const cnt = IDIOMS.filter(i => i.level === l.id).length;
      html += `<button class="filter-chip ${idiomLevel == l.id ? 'active' : ''}" data-lv="${l.id}"><span class="chip-icon">${l.badge}</span> ${l.name} (${cnt}개)</button>`;
    });
    idiomFilterBox.innerHTML = html;
    idiomFilterBox.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        idiomLevel = btn.dataset.lv === 'all' ? 'all' : Number(btn.dataset.lv);
        renderIdiomFilter();
        updateRangeInfo();
      });
    });
  }

  // ---------- 오답 복습 ----------
  function resolveWrongItem(w) {
    if (!w) return null;
    if (w.kind === 'idiom') return IDIOMS.find(i => i.id === w.id);
    if (w.kind === 'grade') return GRADE_HANJA.find(h => h.id === w.id);
    return DATA.find(h => h.id === w.id);
  }

  const KIND_LABEL = { hanja: '생활 한자', grade: '급수 한자', idiom: '고사성어' };

  function renderReviewList() {
    if (!reviewListBox || !NOTES) return;

    // 종류 필터 칩
    if (reviewKindFilter) {
      const all = NOTES.list();
      const kinds = [['all', '전체', '🗂️'], ['grade', '급수 한자', '🏅'], ['idiom', '고사성어', '📖'], ['hanja', '생활 한자', '📚']];
      reviewKindFilter.innerHTML = kinds.map(k => {
        const n = k[0] === 'all' ? all.length : all.filter(w => w.kind === k[0]).length;
        return `<button class="filter-chip ${reviewKind === k[0] ? 'active' : ''}" data-kind="${k[0]}"><span class="chip-icon">${k[2]}</span> ${k[1]} <span class="chip-count">(${n})</span></button>`;
      }).join('');
      reviewKindFilter.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          reviewKind = btn.dataset.kind;
          renderReviewList();
          updateRangeInfo();
        });
      });
    }

    const list = NOTES.listByKind(reviewKind);
    if (list.length === 0) {
      reviewListBox.innerHTML = `<p class="dash-empty" style="text-align:center;">아직 틀린 문제가 없어요! 퀴즈를 풀고 나면 틀린 문제가 여기에 모여요. 🎉</p>`;
      // 오답 복습 모드일 때만 시작 버튼을 잠근다 (다른 모드까지 잠기면 안 됨)
      if (mode === 'review') startBtn.disabled = true;
      return;
    }
    startBtn.disabled = false;

    reviewListBox.innerHTML = list.map(w => `
      <div class="review-item" data-id="${w.id}">
        <span class="rv-char ${w.char && w.char.length > 1 ? 'rv-char-long' : ''}">${w.char || '?'}</span>
        <span class="rv-info">
          <strong>${w.answer || ''}</strong>
          <small>${KIND_LABEL[w.kind] || ''} · ${w.type || ''}</small>
        </span>
        <span class="rv-count" title="틀린 횟수">${w.count}번 틀림</span>
        <button class="rv-del" data-del="${w.id}" title="이 문제 지우기"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join('');

    reviewListBox.querySelectorAll('.rv-del').forEach(btn => {
      btn.addEventListener('click', () => {
        NOTES.remove(btn.dataset.del);
        renderReviewList();
        updateRangeInfo();
      });
    });
  }

  const clearNotesBtn = document.getElementById('clear-notes-btn');
  if (clearNotesBtn) {
    clearNotesBtn.addEventListener('click', () => {
      if (confirm('오답 노트를 모두 지울까요? 되돌릴 수 없어요.')) {
        NOTES.clear();
        renderReviewList();
        updateRangeInfo();
      }
    });
  }

  const printNotesBtn = document.getElementById('print-notes-btn');
  if (printNotesBtn) {
    printNotesBtn.addEventListener('click', () => {
      window.open('worksheet.html?type=wrong&kind=' + reviewKind, '_blank');
    });
  }

  // ---------- 출제 범위 안내 ----------
  function getPool() {
    if (mode === 'review') {
      return NOTES.listByKind(reviewKind).map(w => {
        const item = resolveWrongItem(w);
        return item ? { note: w, item: item } : null;
      }).filter(Boolean);
    }
    if (mode === 'idiom') {
      return idiomLevel === 'all' ? IDIOMS.slice() : IDIOMS.filter(i => i.level === Number(idiomLevel));
    }
    if (mode === 'grade') {
      return GRADE_HANJA.filter(h => h.grade === selectedGrade);
    }
    return selectedCat === 'all' ? DATA.slice() : DATA.filter(h => h.category === selectedCat);
  }

  function updateRangeInfo() {
    const pool = getPool();
    if (mode === 'review') {
      rangeInfo.textContent = pool.length
        ? `복습할 오답 ${pool.length}개 · 맞히면 오답 노트에서 하나씩 졸업해요!`
        : '오답 노트가 비어 있어요.';
      return;
    }
    if (mode === 'idiom') {
      const learned = pool.filter(i => PROGRESS.isLearned(i.id)).length;
      rangeInfo.textContent = `출제 범위 ${pool.length}개 성어 · 학습 완료 ${learned}개 · 유래 일화는 고사성어 페이지에서 읽을 수 있어요.`;
      return;
    }
    if (mode === 'grade') {
      const info = window.getGradeInfo(selectedGrade);
      const best = getBestScores()[selectedGrade];
      const learned = pool.filter(h => PROGRESS.isLearned(h.id)).length;
      rangeInfo.textContent =
        `${info.badge} ${info.name}(${info.title}) 출제 범위 ${pool.length}자 · 학습 완료 ${learned}자`
        + (best != null ? ` · 최고 점수 ${best}점` : '');
    } else {
      const learnedCount = pool.filter(h => PROGRESS.isLearned(h.id)).length;
      rangeInfo.textContent = `총 ${pool.length}자 중 ${learnedCount}자를 학습했어요. 최소 4자 이상 있어야 퀴즈를 시작할 수 있어요.`;
    }
  }

  // ---------- 퀴즈 시작 ----------
  startBtn.addEventListener('click', () => {
    quizPool = getPool();
    if (quizPool.length < 4) {
      alert('퀴즈를 만들기엔 한자 수가 너무 적어요. 다른 범위를 선택해 주세요!');
      return;
    }

    if (mode === 'review') {
      quizQueue = shuffle(quizPool).slice(0, 20).map(entry => ({
        item: entry.item,
        kind: entry.note.kind,
        noteId: entry.note.id,
        type: entry.note.kind === 'idiom' ? pickIdiomType() : pickType()
      }));
    } else if (mode === 'review') {
      const left = NOTES ? NOTES.count() : 0;
      passBadge.innerHTML = `
        <div class="pass-badge ${left === 0 ? 'pass' : 'fail'}">
          ${left === 0 ? '🎉 오답 노트를 모두 졸업했어요!' : `📒 남은 오답 ${left}개`}
          <small>맞힌 문제는 오답 노트에서 하나씩 사라져요</small>
        </div>
      `;
      resultLearnLink.href = 'quiz.html';
      resultLearnLink.innerHTML = '<i class="fa-solid fa-list-check"></i> 오답 노트 다시 보기';
      resultPrintLink.style.display = 'inline-flex';
      resultPrintLink.href = 'worksheet.html?type=wrong&kind=all';
      resultPrintLink.innerHTML = '<i class="fa-solid fa-print"></i> 오답 A4 연습장 인쇄';
    } else if (mode === 'idiom') {
      const count = Math.min(Number(idiomCount.value) || 10, quizPool.length);
      const qt = idiomQtype.value;
      quizQueue = shuffle(quizPool).slice(0, count).map(it => ({
        item: it,
        kind: 'idiom',
        noteId: it.id,
        type: qt === 'mix' ? pickIdiomType() : qt
      }));
    } else if (mode === 'grade') {
      const count = Math.min(Number(countSelect.value) || 20, quizPool.length);
      const qtype = qtypeSelect.value;
      quizQueue = shuffle(quizPool).slice(0, count).map(h => ({
        item: h,
        kind: 'grade',
        noteId: h.id,
        type: qtype === 'mix' ? pickType() : qtype
      }));
    } else {
      // 학습 완료한 한자를 우선 배치, 최대 10문제
      const learned = quizPool.filter(h => PROGRESS.isLearned(h.id));
      const notLearned = quizPool.filter(h => !PROGRESS.isLearned(h.id));
      const ordered = shuffle(learned).concat(shuffle(notLearned));
      quizQueue = ordered.slice(0, Math.min(10, ordered.length)).map(h => ({ item: h, kind: 'hanja', noteId: h.id, type: 'meaning' }));
    }

    qIndex = 0;
    score = 0;
    wrongAnswers = [];

    setupBox.style.display = 'none';
    resultBox.style.display = 'none';
    playBox.style.display = 'block';
    showQuestion();
  });

  function pickType() {
    const types = ['hunmum', 'char', 'sound'];
    return types[Math.floor(Math.random() * types.length)];
  }

  function pickIdiomType() {
    const types = ['story', 'meaning', 'blank', 'reverse'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // ---------- 문제 유형별 표시 값 ----------
  // label: 보기 버튼에 표시할 정답/오답 텍스트
  function optionLabel(h, type) {
    if (type === 'char') return h.char;
    if (type === 'sound') return h.sound;
    if (type === 'hunmum') return `${h.meaning} ${h.sound}`;
    return h.meaning; // 주제별 기본(뜻)
  }

  const IDIOM_TYPE_INFO = {
    story:   { badge: '일화 읽고 맞히기', question: '이 이야기에서 나온 고사성어는?' },
    meaning: { badge: '뜻 보고 맞히기',   question: '이런 뜻을 가진 고사성어는?' },
    blank:   { badge: '빈칸 채우기',      question: '빈칸(□)에 들어갈 한자는?' },
    reverse: { badge: '뜻 고르기',        question: '이 고사성어의 뜻은 무엇일까요?' }
  };

  const TYPE_INFO = {
    hunmum:  { badge: '훈음 고르기', question: '이 한자의 훈(뜻)과 음(소리)은?' },
    char:    { badge: '한자 고르기', question: '이 훈음에 해당하는 한자는?' },
    sound:   { badge: '음 고르기',   question: '이 한자를 어떻게 읽을까요?' },
    meaning: { badge: '뜻 고르기',   question: '이 한자의 뜻은 무엇일까요?' }
  };

  function showQuestion() {
    locked = false;
    const q = quizQueue[qIndex];
    quizProgress.textContent = `${qIndex + 1} / ${quizQueue.length} 문제`;

    if (q.kind === 'idiom') {
      showIdiomQuestion(q);
      return;
    }

    const h = q.item;
    const type = q.type;

    if (mode === 'grade') {
      const info = window.getGradeInfo(selectedGrade);
      quizTypeBadge.style.display = 'inline-block';
      quizTypeBadge.textContent = `${info.badge} ${info.name} · ${TYPE_INFO[type].badge}`;
    } else if (mode === 'review') {
      quizTypeBadge.style.display = 'inline-block';
      quizTypeBadge.textContent = `🔁 오답 복습 · ${TYPE_INFO[type].badge}`;
    } else {
      quizTypeBadge.style.display = 'none';
    }

    // 문제 제시: '한자 고르기'는 훈음을 제시, 나머지는 한자를 제시
    if (type === 'char') {
      quizChar.classList.add('quiz-char-text');
      quizChar.textContent = `${h.meaning} ${h.sound}`;
    } else {
      quizChar.classList.remove('quiz-char-text');
      quizChar.textContent = h.char;
    }
    quizQuestion.textContent = TYPE_INFO[type].question;

    // 보기 4개 (표시 텍스트가 겹치지 않도록 중복 제거)
    const correctLabel = optionLabel(h, type);
    const seen = { [correctLabel]: true };
    const wrongs = [];
    for (const cand of shuffle(optionPool(q.kind))) {
      if (wrongs.length >= 3) break;
      if (cand.char === h.char) continue;
      const lbl = optionLabel(cand, type);
      if (seen[lbl]) continue;
      seen[lbl] = true;
      wrongs.push(cand);
    }

    const options = shuffle([h].concat(wrongs));
    quizOptions.innerHTML = options.map((o, i) =>
      `<button class="quiz-option ${type === 'char' ? 'quiz-option-hanzi' : ''}" data-i="${i}" data-correct="${o.char === h.char ? '1' : '0'}">${optionLabel(o, type)}</button>`
    ).join('');

    quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn, h, type, q));
    });
  }

  // 보기(오답 선택지)를 뽑아올 후보 풀 - 오답 복습은 종류별 전체에서 뽑음
  function optionPool(kind) {
    if (mode !== 'review') return quizPool;
    if (kind === 'grade') return GRADE_HANJA;
    if (kind === 'idiom') return IDIOMS;
    return DATA;
  }

  function handleAnswer(btn, h, type, q) {
    if (locked) return;
    locked = true;
    const kind = (q && q.kind) || (mode === 'grade' ? 'grade' : 'hanja');
    const isCorrect = btn.dataset.correct === '1';
    if (isCorrect) {
      score++;
      if (NOTES) NOTES.markCorrect(h.id);   // 맞히면 오답 노트에서 한 단계 졸업
    } else {
      const entry = {
        id: h.id,
        kind: kind,
        char: h.char,
        answer: `${h.meaning} ${h.sound}`,
        picked: btn.textContent,
        type: TYPE_INFO[type].badge
      };
      wrongAnswers.push(entry);
      if (NOTES) NOTES.addWrong(entry);
    }

    quizOptions.querySelectorAll('.quiz-option').forEach(b => {
      if (b.dataset.correct === '1') b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });

    setTimeout(() => {
      qIndex++;
      if (qIndex < quizQueue.length) showQuestion();
      else showResult();
    }, 900);
  }

  // ---------- 고사성어 문제 ----------
  function showIdiomQuestion(q) {
    const it = q.item;
    const type = q.type;
    const info = IDIOM_TYPE_INFO[type];
    const lv = window.getIdiomLevelInfo(it.level);

    quizTypeBadge.style.display = 'inline-block';
    quizTypeBadge.textContent = (mode === 'review' ? '🔁 오답 복습 · ' : `${lv.badge} ${lv.name} · `) + info.badge;
    quizQuestion.textContent = info.question;

    let blankIndex = -1;
    if (type === 'story') {
      quizChar.className = 'quiz-char quiz-char-story';
      quizChar.textContent = it.story;
    } else if (type === 'meaning') {
      quizChar.className = 'quiz-char quiz-char-text';
      quizChar.textContent = it.meaning;
    } else if (type === 'blank') {
      blankIndex = Math.floor(Math.random() * 4);
      quizChar.className = 'quiz-char';
      quizChar.textContent = it.idiom.split('').map((c, i) => (i === blankIndex ? '□' : c)).join('');
    } else { // reverse
      quizChar.className = 'quiz-char';
      quizChar.textContent = it.idiom;
    }

    // 보기 만들기
    let options, labelOf, isCorrectOf;
    if (type === 'blank') {
      const answerChar = it.idiom[blankIndex];
      const seen = { [answerChar]: true };
      const wrongs = [];
      for (const cand of shuffle(optionPool('idiom'))) {
        if (wrongs.length >= 3) break;
        const ch = cand.idiom[Math.floor(Math.random() * 4)];
        if (seen[ch]) continue;
        seen[ch] = true;
        wrongs.push(ch);
      }
      options = shuffle([answerChar].concat(wrongs));
      labelOf = (o) => o;
      isCorrectOf = (o) => o === answerChar;
    } else if (type === 'reverse') {
      const wrongs = shuffle(optionPool('idiom')).filter(x => x.id !== it.id).slice(0, 3);
      options = shuffle([it].concat(wrongs));
      labelOf = (o) => o.meaning;
      isCorrectOf = (o) => o.id === it.id;
    } else {
      const wrongs = shuffle(optionPool('idiom')).filter(x => x.id !== it.id).slice(0, 3);
      options = shuffle([it].concat(wrongs));
      labelOf = (o) => `${o.idiom} (${o.reading})`;
      isCorrectOf = (o) => o.id === it.id;
    }

    const isHanjaOption = type === 'blank';
    quizOptions.innerHTML = options.map((o, i) =>
      `<button class="quiz-option ${isHanjaOption ? 'quiz-option-hanzi' : ''}" data-i="${i}" data-correct="${isCorrectOf(o) ? '1' : '0'}">${labelOf(o)}</button>`
    ).join('');

    const answerText = type === 'blank'
      ? `${it.idiom[blankIndex]} (${it.chars[blankIndex].hunmum})`
      : (type === 'reverse' ? it.meaning : `${it.idiom} (${it.reading})`);

    quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleIdiomAnswer(btn, it, info.badge, answerText));
    });
  }

  function handleIdiomAnswer(btn, it, typeBadge, answerText) {
    if (locked) return;
    locked = true;
    const isCorrect = btn.dataset.correct === '1';
    if (isCorrect) {
      score++;
      if (NOTES) NOTES.markCorrect(it.id);
    } else {
      const entry = {
        id: it.id,
        kind: 'idiom',
        char: it.idiom,
        answer: answerText,
        picked: btn.textContent,
        type: typeBadge
      };
      wrongAnswers.push(entry);
      if (NOTES) NOTES.addWrong(entry);
    }

    quizOptions.querySelectorAll('.quiz-option').forEach(b => {
      if (b.dataset.correct === '1') b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });

    setTimeout(() => {
      qIndex++;
      if (qIndex < quizQueue.length) showQuestion();
      else showResult();
    }, 1000);
  }

  // ---------- 결과 ----------
  function showResult() {
    playBox.style.display = 'none';
    resultBox.style.display = 'block';

    const total = quizQueue.length;
    const pct = Math.round((score / total) * 100);
    if (window.HanjaSRS) window.HanjaSRS.addLog('quiz', total);

    let emoji = '🙂', title = '조금만 더 연습해요!';
    if (pct === 100) { emoji = '🏆'; title = '만점이에요! 최고예요!'; }
    else if (pct >= 80) { emoji = '🎉'; title = '정말 잘했어요!'; }
    else if (pct >= 50) { emoji = '👍'; title = '잘하고 있어요!'; }

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-desc').textContent = `${total}문제 중 ${score}문제를 맞혔어요! (${pct}점)`;

    // 급수 시험이면 합격 여부와 최고 점수 표시
    if (mode === 'grade') {
      const info = window.getGradeInfo(selectedGrade);
      const passed = pct >= PASS_SCORE;
      const isNewBest = saveBestScore(selectedGrade, pct);
      passBadge.innerHTML = `
        <div class="pass-badge ${passed ? 'pass' : 'fail'}">
          ${passed ? '✅ 합격!' : '📚 불합격 (70점 이상 합격)'}
          <small>${info.badge} ${info.name} ${info.title}${isNewBest ? ' · 🎯 최고 기록 경신!' : ''}</small>
        </div>
      `;
      resultLearnLink.href = `grade.html?grade=${selectedGrade}`;
      resultLearnLink.innerHTML = `<i class="fa-solid fa-book-open"></i> ${info.name} 한자 배우러 가기`;
      resultPrintLink.style.display = 'inline-flex';
      resultPrintLink.href = `worksheet.html?type=grade&grade=${selectedGrade}&limit=20`;
    } else if (mode === 'review') {
      const left = NOTES ? NOTES.count() : 0;
      passBadge.innerHTML = `
        <div class="pass-badge ${left === 0 ? 'pass' : 'fail'}">
          ${left === 0 ? '🎉 오답 노트를 모두 졸업했어요!' : `📒 남은 오답 ${left}개`}
          <small>맞힌 문제는 오답 노트에서 하나씩 사라져요</small>
        </div>
      `;
      resultLearnLink.href = 'quiz.html';
      resultLearnLink.innerHTML = '<i class="fa-solid fa-list-check"></i> 오답 노트 다시 보기';
      resultPrintLink.style.display = 'inline-flex';
      resultPrintLink.href = 'worksheet.html?type=wrong&kind=all';
      resultPrintLink.innerHTML = '<i class="fa-solid fa-print"></i> 오답 A4 연습장 인쇄';
    } else if (mode === 'idiom') {
      passBadge.innerHTML = '';
      resultLearnLink.href = 'idiom.html';
      resultLearnLink.innerHTML = '<i class="fa-solid fa-book-open"></i> 고사성어 이야기 읽으러 가기';
      resultPrintLink.style.display = 'inline-flex';
      resultPrintLink.href = `worksheet.html?type=idiom&level=${idiomLevel}&limit=10`;
      resultPrintLink.innerHTML = '<i class="fa-solid fa-print"></i> 성어 A4 연습장 인쇄';
    } else {
      passBadge.innerHTML = '';
      resultLearnLink.href = 'learn.html';
      resultLearnLink.innerHTML = '<i class="fa-solid fa-book-open"></i> 더 배우러 가기';
      resultPrintLink.style.display = 'none';
    }

    // 로그인 상태면 시험 결과를 계정에 저장
    if (window.HanjaAuth && window.HanjaAuth.isLoggedIn()) {
      window.HanjaAuth.saveQuizResult({
        mode: mode,
        grade: mode === 'grade' ? selectedGrade : null,
        level: mode === 'idiom' ? idiomLevel : (mode === 'category' ? selectedCat : null),
        total: total,
        score: score,
        percent: pct,
        passed: mode === 'grade' ? pct >= PASS_SCORE : pct >= 70,
        wrong: wrongAnswers
      });
    }

    // 오답 노트
    if (wrongAnswers.length > 0) {
      wrongNote.style.display = 'block';
      const oldNotice = wrongNote.querySelector('.wrong-saved');
      if (oldNotice) oldNotice.remove();
      if (NOTES) {
        wrongNote.querySelector('h4').insertAdjacentHTML('afterend',
          `<p class="wrong-saved">✅ 틀린 ${wrongAnswers.length}문제를 <strong>오답 노트</strong>에 저장했어요. 위쪽 <strong>오답 복습</strong> 탭에서 다시 풀 수 있어요!</p>`);
      }
      wrongList.innerHTML = wrongAnswers.map(w => `
        <div class="wrong-item">
          <span class="wrong-char ${w.char.length > 1 ? 'wrong-char-idiom' : ''}">${w.char}</span>
          <span class="wrong-answer">정답: <strong>${w.answer}</strong></span>
          <span class="wrong-picked">내 답: ${w.picked}</span>
          <span class="wrong-type">${w.type}</span>
        </div>
      `).join('');
    } else {
      wrongNote.style.display = 'none';
      wrongList.innerHTML = '';
    }
  }

  retryBtn.addEventListener('click', () => {
    resultBox.style.display = 'none';
    setupBox.style.display = 'block';
    renderGradePicker();
    updateRangeInfo();
  });

  // ---------- 초기화 ----------
  renderCatFilter();
  renderGradePicker();
  renderIdiomFilter();
  renderReviewList();
  updateRangeInfo();
  updateReviewBadge();

  function updateReviewBadge() {
    const badge = document.getElementById('review-badge');
    if (!badge || !NOTES) return;
    const n = NOTES.count();
    badge.textContent = n > 0 ? n : '';
    badge.style.display = n > 0 ? 'inline-flex' : 'none';
  }
  document.addEventListener('hanja:wrong-changed', () => {
    updateReviewBadge();
    if (mode === 'review') renderReviewList();
  });
});
