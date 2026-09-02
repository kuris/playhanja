/* ============================================================
   한자야 놀자! - 홈페이지(index.html) 전용 스크립트
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // ---------- 모바일 내비게이션 토글 ----------
  // 상단 내비게이션(햄버거 메뉴)은 js/nav.js에서 공통 처리합니다.

  // ---------- 홈 화면 급수(1급~9급) 카드 ----------
  const homeGradePicker = document.getElementById('home-grade-picker');
  if (homeGradePicker && window.GRADE_LEVELS) {
    homeGradePicker.innerHTML = window.GRADE_LEVELS.map(g => {
      const total = window.getGradeChars ? window.getGradeChars(g.id).length : 0;
      return `
        <a class="grade-card" href="grade.html?grade=${g.id}" style="--grade-color:${g.color};">
          <span class="grade-badge">${g.badge}</span>
          <span class="grade-name">${g.name}</span>
          <span class="grade-title">${g.title}</span>
          <span class="grade-count">${total}자</span>
        </a>
      `;
    }).join('');
  }


  // ---------- 카테고리 미리보기 카드 ----------
  const catGrid = document.getElementById('category-grid');
  if (catGrid && window.CATEGORIES && window.HANZI_DATA) {
    window.CATEGORIES.forEach(cat => {
      const count = window.HANZI_DATA.filter(h => h.category === cat.id).length;
      const card = document.createElement('a');
      card.href = `learn.html?cat=${cat.id}`;
      card.className = 'category-card';
      card.innerHTML = `
        <div class="cat-icon" style="background:${cat.color}22;">${cat.icon}</div>
        <h3>${cat.name}</h3>
        <p>${cat.desc}</p>
        <span class="cat-count">${count}자 배우기 →</span>
      `;
      catGrid.appendChild(card);
    });
  }

  // ---------- Hero 스테이지: 자동 반복 애니메이션 ----------
  const heroStage = document.getElementById('hero-stage');
  if (heroStage && window.HANZI_DATA) {
    const heroChar = window.HANZI_DATA.find(h => h.id === 'h_day') || window.HANZI_DATA[0];
    playHanziAnimation(heroStage, heroChar, { loop: true, speed: 1 });
  }

  // ---------- Demo 스테이지: 버튼으로 조작 ----------
  const demoStage = document.getElementById('demo-stage');
  const demoReplay = document.getElementById('demo-replay');
  const demoNext = document.getElementById('demo-next');
  if (demoStage && window.HANZI_DATA) {
    // 데모용으로 보여주기 좋은 몇 가지 한자를 순환
    const demoPool = window.HANZI_DATA.filter(h =>
      ['h_man', 'h_house', 'h_school', 'h_tree', 'h_water', 'h_learn', 'h_electric', 'h_speak'].includes(h.id)
    );
    let demoIndex = 0;

    function runDemo() {
      stopHanziAnimation(demoStage);
      playHanziAnimation(demoStage, demoPool[demoIndex], { loop: false, speed: 1 });
    }
    runDemo();

    demoReplay.addEventListener('click', runDemo);
    demoNext.addEventListener('click', () => {
      demoIndex = (demoIndex + 1) % demoPool.length;
      runDemo();
    });
  }
});


/* ---------- 홈 화면 '오늘의 학습' 요약 (플래너와 연동) ---------- */
document.addEventListener('DOMContentLoaded', function () {
  const box = document.getElementById('home-today');
  const section = document.getElementById('today-section');
  if (!box || !window.HanjaSRS) return;

  let goal = null;
  try { goal = JSON.parse(localStorage.getItem('hanzi_study_goal') || 'null'); } catch (e) {}

  const streak = window.HanjaSRS.streak();
  const due = window.HanjaSRS.buildDeck('due', { shuffle: false }).length;
  const wrong = window.HanjaWrongNotes ? window.HanjaWrongNotes.count() : 0;
  const log = window.HanjaSRS.getTodayLog();
  const studiedToday = (log.new || 0) + (log.review || 0) + (log.quiz || 0);

  // 목표도 없고 학습 기록도 없으면 숨김 (처음 방문자에게는 안 보이게)
  if (!goal && studiedToday === 0 && streak === 0 && due === 0 && wrong === 0) return;

  section.style.display = 'block';

  const info = goal && window.getGradeInfo ? window.getGradeInfo(goal.grade) : null;
  box.innerHTML = `
    <div class="ht-head">
      <h3>🗓️ 오늘의 학습</h3>
      ${streak > 0 ? `<span class="streak-badge">🔥 ${streak}일 연속</span>` : ''}
    </div>
    <div class="ht-row">
      ${goal ? `<a class="ht-item" href="planner.html"><span class="hi-num">${info.badge}</span><span class="hi-label">${info.name} 목표</span></a>` : ''}
      <a class="ht-item ${due > 0 ? 'urgent' : ''}" href="flashcard.html?deck=due"><span class="hi-num">${due}</span><span class="hi-label">복습할 카드</span></a>
      <a class="ht-item ${wrong > 0 ? 'urgent' : ''}" href="quiz.html"><span class="hi-num">${wrong}</span><span class="hi-label">복습할 오답</span></a>
      <a class="ht-item" href="planner.html"><span class="hi-num">${studiedToday}</span><span class="hi-label">오늘 공부한 개수</span></a>
    </div>
    <div class="ht-actions">
      <a href="planner.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-calendar-check"></i> 오늘 할 일 보기</a>
      <a href="flashcard.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-bolt"></i> 카드 슥슥 넘기기</a>
    </div>
  `;
});
