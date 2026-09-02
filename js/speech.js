/* ============================================================
   한자야 놀자! - 한자 읽어주기 (speech.js)
   - 브라우저 음성 합성(Web Speech API)으로 훈음을 소리내어 읽어줍니다
   - 지원하지 않는 브라우저에서는 버튼이 자동으로 숨겨집니다
   ============================================================ */

(function () {
  const synth = window.speechSynthesis || null;
  const supported = !!synth && typeof window.SpeechSynthesisUtterance === 'function';
  let koVoice = null;

  function pickVoice() {
    if (!supported) return null;
    const voices = synth.getVoices() || [];
    koVoice = voices.find(v => v.lang === 'ko-KR')
           || voices.find(v => (v.lang || '').toLowerCase().startsWith('ko'))
           || null;
    return koVoice;
  }
  if (supported) {
    pickVoice();
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', pickVoice);
    }
  }

  function speak(text, opts) {
    if (!supported || !text) return false;
    try {
      synth.cancel();  // 이전 읽기 중단 후 새로 읽기
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'ko-KR';
      u.rate = (opts && opts.rate) || 0.85;   // 어린이가 따라 읽기 좋은 속도
      u.pitch = (opts && opts.pitch) || 1;
      if (koVoice) u.voice = koVoice;
      synth.speak(u);
      return true;
    } catch (e) {
      console.warn('[한자야 놀자] 읽어주기 실패:', e);
      return false;
    }
  }

  function stop() { if (supported) synth.cancel(); }

  /**
   * 읽어주기 버튼을 만들어 지정한 요소 앞(상단)에 넣습니다.
   * @param {Element} target   기준이 되는 요소 (이 요소 바로 위에 버튼이 들어감)
   * @param {Function} getText 읽을 문장을 돌려주는 함수
   * @param {String} id        버튼 id (중복 생성 방지)
   */
  function attachButton(target, getText, id) {
    if (!target) return null;
    if (!supported) return null;

    let btn = id ? document.getElementById(id) : null;
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'speak-btn';
      if (id) btn.id = id;
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> 읽어주기';
      btn.setAttribute('aria-label', '읽어주기');
      target.parentNode.insertBefore(btn, target);

      // 리스너는 한 번만 등록하고, 읽을 내용은 항상 최신 함수(_getText)에서 가져옵니다
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const text = btn._getText ? btn._getText() : '';
        if (!text) return;
        btn.classList.add('speaking');
        speak(text);
        setTimeout(() => btn.classList.remove('speaking'), 1200);
      });
    }
    // 모달을 다시 열 때마다 현재 글자를 읽도록 갱신
    btn._getText = getText;
    stop();
    btn.classList.remove('speaking');
    return btn;
  }

  window.HanjaSpeech = { speak, stop, attachButton, isSupported: () => supported };

  // 화면을 벗어나면 읽기 중단
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
