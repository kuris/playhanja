/* ============================================================
   한자야 놀자! - 한자 따라쓰기(Write Pad) 캔버스 엔진
   - 터치 및 마우스 필압/붓 느낌 드로잉 지원
   - 미자(米/十) 격자 보조선 및 연한 가이드 한자 폰트 렌더링
   - 가이드 On/Off, 브러시 색상, 다시 쓰기, 완성 축하 피드백
   ============================================================ */

(function () {
  class HanziWritePad {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      this.currentChar = options.char || '漢';
      this.color = options.color || '#2d241e';
      this.lineWidth = options.lineWidth || 14;
      this.showGuide = true;
      this.strokesCount = 0;
      this.isDrawing = false;
      this.points = [];

      this.initDOM();
      this.initEvents();
      this.resize();
    }

    initDOM() {
      this.container.innerHTML = `
        <div class="write-pad-container">
          <div class="write-canvas-wrap">
            <canvas class="write-bg-canvas"></canvas>
            <canvas class="write-draw-canvas"></canvas>
            <div class="write-success-overlay"><span class="success-stamp">참 잘 썼어요! 💮</span></div>
          </div>
          <div class="write-toolbar">
            <div class="brush-colors">
              <button class="color-btn active" data-color="#2d241e" style="background:#2d241e;" title="먹물색"></button>
              <button class="color-btn" data-color="#d9381e" style="background:#d9381e;" title="주홍색"></button>
              <button class="color-btn" data-color="#1e6bd9" style="background:#1e6bd9;" title="청색"></button>
            </div>
            <div class="write-actions">
              <button class="btn btn-outline btn-sm" id="toggle-guide-btn"><i class="fa-solid fa-eye"></i> <span class="guide-text">가이드 끄기</span></button>
              <button class="btn btn-secondary btn-sm" id="clear-pad-btn"><i class="fa-solid fa-eraser"></i> 지우기</button>
              <button class="btn btn-primary btn-sm" id="done-write-btn"><i class="fa-solid fa-check"></i> 완성!</button>
            </div>
          </div>
        </div>
      `;

      this.wrap = this.container.querySelector('.write-canvas-wrap');
      this.bgCanvas = this.container.querySelector('.write-bg-canvas');
      this.drawCanvas = this.container.querySelector('.write-draw-canvas');
      this.overlay = this.container.querySelector('.write-success-overlay');

      this.bgCtx = this.bgCanvas.getContext('2d');
      this.drawCtx = this.drawCanvas.getContext('2d');

      this.toggleGuideBtn = this.container.querySelector('#toggle-guide-btn');
      this.clearBtn = this.container.querySelector('#clear-pad-btn');
      this.doneBtn = this.container.querySelector('#done-write-btn');
      this.colorBtns = this.container.querySelectorAll('.color-btn');
    }

    initEvents() {
      window.addEventListener('resize', () => this.resize());

      // 색상 변경
      this.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.colorBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.color = btn.dataset.color;
        });
      });

      // 가이드 토글
      this.toggleGuideBtn.addEventListener('click', () => {
        this.showGuide = !this.showGuide;
        const textSpan = this.toggleGuideBtn.querySelector('.guide-text');
        if (textSpan) textSpan.textContent = this.showGuide ? '가이드 끄기' : '가이드 켜기';
        this.renderBackground();
      });

      // 지우기
      this.clearBtn.addEventListener('click', () => {
        this.clear();
      });

      // 완성 축하
      this.doneBtn.addEventListener('click', () => {
        this.celebrate();
      });

      // 포인터(터치 및 마우스) 이벤트
      const canvas = this.drawCanvas;
      canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    }

    setChar(char) {
      this.currentChar = char;
      this.clear();
      this.renderBackground();
    }

    resize() {
      if (!this.wrap) return;
      const size = Math.min(this.wrap.clientWidth || 300, 320);
      const dpr = window.devicePixelRatio || 1;

      this.bgCanvas.width = size * dpr;
      this.bgCanvas.height = size * dpr;
      this.bgCanvas.style.width = size + 'px';
      this.bgCanvas.style.height = size + 'px';

      this.drawCanvas.width = size * dpr;
      this.drawCanvas.height = size * dpr;
      this.drawCanvas.style.width = size + 'px';
      this.drawCanvas.style.height = size + 'px';

      this.bgCtx.scale(dpr, dpr);
      this.drawCtx.scale(dpr, dpr);

      this.size = size;
      this.renderBackground();
    }

    renderBackground() {
      const ctx = this.bgCtx;
      const size = this.size || 300;
      ctx.clearRect(0, 0, size, size);

      // 격자선 (미자/십자 격자)
      ctx.save();
      ctx.strokeStyle = '#f0e3d0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);

      // 가로/세로 중심선
      ctx.beginPath();
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      // 대각선
      ctx.moveTo(0, 0);
      ctx.lineTo(size, size);
      ctx.moveTo(size, 0);
      ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();

      // 바깥 테두리
      ctx.save();
      ctx.strokeStyle = '#e2d3be';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.restore();

      // 연한 가이드 폰트
      if (this.showGuide && this.currentChar) {
        ctx.save();
        ctx.fillStyle = '#eddac2';
        ctx.font = `900 ${Math.floor(size * 0.72)}px "Noto Serif KR", "Gowun Dodum", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentChar, size / 2, size / 2 + size * 0.04);
        ctx.restore();
      }
    }

    getPos(e) {
      const rect = this.drawCanvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    onPointerDown(e) {
      if (e.target !== this.drawCanvas) return;
      this.isDrawing = true;
      this.drawCanvas.setPointerCapture(e.pointerId);
      const pos = this.getPos(e);
      this.points = [pos];
      this.strokesCount++;

      this.drawCtx.strokeStyle = this.color;
      this.drawCtx.fillStyle = this.color;
      this.drawCtx.lineCap = 'round';
      this.drawCtx.lineJoin = 'round';
      this.drawCtx.lineWidth = this.lineWidth;

      // 점 찍기
      this.drawCtx.beginPath();
      this.drawCtx.arc(pos.x, pos.y, this.lineWidth / 2, 0, Math.PI * 2);
      this.drawCtx.fill();
    }

    onPointerMove(e) {
      if (!this.isDrawing) return;
      const pos = this.getPos(e);
      this.points.push(pos);

      if (this.points.length > 2) {
        const lastTwo = this.points.slice(-2);
        const xc = (lastTwo[0].x + lastTwo[1].x) / 2;
        const yc = (lastTwo[0].y + lastTwo[1].y) / 2;

        this.drawCtx.beginPath();
        this.drawCtx.moveTo(this.points[this.points.length - 3].x, this.points[this.points.length - 3].y);
        this.drawCtx.quadraticCurveTo(lastTwo[0].x, lastTwo[0].y, xc, yc);
        this.drawCtx.stroke();
      }
    }

    onPointerUp(e) {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.points = [];
    }

    clear() {
      const size = this.size || 300;
      this.drawCtx.clearRect(0, 0, size, size);
      this.strokesCount = 0;
      this.overlay.classList.remove('show');
    }

    celebrate() {
      this.overlay.classList.add('show');
      setTimeout(() => {
        this.overlay.classList.remove('show');
      }, 2000);
    }
  }

  window.HanziWritePad = HanziWritePad;
})();
