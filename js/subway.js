/* ============================================================
   한자야 놀자! - 재미로 보는 지하철 역 한자 (subway.js)
   - 노선 고르기 → 역 목록 → 역을 누르면 글자별 훈음과 이야기
   - 훈음은 grade-data.js(3,500자)에서 찾아 붙입니다
   ============================================================ */

(function () {
  const $ = function (id) { return document.getElementById(id); };

  let currentLine = null;
  let currentStation = null;

  /* ---------- 노선 고르기 ---------- */

  function renderLines() {
    const grid = $('line-grid');
    if (!grid) return;
    grid.innerHTML = SUBWAY_LINES.map(function (l) {
      const stations = getLineStations(l.id);
      const storied = stations.filter(function (s) { return !!s.story; }).length;
      return `
        <button class="line-card" data-line="${l.id}" style="--line-color:${l.color}">
          <span class="lc-badge">${l.name}</span>
          <span class="lc-desc">${l.desc}</span>
          <span class="lc-meta">${stations.length}개 역 · 이야기 ${storied}개</span>
        </button>`;
    }).join('');

    grid.querySelectorAll('.line-card').forEach(function (btn) {
      btn.addEventListener('click', function () { openLine(btn.dataset.line); });
    });
  }

  /* ---------- 역 목록 ---------- */

  function openLine(lineId) {
    currentLine = lineId;
    const line = getLineInfo(lineId);
    const stations = getLineStations(lineId);

    $('subway-home').style.display = 'none';
    $('subway-line').style.display = '';
    $('station-detail').style.display = 'none';

    const head = $('line-head');
    head.style.setProperty('--line-color', line.color);
    head.innerHTML = `
      <span class="lh-badge">${line.name}</span>
      <span class="lh-desc">${line.desc}</span>
      <span class="lh-meta">${stations.length}개 역</span>`;

    $('station-list').innerHTML = stations.map(function (s) {
      return `
        <button class="station-chip${s.pureKorean ? ' pure' : ''}" data-id="${s.id}" style="--line-color:${line.color}">
          <span class="sc-order">${s.order}</span>
          <span class="sc-ko">${s.ko}</span>
          <span class="sc-mixed">${s.mixed}</span>
          ${s.story ? '<span class="sc-dot" title="이야기가 있어요">💡</span>' : ''}
        </button>`;
    }).join('');

    $('station-list').querySelectorAll('.station-chip').forEach(function (btn) {
      btn.addEventListener('click', function () { openStation(btn.dataset.id); });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 역 상세 ---------- */

  function openStation(id) {
    const s = SUBWAY_STATIONS.find(function (x) { return x.id === id; });
    if (!s) return;
    currentStation = s;
    const line = getLineInfo(s.line);

    $('station-detail').style.display = '';
    $('sd-title').textContent = s.ko;
    $('sd-mixed').textContent = s.mixed;
    $('sd-title').style.setProperty('--line-color', line.color);

    // 환승 노선
    const transfers = getTransferLines(s.ko, s.line);
    $('sd-transfer').innerHTML = transfers.length
      ? '<span class="sd-tf-label">환승</span>' + transfers.map(function (t) {
          const tl = getLineInfo(t);
          return `<button class="sd-tf" data-line="${t}" style="--line-color:${tl.color}">${tl.name}</button>`;
        }).join('')
      : '';
    $('sd-transfer').querySelectorAll('.sd-tf').forEach(function (b) {
      b.addEventListener('click', function () { openLine(b.dataset.line); });
    });

    // 글자별 풀이
    $('sd-chars').innerHTML = s.chars.map(function (ch) {
      if (!isHanjaChar(ch)) {
        return `
          <div class="sd-char native">
            <span class="sdc-char">${ch}</span>
            <span class="sdc-hun">우리말</span>
          </div>`;
      }
      const info = lookupHanja(ch);
      if (!info) {
        return `
          <div class="sd-char unknown">
            <span class="sdc-char">${ch}</span>
            <span class="sdc-hun">훈음 준비 중</span>
          </div>`;
      }
      // 급수는 어문회 배정한자일 때만 표시합니다 (보충 훈음 글자는 급수가 없어요)
      const g = (info.grade && typeof getGradeInfo === 'function') ? getGradeInfo(info.grade) : null;
      const note = info.variantOf
        ? `<span class="sdc-note">표준자 ${info.variantOf}</span>`
        : (info.extra ? '<span class="sdc-note">급수 밖 한자</span>' : '');
      return `
        <div class="sd-char">
          <span class="sdc-char">${ch}</span>
          <span class="sdc-hun">${info.meaning} ${info.sound}</span>
          ${g ? `<span class="sdc-grade">${g.badge} ${g.name}</span>` : ''}
          ${note}
        </div>`;
    }).join('');

    // 이야기
    if (s.story) {
      $('sd-story').style.display = '';
      $('sd-story-text').textContent = s.story;
    } else {
      $('sd-story').style.display = 'none';
    }

    // 순우리말 안내
    $('sd-pure').style.display = s.pureKorean ? '' : 'none';

    // 이어서 공부하기 (역이름에 쓰인 한자의 급수 기준)
    const first = s.hanjaChars.map(lookupHanja).filter(function (h) { return h && h.grade; })[0];
    const flash = $('sd-flash');
    const print = $('sd-print');
    if (first) {
      flash.style.display = '';
      print.style.display = '';
      flash.href = `flashcard.html?deck=grade:${first.grade}&limit=20`;
      print.href = `worksheet.html?type=grade&grade=${first.grade}&limit=20`;
    } else {
      flash.style.display = 'none';
      print.style.display = 'none';
    }

    $('station-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 검색 ---------- */

  function initSearch() {
    const input = $('station-search');
    const box = $('search-result');
    if (!input) return;

    input.addEventListener('input', function () {
      const q = input.value.trim();
      if (!q) { box.innerHTML = ''; box.style.display = 'none'; return; }

      const hits = SUBWAY_STATIONS.filter(function (s) {
        return s.ko.indexOf(q) !== -1 || s.mixed.indexOf(q) !== -1;
      }).slice(0, 24);

      if (!hits.length) {
        box.style.display = '';
        box.innerHTML = '<p class="sr-empty">찾는 역이 없어요. 다른 이름으로 찾아보세요.</p>';
        return;
      }

      box.style.display = '';
      box.innerHTML = hits.map(function (s) {
        const l = getLineInfo(s.line);
        return `
          <button class="sr-item" data-id="${s.id}" style="--line-color:${l.color}">
            <span class="sri-line">${l.name}</span>
            <span class="sri-ko">${s.ko}</span>
            <span class="sri-mixed">${s.mixed}</span>
          </button>`;
      }).join('');

      box.querySelectorAll('.sr-item').forEach(function (b) {
        b.addEventListener('click', function () {
          const s = SUBWAY_STATIONS.find(function (x) { return x.id === b.dataset.id; });
          if (!s) return;
          openLine(s.line);
          openStation(s.id);
        });
      });
    });
  }

  /* ---------- 초기화 ---------- */

  function init() {
    if (typeof SUBWAY_LINES === 'undefined') return;

    const stats = getSubwayStats();
    const el = $('subway-stats');
    if (el) {
      el.innerHTML = `
        <span><strong>${stats.total}</strong>개 역</span>
        <span><strong>${stats.uniqueChars}</strong>자의 한자</span>
        <span><strong>${stats.storied}</strong>개 역 이야기</span>
        <span><strong>${stats.pureKorean}</strong>개 순우리말 역</span>`;
    }

    renderLines();
    initSearch();

    const back = $('line-back');
    if (back) back.addEventListener('click', function () {
      $('subway-line').style.display = 'none';
      $('station-detail').style.display = 'none';
      $('subway-home').style.display = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const sdClose = $('sd-close');
    if (sdClose) sdClose.addEventListener('click', function () {
      $('station-detail').style.display = 'none';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
