/* ============================================================
   한자야 놀자! - 빠른 복습 카드 (flashcard.js)
   앙키식 카드 넘기기: 탭/스페이스로 뒤집고, 스와이프/방향키로 채점
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const SRS = window.HanjaSRS;
  const NOTES = window.HanjaWrongNotes;

  const deckView = document.getElementById('deck-view');
  const cardView = document.getElementById('card-view');
  const doneView = document.getElementById('done-view');
  const deckGrid = document.getElementById('deck-grid');
  const summaryBox = document.getElementById('srs-summary');
  const limitSel = document.getElementById('deck-limit');
  const onlyDueChk = document.getElementById('only-due');

  const flipCard = document.getElementById('flip-card');
  const fcDeck = document.getElementById('fc-deck');
  const fcFront = document.getElementById('fc-front');
  const fcBackChar = document.getElementById('fc-back-char');
  const fcBack = document.getElementById('fc-back');
  const fcExtra = document.getElementById('fc-extra');
  const fcSpeak = document.getElementById('fc-speak');
  const gradeBar = document.getElementById('grade-bar');
  const counter = document.getElementById('card-counter');
  const progress = document.getElementById('card-progress');

  let queue = [];        // 이번 세션 카드
  let index = 0;
  let flipped = false;
  let revealed = false;   // 이 카드의 뜻을 한 번이라도 봤는지
  let sessionStats = { again: 0, hard: 0, good: 0 };
  let currentDeckKey = '';
  let busy = false;

  // ---------- 덱 목록 ----------
  function deckList() {
    const grades = (window.GRADE_LEVELS || []).map(g => ({
      key: 'grade:' + g.id,
      icon: g.badge,
      title: g.name + ' 한자',
      desc: g.title,
      count: (window.GRADE_HANJA || []).filter(h => h.grade === g.id).length
    }));
    return [
      { key: 'due', icon: '🔔', title: '오늘 복습할 카드', desc: '다시 볼 때가 된 카드만 모아서', count: SRS.buildDeck('due', { shuffle: false }).length, highlight: true },
      { key: 'wrong', icon: '📒', title: '오답 카드', desc: '퀴즈에서 틀린 것만', count: NOTES ? NOTES.count() : 0, highlight: true },
      { key: 'hanja', icon: '📚', title: '생활 한자', desc: '어원 이야기가 있는 한자', count: (window.HANZI_DATA || []).length },
      { key: 'idiom', icon: '📖', title: '고사성어', desc: '성어와 뜻 맞히기', count: (window.IDIOMS || []).length }
    ].concat(grades);
  }

  function renderDecks() {
    const s = SRS.stats();
    const st = SRS.streak();
    summaryBox.innerHTML = `
      <div class="srs-stat"><span class="ss-num">${s.due}</span><span class="ss-label">오늘 복습</span></div>
      <div class="srs-stat"><span class="ss-num">${s.total}</span><span class="ss-label">시작한 카드</span></div>
      <div class="srs-stat"><span class="ss-num">${s.learned}</span><span class="ss-label">익힌 카드</span></div>
      <div class="srs-stat"><span class="ss-num">${st}${st > 0 ? '🔥' : ''}</span><span class="ss-label">연속 학습일</span></div>
    `;

    deckGrid.innerHTML = deckList().map(d => `
      <button class="deck-card ${d.highlight ? 'highlight' : ''} ${d.count === 0 ? 'empty' : ''}" data-deck="${d.key}" ${d.count === 0 ? 'disabled' : ''}>
        <span class="dc-icon">${d.icon}</span>
        <span class="dc-title">${d.title}</span>
        <span class="dc-desc">${d.desc}</span>
        <span class="dc-count">${d.count}장</span>
      </button>
    `).join('');

    deckGrid.querySelectorAll('.deck-card').forEach(btn => {
      btn.addEventListener('click', () => startSession(btn.dataset.deck));
    });
  }

  // ---------- 세션 시작 ----------
  function startSession(deckKey) {
    currentDeckKey = deckKey;
    const limit = Number(limitSel.value) || 0;
    queue = SRS.buildDeck(deckKey, {
      limit: limit || undefined,
      onlyDue: onlyDueChk.checked || deckKey === 'due'
    });

    if (queue.length === 0) {
      alert('복습할 카드가 없어요! 다른 묶음을 골라보세요.');
      return;
    }

    index = 0;
    sessionStats = { again: 0, hard: 0, good: 0 };
    deckView.style.display = 'none';
    doneView.style.display = 'none';
    cardView.style.display = 'block';
    showCard();
  }

  // ---------- 카드 표시 ----------
  function showCard() {
    const card = queue[index];
    if (!card) { finish(); return; }

    flipped = false;
    revealed = false;
    busy = false;
    flipCard.classList.remove('flipped');
    flipCard.style.transform = '';
    flipCard.style.opacity = '';
    gradeBar.classList.remove('visible');

    fcDeck.textContent = card.sub || '';
    fcFront.textContent = card.front;
    fcFront.classList.toggle('is-idiom', card.front.length > 1);
    fcBackChar.textContent = card.front;
    fcBackChar.classList.toggle('is-idiom', card.front.length > 1);
    fcBack.textContent = card.back;
    fcExtra.textContent = card.extra || '';

    counter.textContent = `${index + 1} / ${queue.length}`;
    progress.style.width = Math.round(index / queue.length * 100) + '%';

    const p = SRS.previewIntervals(card.id);
    document.getElementById('when-again').textContent = p.again;
    document.getElementById('when-hard').textContent = p.hard;
    document.getElementById('when-good').textContent = p.good;
  }

  // 카드 뒤집기 (한 번 뜻을 본 뒤에는 다시 눌러 앞면으로 돌아올 수 있습니다)
  function setFlipped(v) {
    flipped = v;
    flipCard.classList.toggle('flipped', v);
    if (v) {
      revealed = true;
      gradeBar.classList.add('visible');   // 한 번 본 뒤에는 채점 버튼을 계속 쓸 수 있게 유지
    }
  }
  function flip() { setFlipped(true); }
  function toggleFlip() { setFlipped(!flipped); }

  // ---------- 채점 ----------
  function grade(g) {
    if (busy) return;
    const card = queue[index];
    if (!card) return;
    if (!revealed) { flip(); return; }   // 아직 뜻을 안 봤으면 먼저 뒤집기
    busy = true;

    SRS.review(card.id, g, { kind: card.kind, char: card.char });
    SRS.addLog('review', 1);

    if (g === 0) {
      sessionStats.again++;
      queue.push(card);                 // 모르는 카드는 이번 세션 끝에 다시
      if (NOTES) NOTES.addWrong({ id: card.id, kind: card.kind, char: card.char, answer: card.back, type: '카드 복습' });
    } else if (g === 1) {
      sessionStats.hard++;
    } else {
      sessionStats.good++;
      if (NOTES) NOTES.markCorrect(card.id);
      if (window.HanziProgress && !window.HanziProgress.isLearned(card.id)) {
        window.HanziProgress.markLearned(card.id);   // 아는 카드는 학습 완료로 기록
      }
    }

    // 카드가 날아가는 애니메이션 후 다음 장
    flipCard.style.transition = 'transform .22s ease, opacity .22s ease';
    flipCard.style.transform = g === 0 ? 'translateX(-130%) rotate(-12deg)'
                             : (g === 2 ? 'translateX(130%) rotate(12deg)' : 'translateY(60%) scale(.9)');
    flipCard.style.opacity = '0';

    setTimeout(() => {
      flipCard.style.transition = '';
      index++;
      showCard();
    }, 230);
  }

  gradeBar.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', () => grade(Number(btn.dataset.grade)));
  });

  // ---------- 뒤집기 (탭/클릭) ----------
  flipCard.addEventListener('click', (e) => {
    if (e.target.closest('.speak-btn')) return;
    if (moved) return;          // 스와이프 중이면 뒤집지 않음
    toggleFlip();
  });

  // 읽어주기
  fcSpeak.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = queue[index];
    if (!card || !window.HanjaSpeech) return;
    window.HanjaSpeech.speak(card.kind === 'idiom' ? card.back : `${card.front}, ${card.back}`);
  });

  // ---------- 스와이프 ----------
  let startX = 0, startY = 0, dragging = false, moved = false;

  flipCard.addEventListener('pointerdown', (e) => {
    if (busy) return;
    dragging = true; moved = false;
    startX = e.clientX; startY = e.clientY;
    flipCard.setPointerCapture && flipCard.setPointerCapture(e.pointerId);
  });

  flipCard.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
    flipCard.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx * 0.04}deg)`;
    document.querySelector('.swipe-hint.left').style.opacity = dx < -40 ? '1' : '0';
    document.querySelector('.swipe-hint.right').style.opacity = dx > 40 ? '1' : '0';
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    document.querySelector('.swipe-hint.left').style.opacity = '0';
    document.querySelector('.swipe-hint.right').style.opacity = '0';
    const dx = (e.clientX || 0) - startX;

    if (moved && Math.abs(dx) > 90) {
      if (!revealed) flip();
      grade(dx > 0 ? 2 : 0);            // 오른쪽=알아요, 왼쪽=모르겠어요
      return;
    }
    flipCard.style.transition = 'transform .18s ease';
    flipCard.style.transform = '';
    setTimeout(() => { flipCard.style.transition = ''; }, 190);
  }
  flipCard.addEventListener('pointerup', endDrag);
  flipCard.addEventListener('pointercancel', endDrag);

  // ---------- 키보드 ----------
  document.addEventListener('keydown', (e) => {
    if (cardView.style.display === 'none') return;
    if (e.key === ' ') { e.preventDefault(); toggleFlip(); }
    else if (e.key === 'Enter') { e.preventDefault(); revealed ? grade(2) : flip(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); grade(0); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); grade(1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); grade(2); }
    else if (e.key === 'Escape') exitSession();
  });

  // ---------- 종료 / 결과 ----------
  function finish() {
    cardView.style.display = 'none';
    doneView.style.display = 'block';
    const total = sessionStats.again + sessionStats.hard + sessionStats.good;
    const pct = total ? Math.round(sessionStats.good / total * 100) : 0;

    document.getElementById('done-emoji').textContent = pct >= 80 ? '🏆' : (pct >= 50 ? '🎉' : '💪');
    document.getElementById('done-title').textContent = pct >= 80 ? '완벽해요!' : (pct >= 50 ? '잘했어요!' : '조금만 더 연습해요!');
    document.getElementById('done-desc').textContent = `카드 ${total}장을 복습했어요.`;
    document.getElementById('done-stats').innerHTML = `
      <div class="done-stat again"><span>${sessionStats.again}</span>모르겠어요</div>
      <div class="done-stat hard"><span>${sessionStats.hard}</span>알쏭달쏭</div>
      <div class="done-stat good"><span>${sessionStats.good}</span>알아요</div>
    `;
    renderDecks();
  }

  function exitSession() {
    cardView.style.display = 'none';
    doneView.style.display = 'none';
    deckView.style.display = 'block';
    renderDecks();
  }

  document.getElementById('card-exit').addEventListener('click', exitSession);
  document.getElementById('back-deck-btn').addEventListener('click', exitSession);
  document.getElementById('again-btn').addEventListener('click', () => startSession(currentDeckKey));

  // URL로 덱 바로 시작 (플래너에서 연결)
  const params = new URLSearchParams(location.search);
  renderDecks();
  if (params.get('deck')) {
    if (params.get('limit')) limitSel.value = params.get('limit');
    startSession(params.get('deck'));
  }
});
