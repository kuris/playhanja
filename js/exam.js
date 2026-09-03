/* ============================================================
   한자야 놀자! - 급수별 실전 모의고사 (exam.js)
   한국어문회 출제기준(문항 수·유형·시간·합격선)을 반영한 시험지
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const LEVELS = (window.GRADE_LEVELS || []).filter(g => g.official);
  const SPEC = window.EXAM_SPEC || {};
  const SUPPORTED = window.SUPPORTED_TYPES || [];
  const ANTONYMS = window.ANTONYM_PAIRS || [];
  const IDIOMS = window.IDIOMS || [];
  const NOTES = window.HanjaWrongNotes;

  const setupView = document.getElementById('exam-setup');
  const examView = document.getElementById('exam-view');
  const resultView = document.getElementById('exam-result');
  const gradeGrid = document.getElementById('exam-grade-grid');
  const infoCard = document.getElementById('exam-info-card');
  const sheet = document.getElementById('exam-sheet');
  const timerEl = document.getElementById('eb-timer');
  const progressEl = document.getElementById('exam-progress');

  let selectedGrade = 'g8';
  let questions = [];
  let answers = {};
  let timerId = null;
  let remainSec = 0;
  let startedAt = 0;

  function shuffle(a) {
    const x = a.slice();
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }
    return x;
  }
  const pick = (arr, n) => shuffle(arr).slice(0, n);

  // ---------- 급수 선택 ----------
  function renderGrades() {
    gradeGrid.innerHTML = LEVELS.map(g => {
      const s = SPEC[g.id];
      const cum = window.getCumulativeChars(g.id).length;
      return `
        <button class="exam-grade-card ${g.id === selectedGrade ? 'active' : ''}" data-grade="${g.id}" style="--grade-color:${g.color};">
          <span class="egc-badge">${g.badge}</span>
          <span class="egc-name">${g.name}</span>
          <span class="egc-sub">${cum}자</span>
          <span class="egc-spec">${s.total}문항 · ${s.minutes}분</span>
        </button>`;
    }).join('');
    gradeGrid.querySelectorAll('.exam-grade-card').forEach(b => {
      b.addEventListener('click', () => {
        selectedGrade = b.dataset.grade;
        renderGrades();
        renderInfo();
      });
    });
  }

  function renderInfo() {
    const g = window.getGradeInfo(selectedGrade);
    const s = SPEC[selectedGrade];
    const cum = window.getCumulativeChars(selectedGrade).length;
    const typeRows = Object.keys(s.types).map(t => {
      const supported = SUPPORTED.indexOf(t) !== -1;
      return `<span class="type-chip ${supported ? '' : 'unsupported'}">${t} ${s.types[t]}문항${supported ? '' : ' *'}</span>`;
    }).join('');
    const unsupported = Object.keys(s.types).filter(t => SUPPORTED.indexOf(t) === -1);

    infoCard.innerHTML = `
      <div class="ei-head">
        <span class="ei-badge">${g.badge} ${g.name}</span>
        <span class="ei-title">${g.title} · 출제 범위 ${cum}자</span>
      </div>
      <div class="ei-stats">
        <div><strong>${s.total}</strong><span>문항</span></div>
        <div><strong>${s.pass}</strong><span>합격 점수</span></div>
        <div><strong>${s.minutes}</strong><span>분</span></div>
        <div><strong>${Math.round(s.pass / s.total * 100)}%</strong><span>합격선</span></div>
      </div>
      <div class="ei-types">${typeRows}</div>
      ${unsupported.length ? `<p class="ei-note">* ${unsupported.join('·')} 유형은 아직 준비 중이라, 해당 문항은 <strong>독음·훈음·한자쓰기</strong>로 대체 출제됩니다.</p>` : ''}
    `;
  }

  /* ============================================================
     문제 생성
     ============================================================ */
  function buildQuestions(gradeId) {
    const spec = SPEC[gradeId];
    const pool = window.getCumulativeChars(gradeId);
    const own = pool.filter(h => h.grade === gradeId);
    const qs = [];
    let fallback = 0;

    Object.keys(spec.types).forEach(type => {
      const n = spec.types[type];
      if (SUPPORTED.indexOf(type) === -1) { fallback += n; return; }
      const made = makeQuestions(type, n, pool, own);
      qs.push(...made);
      if (made.length < n) fallback += (n - made.length);
    });

    // 만들지 못한 유형은 기본 유형으로 채움
    while (fallback > 0) {
      const t = ['독음', '훈음', '한자쓰기'][fallback % 3];
      const made = makeQuestions(t, 1, pool, own);
      if (!made.length) break;
      qs.push(...made);
      fallback--;
    }
    return shuffle(qs).slice(0, spec.total).map((q, i) => ({ ...q, no: i + 1 }));
  }

  function makeQuestions(type, n, pool, own) {
    const out = [];
    const used = new Set();

    function others(correct, labelFn, sourcePool) {
      const seen = { [labelFn(correct)]: true };
      const w = [];
      for (const c of shuffle(sourcePool || pool)) {
        if (w.length >= 3) break;
        const l = labelFn(c);
        if (!l || seen[l]) continue;
        seen[l] = true;
        w.push(c);
      }
      return w;
    }

    if (type === '독음') {
      // 실제 시험처럼 한자어(두 글자)를 읽는 문제
      const words = window.getWordsForGrade ? window.getWordsForGrade(selectedGrade) : [];
      const wordPool = shuffle(words);
      for (const wd of wordPool) {
        if (out.length >= n) break;
        if (used.has(wd.word)) continue;
        used.add(wd.word);
        const wrongs = [];
        const seen = { [wd.reading]: true };
        for (const cand of shuffle(words)) {
          if (wrongs.length >= 3) break;
          if (seen[cand.reading]) continue;
          seen[cand.reading] = true;
          wrongs.push(cand.reading);
        }
        if (wrongs.length < 3) continue;
        const firstChar = pool.find(h => h.char === wd.word[0]);
        out.push({
          type: '독음', prompt: '다음 한자어의 <b>읽는 소리(독음)</b>는?', subject: wd.word,
          options: shuffle([wd.reading].concat(wrongs)),
          answer: wd.reading, itemId: firstChar ? firstChar.id : null, char: wd.word,
          explain: `${wd.word} = ${wd.reading}`
        });
      }
      // 한자어가 모자라면 낱글자 독음으로 보충
      if (out.length < n) {
        for (const h of shuffle(own).concat(shuffle(pool))) {
          if (out.length >= n) break;
          if (used.has(h.char)) continue;
          used.add(h.char);
          const w = others(h, x => x.sound);
          if (w.length < 3) continue;
          out.push({
            type: '독음', prompt: '다음 한자의 <b>음(소리)</b>은?', subject: h.char,
            options: shuffle([h].concat(w)).map(x => x.sound),
            answer: h.sound, itemId: h.id, char: h.char, explain: `${h.char} = ${h.hunmum}`
          });
        }
      }
    }

    else if (type === '부수') {
      for (const h of shuffle(own).concat(shuffle(pool))) {
        if (out.length >= n) break;
        if (used.has(h.char)) continue;
        const info = window.getRadical ? window.getRadical(h.char) : null;
        if (!info) continue;
        used.add(h.char);
        const seen = { [info.radical]: true };
        const wrongs = [];
        for (const c of shuffle(pool)) {
          if (wrongs.length >= 3) break;
          const ri = window.getRadical(c.char);
          if (!ri || seen[ri.radical]) continue;
          seen[ri.radical] = true;
          wrongs.push(ri.radical);
        }
        if (wrongs.length < 3) continue;
        out.push({
          type: '부수', prompt: '다음 한자의 <b>부수</b>는?', subject: h.char,
          options: shuffle([info.radical].concat(wrongs)), optionHanja: true,
          answer: info.radical, itemId: h.id, char: h.char,
          explain: `${h.char}(${h.hunmum})의 부수는 ${info.radical}(${info.name})입니다.`
        });
      }
    }

    else if (type === '장단음') {
      // 소리가 긴 한자 1개 + 짧은 한자 3개를 보기로 제시
      const longSet = new Set((window.LONG_SOUND_CHARS || '').split(''));
      const longs = pool.filter(h => longSet.has(h.char));
      const shorts = pool.filter(h => !longSet.has(h.char));
      for (const h of shuffle(longs)) {
        if (out.length >= n) break;
        if (used.has(h.char)) continue;
        used.add(h.char);
        const w = pick(shorts, 3);
        if (w.length < 3) break;
        out.push({
          type: '장단음', prompt: '다음 한자 중 <b>소리가 긴 것(장음)</b>은?',
          subject: '보기에서 고르세요', subjectText: true,
          options: shuffle([h].concat(w)).map(x => `${x.char} (${x.sound})`),
          answer: `${h.char} (${h.sound})`, itemId: h.id, char: h.char,
          explain: `${h.char}(${h.hunmum})은 첫소리를 길게 발음합니다. 나머지는 짧게 소리 납니다.`
        });
      }
    }

    else if (type === '동의어') {
      const inPool = new Set(pool.map(h => h.char));
      const pairs = (window.SYNONYM_PAIRS || []).filter(p => inPool.has(p[0]) && inPool.has(p[1]));
      for (const p of shuffle(pairs)) {
        if (out.length >= n) break;
        const [a, b] = Math.random() < 0.5 ? p : [p[1], p[0]];
        const ha = pool.find(h => h.char === a), hb = pool.find(h => h.char === b);
        if (!ha || !hb || used.has(a)) continue;
        used.add(a);
        const w = pool.filter(h => h.char !== a && h.char !== b);
        out.push({
          type: '동의어', prompt: '다음 한자와 <b>뜻이 비슷한</b> 한자는?', subject: `${a} (${ha.hunmum})`,
          options: shuffle([hb].concat(pick(w, 3))).map(x => x.char), optionHanja: true,
          answer: b, itemId: ha.id, char: a,
          explain: `${a}(${ha.hunmum}) ≒ ${b}(${hb.hunmum})`
        });
      }
    }

    else if (type === '한문') {
      // 천자문 구절과 고사성어로 짧은 한문 해석 문제를 만듭니다
      const verses = (window.THOUSAND_VERSES || []).slice();
      const idioms = (window.IDIOMS || []).slice();
      const items = shuffle(
        verses.map(v => ({ text: v.verse, reading: v.reading, meaning: v.meaning, id: 'verse_' + v.no, src: `천자문 제${v.no}구` }))
        .concat(idioms.map(i => ({ text: i.idiom, reading: i.reading, meaning: i.meaning, id: i.id, src: i.source })))
      );
      for (const it of items) {
        if (out.length >= n) break;
        if (used.has(it.text)) continue;
        used.add(it.text);
        const others2 = shuffle(items.filter(x => x.id !== it.id)).slice(0, 3);
        if (others2.length < 3) break;
        const askReading = Math.random() < 0.4;
        out.push({
          type: '한문',
          prompt: askReading ? '다음 한문 구절을 <b>바르게 읽은 것</b>은?' : '다음 한문 구절의 <b>뜻</b>으로 알맞은 것은?',
          subject: it.text,
          options: shuffle([it].concat(others2)).map(x => askReading ? x.reading : x.meaning),
          answer: askReading ? it.reading : it.meaning,
          itemId: it.id, char: it.text,
          explain: `${it.text} (${it.reading}) — ${it.meaning} · ${it.src}`
        });
      }
    }

    else if (type === '동음이의어') {
      // 제시된 한자와 음은 같지만 뜻이 다른 한자 고르기
      const bySound = {};
      pool.forEach(h => { (bySound[h.sound] = bySound[h.sound] || []).push(h); });
      const groups = Object.keys(bySound).filter(s => bySound[s].length >= 2);
      for (const s of shuffle(groups)) {
        if (out.length >= n) break;
        const g = shuffle(bySound[s]);
        const q = g[0], ans = g[1];
        if (used.has(q.char)) continue;
        used.add(q.char);
        const wrongs = shuffle(pool.filter(h => h.sound !== s)).slice(0, 3);
        if (wrongs.length < 3) continue;
        out.push({
          type: '동음이의어',
          prompt: `다음 한자와 <b>음은 같고 뜻이 다른</b> 한자는?`,
          subject: `${q.char} (${q.hunmum})`,
          options: shuffle([ans].concat(wrongs)).map(x => x.char), optionHanja: true,
          answer: ans.char, itemId: q.id, char: q.char,
          explain: `${q.char}(${q.hunmum})와 ${ans.char}(${ans.hunmum})는 모두 '${s}'으로 읽습니다.`
        });
      }
    }

    else if (type === '약자') {
      const inPool = new Set(pool.map(h => h.char));
      const pairs = (window.ABBREV_PAIRS || []).filter(p => inPool.has(p[0]));
      for (const [full, abbr] of shuffle(pairs)) {
        if (out.length >= n) break;
        const h = pool.find(x => x.char === full);
        const others2 = shuffle((window.ABBREV_PAIRS || []).filter(p => p[1] !== abbr)).slice(0, 3).map(p => p[1]);
        if (others2.length < 3) continue;
        out.push({
          type: '약자', prompt: '다음 한자의 <b>약자(略字)</b>는?', subject: full,
          options: shuffle([abbr].concat(others2)), optionHanja: true,
          answer: abbr, itemId: h ? h.id : null, char: full,
          explain: `${full}(${h ? h.hunmum : ''})의 약자는 ${abbr}입니다.`
        });
      }
    }

    else if (type === '훈음' || type === '한자쓰기') {
      // 해당 급수 글자를 우선 출제하고 모자라면 하위 급수에서 보충
      const src = shuffle(own).concat(shuffle(pool));
      for (const h of src) {
        if (out.length >= n) break;
        if (used.has(h.char)) continue;
        used.add(h.char);

        if (type === '훈음') {
          const w = others(h, x => x.hunmum);
          if (w.length < 3) continue;
          out.push({
            type: '훈음', prompt: `다음 한자의 <b>훈(뜻)과 음</b>은?`, subject: h.char,
            options: shuffle([h].concat(w)).map(x => x.hunmum),
            answer: h.hunmum, itemId: h.id, char: h.char, explain: `${h.char} = ${h.hunmum}`
          });
        } else {
          const w = others(h, x => x.char);
          if (w.length < 3) continue;
          out.push({
            type: '한자쓰기', prompt: `다음 훈음에 해당하는 <b>한자</b>는?`, subject: h.hunmum, subjectText: true,
            options: shuffle([h].concat(w)).map(x => x.char), optionHanja: true,
            answer: h.char, itemId: h.id, char: h.char, explain: `${h.hunmum} = ${h.char}`
          });
        }
      }
    }

    else if (type === '필순') {
      // 총 획수 맞히기
      for (const h of shuffle(own).concat(shuffle(pool))) {
        if (out.length >= n) break;
        if (!h.strokes || used.has(h.char)) continue;
        used.add(h.char);
        // 보기 4개를 만든다. 1획 한자처럼 주변 값이 부족하면 범위를 넓혀 무한 반복을 막는다.
        const cand = new Set([h.strokes]);
        let spread = 2;
        let guard = 0;
        while (cand.size < 4 && guard++ < 200) {
          const d = h.strokes + (Math.floor(Math.random() * (spread * 2 + 1)) - spread);
          if (d > 0 && d !== h.strokes) cand.add(d);
          if (guard % 20 === 0) spread++;
        }
        if (cand.size < 4) continue;
        out.push({
          type: '필순', prompt: `다음 한자는 모두 <b>몇 획</b>일까요?`, subject: h.char,
          options: shuffle(Array.from(cand)).map(v => v + '획'),
          answer: h.strokes + '획', itemId: h.id, char: h.char,
          explain: `${h.char}(${h.hunmum})은 ${h.strokes}획입니다.`
        });
      }
    }

    else if (type === '반의어') {
      const inPool = new Set(pool.map(h => h.char));
      const pairs = ANTONYMS.filter(p => inPool.has(p[0]) && inPool.has(p[1]));
      for (const p of shuffle(pairs)) {
        if (out.length >= n) break;
        const [a, b] = Math.random() < 0.5 ? p : [p[1], p[0]];
        const ha = pool.find(h => h.char === a), hb = pool.find(h => h.char === b);
        if (!ha || !hb) continue;
        const w = pool.filter(h => h.char !== a && h.char !== b);
        out.push({
          type: '반의어', prompt: `다음 한자와 뜻이 <b>반대</b>인 한자는?`, subject: a,
          options: shuffle([hb].concat(pick(w, 3))).map(x => x.char), optionHanja: true,
          answer: b, itemId: ha.id, char: a,
          explain: `${a}(${ha.hunmum}) ↔ ${b}(${hb.hunmum})`
        });
      }
    }

    else if (type === '완성형') {
      // 고사성어 빈칸 채우기
      const inPool = new Set(pool.map(h => h.char));
      const usable = IDIOMS.filter(it => it.chars.some(c => inPool.has(c.char)));
      for (const it of shuffle(usable)) {
        if (out.length >= n) break;
        const idxs = it.chars.map((c, i) => inPool.has(c.char) ? i : -1).filter(i => i >= 0);
        if (!idxs.length) continue;
        const bi = idxs[Math.floor(Math.random() * idxs.length)];
        const ans = it.idiom[bi];
        const w = pool.filter(h => it.idiom.indexOf(h.char) === -1);
        out.push({
          type: '완성형', prompt: `빈칸에 들어갈 <b>한자</b>는? <small>${it.meaning}</small>`,
          subject: it.idiom.split('').map((c, i) => i === bi ? '□' : c).join(''),
          options: shuffle([ans].concat(pick(w, 3).map(x => x.char))), optionHanja: true,
          answer: ans, itemId: it.id, char: it.idiom,
          explain: `${it.idiom} (${it.reading}) — ${it.meaning}`
        });
      }
    }

    else if (type === '뜻풀이') {
      for (const it of shuffle(IDIOMS)) {
        if (out.length >= n) break;
        const w = IDIOMS.filter(x => x.id !== it.id);
        out.push({
          type: '뜻풀이', prompt: `다음 고사성어의 <b>뜻</b>으로 알맞은 것은?`, subject: `${it.idiom} (${it.reading})`,
          subjectText: false,
          options: shuffle([it].concat(pick(w, 3))).map(x => x.meaning),
          answer: it.meaning, itemId: it.id, char: it.idiom,
          explain: `${it.idiom}(${it.reading}) — ${it.meaning}`
        });
      }
    }

    return out;
  }

  /* ============================================================
     시험 진행
     ============================================================ */
  document.getElementById('start-exam-btn').addEventListener('click', startExam);

  function startExam() {
    questions = buildQuestions(selectedGrade);
    if (questions.length === 0) { alert('문제를 만들지 못했어요. 다른 급수를 선택해 주세요.'); return; }
    answers = {};
    startedAt = Date.now();

    setupView.style.display = 'none';
    resultView.style.display = 'none';
    examView.style.display = 'block';

    const g = window.getGradeInfo(selectedGrade);
    const s = SPEC[selectedGrade];
    document.getElementById('eb-grade').textContent = `${g.badge} ${g.name} 모의고사`;
    renderSheet();
    updateCount();

    // 타이머
    clearInterval(timerId);
    if (document.getElementById('timer-on').checked) {
      remainSec = s.minutes * 60;
      timerEl.style.display = '';
      tick();
      timerId = setInterval(tick, 1000);
    } else {
      timerEl.style.display = 'none';
    }
    window.scrollTo({ top: 0 });
  }

  function tick() {
    const m = Math.floor(remainSec / 60), sec = remainSec % 60;
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    timerEl.classList.toggle('urgent', remainSec <= 300);
    if (remainSec <= 0) {
      clearInterval(timerId);
      alert('시험 시간이 끝났어요! 지금까지 표시한 답안으로 채점할게요.');
      submitExam();
      return;
    }
    remainSec--;
  }

  function renderSheet() {
    sheet.innerHTML = questions.map(q => `
      <div class="exam-q" id="q-${q.no}">
        <div class="eq-head">
          <span class="eq-no">${q.no}</span>
          <span class="eq-type">${q.type}</span>
          <span class="eq-prompt">${q.prompt}</span>
        </div>
        <div class="eq-subject ${q.subjectText ? 'text' : ''} ${q.char && q.char.length > 1 ? 'long' : ''}">${q.subject}</div>
        <div class="eq-options">
          ${q.options.map((o, i) => `
            <button class="eq-option ${q.optionHanja ? 'hanja' : ''}" data-no="${q.no}" data-val="${String(o).replace(/"/g, '&quot;')}">
              <span class="eq-num">${'①②③④'[i]}</span> ${o}
            </button>`).join('')}
        </div>
      </div>
    `).join('');

    sheet.querySelectorAll('.eq-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const no = Number(btn.dataset.no);
        answers[no] = btn.dataset.val;
        sheet.querySelectorAll(`.eq-option[data-no="${no}"]`).forEach(b => b.classList.remove('picked'));
        btn.classList.add('picked');
        document.getElementById('q-' + no).classList.add('answered');
        updateCount();
      });
    });
  }

  function updateCount() {
    const done = Object.keys(answers).length;
    document.getElementById('eb-count').textContent = `${done} / ${questions.length} 문항`;
    progressEl.style.width = Math.round(done / questions.length * 100) + '%';
  }

  document.getElementById('submit-exam-btn').addEventListener('click', confirmSubmit);
  document.getElementById('submit-exam-btn2').addEventListener('click', confirmSubmit);

  function confirmSubmit() {
    const left = questions.length - Object.keys(answers).length;
    if (left > 0 && !confirm(`아직 ${left}문항을 풀지 않았어요. 그래도 제출할까요?`)) return;
    submitExam();
  }

  /* ============================================================
     채점 & 성적표
     ============================================================ */
  function submitExam() {
    clearInterval(timerId);
    const spec = SPEC[selectedGrade];
    const g = window.getGradeInfo(selectedGrade);

    let score = 0;
    const byType = {};
    const wrong = [];

    questions.forEach(q => {
      const mine = answers[q.no];
      const ok = mine === q.answer;
      byType[q.type] = byType[q.type] || { total: 0, correct: 0 };
      byType[q.type].total++;
      if (ok) { byType[q.type].correct++; score++; }
      else {
        wrong.push({ ...q, mine: mine || '(미응답)' });
        if (NOTES) NOTES.addWrong({
          id: q.itemId,
          kind: q.itemId && q.itemId.indexOf('idiom') === 0 ? 'idiom' : 'grade',
          char: q.char, answer: q.explain, type: q.type + ' (모의고사)'
        });
      }
    });

    const passed = score >= spec.pass;
    const pct = Math.round(score / questions.length * 100);
    const usedSec = Math.round((Date.now() - startedAt) / 1000);

    if (window.HanjaSRS) window.HanjaSRS.addLog('quiz', questions.length);
    if (window.HanjaAuth && window.HanjaAuth.isLoggedIn()) {
      window.HanjaAuth.saveQuizResult({
        mode: 'exam', grade: null, level: selectedGrade,
        total: questions.length, score: score, percent: pct, passed: passed,
        wrong: wrong.slice(0, 30).map(w => ({ id: w.itemId, kind: 'grade', char: w.char, answer: w.explain, type: w.type }))
      });
    }
    try {
      const key = 'hanzi_exam_best';
      const best = JSON.parse(localStorage.getItem(key) || '{}');
      if (!best[selectedGrade] || score > best[selectedGrade]) {
        best[selectedGrade] = score;
        localStorage.setItem(key, JSON.stringify(best));
      }
    } catch (e) {}

    examView.style.display = 'none';
    resultView.style.display = 'block';
    window.scrollTo({ top: 0 });

    document.getElementById('ex-emoji').textContent = passed ? (pct >= 90 ? '🏆' : '🎉') : '💪';
    document.getElementById('ex-title').textContent = passed ? `${g.name} 합격이에요!` : `${g.name} 조금만 더!`;
    document.getElementById('ex-score').innerHTML = `<strong>${score}</strong> <small>/ ${questions.length}점</small>`;
    document.getElementById('ex-pass').innerHTML = passed
      ? `<span class="pass-badge pass">✅ 합격 (합격선 ${spec.pass}점)</span>`
      : `<span class="pass-badge fail">📚 불합격 · ${spec.pass - score}점 부족 (합격선 ${spec.pass}점)</span>`;
    document.getElementById('ex-meta').textContent =
      `정답률 ${pct}% · 걸린 시간 ${Math.floor(usedSec / 60)}분 ${usedSec % 60}초 / 제한 ${spec.minutes}분`;

    document.getElementById('ex-types').innerHTML = Object.keys(byType).map(t => {
      const v = byType[t];
      const p = Math.round(v.correct / v.total * 100);
      return `
        <div class="ex-type-row">
          <span class="etr-name">${t}</span>
          <span class="etr-bar"><span style="width:${p}%; background:${p >= 70 ? '#4ade80' : (p >= 50 ? '#fbbf24' : '#f87171')}"></span></span>
          <span class="etr-num">${v.correct}/${v.total} (${p}%)</span>
        </div>`;
    }).join('');

    document.getElementById('ex-wrong').innerHTML = wrong.length
      ? wrong.map(w => `
          <div class="ex-wrong-row">
            <span class="ewr-no">${w.no}</span>
            <span class="ewr-subject ${w.char && w.char.length > 1 ? 'long' : ''}">${w.subject}</span>
            <span class="ewr-body">
              <small>${w.type}</small>
              <span>정답 <strong>${w.answer}</strong> · 내 답 <em>${w.mine}</em></span>
              <small class="ewr-explain">${w.explain}</small>
            </span>
          </div>`).join('')
      : '<p class="dash-empty">틀린 문제가 없어요! 완벽합니다 🎉</p>';
  }

  document.getElementById('ex-retry').addEventListener('click', startExam);
  document.getElementById('ex-back').addEventListener('click', () => {
    resultView.style.display = 'none';
    setupView.style.display = 'block';
  });

  // URL로 급수 지정 (플래너 등에서 연결)
  const params = new URLSearchParams(location.search);
  if (params.get('grade') && SPEC[params.get('grade')]) selectedGrade = params.get('grade');

  renderGrades();
  renderInfo();
});
