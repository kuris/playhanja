/* ============================================================
   한자야 놀자! - 재미로 보는 이야기 (story.js)
   한글 본문의 한자어를 눌러 한자로 바꾸고 훈음을 확인합니다
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const STORIES = window.STORIES || [];
  const listView = document.getElementById('story-list');
  const readView = document.getElementById('story-read');
  const grid = document.getElementById('story-grid');
  const body = document.getElementById('story-body');
  const tabs = document.getElementById('chapter-tabs');
  const pop = document.getElementById('word-pop');

  let story = null;
  let chapterIdx = 0;
  let allHanja = false;   // 전체 한자 보기 여부

  const gradeOf = (ch) => (window.GRADE_HANJA || []).find(h => h.char === ch);

  // 한자어의 출제 급수 = 구성 한자 중 가장 높은 급수
  function wordGrade(hanja) {
    const infos = [...hanja].map(gradeOf).filter(Boolean);
    if (!infos.length) return null;
    return infos.reduce((a, b) => (a.gradeOrder >= b.gradeOrder ? a : b));
  }

  // ---------- 목록 ----------
  function renderList() {
    grid.innerHTML = STORIES.map((s, i) => {
      const total = s.chapters.reduce((n, c) => n + window.getStoryWords(c).length, 0);
      return `
        <button class="story-card" data-idx="${i}" style="--sc-color:${s.color};">
          <span class="sc-cover">${s.cover}</span>
          <span class="sc-title">${s.title}</span>
          <span class="sc-sub">${s.subtitle}</span>
          <span class="sc-desc">${s.intro}</span>
          <span class="sc-meta">${s.chapters.length}장 · 한자어 ${total}개</span>
          <span class="sc-author">${s.author}</span>
        </button>`;
    }).join('');
    grid.querySelectorAll('.story-card').forEach(b => {
      b.addEventListener('click', () => openStory(Number(b.dataset.idx)));
    });
  }

  function openStory(i) {
    story = STORIES[i];
    chapterIdx = 0;
    listView.style.display = 'none';
    readView.style.display = 'block';
    document.getElementById('sb-title').textContent = story.title;
    renderTabs();
    renderChapter();
  }

  function renderTabs() {
    tabs.innerHTML = story.chapters.map((c, i) => `
      <button class="chapter-tab ${i === chapterIdx ? 'active' : ''}" data-i="${i}">
        <span class="ct-emoji">${c.emoji}</span>
        <span class="ct-no">${c.no}장</span>
        <span class="ct-title">${c.title}</span>
      </button>`).join('');
    tabs.querySelectorAll('.chapter-tab').forEach(b => {
      b.addEventListener('click', () => { chapterIdx = Number(b.dataset.i); renderTabs(); renderChapter(); });
    });
  }

  // ---------- 본문 ----------
  function renderChapter() {
    const ch = story.chapters[chapterIdx];
    body.innerHTML = `
      <h2 class="story-ch-title">${ch.emoji} ${ch.no}장. ${ch.title}</h2>
      ${ch.paragraphs.map(para => `
        <p class="story-para">
          ${para.map(line => window.parseStoryLine(line).map(t => {
            if (!t.hanja) return escapeHtml(t.text);
            const g = wordGrade(t.hanja);
            return `<button class="hw" data-ko="${t.ko}" data-hanja="${t.hanja}"
                      data-grade="${g ? g.grade : ''}">${allHanja ? t.hanja : t.ko}</button>`;
          }).join('')).join(' ')}
        </p>`).join('')}
    `;
    body.querySelectorAll('.hw').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWord(btn);
        showPop(btn);
      });
    });
    renderWordList(ch);
    document.getElementById('prev-ch').disabled = chapterIdx === 0;
    document.getElementById('next-ch').disabled = chapterIdx === story.chapters.length - 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // 한글 ↔ 한자 전환
  function toggleWord(btn) {
    const showing = btn.dataset.showing === 'hanja';
    btn.textContent = showing ? btn.dataset.ko : btn.dataset.hanja;
    btn.dataset.showing = showing ? 'ko' : 'hanja';
    btn.classList.toggle('is-hanja', !showing);
  }

  // ---------- 팝오버 ----------
  function showPop(btn) {
    const hanja = btn.dataset.hanja;
    const ko = btn.dataset.ko;
    document.getElementById('wp-hanja').textContent = hanja;
    document.getElementById('wp-ko').textContent = ko;

    document.getElementById('wp-chars').innerHTML = [...hanja].map(c => {
      const g = gradeOf(c);
      if (!g) return `<div class="wp-char"><span class="wpc-han">${c}</span><span class="wpc-info">—</span></div>`;
      const lv = window.getGradeInfo(g.grade);
      return `
        <div class="wp-char">
          <span class="wpc-han">${c}</span>
          <span class="wpc-info">
            <strong>${g.hunmum}</strong>
            <small>${lv.badge} ${lv.name} · ${g.strokes}획 · 부수 ${g.radical}</small>
          </span>
        </div>`;
    }).join('');

    const first = [...hanja].map(gradeOf).find(Boolean);
    document.getElementById('wp-learn').href = first ? `grade.html?grade=${first.grade}` : 'grade.html';
    document.getElementById('wp-speak').onclick = () => {
      if (window.HanjaSpeech) window.HanjaSpeech.speak(`${ko}. ` + [...hanja].map(c => {
        const g = gradeOf(c); return g ? g.hunmum : c;
      }).join(', '));
    };

    const r = btn.getBoundingClientRect();
    pop.style.display = 'block';
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(10, Math.min(window.innerWidth - pw - 10, left));
    let top = r.bottom + window.scrollY + 10;
    if (r.bottom + ph + 20 > window.innerHeight) top = r.top + window.scrollY - ph - 10;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function hidePop() { pop.style.display = 'none'; }
  document.getElementById('wp-close').addEventListener('click', hidePop);
  document.addEventListener('click', (e) => { if (!pop.contains(e.target)) hidePop(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hidePop(); });

  // ---------- 이 장의 한자어 ----------
  function renderWordList(ch) {
    const words = window.getStoryWords(ch);
    document.getElementById('sw-count').textContent = `(${words.length}개)`;
    document.getElementById('story-words').innerHTML = words.map(w => {
      const g = wordGrade(w.hanja);
      const lv = g ? window.getGradeInfo(g.grade) : null;
      return `
        <button class="sw-item" data-hanja="${w.hanja}" data-ko="${w.ko}">
          <span class="swi-hanja">${w.hanja}</span>
          <span class="swi-ko">${w.ko}</span>
          ${lv ? `<span class="swi-lv">${lv.badge} ${lv.name}</span>` : ''}
        </button>`;
    }).join('');
    document.getElementById('story-words').querySelectorAll('.sw-item').forEach(b => {
      b.addEventListener('click', (e) => { e.stopPropagation(); showPop(b); });
    });

    // 이 장 한자로 복습/인쇄
    const chars = [...new Set(words.flatMap(w => [...w.hanja]))].filter(c => gradeOf(c));
    const first = chars.length ? gradeOf(chars[0]) : null;
    document.getElementById('sw-flash').href = first ? `flashcard.html?deck=grade:${first.grade}&limit=20` : 'flashcard.html';
    document.getElementById('sw-print').href = first ? `worksheet.html?type=grade&grade=${first.grade}&limit=20` : 'worksheet.html';
  }

  // ---------- 전체 한자 보기 ----------
  document.getElementById('toggle-all').addEventListener('click', () => {
    allHanja = !allHanja;
    document.getElementById('toggle-all').innerHTML = allHanja
      ? '<i class="fa-solid fa-language"></i> 전체 한글로'
      : '<i class="fa-solid fa-language"></i> 전체 한자로';
    renderChapter();
  });

  document.getElementById('story-back').addEventListener('click', () => {
    readView.style.display = 'none';
    listView.style.display = 'block';
    hidePop();
  });
  document.getElementById('prev-ch').addEventListener('click', () => {
    if (chapterIdx > 0) { chapterIdx--; renderTabs(); renderChapter(); }
  });
  document.getElementById('next-ch').addEventListener('click', () => {
    if (chapterIdx < story.chapters.length - 1) { chapterIdx++; renderTabs(); renderChapter(); }
  });

  renderList();
  const params = new URLSearchParams(location.search);
  if (params.get('story')) {
    const i = STORIES.findIndex(s => s.id === params.get('story'));
    if (i >= 0) openStory(i);
  }
});
