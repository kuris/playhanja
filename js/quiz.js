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
  const PROGRESS = window.HanziProgress;

  const BEST_KEY = 'hanzi_grade_best_scores';
  const PASS_SCORE = 70;

  // 상단 내비게이션(햄버거 메뉴)은 js/nav.js에서 공통 처리합니다.

  const modeTabs = document.querySelectorAll('.quiz-mode-tab');
  const setupCategory = document.getElementById('setup-category');
  const setupGrade = document.getElementById('setup-grade');
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

  let mode = 'category';        // 'category' | 'grade'
  let selectedCat = 'all';
  let selectedGrade = 9;
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
      startBtn.innerHTML = mode === 'grade'
        ? '<i class="fa-solid fa-file-pen"></i> 급수 시험 시작!'
        : '<i class="fa-solid fa-play"></i> 퀴즈 시작!';
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
        selectedGrade = Number(btn.dataset.grade);
        renderGradePicker();
        updateRangeInfo();
      });
    });
  }

  // ---------- 출제 범위 안내 ----------
  function getPool() {
    if (mode === 'grade') {
      return GRADE_HANJA.filter(h => h.grade === selectedGrade);
    }
    return selectedCat === 'all' ? DATA.slice() : DATA.filter(h => h.category === selectedCat);
  }

  function updateRangeInfo() {
    const pool = getPool();
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

    if (mode === 'grade') {
      const count = Math.min(Number(countSelect.value) || 20, quizPool.length);
      const qtype = qtypeSelect.value;
      quizQueue = shuffle(quizPool).slice(0, count).map(h => ({
        item: h,
        type: qtype === 'mix' ? pickType() : qtype
      }));
    } else {
      // 학습 완료한 한자를 우선 배치, 최대 10문제
      const learned = quizPool.filter(h => PROGRESS.isLearned(h.id));
      const notLearned = quizPool.filter(h => !PROGRESS.isLearned(h.id));
      const ordered = shuffle(learned).concat(shuffle(notLearned));
      quizQueue = ordered.slice(0, Math.min(10, ordered.length)).map(h => ({ item: h, type: 'meaning' }));
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

  // ---------- 문제 유형별 표시 값 ----------
  // label: 보기 버튼에 표시할 정답/오답 텍스트
  function optionLabel(h, type) {
    if (type === 'char') return h.char;
    if (type === 'sound') return h.sound;
    if (type === 'hunmum') return `${h.meaning} ${h.sound}`;
    return h.meaning; // 주제별 기본(뜻)
  }

  const TYPE_INFO = {
    hunmum:  { badge: '훈음 고르기', question: '이 한자의 훈(뜻)과 음(소리)은?' },
    char:    { badge: '한자 고르기', question: '이 훈음에 해당하는 한자는?' },
    sound:   { badge: '음 고르기',   question: '이 한자를 어떻게 읽을까요?' },
    meaning: { badge: '뜻 고르기',   question: '이 한자의 뜻은 무엇일까요?' }
  };

  function showQuestion() {
    locked = false;
    const q = quizQueue[qIndex];
    const h = q.item;
    const type = q.type;

    quizProgress.textContent = `${qIndex + 1} / ${quizQueue.length} 문제`;

    if (mode === 'grade') {
      const info = window.getGradeInfo(selectedGrade);
      quizTypeBadge.style.display = 'inline-block';
      quizTypeBadge.textContent = `${info.badge} ${info.name} · ${TYPE_INFO[type].badge}`;
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
    for (const cand of shuffle(quizPool)) {
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
      btn.addEventListener('click', () => handleAnswer(btn, h, type));
    });
  }

  function handleAnswer(btn, h, type) {
    if (locked) return;
    locked = true;
    const isCorrect = btn.dataset.correct === '1';
    if (isCorrect) {
      score++;
    } else {
      wrongAnswers.push({
        char: h.char,
        answer: `${h.meaning} ${h.sound}`,
        picked: btn.textContent,
        type: TYPE_INFO[type].badge
      });
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

  // ---------- 결과 ----------
  function showResult() {
    playBox.style.display = 'none';
    resultBox.style.display = 'block';

    const total = quizQueue.length;
    const pct = Math.round((score / total) * 100);

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
    } else {
      passBadge.innerHTML = '';
      resultLearnLink.href = 'learn.html';
      resultLearnLink.innerHTML = '<i class="fa-solid fa-book-open"></i> 더 배우러 가기';
      resultPrintLink.style.display = 'none';
    }

    // 오답 노트
    if (wrongAnswers.length > 0) {
      wrongNote.style.display = 'block';
      wrongList.innerHTML = wrongAnswers.map(w => `
        <div class="wrong-item">
          <span class="wrong-char">${w.char}</span>
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
  updateRangeInfo();
});
