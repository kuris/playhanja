/* ============================================================
   한자야 놀자! - idiom.html 고사성어 학습 스크립트
   난이도 필터, 검색, 유래 일화 모달, 4글자 획순/따라쓰기, A4 인쇄 연동
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const ALL = window.IDIOMS || [];
  const LEVELS = window.IDIOM_LEVELS || [];
  const HANZI_DATA = window.HANZI_DATA || [];
  const PROGRESS = window.HanziProgress;

  const filterBox = document.getElementById('idiom-level-filter');
  const grid = document.getElementById('idiom-grid');
  const searchInput = document.getElementById('idiom-search');
  const countLabel = document.getElementById('idiom-count-label');
  const printBtn = document.getElementById('idiom-print-btn');

  const modal = document.getElementById('idiom-modal');
  const modalClose = document.getElementById('idiom-modal-close');
  const mLevel = document.getElementById('i-modal-level');
  const mIdiom = document.getElementById('i-modal-idiom');
  const mReading = document.getElementById('i-modal-reading');
  const mMeaning = document.getElementById('i-modal-meaning');
  const mStory = document.getElementById('i-modal-story');
  const mLesson = document.getElementById('i-modal-lesson');
  const mSource = document.getElementById('i-modal-source');
  const charTabs = document.getElementById('i-char-tabs');
  const writeMount = document.getElementById('i-write-mount');
  const detailBox = document.getElementById('i-char-detail-box');
  const prevBtn = document.getElementById('i-prev-btn');
  const nextBtn = document.getElementById('i-next-btn');
  const markBtn = document.getElementById('i-mark-learned');
  const modalPrintBtn = document.getElementById('i-print-btn');

  const params = new URLSearchParams(location.search);
  let level = params.get('level') || 'all';
  let searchQuery = '';
  let currentList = [];
  let currentIndex = -1;
  let selectedCharIndex = 0;
  let writePad = null;

  if (writeMount && window.HanziWritePad) {
    writePad = new window.HanziWritePad(writeMount, { char: '塞' });
  }

  // ---------- 난이도 필터 ----------
  function renderFilter() {
    let html = `<button class="filter-chip ${level === 'all' ? 'active' : ''}" data-lv="all"><span class="chip-icon">📚</span> 전체 (${ALL.length}개)</button>`;
    LEVELS.forEach(l => {
      const cnt = ALL.filter(i => i.level === l.id).length;
      html += `<button class="filter-chip ${level == l.id ? 'active' : ''}" data-lv="${l.id}"><span class="chip-icon">${l.badge}</span> ${l.name} <span class="chip-count">(${cnt}개)</span></button>`;
    });
    filterBox.innerHTML = html;
    filterBox.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        level = btn.dataset.lv === 'all' ? 'all' : Number(btn.dataset.lv);
        renderFilter();
        renderGrid();
      });
    });
  }

  // ---------- 목록 ----------
  function getList() {
    return ALL.filter(i => {
      if (level !== 'all' && i.level !== Number(level)) return false;
      if (searchQuery) {
        const q = searchQuery.trim().toLowerCase();
        const hay = (i.idiom + i.reading + i.meaning + i.story + i.lesson + i.tag).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderGrid() {
    currentList = getList();
    countLabel.textContent = searchQuery || level !== 'all'
      ? `${ALL.length}개 중 ${currentList.length}개 표시`
      : `총 ${ALL.length}개`;
    printBtn.href = `worksheet.html?type=idiom&level=${level}&limit=10`;

    if (currentList.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-face-frown" style="font-size:2rem; margin-bottom:12px; display:block;"></i><p>조건에 맞는 고사성어가 없어요. 다른 검색어로 찾아보세요!</p></div>`;
      return;
    }

    grid.innerHTML = currentList.map((it, idx) => {
      const lv = window.getIdiomLevelInfo(it.level);
      const learned = PROGRESS.isLearned(it.id);
      return `
        <button class="idiom-card ${learned ? 'learned' : ''}" data-idx="${idx}" style="--lv-color:${lv.color};">
          <span class="ic-level">${lv.badge} ${lv.name}</span>
          ${learned ? '<span class="ic-done">✅</span>' : ''}
          <span class="ic-idiom">${it.idiom}</span>
          <span class="ic-reading">${it.reading}</span>
          <span class="ic-meaning">${it.meaning}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.idiom-card').forEach(c => {
      c.addEventListener('click', () => openModal(Number(c.dataset.idx)));
    });
  }

  // ---------- 검색 ----------
  let timer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchQuery = searchInput.value;
      renderGrid();
    }, 180);
  });

  // ---------- 모달 ----------
  function openModal(idx) {
    const it = currentList[idx];
    if (!it) return;
    currentIndex = idx;
    const lv = window.getIdiomLevelInfo(it.level);

    modal.classList.add('open');
    document.body.classList.add('nav-open');
    const box = modal.querySelector('.modal-box');
    if (box) box.scrollTop = 0;

    mLevel.textContent = `${lv.badge} ${lv.name} · ${it.tag}`;
    mIdiom.textContent = it.idiom;
    mReading.textContent = it.reading;
    mMeaning.textContent = it.meaning;
    mStory.textContent = it.story;
    mLesson.innerHTML = `<strong>💡 교훈</strong> ${it.lesson}`;
    mSource.textContent = `출전: ${it.source}`;
    modalPrintBtn.href = `worksheet.html?type=idiom&no=${it.no}`;

    updateMarkBtn(it);
    selectedCharIndex = 0;
    renderCharTabs(it);
    selectChar(0, it);
  }

  function renderCharTabs(it) {
    charTabs.innerHTML = it.chars.map((c, i) => `
      <button class="v-char-tab ${i === selectedCharIndex ? 'active' : ''}" data-ci="${i}">
        <span class="v-char-tab-hanzi">${c.char}</span>
        <span class="v-char-tab-sound">${c.sound}</span>
      </button>
    `).join('');
    charTabs.querySelectorAll('.v-char-tab').forEach(btn => {
      btn.addEventListener('click', () => selectChar(Number(btn.dataset.ci), it));
    });
  }

  function selectChar(ci, it) {
    selectedCharIndex = ci;
    charTabs.querySelectorAll('.v-char-tab').forEach((b, i) => b.classList.toggle('active', i === ci));

    const c = it.chars[ci];
    if (!c) return;
    const match = HANZI_DATA.find(h => h.char === c.char);

    detailBox.innerHTML = `
      <div class="v-char-info-card">
        <h4>${c.char} — ${c.hunmum}${match ? ` (${match.strokes}획)` : ''}</h4>
        <p class="v-char-story">${match
          ? `<strong>원리와 어원:</strong> ${match.story}`
          : `<strong>${it.idiom}(${it.reading})</strong>의 ${ci + 1}번째 글자예요. ${it.meaning}이라는 뜻의 성어에 쓰입니다.`}</p>
      </div>
    `;

    if (writePad) {
      setTimeout(() => {
        writePad.resize();
        writePad.setChar(c.char);
      }, 50);
    }
  }

  function updateMarkBtn(it) {
    const learned = PROGRESS.isLearned(it.id);
    markBtn.innerHTML = learned
      ? '<i class="fa-solid fa-circle-check"></i> 학습 완료됨 (취소)'
      : '<i class="fa-solid fa-star"></i> 다 배웠어요!';
    markBtn.classList.toggle('btn-secondary', learned);
    markBtn.classList.toggle('btn-primary', !learned);
  }

  markBtn.addEventListener('click', () => {
    const it = currentList[currentIndex];
    if (!it) return;
    PROGRESS.toggleLearned(it.id);
    updateMarkBtn(it);
    renderGrid();
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  prevBtn.addEventListener('click', () => openModal(currentIndex > 0 ? currentIndex - 1 : currentList.length - 1));
  nextBtn.addEventListener('click', () => openModal(currentIndex < currentList.length - 1 ? currentIndex + 1 : 0));
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  renderFilter();
  renderGrid();
});
