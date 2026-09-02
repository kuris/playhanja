/* ============================================================
   한자야 놀자! - grade.html 급수별(1급~9급) 한자 학습 스크립트
   급수 선택, 검색, 카드 그리드, 획순/따라쓰기 모달, A4 인쇄 연동
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const GRADES = window.GRADE_LEVELS || [];
  const ALL = window.GRADE_HANJA || [];
  const HANZI_DATA = window.HANZI_DATA || [];
  const PROGRESS = window.HanziProgress;

  const picker = document.getElementById('grade-picker');
  const grid = document.getElementById('grade-grid');
  const searchInput = document.getElementById('grade-search');
  const countLabel = document.getElementById('grade-count-label');
  const printBtn = document.getElementById('grade-print-btn');
  const printRange = document.getElementById('print-range');
  const progressFill = document.getElementById('grade-progress-fill');
  const progressLabel = document.getElementById('grade-progress-label');

  const modal = document.getElementById('grade-modal');
  const modalClose = document.getElementById('grade-modal-close');
  const mGrade = document.getElementById('g-modal-grade');
  const mChar = document.getElementById('g-modal-char');
  const mHunmum = document.getElementById('g-modal-hunmum');
  const mDesc = document.getElementById('g-modal-desc');
  const detailBox = document.getElementById('g-char-detail-box');
  const writeMount = document.getElementById('g-write-mount');
  const prevBtn = document.getElementById('g-prev-btn');
  const nextBtn = document.getElementById('g-next-btn');
  const markBtn = document.getElementById('g-mark-learned');
  const modalPrintBtn = document.getElementById('g-print-btn');

  // URL 파라미터로 급수 지정 가능 (예: grade.html?grade=7)
  const params = new URLSearchParams(location.search);
  let currentGrade = Number(params.get('grade')) || 9;
  if (!GRADES.some(g => g.id === currentGrade)) currentGrade = 9;

  let currentList = [];
  let currentIndex = -1;
  let searchQuery = '';
  let writePad = null;

  if (writeMount && window.HanziWritePad) {
    writePad = new window.HanziWritePad(writeMount, { char: '一' });
  }

  // ---------- 급수 선택 카드 ----------
  function renderPicker() {
    picker.innerHTML = GRADES.map(g => {
      const total = ALL.filter(h => h.grade === g.id).length;
      const done = ALL.filter(h => h.grade === g.id && PROGRESS.isLearned(h.id)).length;
      return `
        <button class="grade-card ${g.id === currentGrade ? 'active' : ''}" data-grade="${g.id}" style="--grade-color:${g.color};">
          <span class="grade-badge">${g.badge}</span>
          <span class="grade-name">${g.name}</span>
          <span class="grade-title">${g.title}</span>
          <span class="grade-count">${total}자</span>
          <span class="grade-done">${done > 0 ? '✅ ' + done + '자 완료' : '&nbsp;'}</span>
        </button>
      `;
    }).join('');

    picker.querySelectorAll('.grade-card').forEach(btn => {
      btn.addEventListener('click', () => {
        currentGrade = Number(btn.dataset.grade);
        renderPicker();
        renderGrid();
        window.scrollTo({ top: picker.offsetTop - 20, behavior: 'smooth' });
      });
    });
  }

  // ---------- 목록 필터 ----------
  function getList() {
    return ALL.filter(h => {
      if (h.grade !== currentGrade) return false;
      if (searchQuery) {
        const q = searchQuery.trim().toLowerCase();
        const hay = (h.char + h.meaning + h.sound + h.hunmum).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // ---------- 카드 그리드 ----------
  function renderGrid() {
    const info = window.getGradeInfo(currentGrade);
    currentList = getList();

    const total = ALL.filter(h => h.grade === currentGrade).length;
    countLabel.textContent = searchQuery
      ? `${info.name} ${total}자 중 ${currentList.length}자 검색됨`
      : `${info.name} ${info.title} · 총 ${total}자`;

    updatePrintLink();
    updateProgress();

    if (currentList.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-face-frown" style="font-size:2rem; margin-bottom:12px; display:block;"></i><p>조건에 맞는 한자가 없어요. 다른 급수나 검색어로 찾아보세요!</p></div>`;
      return;
    }

    grid.innerHTML = currentList.map((h, idx) => {
      const learned = PROGRESS.isLearned(h.id);
      return `
        <button class="grade-char-card ${learned ? 'learned' : ''}" data-idx="${idx}" style="--grade-color:${info.color};">
          ${learned ? '<span class="gc-done">✅</span>' : ''}
          <span class="gc-char">${h.char}</span>
          <span class="gc-hunmum">${h.meaning} ${h.sound}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.grade-char-card').forEach(card => {
      card.addEventListener('click', () => openModal(Number(card.dataset.idx)));
    });
  }

  // ---------- 진도 ----------
  function updateProgress() {
    const list = ALL.filter(h => h.grade === currentGrade);
    const done = list.filter(h => PROGRESS.isLearned(h.id)).length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    progressFill.style.width = pct + '%';
    const info = window.getGradeInfo(currentGrade);
    progressLabel.textContent = `${info.name} ${done} / ${list.length}자 학습 완료 (${pct}%)`;
  }

  // ---------- A4 인쇄 링크 ----------
  function updatePrintLink() {
    const limit = printRange ? printRange.value : '40';
    printBtn.href = `worksheet.html?type=grade&grade=${currentGrade}&limit=${limit}`;
  }
  if (printRange) printRange.addEventListener('change', updatePrintLink);

  // ---------- 검색 ----------
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value;
      renderGrid();
    }, 180);
  });

  // ---------- 상세 모달 ----------
  function openModal(idx) {
    const h = currentList[idx];
    if (!h) return;
    currentIndex = idx;

    const info = window.getGradeInfo(h.grade);
    modal.classList.add('open');
    document.body.classList.add('nav-open');
    const box = modal.querySelector('.modal-box');
    if (box) box.scrollTop = 0;

    // 한자 상단 읽어주기 버튼
    if (window.HanjaSpeech) {
      window.HanjaSpeech.attachButton(mChar, () => `${h.char}, ${h.meaning} ${h.sound}`, 'g-speak-btn');
    }

    mGrade.textContent = `${info.badge} ${info.name} (${info.title})`;
    mChar.textContent = h.char;
    mHunmum.textContent = `${h.meaning} ${h.sound}`;
    mDesc.textContent = info.desc;

    // 인쇄 링크: 이 글자가 포함된 4글자 묶음 1장
    const gradeAll = ALL.filter(x => x.grade === h.grade);
    const pos = gradeAll.findIndex(x => x.char === h.char);
    const start = Math.floor(Math.max(pos, 0) / 4) * 4 + 1;
    modalPrintBtn.href = `worksheet.html?type=grade&grade=${h.grade}&from=${start}&limit=4`;

    // 한자 DB에 어원/낱말 정보가 있으면 함께 노출
    const match = HANZI_DATA.find(d => d.char === h.char);
    if (match) {
      detailBox.innerHTML = `
        <div class="v-char-info-card">
          <h4>${match.char} — ${match.meaning} (${match.strokes}획)</h4>
          <p class="v-char-story"><strong>원리와 어원:</strong> ${match.story}</p>
          <div class="v-char-words">
            <strong>활용 낱말:</strong>
            ${match.words.map(w => `<span class="word-chip">${w.word} <small>${w.reading} · ${w.meaning}</small></span>`).join(' ')}
          </div>
        </div>
      `;
    } else {
      detailBox.innerHTML = `
        <div class="v-char-info-card">
          <h4>${h.char} — ${h.meaning} ${h.sound} (${info.name})</h4>
          <p class="v-char-story">“<strong>${h.meaning} ${h.sound}</strong>”이라고 읽고 씁니다. 아래 캔버스에서 표준 획순 애니메이션을 본 뒤 직접 따라 써보세요. 오른쪽 아래 <strong>A4 인쇄</strong> 버튼을 누르면 이 글자가 들어간 쓰기 연습장을 출력할 수 있어요.</p>
        </div>
      `;
    }

    updateMarkBtn(h);

    if (writePad) {
      setTimeout(() => {
        writePad.resize();
        writePad.setChar(h.char);
      }, 50);
    }
  }

  function updateMarkBtn(h) {
    const learned = PROGRESS.isLearned(h.id);
    markBtn.innerHTML = learned
      ? '<i class="fa-solid fa-circle-check"></i> 학습 완료됨 (취소)'
      : '<i class="fa-solid fa-star"></i> 다 배웠어요!';
    markBtn.classList.toggle('btn-secondary', learned);
    markBtn.classList.toggle('btn-primary', !learned);
  }

  markBtn.addEventListener('click', () => {
    const h = currentList[currentIndex];
    if (!h) return;
    PROGRESS.toggleLearned(h.id);
    updateMarkBtn(h);
    renderPicker();
    renderGrid();
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  prevBtn.addEventListener('click', () => {
    openModal(currentIndex > 0 ? currentIndex - 1 : currentList.length - 1);
  });
  nextBtn.addEventListener('click', () => {
    openModal(currentIndex < currentList.length - 1 ? currentIndex + 1 : 0);
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  // ---------- 초기 렌더 ----------
  renderPicker();
  renderGrid();
});
