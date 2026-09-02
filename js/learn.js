/* ============================================================
   한자야 놀자! - learn.html 전용 스크립트
   필터링, 검색, 진도 표시, 상세 애니메이션 & 따라쓰기 모달 제어
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
    search: '',
    modalTab: 'anim'
  };

  // ---------- DOM 참조 ----------
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

  const modalTabs = document.querySelectorAll('.modal-tab');
  const tabAnimContent = document.getElementById('tab-anim-content');
  const tabWriteContent = document.getElementById('tab-write-content');
  const writePadMount = document.getElementById('write-pad-mount');

  let currentList = [];
  let currentIndex = -1;
  let writePad = null;

  // ---------- 따라쓰기 패드 초기화 ----------
  if (writePadMount && window.HanziWritePad) {
    writePad = new window.HanziWritePad(writePadMount, { char: '漢' });
  }

  // ---------- 모바일 내비 (js/nav.js 공통 처리) ----------

  // ---------- 필터 UI 생성 ----------
  function renderFilterButtons() {
    // 카테고리
    let catHtml = `<button class="filter-chip ${state.category === 'all' ? 'active' : ''}" data-cat="all"><span class="chip-icon">🗂️</span> 전체보기 (${DATA.length})</button>`;
    CATEGORIES.forEach(c => {
      const count = DATA.filter(h => h.category === c.id).length;
      catHtml += `<button class="filter-chip ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}"><span class="chip-icon">${c.icon}</span> ${c.name} <span class="chip-count">(${count})</span></button>`;
    });
    filterCategoryBox.innerHTML = catHtml;

    // 난이도
    let lvlHtml = `<button class="filter-chip ${state.level === 'all' ? 'active' : ''}" data-lvl="all"><span class="chip-icon">✨</span> 전체 단계</button>`;
    LEVELS.forEach(l => {
      const count = DATA.filter(h => h.level === l.id).length;
      lvlHtml += `<button class="filter-chip ${state.level === l.id ? 'active' : ''}" data-lvl="${l.id}"><span class="chip-icon">${l.badge}</span> ${l.name} <span class="chip-count">(${count})</span></button>`;
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
        const q = state.search.trim().toLowerCase();
        const hay = (h.char + h.sound + h.meaning).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // ---------- 그리드 렌더 ----------
  function renderGrid() {
    const list = getFiltered();
    currentList = list;

    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-face-frown" style="font-size:2rem; margin-bottom:12px; display:block;"></i><p>조건에 맞는 한자가 없어요. 다른 카테고리나 단계를 골라보세요!</p></div>`;
      updateProgress();
      return;
    }

    let bannerHtml = '';
    if (state.category === 'thousand') {
      bannerHtml = `
        <div class="thousand-promo-banner" style="grid-column:1/-1; background:#fef3c7; border:2px solid #f59e0b; border-radius:12px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:14px; flex-wrap:wrap;">
          <div>
            <strong style="color:#92400e; font-size:1.05rem; display:block;">📜 천자문 250구 (1,000자) 전체 모아보기</strong>
            <span style="color:#78350f; font-size:.9rem;">4글자씩 250개 구절이 작게 나열되어 클릭하면 확대되는 천자문 전용관을 이용해 보세요!</span>
          </div>
          <a href="thousand.html" class="btn btn-primary btn-sm" style="white-space:nowrap;"><i class="fa-solid fa-arrow-right"></i> 천자문 250구 전용관 가기</a>
        </div>
      `;
    }

    grid.innerHTML = bannerHtml + list.map((h, i) => {
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
    }, 180);
  });

  // ---------- 탭 전환 로직 ----------
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      modalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (target === 'anim') {
        tabAnimContent.classList.add('active');
        tabWriteContent.classList.remove('active');
        if (currentIndex >= 0) {
          runDetailAnimation(currentList[currentIndex], 1);
        }
      } else {
        tabAnimContent.classList.remove('active');
        tabWriteContent.classList.add('active');
        stopHanziAnimation(detailStage);
        if (writePad && currentIndex >= 0) {
          writePad.resize();
          writePad.setChar(currentList[currentIndex].char);
        }
      }
    });
  });

  // ---------- 상세 모달 ----------
  function openDetail(index) {
    currentIndex = index;
    const hanzi = currentList[index];
    if (!hanzi) return;

    modal.classList.add('open');
    const lvlInfo = LEVELS.find(l => l.id === hanzi.level);
    // 한자 상단 읽어주기 버튼
    if (window.HanjaSpeech) {
      window.HanjaSpeech.attachButton(detailSound, () => `${hanzi.char}, ${hanzi.meaning} ${hanzi.sound}`, 'l-speak-btn');
    }

    detailSound.textContent = `${hanzi.sound} · ${lvlInfo?.badge || ''} ${lvlInfo?.name || ''} (${hanzi.strokes}획)`;
    detailMeaning.textContent = `${hanzi.char}  —  ${hanzi.meaning}`;

    storyBox.innerHTML = `<strong>어떻게 만들어진 한자일까요?</strong><br>${hanzi.story}`;

    wordsList.innerHTML = hanzi.words.map(w =>
      `<div class="word-chip">${w.word} <small>${w.reading ? `(${w.reading}) ` : ''}${w.meaning}</small></div>`
    ).join('');

    updateMarkButton(hanzi);

    // 탭 상태 유지 및 갱신
    if (writePad) {
      writePad.setChar(hanzi.char);
    }

    // 기본으로 애니메이션 실행
    const activeTab = document.querySelector('.modal-tab.active');
    if (activeTab && activeTab.dataset.tab === 'write') {
      tabAnimContent.classList.remove('active');
      tabWriteContent.classList.add('active');
      setTimeout(() => { if (writePad) writePad.resize(); }, 50);
    } else {
      tabAnimContent.classList.add('active');
      tabWriteContent.classList.remove('active');
      runDetailAnimation(hanzi, 1);
    }
  }

  function updateMarkButton(hanzi) {
    const learned = PROGRESS.isLearned(hanzi.id);
    markLearnedBtn.innerHTML = learned
      ? '<i class="fa-solid fa-star"></i> 학습 완료! (다시 누르면 취소)'
      : '<i class="fa-solid fa-star"></i> 다 배웠어요!';
    markLearnedBtn.classList.toggle('btn-secondary', learned);
    markLearnedBtn.classList.toggle('btn-primary', !learned);
  }

  function runDetailAnimation(hanzi, speed) {
    stopHanziAnimation(detailStage);

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
