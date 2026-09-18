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

  // URL 파라미터로 급수 지정 가능 (예: grade.html?grade=g7II / ?grade=7 / ?q=마당 / ?char=場)
  const params = new URLSearchParams(location.search);
  function normalizeGradeParam(v) {
    if (!v) return null;
    const s = String(v).trim();
    if (GRADES.some(g => g.id === s)) return s;
    const compact = s.replace(/\s+/g, '').toLowerCase();
    const alias = {
      '8': 'g8', '8급': 'g8',
      '7ii': 'g7II', '7ⅱ': 'g7II', '7급ii': 'g7II', '7급ⅱ': 'g7II', '7-2': 'g7II', '7_2': 'g7II',
      '7': 'g7', '7급': 'g7',
      '6ii': 'g6II', '6ⅱ': 'g6II', '6급ii': 'g6II', '6-2': 'g6II',
      '6': 'g6', '6급': 'g6',
      '5ii': 'g5II', '5ⅱ': 'g5II', '5급ii': 'g5II', '5-2': 'g5II',
      '5': 'g5', '5급': 'g5',
      '4ii': 'g4II', '4ⅱ': 'g4II', '4급ii': 'g4II', '4-2': 'g4II',
      '4': 'g4', '4급': 'g4',
      '3ii': 'g3II', '3ⅱ': 'g3II', '3급ii': 'g3II', '3-2': 'g3II',
      '3': 'g3', '3급': 'g3',
      '2': 'g2', '2급': 'g2',
      '1': 'g1', '1급': 'g1'
    };
    return alias[compact] || null;
  }
  let currentGrade = normalizeGradeParam(params.get('grade')) || 'g8';
  if (!GRADES.some(g => g.id === currentGrade)) currentGrade = 'g8';

  let currentList = [];
  let currentIndex = -1;
  let searchQuery = params.get('q') || '';
  const charParam = params.get('char') || '';
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
        currentGrade = btn.dataset.grade;
        renderPicker();
        renderGrid();
        window.scrollTo({ top: picker.offsetTop - 20, behavior: 'smooth' });
      });
    });
  }

  // ---------- 목록 필터 ----------
  // 검색어가 있으면 전체 급수에서 통합 검색 (급수 필터 무시)
  // 음만 알아도 찾도록 정확도 순으로 정렬: 한자 일치 > 음 정확일치 > 훈음 정확일치 > 훈 정확일치 > 부분일치
  function gradeScore(h, q) {
    if (h.char === q) return 100;
    const sounds = String(h.sound || '').toLowerCase().split('/');
    if (sounds.indexOf(q) !== -1) return 90;
    if (String(h.hunmum || '').toLowerCase() === q) return 85;
    const meanings = String(h.meaning || '').toLowerCase().split(/[,/·\s]+/);
    if (meanings.indexOf(q) !== -1) return 80;
    if (String(h.sound || '').toLowerCase().indexOf(q) !== -1) return 50;
    if (String(h.meaning || '').toLowerCase().indexOf(q) !== -1) return 40;
    if (String(h.hunmum || '').toLowerCase().indexOf(q) !== -1) return 30;
    const extra = ((h.meaningFull || '') + ' ' + (h.soundFull || '')).toLowerCase();
    if (q && extra.indexOf(q) !== -1) return 20;
    return 0;
  }
  function getList() {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return ALL.filter(h => h.grade === currentGrade);
    return ALL.map(h => ({ h: h, s: gradeScore(h, q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => (b.s - a.s) || (a.h.gradeOrder - b.h.gradeOrder) || (a.h.index - b.h.index))
      .map(x => x.h);
  }

  // ---------- 카드 그리드 ----------
  function renderGrid() {
    const info = window.getGradeInfo(currentGrade);
    currentList = getList();
    const q = (searchQuery || '').trim();

    if (q) {
      countLabel.textContent = `전체 급수에서 "${q}" ${currentList.length}자 찾음`;
    } else {
      const total = ALL.filter(h => h.grade === currentGrade).length;
      countLabel.textContent = `${info.name} ${info.title} · 총 ${total}자`;
    }

    updatePrintLink();
    updateProgress();

    if (currentList.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-face-frown" style="font-size:2rem; margin-bottom:12px; display:block;"></i><p>"${q || ''}"에 맞는 한자가 없어요. 한자(예: 場) · 훈(예: 마당) · 음(예: 장)으로 다시 검색해 보세요!</p></div>`;
      return;
    }

    grid.innerHTML = currentList.map((h, idx) => {
      const learned = PROGRESS.isLearned(h.id);
      const ginfo = window.getGradeInfo(h.grade);
      const gradeBadge = q ? `<span class="gc-grade">${ginfo.badge} ${ginfo.name}</span>` : '';
      return `
        <button class="grade-char-card ${learned ? 'learned' : ''}" data-idx="${idx}" style="--grade-color:${ginfo.color};">
          ${learned ? '<span class="gc-done">✅</span>' : ''}
          <span class="gc-char">${h.char}</span>
          <span class="gc-hunmum">${h.meaning} ${h.sound}</span>
          ${gradeBadge}
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
          <h4>${match.char} — ${match.meaning} (${window.getOfficialStrokes(h.char) || match.strokes}획)</h4>
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
          <h4>${h.char} — ${h.meaning} ${h.sound} · ${h.strokes}획 · 부수 ${h.radical} (${info.name})</h4>
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
  if (searchInput && searchQuery) searchInput.value = searchQuery;
  renderPicker();
  renderGrid();
  // ?char=場 같은 딥링크: 해당 한자 모달을 바로 열어줌
  if (charParam) {
    const idx = currentList.findIndex(h => h.char === charParam.trim());
    if (idx >= 0) openModal(idx);
  }
});
