/* ============================================================
   한자야 놀자! - A4 워크시트 & PDF 인쇄 엔진 (worksheet.js)
   - 1페이지에 4글자씩 A4 최적화 쓰기 연습장 렌더링
   - 따라쓰기 2칸 + 스스로 쓰기 4칸 + 낱말 쓰기 + 하단 받아쓰기 퀴즈
   - 두 가지 모드 지원
     1) 천자문 모드 : ?type=verse&no=1  /  ?type=verse_range&from=1&to=5
     2) 급수 모드   : ?type=grade&grade=7&limit=40  /  ?type=grade&grade=7&from=5&limit=4
     3) 성어 모드   : ?type=idiom&no=1  /  ?type=idiom&level=all&limit=10
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const mount = document.getElementById('ws-mount');
  const modeSelector = document.getElementById('mode-selector');
  const selector = document.getElementById('verse-selector');
  const gradeSelector = document.getElementById('grade-selector');
  const gradeRange = document.getElementById('grade-range');
  const idiomSelector = document.getElementById('idiom-selector');
  const idiomRange = document.getElementById('idiom-range');
  const VERSES = window.THOUSAND_VERSES || [];
  const HANZI_DATA = window.HANZI_DATA || [];
  const GRADE_LEVELS = window.GRADE_LEVELS || [];

  // URL 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'verse';
  const no = parseInt(urlParams.get('no') || '1', 10);
  const from = parseInt(urlParams.get('from') || '1', 10);
  const to = parseInt(urlParams.get('to') || '1', 10);
  const gradeParam = parseInt(urlParams.get('grade') || '9', 10);
  const idiomNo = parseInt(urlParams.get('no') || '0', 10);
  const idiomLevel = urlParams.get('level') || 'all';
  const limitParam = urlParams.get('limit') || '40';

  const CHARS_PER_PAGE = 4;

  // ---------- 셀렉터 초기화 ----------
  // 천자문 구절 셀렉터
  selector.innerHTML = `
    <option value="single">현재 구절 (제 ${no}구)</option>
    <option value="range_1_5">제 1구 ~ 5구 (총 5장)</option>
    <option value="range_1_10">제 1구 ~ 10구 (총 10장)</option>
    <option value="all">천자문 1구~250구 전체</option>
  ` + VERSES.map(v => `<option value="${v.no}">제 ${v.no}구: ${v.verse} (${v.reading})</option>`).join('');
  selector.value = no.toString();

  // 급수 셀렉터
  if (gradeSelector) {
    gradeSelector.innerHTML = GRADE_LEVELS.map(g => {
      const cnt = window.getGradeChars ? window.getGradeChars(g.id).length : 0;
      return `<option value="${g.id}">${g.badge} ${g.name} (${g.title}) · ${cnt}자</option>`;
    }).join('');
    gradeSelector.value = String(gradeParam);
  }
  if (gradeRange) {
    // URL의 limit 값이 기본 옵션에 없으면(예: 4자 낱장 인쇄) 임시 옵션을 만들어 선택
    const has = Array.prototype.some.call(gradeRange.options, o => o.value === String(limitParam));
    if (!has) {
      const opt = document.createElement('option');
      opt.value = String(limitParam);
      opt.textContent = `앞에서 ${limitParam}자`;
      gradeRange.insertBefore(opt, gradeRange.firstChild);
    }
    gradeRange.value = String(limitParam);
  }

  // 성어 셀렉터
  const IDIOMS = window.IDIOMS || [];
  if (idiomSelector) {
    idiomSelector.innerHTML = `<option value="range">난이도 전체에서 순서대로</option>`
      + IDIOMS.map(i => `<option value="${i.no}">${i.idiom} (${i.reading})</option>`).join('');
    if (idiomNo > 0) idiomSelector.value = String(idiomNo);
  }

  // ---------- 모드 전환 ----------
  function applyMode(mode) {
    const isGrade = mode === 'grade';
    const isIdiom = mode === 'idiom';
    selector.style.display = (!isGrade && !isIdiom) ? '' : 'none';
    if (gradeSelector) gradeSelector.style.display = isGrade ? '' : 'none';
    if (gradeRange) gradeRange.style.display = isGrade ? '' : 'none';
    if (idiomSelector) idiomSelector.style.display = isIdiom ? '' : 'none';
    if (idiomRange) idiomRange.style.display = isIdiom ? '' : 'none';
    if (modeSelector) modeSelector.value = mode;
  }

  if (modeSelector) {
    modeSelector.addEventListener('change', (e) => {
      const mode = e.target.value;
      applyMode(mode);
      if (mode === 'grade') renderGradeSheets();
      else if (mode === 'idiom') renderIdiomSheets();
      else renderSingleVerse(parseInt(selector.value, 10) || no);
    });
  }

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
      renderSingleVerse(parseInt(val, 10));
    }
  });

  if (gradeSelector) gradeSelector.addEventListener('change', renderGradeSheets);
  if (gradeRange) gradeRange.addEventListener('change', renderGradeSheets);
  if (idiomSelector) idiomSelector.addEventListener('change', renderIdiomSheets);
  if (idiomRange) idiomRange.addEventListener('change', renderIdiomSheets);

  // ---------- 초기 렌더링 ----------
  if (type === 'grade') {
    applyMode('grade');
    renderGradeSheets(true);
  } else if (type === 'idiom') {
    applyMode('idiom');
    renderIdiomSheets(true);
  } else if (type === 'verse_range') {
    applyMode('verse');
    renderVerseRange(from, to);
  } else {
    applyMode('verse');
    renderSingleVerse(no);
  }

  /* ============================================================
     1) 천자문 모드
     ============================================================ */
  function renderSingleVerse(verseNo) {
    const v = VERSES.find(item => item.no === verseNo) || VERSES[0];
    if (!v) return;
    mount.innerHTML = generateVersePage(v);
  }

  function renderVerseRange(startNo, endNo) {
    const list = VERSES.filter(item => item.no >= startNo && item.no <= endNo);
    mount.innerHTML = list.map(v => generateVersePage(v)).join('');
  }

  function generateVersePage(verseItem) {
    const rows = verseItem.chars.map(c => {
      const info = HANZI_DATA.find(h => h.char === c.char);
      return {
        char: c.char,
        sound: c.sound,
        meaning: info ? info.meaning.split(',')[0] : '',
        strokes: info ? `${info.strokes}획` : '',
        words: buildWordsHtml(info, verseItem)
      };
    });

    return generatePageHTML({
      title: '천자문 쓰기 연습장',
      titleSmall: `(제 ${verseItem.no}구)`,
      bannerLeft: `【 ${verseItem.verse} 】 (${verseItem.reading})`,
      bannerRight: verseItem.meaning,
      rows: rows,
      quizItems: verseItem.chars.map(c => ({ label: `${c.sound}:` })),
      quizTitle: '✍️ 【 미니 받아쓰기 】 소리를 보고 알맞은 한자를 적어보세요:',
      quizHint: '4글자 구절 순서대로 적기',
      footerMiddle: '천자문 250구 완당 워크시트 · A4 규격',
      footerRight: `제 ${verseItem.no} / 250구`
    });
  }

  function buildWordsHtml(info, verseItem) {
    if (info && info.words && info.words.length > 0) {
      return info.words.slice(0, 2).map(w => `
        <div class="ws-word-item">
          <span class="ws-word-hanzi">${w.word}</span>
          <span class="ws-word-desc">(${w.reading}: ${w.meaning})</span>
        </div>
      `).join('');
    }
    if (verseItem) {
      return `
        <div class="ws-word-item">
          <span class="ws-word-hanzi">${verseItem.verse.slice(0, 2)}</span>
          <span class="ws-word-desc">(${verseItem.reading.slice(0, 2)})</span>
        </div>
        <div class="ws-word-item">
          <span class="ws-word-hanzi">${verseItem.verse.slice(2, 4)}</span>
          <span class="ws-word-desc">(${verseItem.reading.slice(2, 4)})</span>
        </div>
      `;
    }
    return '';
  }

  /* ============================================================
     2) 급수 모드 (1급~9급)
     ============================================================ */
  function renderGradeSheets(useUrlParams) {
    if (!window.getGradeChars) return;

    const gradeId = gradeSelector ? Number(gradeSelector.value) : gradeParam;
    const info = window.getGradeInfo(gradeId);
    const all = window.getGradeChars(gradeId);

    // 시작 위치(from)는 URL로 진입한 최초 1회에만 적용
    const startIdx = useUrlParams ? Math.max(0, from - 1) : 0;
    const limitRaw = useUrlParams ? limitParam : (gradeRange ? gradeRange.value : '40');
    const limit = limitRaw === 'all' ? all.length : (parseInt(limitRaw, 10) || 40);

    const list = all.slice(startIdx, startIdx + limit);
    if (list.length === 0) {
      mount.innerHTML = '<div style="color:#fff; padding:40px;">인쇄할 한자가 없습니다.</div>';
      return;
    }

    // 4글자씩 페이지 분할
    const pages = [];
    for (let i = 0; i < list.length; i += CHARS_PER_PAGE) {
      pages.push(list.slice(i, i + CHARS_PER_PAGE));
    }
    const totalPages = pages.length;

    mount.innerHTML = pages.map((chunk, pageIdx) => {
      const rows = chunk.map(h => {
        const dbInfo = HANZI_DATA.find(d => d.char === h.char);
        return {
          char: h.char,
          sound: h.sound,
          meaning: h.meaning,
          strokes: dbInfo ? `${dbInfo.strokes}획` : '',
          words: dbInfo && dbInfo.words && dbInfo.words.length
            ? buildWordsHtml(dbInfo, null)
            : buildHunmumPracticeHtml(h)
        };
      });

      const firstNo = startIdx + pageIdx * CHARS_PER_PAGE + 1;
      const lastNo = firstNo + chunk.length - 1;

      return generatePageHTML({
        title: `${info.name} 한자 쓰기 연습장`,
        titleSmall: `(${info.badge} ${info.title})`,
        bannerLeft: chunk.map(h => h.char).join(' '),
        bannerRight: `${info.name} 제 ${firstNo}~${lastNo}자 · ${info.desc}`,
        rows: rows,
        quizItems: chunk.map(h => ({ label: `${h.meaning} ${h.sound}:` })),
        quizTitle: '✍️ 【 미니 받아쓰기 】 훈과 음을 보고 알맞은 한자를 적어보세요:',
        quizHint: '훈음 → 한자 쓰기',
        footerMiddle: `${info.name}(${info.title}) 급수 한자 워크시트 · A4 규격`,
        footerRight: `${firstNo}~${lastNo}자 (${pageIdx + 1} / ${totalPages}장)`
      });
    }).join('');
  }

  // 급수 한자는 낱말 자료가 없을 수 있으므로 훈음 쓰기 칸을 제공
  function buildHunmumPracticeHtml(h) {
    return `
      <div class="ws-word-item">
        <span class="ws-word-desc">훈(뜻): </span>
        <span class="ws-write-line"></span>
      </div>
      <div class="ws-word-item">
        <span class="ws-word-desc">음(소리): </span>
        <span class="ws-write-line"></span>
      </div>
      <div class="ws-word-item">
        <span class="ws-word-desc" style="color:#9ca3af;">정답: ${h.meaning} ${h.sound}</span>
      </div>
    `;
  }

  /* ============================================================
     3) 고사성어 모드
     ============================================================ */
  function renderIdiomSheets(useUrlParams) {
    const list = window.IDIOMS || [];
    if (list.length === 0) return;

    let targets;
    const selVal = idiomSelector ? idiomSelector.value : 'range';
    if (useUrlParams && idiomNo > 0) {
      const one = list.find(i => i.no === idiomNo);
      targets = one ? [one] : [list[0]];
    } else if (selVal !== 'range') {
      const one = list.find(i => i.no === Number(selVal));
      targets = one ? [one] : [list[0]];
    } else {
      const lv = useUrlParams ? idiomLevel : 'all';
      const pool = lv === 'all' ? list : list.filter(i => i.level === Number(lv));
      const limitRaw = useUrlParams
        ? (urlParams.get('limit') || '10')
        : (idiomRange ? idiomRange.value : '10');
      const limit = limitRaw === 'all' ? pool.length : (parseInt(limitRaw, 10) || 10);
      targets = pool.slice(0, limit);
    }

    mount.innerHTML = targets.map((it, idx) => {
      const rows = it.chars.map(c => {
        const dbInfo = HANZI_DATA.find(d => d.char === c.char);
        return {
          char: c.char,
          sound: c.sound,
          meaning: c.meaning,
          strokes: dbInfo ? `${dbInfo.strokes}획` : '',
          words: dbInfo && dbInfo.words && dbInfo.words.length
            ? buildWordsHtml(dbInfo, null)
            : buildHunmumPracticeHtml(c)
        };
      });

      return generatePageHTML({
        title: '고사성어 쓰기 연습장',
        titleSmall: `(제 ${it.no}번 · ${window.getIdiomLevelInfo(it.level).name})`,
        bannerLeft: `【 ${it.idiom} 】 (${it.reading})`,
        bannerRight: it.meaning,
        rows: rows,
        quizItems: it.chars.map(c => ({ label: `${c.meaning} ${c.sound}:` })),
        quizTitle: '✍️ 【 성어 통쓰기 】 훈과 음을 보고 네 글자를 순서대로 적어보세요:',
        quizHint: `${it.reading} · ${it.source}`,
        storyNote: `📖 ${it.story}<br><strong>💡 ${it.lesson}</strong>`,
        footerMiddle: '고사성어 100선 워크시트 · A4 규격',
        footerRight: `${idx + 1} / ${targets.length}장`
      });
    }).join('');
  }

  /* ============================================================
     공통 A4 1페이지 HTML 생성
     ============================================================ */
  function generatePageHTML(opt) {
    const charsHtml = opt.rows.map(r => `
      <div class="ws-char-row">
        <!-- 1열: 대표 글자 & 훈음 -->
        <div class="ws-char-badge">
          <div class="ws-big-char">${r.char}</div>
          <div class="ws-char-sound">${r.meaning ? r.meaning + ' ' : ''}${r.sound}</div>
          <div class="ws-char-strokes">${r.strokes}</div>
        </div>

        <!-- 쓰기 격자 6칸 (2칸 따라쓰기 + 4칸 스스로 쓰기) -->
        <div class="ws-grids-wrap">
          <div class="ws-grid-box">
            <span class="ws-guide-char">${r.char}</span>
            <span class="ws-guide-label">따라쓰기</span>
          </div>
          <div class="ws-grid-box">
            <span class="ws-guide-char">${r.char}</span>
            <span class="ws-guide-label">따라쓰기</span>
          </div>
          <div class="ws-grid-box"></div>
          <div class="ws-grid-box"></div>
          <div class="ws-grid-box"></div>
          <div class="ws-grid-box"></div>
        </div>

        <!-- 활용 낱말 / 훈음 쓰기 -->
        <div class="ws-words-col">
          <div style="font-size:.65rem; color:#6b7280; font-weight:700; margin-bottom:2px;">낱말 연습</div>
          ${r.words}
        </div>
      </div>
    `).join('');

    const quizBlanks = opt.quizItems.map(q => `
      <div class="ws-quiz-item">
        <span class="ws-quiz-sound">${q.label}</span>
        <div class="ws-quiz-blank"></div>
      </div>
    `).join('');

    return `
      <div class="a4-page">
        <div class="ws-header">
          <div class="ws-title-row">
            <div class="ws-main-title">
              <i class="fa-solid fa-feather-pointed" style="color:#92400e;"></i> ${opt.title}
              <small style="font-size:.9rem; color:#6b7280; font-weight:normal;">${opt.titleSmall}</small>
            </div>
            <div class="ws-meta-box">
              <span>날짜: <span class="ws-meta-field"></span></span>
              <span>이름: <span class="ws-meta-field"></span></span>
              <span>점수: <span class="ws-meta-field" style="min-width:50px;"></span> / 100</span>
            </div>
          </div>
          <div class="ws-subtitle-row">
            <span class="ws-verse-text">${opt.bannerLeft}</span>
            <span class="ws-verse-meaning">${opt.bannerRight}</span>
          </div>
        </div>

        <div class="ws-body-rows">
          ${charsHtml}
        </div>

        ${opt.storyNote ? `<div class="ws-story-note">${opt.storyNote}</div>` : ''}

        <div class="ws-footer-quiz">
          <div class="ws-quiz-title">
            <span>${opt.quizTitle}</span>
            <span style="font-size:.75rem; color:#6b7280;">${opt.quizHint}</span>
          </div>
          <div class="ws-quiz-grid">
            ${quizBlanks}
          </div>
        </div>

        <div class="ws-page-footer">
          <span>한자야 놀자! (playhanja.vercel.app)</span>
          <span>${opt.footerMiddle}</span>
          <span>${opt.footerRight}</span>
        </div>
      </div>
    `;
  }
});
