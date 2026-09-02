/* ============================================================
   한자야 놀자! - 학습 플래너 (planner.js)
   목표 급수와 하루 학습량만 정하면 오늘 할 일을 자동으로 배정합니다.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const SRS = window.HanjaSRS;
  const NOTES = window.HanjaWrongNotes;
  const PROGRESS = window.HanziProgress;
  const GOAL_KEY = 'hanzi_study_goal';

  const goalBar = document.getElementById('goal-bar');
  const todayCard = document.getElementById('today-card');
  const streakBadge = document.getElementById('streak-badge');
  const calBox = document.getElementById('cal-heatmap');
  const goalProgressBox = document.getElementById('goal-progress');
  const modal = document.getElementById('goal-modal');

  // ---------- 목표 저장 ----------
  function getGoal() {
    try {
      const g = JSON.parse(localStorage.getItem(GOAL_KEY) || 'null');
      return g && g.grade ? g : null;
    } catch (e) { return null; }
  }
  function setGoal(goal) {
    try { localStorage.setItem(GOAL_KEY, JSON.stringify(goal)); } catch (e) {}
    // 로그인 상태면 프로필에도 목표 급수 저장
    if (window.HanjaAuth && window.HanjaAuth.isLoggedIn() && window.sb) {
      const user = window.HanjaAuth.getUser();
      window.sb.from('profiles')
        .upsert({ id: user.id, grade_goal: goal.grade, updated_at: new Date().toISOString() })
        .then(() => {}, () => {});
    }
  }

  // ---------- 오늘 할 일 자동 배정 ----------
  function todayPlan() {
    const goal = getGoal();
    if (!goal) return null;

    const all = (window.GRADE_HANJA || []).filter(h => h.grade === goal.grade);
    const notLearned = all.filter(h => !PROGRESS.isLearned(h.id));
    const newChars = notLearned.slice(0, goal.daily);

    const idioms = (window.IDIOMS || []).filter(i => !PROGRESS.isLearned(i.id));
    const newIdioms = goal.idiom > 0 ? idioms.slice(0, goal.idiom) : [];

    const dueCards = SRS.buildDeck('due', { shuffle: false });
    const wrongCount = NOTES ? NOTES.count() : 0;

    return {
      goal: goal,
      newChars: newChars,
      newIdioms: newIdioms,
      dueCount: dueCards.length,
      wrongCount: wrongCount,
      learned: all.length - notLearned.length,
      total: all.length
    };
  }

  // ---------- 오늘 할 일 완료 판정 ----------
  // 새 한자: 오늘 학습한 글자 수(로그) 기준, 복습: 오늘 복습한 카드 수 기준
  function renderToday() {
    const plan = todayPlan();
    const log = SRS.getTodayLog();
    streakBadge.textContent = `🔥 ${SRS.streak()}일 연속`;

    if (!plan) {
      goalBar.innerHTML = `
        <div class="goal-empty">
          <span class="ge-icon">🎯</span>
          <div>
            <strong>아직 학습 목표가 없어요</strong>
            <p>목표 급수와 하루 학습량만 정하면 오늘 공부할 한자를 자동으로 골라드려요.</p>
          </div>
          <button class="btn btn-primary" id="set-goal-btn"><i class="fa-solid fa-flag"></i> 목표 정하기</button>
        </div>`;
      document.getElementById('set-goal-btn').addEventListener('click', openGoalModal);
      todayCard.innerHTML = '';
      goalProgressBox.innerHTML = '<p class="dash-empty">목표를 정하면 남은 학습량을 알려드려요.</p>';
      return;
    }

    const info = window.getGradeInfo(plan.goal.grade);
    goalBar.innerHTML = `
      <div class="goal-set">
        <span class="gs-badge">${info.badge}</span>
        <div class="gs-text">
          <strong>${info.name} 목표</strong>
          <span>하루 새 한자 ${plan.goal.daily}자${plan.goal.idiom > 0 ? ` · 고사성어 ${plan.goal.idiom}개` : ''}</span>
        </div>
        <button class="btn btn-outline btn-sm" id="edit-goal-btn"><i class="fa-solid fa-gear"></i> 목표 바꾸기</button>
      </div>`;
    document.getElementById('edit-goal-btn').addEventListener('click', openGoalModal);

    // 오늘의 할 일 4가지
    const tasks = [];

    tasks.push({
      key: 'new',
      icon: '🌱',
      title: `새 한자 ${plan.goal.daily}자 배우기`,
      desc: plan.newChars.length
        ? plan.newChars.map(c => c.char).join(' ')
        : '이 급수의 한자를 모두 배웠어요! 🎉',
      done: log.new >= plan.goal.daily || plan.newChars.length === 0,
      progress: `${Math.min(log.new, plan.goal.daily)}/${plan.goal.daily}`,
      href: `grade.html?grade=${plan.goal.grade}`,
      cta: '배우러 가기'
    });

    if (plan.goal.idiom > 0) {
      tasks.push({
        key: 'idiom',
        icon: '📖',
        title: `고사성어 ${plan.goal.idiom}개 익히기`,
        desc: plan.newIdioms.length ? plan.newIdioms.map(i => `${i.idiom}(${i.reading})`).join(', ') : '성어를 모두 배웠어요! 🎉',
        done: plan.newIdioms.length === 0,
        progress: '',
        href: 'idiom.html',
        cta: '이야기 읽기'
      });
    }

    tasks.push({
      key: 'review',
      icon: '⚡',
      title: plan.dueCount > 0 ? `복습 카드 ${plan.dueCount}장 넘기기` : '복습 카드 넘기기',
      desc: plan.dueCount > 0 ? '오늘 다시 볼 때가 된 카드예요' : '오늘 복습할 카드는 없어요. 새 카드를 시작해도 좋아요!',
      done: plan.dueCount === 0 && log.review > 0,
      progress: log.review > 0 ? `오늘 ${log.review}장` : '',
      href: plan.dueCount > 0 ? 'flashcard.html?deck=due' : `flashcard.html?deck=grade:${plan.goal.grade}&limit=20`,
      cta: '카드 넘기기'
    });

    tasks.push({
      key: 'wrong',
      icon: '📒',
      title: plan.wrongCount > 0 ? `오답 ${plan.wrongCount}개 복습하기` : '오답 복습',
      desc: plan.wrongCount > 0 ? '틀린 문제를 다시 풀어 졸업시켜요' : '오답이 없어요. 아주 좋아요! ✨',
      done: plan.wrongCount === 0,
      progress: '',
      href: 'quiz.html',
      cta: '복습하기'
    });

    const doneCount = tasks.filter(t => t.done).length;
    const allDone = doneCount === tasks.length;

    todayCard.innerHTML = `
      <div class="today-progress">
        <div class="tp-bar"><span style="width:${Math.round(doneCount / tasks.length * 100)}%"></span></div>
        <span class="tp-label">${doneCount} / ${tasks.length} 완료</span>
      </div>
      ${allDone ? '<div class="today-done">🎉 오늘 학습을 모두 마쳤어요! 정말 잘했어요!</div>' : ''}
      <div class="task-list">
        ${tasks.map(t => `
          <a class="task-item ${t.done ? 'done' : ''}" href="${t.href}">
            <span class="ti-check">${t.done ? '✅' : '⬜'}</span>
            <span class="ti-icon">${t.icon}</span>
            <span class="ti-body">
              <strong>${t.title}</strong>
              <small>${t.desc}</small>
            </span>
            ${t.progress ? `<span class="ti-progress">${t.progress}</span>` : ''}
            <span class="ti-cta">${t.cta} <i class="fa-solid fa-chevron-right"></i></span>
          </a>
        `).join('')}
      </div>
    `;

    // 목표까지 남은 양
    const remain = plan.total - plan.learned;
    const days = plan.goal.daily > 0 ? Math.ceil(remain / plan.goal.daily) : 0;
    const pct = plan.total ? Math.round(plan.learned / plan.total * 100) : 0;
    goalProgressBox.innerHTML = `
      <div class="goal-ring-row">
        <div class="goal-pct">${pct}<small>%</small></div>
        <div class="goal-detail">
          <strong>${info.badge} ${info.name}</strong>
          <span>${plan.learned} / ${plan.total}자 완료</span>
          <span>남은 ${remain}자 · 하루 ${plan.goal.daily}자면 <strong>${days}일</strong></span>
        </div>
      </div>
      <div class="progress-bar-track" style="margin-top:12px;"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    `;
  }

  // ---------- 학습 달력 (최근 5주) ----------
  function renderCalendar() {
    const log = SRS.getLog();
    const days = [];
    const today = new Date();
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const key = SRS.todayKey(d);
      const rec = log[key];
      const n = rec ? (rec.new || 0) + (rec.review || 0) + (rec.quiz || 0) : 0;
      let lv = 0;
      if (n > 0) lv = 1;
      if (n >= 10) lv = 2;
      if (n >= 25) lv = 3;
      days.push({ key: key, n: n, lv: lv, isToday: i === 0, date: d });
    }
    calBox.innerHTML = days.map(d => `
      <span class="cal-cell lv${d.lv} ${d.isToday ? 'today' : ''}" title="${d.key} · ${d.n}개 학습"></span>
    `).join('');
  }

  // ---------- 목표 설정 모달 ----------
  function openGoalModal() {
    const gradeSel = document.getElementById('goal-grade');
    gradeSel.innerHTML = (window.GRADE_LEVELS || []).map(g => {
      const cnt = (window.GRADE_HANJA || []).filter(h => h.grade === g.id).length;
      return `<option value="${g.id}">${g.badge} ${g.name} (${g.title}) · ${cnt}자</option>`;
    }).join('');

    const cur = getGoal();
    if (cur) {
      gradeSel.value = cur.grade;
      document.getElementById('goal-daily').value = cur.daily;
      document.getElementById('goal-idiom').value = cur.idiom;
    } else {
      gradeSel.value = '8';
    }
    modal.classList.add('open');
    document.body.classList.add('nav-open');
  }
  function closeGoalModal() {
    modal.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  document.getElementById('goal-modal-close').addEventListener('click', closeGoalModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeGoalModal(); });
  document.getElementById('goal-save').addEventListener('click', () => {
    setGoal({
      grade: Number(document.getElementById('goal-grade').value),
      daily: Number(document.getElementById('goal-daily').value),
      idiom: Number(document.getElementById('goal-idiom').value),
      startedAt: (getGoal() && getGoal().startedAt) || Date.now()
    });
    closeGoalModal();
    renderToday();
    renderCalendar();
  });

  // ---------- 갱신 ----------
  ['hanja:progress-changed', 'hanja:srs-changed', 'hanja:log-changed', 'hanja:wrong-changed', 'hanja:progress-synced']
    .forEach(ev => document.addEventListener(ev, () => { renderToday(); renderCalendar(); }));

  renderToday();
  renderCalendar();
});
