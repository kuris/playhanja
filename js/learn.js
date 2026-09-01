/* ============================================================
   한자야 놀자! - learn.html 전용 스크립트
   필터링, 검색, 진도 표시, 상세 애니메이션 모달 제어
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const DATA = window.HANZI_DATA || [];
  const CATEGORIES = window.CATEGORIES || [];
  const LEVELS = window.LEVELS || [];
  const PROGRESS = window.HanziProgress;

  // ---------- 상태 ----------
  const params = new URLSearchParams(location.search);
  let state = {
    category: params.get('cat') || 'all',
    level: 'all',
    search: ''
  };

  // ---------- DOM 참조 ----------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const grid = document.getElementById('hanzi-grid');
  const filterCategoryBox = document.getElementById('filter-category');
  const filterLevelBox = document.getElementById('filter-level');
  const searchInput = document.getElementById('search-input');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');

  const modal = document.getElementById('detail-modal');
  const modalClose = document.getElementById('modal-close');
  const detailStage = document.getElementById('detail-stage');
  const detailSound = document.getElementById('detail-sound');
  const detailMeaning = document.getElementById('detail-meaning');
  const detailReplay = document.getElementById('detail-replay');
  const detailSlow = document.getElementById('detail-slow');
  const detailNext = document.getElementById('detail-next');
  const partsLegend = document.getElementById('parts-legend');
  const storyBox = document.getElementById('story-box');
  const wordsList = document.getElementById('words-list');
  const markLearnedBtn = document.getElementById('mark-learned');

  let currentList = [];
  let currentIndex = -1;

  // ---------- 모바일 내비 ----------
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  }

  // ---------- 필터 UI 생성 ----------
  function renderFilterButtons() {
    // 카테고리
    let catHtml = `<button class="filter-chip ${state.category === 'all' ? 'active' : ''}" data-cat="all"><span class="chip-icon">🗂️</span> 전체</button>`;
    CATEGORIES.forEach(c => {
      catHtml += `<button class="filter-chip ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}"><span class="chip-icon">${c.icon}</span> ${c.name}</button>`;
    });
    filterCategoryBox.innerHTML = catHtml;

    // 난이도
    let lvlHtml = `<button class="filter-chip ${state.level === 'all' ? 'active' : ''}" data-lvl="all"><span class="chip-icon">✨</span> 전체</button>`;
    LEVELS.forEach(l => {
      lvlHtml += `<button class="filter-chip ${state.level === l.id ? 'active' : ''}" data-lvl="${l.id}"><span class="chip-icon">${l.badge}</span> ${l.name}</button>`;
    });
    filterLevelBox.innerHTML = lvlHtml;

    filterCategoryBox.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.cat;
        renderFilterButtons();
        renderGrid();
      });
    });
    filterLevelBox.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.level = btn.dataset.lvl === 'all' ? 'all' : Number(btn.dataset.lvl);
        renderFilterButtons();
        renderGrid();
      });
    });
  }

  // ---------- 필터링 로직 ----------
  function getFiltered() {
    return DATA.filter(h => {
      if (state.category !== 'all' && h.category !== state.category) return false;
      if (state.level !== 'all' && h.level !== state.level) return false;
      if (state.search) {
        const q = state.search.trim();
        const hay = (h.char + h.sound + h.meaning).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }

  // ---------- 그리드 렌더 ----------
  function renderGrid() {
    const list = getFiltered();
    currentList = list;

    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-face-frown" style="font-size:2rem;"></i><p>조건에 맞는 한자가 없어요. 다른 조건을 선택해 보세요!</p></div>`;
      updateProgress();
      return;
    }

    grid.innerHTML = list.map((h, i) => {
      const lvlInfo = LEVELS.find(l => l.id === h.level);
      const learned = PROGRESS.isLearned(h.id);
      return `
        <button class="hanzi-card ${learned ? 'learned' : ''}" data-index="${i}">
          <span class="card-level">${lvlInfo ? lvlInfo.badge : ''}</span>
          ${learned ? '<span class="card-done"><i class="fa-solid fa-circle-check"></i></span>' : ''}
          <div class="card-char">${h.char}</div>
          <div class="card-sound">${h.sound}</div>
          <div class="card-meaning">${h.meaning}</div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.hanzi-card').forEach(card => {
      card.addEventListener('click', () => openDetail(Number(card.dataset.index)));
    });

    updateProgress();
  }

  // ---------- 진도 표시 ----------
  function updateProgress() {
    const total = DATA.length;
    const learnedCount = DATA.filter(h => PROGRESS.isLearned(h.id)).length;
    const pct = total ? Math.round((learnedCount / total) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `${learnedCount} / ${total}자 학습 완료 (${pct}%)`;
  }

  // ---------- 검색 ----------
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = searchInput.value;
      renderGrid();
    }, 200);
  });

  // ---------- 상세 모달 ----------
  function openDetail(index) {
    currentIndex = index;
    const hanzi = currentList[index];
    if (!hanzi) return;

    modal.classList.add('open');
    detailSound.textContent = `${hanzi.sound} · ${LEVELS.find(l => l.id === hanzi.level)?.badge || ''} ${LEVELS.find(l => l.id === hanzi.level)?.name || ''}`;
    detailMeaning.textContent = `${hanzi.char}  —  ${hanzi.meaning}`;

    storyBox.innerHTML = `<strong>어떻게 만들어졌을까요?</strong><br>${hanzi.story}`;

    wordsList.innerHTML = hanzi.words.map(w =>
      `<div class="word-chip">${w.word} <small>${w.meaning}</small></div>`
    ).join('');

    updateMarkButton(hanzi);
    runDetailAnimation(hanzi, 1);
  }

  function updateMarkButton(hanzi) {
    const learned = PROGRESS.isLearned(hanzi.id);
    markLearnedBtn.innerHTML = learned
      ? '<i class="fa-solid fa-star"></i> 학습 완료! (취소하기)'
      : '<i class="fa-solid fa-star"></i> 다 배웠어요!';
    markLearnedBtn.classList.toggle('btn-secondary', learned);
    markLearnedBtn.classList.toggle('btn-primary', !learned);
  }

  function runDetailAnimation(hanzi, speed) {
    stopHanziAnimation(detailStage);

    // 부수 설명 목록(레전드) 초기 상태로 준비
    partsLegend.innerHTML = hanzi.parts.map(p => `
      <div class="legend-item">
        <span class="legend-icon">${p.txt}</span>
        <span class="legend-text"><b>${p.label}</b><span>${p.meaning}</span></span>
      </div>
    `).join('');
    const legendItems = partsLegend.querySelectorAll('.legend-item');

    playHanziAnimation(detailStage, hanzi, {
      speed: speed,
      loop: false,
      onPartStart: (i) => {
        if (legendItems[i]) legendItems[i].classList.add('show');
      }
    });
  }

  modalClose.addEventListener('click', closeDetail);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeDetail(); });
  function closeDetail() {
    stopHanziAnimation(detailStage);
    modal.classList.remove('open');
  }

  detailReplay.addEventListener('click', () => {
    if (currentIndex >= 0) runDetailAnimation(currentList[currentIndex], 1);
  });
  detailSlow.addEventListener('click', () => {
    if (currentIndex >= 0) runDetailAnimation(currentList[currentIndex], 0.5);
  });
  detailNext.addEventListener('click', () => {
    if (currentList.length === 0) return;
    const next = (currentIndex + 1) % currentList.length;
    openDetail(next);
  });
  markLearnedBtn.addEventListener('click', () => {
    if (currentIndex < 0) return;
    const hanzi = currentList[currentIndex];
    PROGRESS.toggleLearned(hanzi.id);
    updateMarkButton(hanzi);
    renderGrid();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });

  // ---------- 초기 실행 ----------
  renderFilterButtons();
  renderGrid();
});
