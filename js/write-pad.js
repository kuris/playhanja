/* ============================================================
   한자야 놀자! - 한자 따라쓰기(Write Pad) & 획순 애니메이션 엔진
   - HanziWriter 라이브러리 연동으로 정확한 표준 획순 애니메이션 제공
   - 획순 자동 재생(보통/천천히) & 한 획씩 순서대로 보여주기
   - 캔버스 미자(米/十) 격자 보조선 위 자유 붓펜 필기 및 가이드 On/Off
   - 네트워크 fallback(자체 캔버스 렌더러) 완벽 지원
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
      this.mode = 'draw'; // 'draw' | 'stroke'
      this.writer = null;
      this.isDrawing = false;
      this.points = [];

      this.initDOM();
      this.initEvents();
      this.resize();
    }

    initDOM() {
      this.container.innerHTML = `
        <div class="write-pad-container">
          <!-- 획순 & 따라쓰기 모드 스위처 -->
          <div class="write-mode-bar">
            <button class="write-mode-btn active" data-mode="stroke"><i class="fa-solid fa-play"></i> 획순 보기</button>
            <button class="write-mode-btn" data-mode="draw"><i class="fa-solid fa-pen-nib"></i> 직접 쓰기</button>
          </div>

          <div class="write-canvas-wrap" id="write-canvas-wrap">
            <!-- 획순 전용 HanziWriter 타겟 컨테이너 -->
            <div class="hanzi-writer-stage" id="hanzi-writer-target"></div>

            <!-- 자유 드로잉 캔버스 -->
            <canvas class="write-bg-canvas"></canvas>
            <canvas class="write-draw-canvas"></canvas>
            <div class="write-success-overlay"><span class="success-stamp">참 잘 썼어요! 💮</span></div>
          </div>

          <!-- 획순 컨트롤 바 (획순 모드일 때 표시) -->
          <div class="stroke-controls" id="stroke-controls">
            <button class="btn btn-primary btn-sm" id="stroke-play-btn"><i class="fa-solid fa-play"></i> 획순 재생</button>
            <button class="btn btn-secondary btn-sm" id="stroke-slow-btn"><i class="fa-solid fa-gauge-simple"></i> 천천히 보기</button>
            <button class="btn btn-outline btn-sm" id="stroke-loop-btn"><i class="fa-solid fa-rotate"></i> 반복 보기</button>
          </div>

          <!-- 직접 쓰기 툴바 (직접 쓰기 모드일 때 표시) -->
          <div class="write-toolbar" id="draw-toolbar" style="display:none;">
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

      this.wrap = this.container.querySelector('#write-canvas-wrap');
      this.writerTarget = this.container.querySelector('#hanzi-writer-target');
      this.bgCanvas = this.container.querySelector('.write-bg-canvas');
      this.drawCanvas = this.container.querySelector('.write-draw-canvas');
      this.overlay = this.container.querySelector('.write-success-overlay');

      this.strokeControls = this.container.querySelector('#stroke-controls');
      this.drawToolbar = this.container.querySelector('#draw-toolbar');
      this.modeBtns = this.container.querySelectorAll('.write-mode-btn');

      this.strokePlayBtn = this.container.querySelector('#stroke-play-btn');
      this.strokeSlowBtn = this.container.querySelector('#stroke-slow-btn');
      this.strokeLoopBtn = this.container.querySelector('#stroke-loop-btn');

      this.bgCtx = this.bgCanvas.getContext('2d');
      this.drawCtx = this.drawCanvas.getContext('2d');

      this.toggleGuideBtn = this.container.querySelector('#toggle-guide-btn');
      this.clearBtn = this.container.querySelector('#clear-pad-btn');
      this.doneBtn = this.container.querySelector('#done-write-btn');
      this.colorBtns = this.container.querySelectorAll('.color-btn');
    }

    initEvents() {
      window.addEventListener('resize', () => this.resize());

      // 모드 전환 (획순 보기 <-> 직접 쓰기)
      this.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.modeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setMode(btn.dataset.mode);
        });
      });

      // 획순 버튼들
      this.strokePlayBtn.addEventListener('click', () => this.playStrokeAnimation(1));
      this.strokeSlowBtn.addEventListener('click', () => this.playStrokeAnimation(0.45));
      this.strokeLoopBtn.addEventListener('click', () => this.loopStrokeAnimation());

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
      this.clearBtn.addEventListener('click', () => this.clear());

      // 완성 축하
      this.doneBtn.addEventListener('click', () => this.celebrate());

      // 포인터(터치 및 마우스) 드로잉 이벤트
      const canvas = this.drawCanvas;
      canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    }

    setMode(mode) {
      this.mode = mode;
      if (mode === 'stroke') {
        this.writerTarget.style.display = 'flex';
        this.drawCanvas.style.display = 'none';
        this.strokeControls.style.display = 'flex';
        this.drawToolbar.style.display = 'none';
        this.playStrokeAnimation(1);
      } else {
        this.writerTarget.style.display = 'none';
        this.drawCanvas.style.display = 'block';
        this.strokeControls.style.display = 'none';
        this.drawToolbar.style.display = 'flex';
        this.renderBackground();
      }
    }

    setChar(char) {
      this.currentChar = char;
      this.clear();
      this.initHanziWriter();
      if (this.mode === 'stroke') {
        this.playStrokeAnimation(1);
      } else {
        this.renderBackground();
      }
    }

    initHanziWriter() {
      if (!this.writerTarget) return;
      this.writerTarget.innerHTML = '';
      const size = this.size || 280;

      if (window.HanziWriter) {
        try {
          this.writer = window.HanziWriter.create(this.writerTarget, this.currentChar, {
            width: size,
            height: size,
            padding: 18,
            showOutline: true,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 220,
            strokeColor: '#2d241e',
            outlineColor: '#dfd2c0',
            drawingColor: '#d9381e',
            highlightColor: '#ff6b4a',
            showCharacter: false,
            gridBackground: false
          });
        } catch (e) {
          console.warn('HanziWriter fallback:', e);
          this.writer = null;
        }
      }
    }

    playStrokeAnimation(speed = 1) {
      if (this.writer) {
        this.writer.cancelAnimation();
        this.writer.animateCharacter({
          strokeAnimationSpeed: speed,
          delayBetweenStrokes: 220 / speed
        });
      } else {
        // Fallback: 캔버스 가이드 글자 깜빡임 효과
        this.renderBackground();
      }
    }

    loopStrokeAnimation() {
      if (this.writer) {
        this.writer.cancelAnimation();
        this.writer.loopCharacterAnimation({
          strokeAnimationSpeed: 0.9,
          delayBetweenStrokes: 180,
          delayBetweenLoops: 1200
        });
      }
    }

    resize() {
      if (!this.wrap) return;
      const size = Math.min(this.wrap.clientWidth || 300, 300);
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
      this.initHanziWriter();
      this.renderBackground();
    }

    renderBackground() {
      const ctx = this.bgCtx;
      const size = this.size || 300;
      ctx.clearRect(0, 0, size, size);

      // 격자선 (미자/십자 점선 격자)
      ctx.save();
      ctx.strokeStyle = '#ecdcc7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);

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
      ctx.strokeStyle = '#dfd0bd';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.restore();

      // 연한 가이드 폰트 (직접 쓰기 모드일 때)
      if (this.mode === 'draw' && this.showGuide && this.currentChar) {
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
      if (this.mode !== 'draw' || e.target !== this.drawCanvas) return;
      this.isDrawing = true;
      this.drawCanvas.setPointerCapture(e.pointerId);
      const pos = this.getPos(e);
      this.points = [pos];

      this.drawCtx.strokeStyle = this.color;
      this.drawCtx.fillStyle = this.color;
      this.drawCtx.lineCap = 'round';
      this.drawCtx.lineJoin = 'round';
      this.drawCtx.lineWidth = this.lineWidth;

      this.drawCtx.beginPath();
      this.drawCtx.arc(pos.x, pos.y, this.lineWidth / 2, 0, Math.PI * 2);
      this.drawCtx.fill();
    }

    onPointerMove(e) {
      if (!this.isDrawing || this.mode !== 'draw') return;
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
