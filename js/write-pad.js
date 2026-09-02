/* ============================================================
   한자야 놀자! - 한자 따라쓰기(Write Pad) & 획순 애니메이션 엔진
   - HanziWriter 라이브러리 연동으로 정확한 표준 획순 애니메이션 제공
   - 획순 재생 시 획 시작 위치에 1, 2, 3, 4 숫자 뱃지가 순서대로 나타났다 사라짐!
   - 획순 자동 재생(보통/천천히/반복) & 자유 붓펜 필기 및 가이드 On/Off
   ============================================================ */

(function () {
  /* ------------------------------------------------------------
     획순 데이터(hanzi-writer-data) 이체자 매핑 테이블
     한국에서 쓰는 전통 자형(예: 敎 U+654E)은 획순 데이터가 없어서
     동일 글자의 표준 자형(예: 教 U+6559)으로 바꿔 획순을 재생합니다.
     ------------------------------------------------------------ */
  const STROKE_VARIANT_MAP = {
    '姉': '姊', '敎': '教', '爲': '為', '愼': '慎', '顚': '顛',
    '眞': '真', '旣': '既', '隷': '隸', '覇': '霸', '幷': '并',
    '玆': '茲', '勅': '敕', '皐': '皋', '卽': '即', '晩': '晚',
    '擧': '舉', '竝': '並', '姸': '妍', '窓': '窗', '淸': '清',
    '氷': '冰', '査': '查', '硏': '研', '絶': '絕', '鄕': '鄉',
    '郞': '郎', '裵': '裴', '兪': '俞', '楡': '榆'
  };

  // 획순 데이터가 아예 없는 한자 (국자·희귀 이체자) - 글꼴 가이드로 대체 안내
  const NO_STROKE_DATA = ['岾', '旻', '昞', '燁', '祐', '凊', '俶', '寔', '磻', '輶', '飡'];

  class HanziWritePad {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      this.currentChar = options.char || '漢';
      this.color = options.color || '#2d241e';
      this.lineWidth = options.lineWidth || 14;
      this.showGuide = true;
      this.mode = 'stroke'; // 기본 모드: 획순 보기
      this.writer = null;
      this.isDrawing = false;
      this.points = [];
      this.isWriterLoaded = false;
      this.charData = null;
      this.animTimeoutId = null;
      this.isAnimating = false;

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
            <!-- 배경 격자 캔버스 (z-index: 1) -->
            <canvas class="write-bg-canvas"></canvas>

            <!-- 획순 & 따라쓰기 공통 HanziWriter 해서체 스테이지 (z-index: 2) -->
            <div class="hanzi-writer-stage" id="hanzi-writer-target"></div>

            <!-- 획순 1, 2, 3, 4 숫자 뱃지 컨테이너 (z-index: 5) -->
            <div class="stroke-numbers-layer" id="stroke-numbers-layer"></div>

            <!-- 현재 획 카운터 뱃지 (z-index: 6) -->
            <div class="stroke-step-counter" id="stroke-step-counter" style="display:none;"></div>

            <!-- 직접 쓰기 드로잉 캔버스 (z-index: 3) -->
            <canvas class="write-draw-canvas"></canvas>

            <!-- 칭찬 오버레이 (z-index: 10) -->
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
      this.numbersLayer = this.container.querySelector('#stroke-numbers-layer');
      this.stepCounter = this.container.querySelector('#stroke-step-counter');

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

      // 획순 버튼 클릭 이벤트
      this.strokePlayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.playStrokeAnimation(1);
      });
      this.strokeSlowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.playStrokeAnimation(0.4);
      });
      this.strokeLoopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.loopStrokeAnimation();
      });

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
        
        if (this.writer) {
          if (this.showGuide) {
            this.writer.showOutline();
          } else {
            this.writer.hideOutline();
          }
        }
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
      this.clearNumbers();
      if (this.animTimeoutId) clearTimeout(this.animTimeoutId);

      if (mode === 'stroke') {
        this.drawCanvas.style.display = 'none';
        this.strokeControls.style.display = 'flex';
        this.drawToolbar.style.display = 'none';
        if (this.writer) {
          this.writer.showOutline();
        }
        this.playStrokeAnimation(1);
      } else {
        this.drawCanvas.style.display = 'block';
        this.strokeControls.style.display = 'none';
        this.drawToolbar.style.display = 'flex';
        if (this.writer) {
          try {
            this.writer.hideCharacter();
            if (this.showGuide) {
              this.writer.showOutline();
            } else {
              this.writer.hideOutline();
            }
          } catch (e) {}
        }
      }
    }

    setChar(char) {
      this.currentChar = char;
      this.isWriterLoaded = false;
      this.charData = null;
      this.clear();
      this.clearNumbers();
      if (this.animTimeoutId) clearTimeout(this.animTimeoutId);
      this.initHanziWriter();
      this.renderBackground();
    }

    initHanziWriter() {
      if (!this.writerTarget) return;
      this.writerTarget.innerHTML = '';
      const size = this.size || 280;

      // 획순 데이터가 있는 표준 자형으로 변환 (없으면 원래 글자 그대로)
      const strokeChar = STROKE_VARIANT_MAP[this.currentChar] || this.currentChar;
      this.strokeChar = strokeChar;
      this.hideStrokeNotice();

      if (NO_STROKE_DATA.indexOf(this.currentChar) !== -1) {
        this.writer = null;
        this.showStrokeNotice();
        return;
      }

      if (window.HanziWriter) {
        try {
          this.writer = window.HanziWriter.create(this.writerTarget, strokeChar, {
            width: size,
            height: size,
            padding: 16,
            showOutline: this.showGuide,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 200,
            strokeColor: '#2b231c',
            outlineColor: '#dfd2c0',
            drawingColor: '#d9381e',
            highlightColor: '#e05338',
            showCharacter: false,
            gridBackground: false,
            onLoadCharDataSuccess: (data) => {
              this.isWriterLoaded = true;
              this.charData = data;
              if (this.mode === 'stroke') {
                this.playStrokeAnimation(1);
              } else {
                if (this.showGuide) this.writer.showOutline();
                else this.writer.hideOutline();
              }
            },
            onLoadCharDataError: (err) => {
              console.warn('HanziWriter fallback for character:', this.currentChar, err);
              this.writer = null;
              this.showStrokeNotice();
            }
          });
        } catch (e) {
          console.warn('HanziWriter create error:', e);
          this.writer = null;
        }
      }
    }

    // 1, 2, 3, 4 숫자 뱃지와 함께 순차 획순 재생!
    playStrokeAnimation(speed = 1, isLoop = false) {
      if (!this.writer) return;
      if (this.animTimeoutId) clearTimeout(this.animTimeoutId);
      this.clearNumbers();

      try {
        this.writer.hideCharacter();
        this.writer.showOutline();
      } catch (e) {}

      // 획순 메디안 데이터 가져오기
      const strokes = (this.charData && this.charData.strokes) ? this.charData.strokes : [];
      const medians = (this.charData && this.charData.medians) ? this.charData.medians : [];
      const totalStrokes = strokes.length;

      if (totalStrokes === 0) {
        // Fallback: 일반 animateCharacter 호출
        try {
          this.writer.animateCharacter({
            strokeAnimationSpeed: speed,
            delayBetweenStrokes: 200 / speed
          });
        } catch (e) {}
        return;
      }

      const size = this.size || 280;
      const padding = 16;
      const innerSize = size - padding * 2;
      const scale = innerSize / 1024;

      let currentStroke = 0;

      const animateNextStroke = () => {
        if (this.mode !== 'stroke') return;

        if (currentStroke >= totalStrokes) {
          // 전체 획순 완성 후 마지막 숫자 버블 즉시 정리
          if (this.numbersLayer) this.numbersLayer.innerHTML = '';
          if (this.stepCounter) {
            this.stepCounter.innerHTML = `총 ${totalStrokes}획 완성! ✨`;
            this.stepCounter.style.display = 'block';
          }
          if (isLoop) {
            this.animTimeoutId = setTimeout(() => {
              this.playStrokeAnimation(speed, true);
            }, 1400);
          } else {
            this.animTimeoutId = setTimeout(() => {
              if (this.stepCounter) this.stepCounter.style.display = 'none';
            }, 2500);
          }
          return;
        }

        const strokeIndex = currentStroke;
        const strokeNum = strokeIndex + 1;

        // 획 시작 좌표 계산
        let posX = size / 2;
        let posY = size / 2;
        if (medians[strokeIndex] && medians[strokeIndex].length > 0) {
          const firstPoint = medians[strokeIndex][0];
          posX = padding + firstPoint[0] * scale;
          posY = size - (padding + firstPoint[1] * scale); // SVG 좌표 반전 보정
        }

        // 숫자 버블 뱃지 생성 & 표시
        this.showNumberBubble(strokeNum, posX, posY);

        // 상단 카운터 업데이트
        if (this.stepCounter) {
          this.stepCounter.innerHTML = `<span class="stroke-badge-num">${strokeNum}</span> / ${totalStrokes}획`;
          this.stepCounter.style.display = 'block';
        }

        // 해당 획 애니메이션 실행
        this.writer.animateStroke(strokeIndex, {
          strokeAnimationSpeed: speed,
          onComplete: () => {
            currentStroke++;
            const delay = 180 / speed;
            this.animTimeoutId = setTimeout(animateNextStroke, delay);
          }
        });
      };

      animateNextStroke();
    }

    showNumberBubble(num, x, y) {
      this.clearNumbers();
      if (!this.numbersLayer) return;

      const bubble = document.createElement('div');
      bubble.className = 'stroke-num-bubble pop-in';
      bubble.textContent = num;
      bubble.style.left = `${Math.max(12, Math.min(this.size - 32, x - 14))}px`;
      bubble.style.top = `${Math.max(12, Math.min(this.size - 32, y - 14))}px`;

      this.numbersLayer.appendChild(bubble);
    }

    clearNumbers() {
      if (this.numbersLayer) this.numbersLayer.innerHTML = '';
      if (this.stepCounter) this.stepCounter.style.display = 'none';
    }

    loopStrokeAnimation() {
      this.playStrokeAnimation(0.9, true);
    }

    resize() {
      if (!this.wrap) return;
      const size = Math.min(this.wrap.clientWidth || 280, 280);
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

    // 획순 데이터가 없을 때: 글꼴 가이드 글자와 안내 문구 표시
    showStrokeNotice() {
      if (!this.writerTarget) return;
      this.writerTarget.innerHTML = `
        <div class="stroke-fallback">
          <div class="stroke-fallback-char">${this.currentChar}</div>
          <p class="stroke-fallback-msg">이 글자는 표준 획순 데이터가 없어요.<br>글자 모양을 보면서 <strong>직접 쓰기</strong>로 연습해 보세요!</p>
        </div>
      `;
      if (this.strokeControls) this.strokeControls.classList.add('is-disabled');
    }

    hideStrokeNotice() {
      if (this.strokeControls) this.strokeControls.classList.remove('is-disabled');
    }

    renderBackground() {
      const ctx = this.bgCtx;
      const size = this.size || 280;
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
      const size = this.size || 280;
      this.drawCtx.clearRect(0, 0, size, size);
      if (this.overlay) this.overlay.classList.remove('show');
    }

    celebrate() {
      if (this.overlay) {
        this.overlay.classList.add('show');
        setTimeout(() => {
          this.overlay.classList.remove('show');
        }, 1800);
      }
    }
  }

  window.HanziWritePad = HanziWritePad;
})();
