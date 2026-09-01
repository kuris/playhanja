/* ============================================================
   한자야 놀자! - A4 워크시트 & PDF 인쇄 엔진 (worksheet.js)
   - 1페이지에 4글자씩 A4 최적화 쓰기 연습장 렌더링
   - 따라쓰기 2칸 + 스스로 쓰기 4칸 + 낱말 쓰기 + 하단 받아쓰기 퀴즈
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const mount = document.getElementById('ws-mount');
  const selector = document.getElementById('verse-selector');
  const VERSES = window.THOUSAND_VERSES || [];
  const HANZI_DATA = window.HANZI_DATA || [];

  // URL 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'verse';
  const no = parseInt(urlParams.get('no') || '1', 10);
  const from = parseInt(urlParams.get('from') || '1', 10);
  const to = parseInt(urlParams.get('to') || '1', 10);

  // 셀렉터 초기화 (천자문 1구~250구)
  selector.innerHTML = `
    <option value="single">현재 구절 (제 ${no}구)</option>
    <option value="range_1_5">제 1구 ~ 5구 (총 5장)</option>
    <option value="range_1_10">제 1구 ~ 10구 (총 10장)</option>
    <option value="all">천자문 1구~250구 전체</option>
  ` + VERSES.map(v => `<option value="${v.no}">제 ${v.no}구: ${v.verse} (${v.reading})</option>`).join('');

  selector.value = no.toString();

  selector.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'range_1_5') {
      renderVerseRange(1, 5);
    } else if (val === 'range_1_10') {
      renderVerseRange(1, 10);
    } else if (val === 'all') {
      renderVerseRange(1, 250);
    } else if (val === 'single') {
      renderSingleVerse(no);
    } else {
      const vno = parseInt(val, 10);
      renderSingleVerse(vno);
    }
  });

  // 초기 렌더링
  if (type === 'verse_range') {
    renderVerseRange(from, to);
  } else {
    renderSingleVerse(no);
  }

  // ---------- 단일 구절 렌더링 ----------
  function renderSingleVerse(verseNo) {
    const v = VERSES.find(item => item.no === verseNo) || VERSES[0];
    mount.innerHTML = generatePageHTML(v);
  }

  // ---------- 범위 렌더링 ----------
  function renderVerseRange(startNo, endNo) {
    const list = VERSES.filter(item => item.no >= startNo && item.no <= endNo);
    mount.innerHTML = list.map(v => generatePageHTML(v)).join('');
  }

  // ---------- A4 1페이지 HTML 생성 ----------
  function generatePageHTML(verseItem) {
    // 4글자 데이터 가공
    const charsHtml = verseItem.chars.map((c, i) => {
      const hanziInfo = HANZI_DATA.find(h => h.char === c.char);
      const strokes = hanziInfo ? `${hanziInfo.strokes}획` : '';
      const meaning = hanziInfo ? hanziInfo.meaning.split(',')[0] : c.sound;
      const sound = c.sound;

      // 낱말 데이터
      let wordsHtml = '';
      if (hanziInfo && hanziInfo.words && hanziInfo.words.length > 0) {
        wordsHtml = hanziInfo.words.slice(0, 2).map(w => `
          <div class="ws-word-item">
            <span class="ws-word-hanzi">${w.word}</span>
            <span class="ws-word-box"></span>
          </div>
        `).join('');
      } else {
        wordsHtml = `
          <div class="ws-word-item">
            <span class="ws-word-hanzi">${verseItem.verse.slice(0, 2)}</span>
            <span class="ws-word-box"></span>
          </div>
          <div class="ws-word-item">
            <span class="ws-word-hanzi">${verseItem.verse.slice(2, 4)}</span>
            <span class="ws-word-box"></span>
          </div>
        `;
      }

      return `
        <div class="ws-char-row">
          <!-- 1열: 대표 글자 & 훈음 -->
          <div class="ws-char-badge">
            <div class="ws-big-char">${c.char}</div>
            <div class="ws-char-sound">${sound} (${meaning})</div>
            <div class="ws-char-strokes">${strokes}</div>
          </div>

          <!-- 쓰기 격자 6칸 (2칸 따라쓰기 + 4칸 스스로 쓰기) -->
          <div class="ws-grids-wrap">
            <!-- 따라쓰기 1 -->
            <div class="ws-grid-box">
              <span class="ws-guide-char">${c.char}</span>
              <span class="ws-guide-label">따라쓰기</span>
            </div>
            <!-- 따라쓰기 2 -->
            <div class="ws-grid-box">
              <span class="ws-guide-char">${c.char}</span>
              <span class="ws-guide-label">따라쓰기</span>
            </div>
            <!-- 스스로 쓰기 1 -->
            <div class="ws-grid-box"></div>
            <!-- 스스로 쓰기 2 -->
            <div class="ws-grid-box"></div>
            <!-- 스스로 쓰기 3 -->
            <div class="ws-grid-box"></div>
            <!-- 스스로 쓰기 4 -->
            <div class="ws-grid-box"></div>
          </div>

          <!-- 활용 낱말 쓰기 -->
          <div class="ws-words-col">
            <div style="font-size:.65rem; color:#6b7280; font-weight:700; margin-bottom:2px;">낱말 연습</div>
            ${wordsHtml}
          </div>
        </div>
      `;
    }).join('');

    // 하단 받아쓰기 퀴즈 칸
    const quizBlanks = verseItem.chars.map(c => `
      <div class="ws-quiz-item">
        <span class="ws-quiz-sound">${c.sound}:</span>
        <div class="ws-quiz-blank"></div>
      </div>
    `).join('');

    return `
      <div class="a4-page">
        <!-- 헤더 -->
        <div class="ws-header">
          <div class="ws-title-row">
            <div class="ws-main-title">
              <i class="fa-solid fa-feather-pointed" style="color:#92400e;"></i> 천자문 쓰기 연습장
              <small style="font-size:.9rem; color:#6b7280; font-weight:normal;">(제 ${verseItem.no}구)</small>
            </div>
            <div class="ws-meta-box">
              <span>날짜: <span class="ws-meta-field"></span></span>
              <span>이름: <span class="ws-meta-field"></span></span>
              <span>점수: <span class="ws-meta-field" style="min-width:50px;"></span> / 100</span>
            </div>
          </div>
          <div class="ws-subtitle-row">
            <span class="ws-verse-text">【 ${verseItem.verse} 】 (${verseItem.reading})</span>
            <span class="ws-verse-meaning">${verseItem.meaning}</span>
          </div>
        </div>

        <!-- 4글자 쓰기 본문 -->
        <div class="ws-body-rows">
          ${charsHtml}
        </div>

        <!-- 하단 미니 받아쓰기 & 4자 성구 암기 테스트 -->
        <div class="ws-footer-quiz">
          <div class="ws-quiz-title">
            <span>✍️ 【 미니 받아쓰기 】 소리를 보고 알맞은 한자를 적어보세요:</span>
            <span style="font-size:.75rem; color:#6b7280;">4글자 구절 순서대로 적기</span>
          </div>
          <div class="ws-quiz-grid">
            ${quizBlanks}
          </div>
        </div>

        <!-- 페이지 바닥글 -->
        <div class="ws-page-footer">
          <span>한자야 놀자! (playhanja.vercel.app)</span>
          <span>천자문 250구 완당 워크시트 · A4 규격</span>
          <span>제 ${verseItem.no} / 250구</span>
        </div>
      </div>
    `;
  }
});
