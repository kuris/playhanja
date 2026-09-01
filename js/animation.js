/* ============================================================
   한자야 놀자! - 한자 조립 애니메이션 엔진
   1) 그림(부수) 조각들이 각자의 방향에서 날아와 한자 실루엣 위치로 모임
   2) [중간 추상화 단계] 그림들이 점점 먹물처럼 흐려지고 채도가 빠지면서
      붓글씨 느낌의 "반쯔인 한자" 유령 글자로 서서히 변함 (그림 → 글자 브릿지)
   3) 유령 글자가 선명해지며 최종 정자체 한자로 자연스럽게 안착
   ============================================================ */

(function () {
  // 방향 키워드 -> 조립 시 각 부수가 모이는 대략적인 위치(중앙 기준 오프셋)
  // 완전히 겹치지 않고 한자 실루엣 안에서 위/아래/좌/우 자리를 잡는 느낌을 줌
  const START_OFFSET = {
    top:    { x: 0,   y: -160 },
    bottom: { x: 0,   y: 160  },
    left:   { x: -160, y: 0   },
    right:  { x: 160,  y: 0   },
    center: { x: 0,   y: 0    }
  };
  const GATHER_OFFSET = {
    top:    { x: 0,   y: -46 },
    bottom: { x: 0,   y: 46  },
    left:   { x: -46, y: 0   },
    right:  { x: 46,  y: 0   },
    center: { x: 0,   y: 0   }
  };

  /**
   * 한자 조립 애니메이션을 하나의 스테이지(char-stage) 안에서 재생한다.
   * @param {HTMLElement} stage - .char-stage 요소
   * @param {Object} hanzi - HANZI_DATA의 한 항목
   * @param {Object} opts
   *   - onPartStart(index, part) : 부수 하나가 등장할 때 호출
   *   - onMorphStart() : 그림 → 글자 브릿지 단계가 시작될 때 호출
   *   - onCharShown() : 최종 한자가 나타났을 때 호출
   *   - onDone() : 전체 애니메이션(한 사이클) 종료 시 호출
   *   - loop : true면 끝난 후 다시 재생
   *   - speed : 1(기본), 낮추면 느려짐(예 0.6), 높이면 빨라짐
   */
  function playHanziAnimation(stage, hanzi, opts) {
    opts = opts || {};
    const speed = opts.speed || 1;
    const partDuration   = 900 / speed;   // 부수 하나 등장 시간
    const gapBetween     = 550 / speed;   // 부수 간 등장 간격
    const holdGathered   = 550 / speed;   // 다 모인 모습을 보여주는 시간
    const morphDuration  = 1300 / speed;  // 그림 -> 먹글씨 유령 글자로 바뀌는 시간(중간 추상화 단계)
    const holdGhost      = 500 / speed;   // 유령 글자를 보여주는 시간
    const resolveDuration = 900 / speed;  // 유령 글자 -> 정자체 한자로 선명해지는 시간
    const holdCharDuration = 1900 / speed;

    // 스테이지 초기화
    stage.innerHTML = '';
    stage.dataset.playing = 'true';

    // 뱃지(획수) 표시
    const meta = document.createElement('div');
    meta.className = 'stage-meta';
    meta.textContent = hanzi.strokes + '획';
    stage.appendChild(meta);

    // 캡션
    const caption = document.createElement('div');
    caption.className = 'stage-caption';
    caption.textContent = '조각들이 모여서 한자가 될 거예요';
    stage.appendChild(caption);

    const parts = hanzi.parts;
    const partEls = [];

    // 각 부수 요소 생성 (처음엔 화면 밖 위치에서 시작, 색이 있는 그림 그대로)
    parts.forEach((part) => {
      const start = START_OFFSET[part.dir] || START_OFFSET.center;
      const el = document.createElement('div');
      el.className = 'stage-part';
      el.textContent = part.txt;
      el.style.opacity = '0';
      el.style.filter = 'grayscale(0) blur(0px)';
      el.style.transform = `translate(${start.x}px, ${start.y}px) scale(0.5)`;
      el.style.transition = `transform ${partDuration}ms cubic-bezier(.34,1.56,.64,1), opacity ${partDuration}ms ease`;
      stage.appendChild(el);
      partEls.push(el);
    });

    // [중간 추상화 단계] 그림이 점점 흐려지며 먹물 붓글씨 느낌으로 변하는 "유령 글자"
    const ghostEl = document.createElement('div');
    ghostEl.className = 'stage-ghost';
    ghostEl.textContent = hanzi.char;
    ghostEl.style.opacity = '0';
    stage.appendChild(ghostEl);

    // 최종 한자 요소 (처음엔 숨김, 선명한 정자체)
    const charEl = document.createElement('div');
    charEl.className = 'stage-hanzi';
    charEl.textContent = hanzi.char;
    charEl.style.opacity = '0';
    charEl.style.transform = 'scale(0.92)';
    stage.appendChild(charEl);

    let timers = [];
    function schedule(fn, t) { timers.push(setTimeout(fn, t)); }

    let t = 100;

    // 1단계: 부수들이 하나씩 날아와, 한자 실루엣 안의 제자리로 모임
    parts.forEach((part, i) => {
      const gather = GATHER_OFFSET[part.dir] || GATHER_OFFSET.center;
      schedule(() => {
        if (typeof opts.onPartStart === 'function') opts.onPartStart(i, part);
        partEls[i].style.opacity = '1';
        partEls[i].style.transform = `translate(${gather.x}px, ${gather.y}px) scale(0.85)`;
        caption.textContent = part.label + ' → ' + part.meaning;
      }, t);
      t += gapBetween;
    });

    // 2단계: 다 모인 모습을 잠시 보여줌
    t += holdGathered;

    // 3단계(핵심/중간 추상화): 그림들이 점점 채도를 잃고 흐려지며
    //   붓글씨 유령 글자가 겹쳐서 서서히 떠오름 → "그림이 한자로 변해가는" 느낌
    schedule(() => {
      caption.textContent = '그림이 점점 한자 모양으로 변하고 있어요...';
      partEls.forEach(el => {
        el.style.transition = `filter ${morphDuration}ms ease, opacity ${morphDuration}ms ease, transform ${morphDuration}ms ease`;
        el.style.filter = 'grayscale(1) blur(2px)';
        el.style.opacity = '0.28';
        el.style.transform += ' scale(0.7)';
      });
      ghostEl.style.transition = `opacity ${morphDuration}ms ease, filter ${morphDuration}ms ease`;
      ghostEl.style.filter = 'blur(6px)';
      ghostEl.style.opacity = '0.85';
      if (typeof opts.onMorphStart === 'function') opts.onMorphStart();
    }, t);
    t += morphDuration;

    // 4단계: 그림 조각은 완전히 사라지고, 유령 글자만 살짝 보이는 상태로 유지
    schedule(() => {
      partEls.forEach(el => { el.style.opacity = '0'; });
      caption.textContent = '먹으로 쓴 글씨처럼 점점 또렷해져요';
    }, t);
    t += holdGhost;

    // 5단계: 유령 글자가 선명해지며(블러 제거) 최종 정자체 한자로 안착
    schedule(() => {
      ghostEl.style.transition = `opacity ${resolveDuration}ms ease, filter ${resolveDuration}ms ease`;
      ghostEl.style.filter = 'blur(0px)';
      ghostEl.style.opacity = '0';

      charEl.style.transition = `transform ${resolveDuration}ms cubic-bezier(.34,1.56,.64,1), opacity ${resolveDuration}ms ease`;
      charEl.style.opacity = '1';
      charEl.style.transform = 'scale(1)';
      caption.textContent = '짜잔! 완성된 한자예요';
      if (typeof opts.onCharShown === 'function') opts.onCharShown();
    }, t);
    t += resolveDuration;

    schedule(() => {
      caption.textContent = hanzi.char + ' = ' + hanzi.meaning + ' (' + hanzi.sound + ')';
    }, t);

    t += holdCharDuration;

    schedule(() => {
      if (typeof opts.onDone === 'function') opts.onDone();
      if (opts.loop && stage.dataset.playing === 'true') {
        playHanziAnimation(stage, hanzi, opts);
      }
    }, t);

    // 재생 취소용 핸들
    stage._cancelAnim = function () {
      stage.dataset.playing = 'false';
      timers.forEach(clearTimeout);
    };
  }

  function stopHanziAnimation(stage) {
    if (stage && typeof stage._cancelAnim === 'function') {
      stage._cancelAnim();
    }
  }

  // 전역에 노출
  window.playHanziAnimation = playHanziAnimation;
  window.stopHanziAnimation = stopHanziAnimation;
})();
