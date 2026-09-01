/* ============================================================
   한자야 놀자! - 홈페이지(index.html) 전용 스크립트
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // ---------- 모바일 내비게이션 토글 ----------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
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
