/* ============================================================
   한자야 놀자! - thousand.html 천자문 250구 전용 스크립트
   250개 4자 구절 그리드 렌더링, 검색, 모달 상세 및 획순/따라쓰기 연동
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const VERSES = window.THOUSAND_VERSES || [];
  const HANZI_DATA = window.HANZI_DATA || [];
  const PROGRESS = window.HanziProgress;

  // 상단 내비게이션(햄버거 메뉴)은 js/nav.js에서 공통 처리합니다.

  const grid = document.getElementById('thousand-grid');
  const searchInput = document.getElementById('thousand-search');
  const verseCountLabel = document.getElementById('verse-count-label');

  // 모달 참조
  const modal = document.getElementById('verse-modal');
  const modalClose = document.getElementById('verse-modal-close');
  const modalNo = document.getElementById('v-modal-no');
  const modalVerse = document.getElementById('v-modal-verse');
  const modalReading = document.getElementById('v-modal-reading');
  const modalMeaning = document.getElementById('v-modal-meaning');
  const charTabs = document.getElementById('v-char-tabs');
  const writeMount = document.getElementById('v-write-mount');
  const charDetailBox = document.getElementById('v-char-detail-box');
  const prevBtn = document.getElementById('v-prev-btn');
  const nextBtn = document.getElementById('v-next-btn');

  let currentList = VERSES.slice();
  let currentIndex = -1;
  let selectedCharIndex = 0;
  let writePad = null;

  // 따라쓰기 인스턴스 초기화
  if (writeMount && window.HanziWritePad) {
    writePad = new window.HanziWritePad(writeMount, { char: '天' });
  }

  // ---------- 그리드 렌더링 ----------
  function renderGrid(list) {
    currentList = list;
    verseCountLabel.textContent = `총 250구 중 ${list.length}구 표시`;

    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-book-open" style="font-size:2.2rem; margin-bottom:12px; display:block;"></i><p>일치하는 천자문 구절이 없어요. 다른 검색어로 찾아보세요!</p></div>`;
      return;
    }

    grid.innerHTML = list.map((v, idx) => {
      return `
        <button class="verse-card" data-idx="${idx}">
          <div class="v-card-no">#${v.no}</div>
          <div class="v-card-chars">${v.verse}</div>
          <div class="v-card-reading">${v.reading}</div>
          <div class="v-card-meaning">${v.meaning}</div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.verse-card').forEach(card => {
      card.addEventListener('click', () => {
        openVerseModal(Number(card.dataset.idx));
      });
    });
  }

  // ---------- 검색 ----------
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        renderGrid(VERSES);
        return;
      }
      const filtered = VERSES.filter(v => {
        return (
          v.no.toString() === q ||
          v.verse.includes(q) ||
          v.reading.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q)
        );
      });
      renderGrid(filtered);
    }, 180);
  });

  // ---------- 구절 모달 열기 ----------
  function openVerseModal(index) {
    currentIndex = index;
    const item = currentList[index];
    if (!item) return;

    modal.classList.add('open');
    const modalBox = modal.querySelector('.modal-box');
    if (modalBox) modalBox.scrollTop = 0;

    // 구절 상단 읽어주기 버튼
    if (window.HanjaSpeech) {
      window.HanjaSpeech.attachButton(modalVerse, () => `${item.reading}. ${item.meaning}`, 'v-speak-btn');
    }

    modalNo.textContent = `천자문 제 ${item.no}구 (총 250구)`;
    modalVerse.textContent = item.verse;
    modalReading.textContent = item.reading;
    modalMeaning.textContent = item.meaning;

    const printWsBtn = document.getElementById('v-print-ws-btn');
    if (printWsBtn) {
      printWsBtn.href = `worksheet.html?type=verse&no=${item.no}`;
    }

    // 4글자 탭 렌더링
    selectedCharIndex = 0;
    renderCharTabs(item);
    selectChar(0, item);
  }

  function renderCharTabs(item) {
    charTabs.innerHTML = item.chars.map((c, i) => `
      <button class="v-char-tab ${i === selectedCharIndex ? 'active' : ''}" data-cidx="${i}">
        <span class="v-char-tab-hanzi">${c.char}</span>
        <span class="v-char-tab-sound">${c.sound}</span>
      </button>
    `).join('');

    charTabs.querySelectorAll('.v-char-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cidx = Number(btn.dataset.cidx);
        selectChar(cidx, item);
      });
    });
  }

  function selectChar(cidx, item) {
    selectedCharIndex = cidx;
    charTabs.querySelectorAll('.v-char-tab').forEach((b, i) => {
      b.classList.toggle('active', i === cidx);
    });

    const c = item.chars[cidx];
    if (!c) return;

    // 한자 데이터베이스에서 추가 정보가 있는지 조회
    const match = HANZI_DATA.find(h => h.char === c.char);

    if (match) {
      charDetailBox.innerHTML = `
        <div class="v-char-info-card">
          <h4>${match.char} — ${match.meaning} (${match.strokes}획)</h4>
          <p class="v-char-story"><strong>원리와 어원:</strong> ${match.story}</p>
          <div class="v-char-words">
            <strong>활용 낱말:</strong>
            ${match.words.map(w => `<span class="word-chip">${w.word} <small>${w.meaning}</small></span>`).join(' ')}
          </div>
        </div>
      `;
    } else {
      charDetailBox.innerHTML = `
        <div class="v-char-info-card">
          <h4>${c.char} — ${item.reading[cidx]} (${item.verse}의 ${cidx + 1}번째 글자)</h4>
          <p class="v-char-story">천자문 ${item.no}구 "<strong>${item.verse}</strong>(${item.meaning})"에 나오는 한자입니다. 아래 캔버스에서 획순 애니메이션과 따라쓰기를 연습해 보세요!</p>
        </div>
      `;
    }

    // 캔버스 / HanziWriter에 글자 설정
    if (writePad) {
      setTimeout(() => {
        writePad.resize();
        writePad.setChar(c.char);
      }, 50);
    }
  }

  // 모달 닫기
  modalClose.addEventListener('click', closeVerseModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeVerseModal(); });
  function closeVerseModal() {
    modal.classList.remove('open');
  }

  // 이전/다음 구절 버튼
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      openVerseModal(currentIndex - 1);
    } else {
      openVerseModal(currentList.length - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < currentList.length - 1) {
      openVerseModal(currentIndex + 1);
    } else {
      openVerseModal(0);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVerseModal();
    if (modal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    }
  });

  // 초기 렌더링
  renderGrid(VERSES);
});
