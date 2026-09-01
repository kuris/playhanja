/* ============================================================
   한자야 놀자! - quiz.html 전용 스크립트
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const DATA = window.HANZI_DATA || [];
  const CATEGORIES = window.CATEGORIES || [];
  const PROGRESS = window.HanziProgress;

  // 상단 내비게이션(햄버거 메뉴)은 js/nav.js에서 공통 처리합니다.

  const catFilterBox = document.getElementById('quiz-category-filter');
  const startBtn = document.getElementById('start-quiz-btn');
  const rangeInfo = document.getElementById('quiz-range-info');
  const setupBox = document.getElementById('quiz-setup');
  const playBox = document.getElementById('quiz-play');
  const resultBox = document.getElementById('quiz-result');

  const quizProgress = document.getElementById('quiz-progress');
  const quizChar = document.getElementById('quiz-char');
  const quizOptions = document.getElementById('quiz-options');
  const retryBtn = document.getElementById('retry-quiz-btn');

  let selectedCat = 'all';
  let quizPool = [];
  let quizQueue = [];
  let qIndex = 0;
  let score = 0;
  let locked = false;

  // ---------- 카테고리 선택 UI ----------
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

  function getPool() {
    return selectedCat === 'all' ? DATA.slice() : DATA.filter(h => h.category === selectedCat);
  }

  function updateRangeInfo() {
    const pool = getPool();
    const learnedCount = pool.filter(h => PROGRESS.isLearned(h.id)).length;
    rangeInfo.textContent = `총 ${pool.length}자 중 ${learnedCount}자를 학습했어요. 최소 4자 이상 있어야 퀴즈를 시작할 수 있어요.`;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  startBtn.addEventListener('click', () => {
    quizPool = getPool();
    if (quizPool.length < 4) {
      alert('퀴즈를 만들기엔 한자 수가 너무 적어요. 다른 카테고리를 선택하거나 전체를 골라주세요!');
      return;
    }
    // 학습 완료한 한자를 우선 배치, 최대 10문제
    const learned = quizPool.filter(h => PROGRESS.isLearned(h.id));
    const notLearned = quizPool.filter(h => !PROGRESS.isLearned(h.id));
    const ordered = shuffle(learned).concat(shuffle(notLearned));
    quizQueue = ordered.slice(0, Math.min(10, ordered.length));
    qIndex = 0;
    score = 0;

    setupBox.style.display = 'none';
    resultBox.style.display = 'none';
    playBox.style.display = 'block';
    showQuestion();
  });

  function buildOptions(correct) {
    const others = quizPool.filter(h => h.id !== correct.id);
    const wrongs = shuffle(others).slice(0, 3);
    return shuffle([correct, ...wrongs]);
  }

  function showQuestion() {
    locked = false;
    const hanzi = quizQueue[qIndex];
    quizProgress.textContent = `${qIndex + 1} / ${quizQueue.length} 문제`;
    quizChar.textContent = hanzi.char;

    const options = buildOptions(hanzi);
    quizOptions.innerHTML = options.map(o =>
      `<button class="quiz-option" data-id="${o.id}">${o.meaning}</button>`
    ).join('');

    quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn, hanzi));
    });
  }

  function handleAnswer(btn, hanzi) {
    if (locked) return;
    locked = true;
    const isCorrect = btn.dataset.id === hanzi.id;
    if (isCorrect) score++;

    quizOptions.querySelectorAll('.quiz-option').forEach(b => {
      if (b.dataset.id === hanzi.id) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });

    setTimeout(() => {
      qIndex++;
      if (qIndex < quizQueue.length) {
        showQuestion();
      } else {
        showResult();
      }
    }, 900);
  }

  function showResult() {
    playBox.style.display = 'none';
    resultBox.style.display = 'block';
    const total = quizQueue.length;
    const pct = Math.round((score / total) * 100);
    let emoji = '🙂', title = '조금만 더 연습해요!';
    if (pct === 100) { emoji = '🏆'; title = '완벽해요! 최고예요!'; }
    else if (pct >= 80) { emoji = '🎉'; title = '정말 잘했어요!'; }
    else if (pct >= 50) { emoji = '👍'; title = '잘하고 있어요!'; }

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-desc').textContent = `${total}문제 중 ${score}문제를 맞혔어요! (${pct}점)`;
  }

  retryBtn.addEventListener('click', () => {
    resultBox.style.display = 'none';
    setupBox.style.display = 'block';
    updateRangeInfo();
  });

  renderCatFilter();
  updateRangeInfo();
});
