/* ============================================================
   한자야 놀자! - 이름 한자 풀이 스크립트 (name.js)
   - 한글 입력 시 글자별(음절별) 한자 후보 자동 추천 및 원클릭 선택 기능
   - 직접 한자 입력 및 복사-붙여넣기 지원
   - 이름 한자별 훈음/의미 분리 표시 & 종합 자연스러운 풀이 조합
   - 클립보드 복사(토스트 알림) 및 A4 카드 인쇄(window.print)
   - 추천 예시 이름 원클릭 입력 & URL 쿼리 파라미터 연동
   ============================================================ */

(function () {
  const hangulInput = document.getElementById('name-hangul');
  const hanjaInput = document.getElementById('name-hanja');
  const analyzeBtn = document.getElementById('btn-analyze');
  const resetBtn = document.getElementById('btn-reset');
  const copyBtn = document.getElementById('btn-copy');
  const printBtn = document.getElementById('btn-print');
  const resultSection = document.getElementById('name-result-section');
  const charGrid = document.getElementById('result-char-grid');
  const sentenceBox = document.getElementById('result-sentence');
  const resultTitle = document.getElementById('result-name-title');
  const toast = document.getElementById('name-toast');
  const sampleChips = document.querySelectorAll('.sample-chip');

  // 한자 선택기 관련 요소
  const pickerContainer = document.getElementById('syllable-picker-container');
  const groupsList = document.getElementById('syllable-groups-list');
  const toggleManualBtn = document.getElementById('btn-toggle-manual');
  const manualBox = document.getElementById('manual-hanja-box');

  // 글자별 선택된 한자 상태 [index: char]
  let selectedHanjaByIndex = [];

  // 한자 직접 입력창 토글
  if (toggleManualBtn && manualBox) {
    toggleManualBtn.addEventListener('click', () => {
      const isHidden = manualBox.style.display === 'none';
      manualBox.style.display = isHidden ? 'block' : 'none';
    });
  }

  // 한글 입력 감지 -> 글자별 한자 선택기 생성
  if (hangulInput) {
    hangulInput.addEventListener('input', () => {
      handleHangulInput();
    });
  }

  // 특정 음(sound)에 해당하는 한자 후보 목록 가져오기
  function getHanjaCandidatesForSound(sound) {
    const list = [];
    const seen = new Set();

    // 1. NAME_HANJA_LIST 에서 우선 검색
    if (typeof NAME_HANJA_LIST !== 'undefined') {
      NAME_HANJA_LIST.forEach(item => {
        if (item.sound === sound || item.popularSound === sound) {
          if (!seen.has(item.char)) {
            seen.add(item.char);
            list.push({
              char: item.char,
              hun: item.meaning,
              sound: item.sound,
              desc: item.desc,
              isPrimary: true
            });
          }
        }
      });
    }

    // 2. GRADE_HANJA (3,500자) 에서 추가 보강
    if (typeof GRADE_HANJA !== 'undefined' && Array.isArray(GRADE_HANJA)) {
      GRADE_HANJA.forEach(item => {
        if (item.sound === sound && !seen.has(item.char)) {
          seen.add(item.char);
          list.push({
            char: item.char,
            hun: item.hun,
            sound: item.sound,
            desc: `${item.hun} ${item.sound}`,
            isPrimary: false
          });
        }
      });
    }

    return list;
  }

  // 한글 입력 시 글자별 한자 선택기 렌더링
  function handleHangulInput(prefilledHanja) {
    const hangul = (hangulInput ? hangulInput.value : '').trim();
    const syllables = hangul.match(/[\uAC00-\uD7A3]/g) || [];

    if (syllables.length === 0) {
      if (pickerContainer) pickerContainer.style.display = 'none';
      selectedHanjaByIndex = [];
      return;
    }

    if (pickerContainer) pickerContainer.style.display = 'block';

    // 기존에 선택된 한자 유지 또는 기본값 설정
    const prevSelected = [...selectedHanjaByIndex];
    selectedHanjaByIndex = [];

    let preHanjaList = [];
    if (prefilledHanja) {
      preHanjaList = prefilledHanja.match(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g) || [];
    }

    if (groupsList) {
      groupsList.innerHTML = syllables.map((syl, idx) => {
        const candidates = getHanjaCandidatesForSound(syl);

        // 기본 선택 결정: prefilledHanja > 기존 선택 > 첫 번째 후보
        let chosen = '';
        if (preHanjaList[idx]) {
          chosen = preHanjaList[idx];
        } else if (prevSelected[idx] && candidates.some(c => c.char === prevSelected[idx])) {
          chosen = prevSelected[idx];
        } else if (candidates.length > 0) {
          chosen = candidates[0].char;
        }

        selectedHanjaByIndex[idx] = chosen;

        let pillsHtml = '';
        if (candidates.length > 0) {
          pillsHtml = candidates.map(c => `
            <button type="button" class="char-pill-btn ${c.char === chosen ? 'active' : ''}" data-idx="${idx}" data-char="${c.char}">
              <span class="cpb-char">${c.char}</span>
              <span class="cpb-hun">${c.hun} ${c.sound}</span>
            </button>
          `).join('');
        } else {
          pillsHtml = `<span style="font-size:0.85rem; color:var(--color-text-soft);">‘${syl}’ 소리의 등록 한자가 없습니다. 아래 직접 입력창을 이용해 주세요.</span>`;
        }

        return `
          <div class="syllable-group" data-group-idx="${idx}">
            <div class="syllable-header">
              <span class="syllable-badge">${idx + 1}번째 글자</span>
              <span class="syllable-char-name">‘<strong>${syl}</strong>’에 쓰인 한자를 골라주세요:</span>
            </div>
            <div class="syllable-pills">
              ${pillsHtml}
            </div>
          </div>
        `;
      }).join('');

      // pill 버튼 클릭 이벤트 등록
      groupsList.querySelectorAll('.char-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const ch = btn.getAttribute('data-char');
          selectedHanjaByIndex[idx] = ch;

          // 같은 그룹 내 active 클래스 갱신
          const group = btn.closest('.syllable-group');
          if (group) {
            group.querySelectorAll('.char-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }

          // 한자 입력창 동기화
          syncHanjaInput();
          // 자동 풀이 실행
          analyzeName();
        });
      });
    }

    syncHanjaInput();
  }

  // 선택된 한자들을 한자 입력창에 동기화
  function syncHanjaInput() {
    const combined = selectedHanjaByIndex.filter(Boolean).join('');
    if (hanjaInput) {
      hanjaInput.value = combined;
    }
  }

  // 사용자가 한자 입력창에 직접 타이핑했을 때 선택기 동기화
  if (hanjaInput) {
    hanjaInput.addEventListener('input', () => {
      const val = hanjaInput.value.trim();
      const chars = val.match(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g) || [];
      chars.forEach((ch, idx) => {
        if (selectedHanjaByIndex[idx] !== undefined) {
          selectedHanjaByIndex[idx] = ch;
          // UI 버튼 active 갱신
          const group = groupsList ? groupsList.querySelector(`[data-group-idx="${idx}"]`) : null;
          if (group) {
            group.querySelectorAll('.char-pill-btn').forEach(b => {
              if (b.getAttribute('data-char') === ch) b.classList.add('active');
              else b.classList.remove('active');
            });
          }
        }
      });
    });
  }

  // 추천 예시 이름 클릭 처리
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const h = chip.getAttribute('data-h') || '';
      const c = chip.getAttribute('data-c') || '';
      if (hangulInput) hangulInput.value = h;
      handleHangulInput(c);
      if (hanjaInput) hanjaInput.value = c;
      analyzeName();
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 풀이 버튼 클릭
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeName);
  }

  // 엔터 키 입력 시 자동 풀이
  [hangulInput, hanjaInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        analyzeName();
      }
    });
  });

  // 다시 입력하기 버튼
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (hangulInput) hangulInput.value = '';
      if (hanjaInput) hanjaInput.value = '';
      if (pickerContainer) pickerContainer.style.display = 'none';
      if (resultSection) resultSection.style.display = 'none';
      selectedHanjaByIndex = [];
      if (hangulInput) hangulInput.focus();
    });
  }

  // 결과 복사 기능 (navigator.clipboard)
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const hVal = (hangulInput ? hangulInput.value : '').trim();
      const cVal = (hanjaInput ? hanjaInput.value : '').trim();
      const title = `${hVal ? hVal + ' ' : ''}${cVal ? '(' + cVal + ')' : ''} 이름 한자 풀이`;
      const text = sentenceBox ? sentenceBox.innerText : '';

      const cards = charGrid ? charGrid.querySelectorAll('.name-char-card') : [];
      let details = [];
      cards.forEach(card => {
        const ch = card.querySelector('.nc-char')?.innerText || '';
        const hun = card.querySelector('.nc-hun')?.innerText || '';
        const desc = card.querySelector('.nc-desc')?.innerText || '';
        if (ch) details.push(`• ${ch} : ${hun} - ${desc}`);
      });

      const copyText = `[한자야 놀자 - 이름 한자 풀이]\n\n${title}\n\n${text}\n\n[글자별 뜻]\n${details.join('\n')}\n\n자세히 보기: ${location.href}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(() => {
          showToast('📋 이름 풀이 결과가 클립보드에 복사되었습니다!');
        }).catch(() => {
          fallbackCopy(copyText);
        });
      } else {
        fallbackCopy(copyText);
      }
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('📋 이름 풀이 결과가 클립보드에 복사되었습니다!');
    } catch (err) {
      alert('복사에 실패했습니다. 결과를 직접 드래그하여 복사해 주세요.');
    }
    document.body.removeChild(ta);
  }

  // 카드 인쇄/PDF 저장
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 토스트 메시지
  function showToast(msg) {
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  }

  // 이름 분석 핵심 함수
  function analyzeName() {
    let rawHanja = (hanjaInput ? hanjaInput.value : '').trim();
    const hangul = (hangulInput ? hangulInput.value : '').trim();

    // 한자 입력이 비어있는데 선택된 한자가 있으면 조합
    if (!rawHanja && selectedHanjaByIndex.length > 0) {
      rawHanja = selectedHanjaByIndex.join('');
      if (hanjaInput) hanjaInput.value = rawHanja;
    }

    // 한자 추출
    const hanjaList = (rawHanja.match(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g) || []);

    if (hanjaList.length === 0) {
      // 한글만 입력된 상태라면 선택기를 펼치고 유도
      if (hangul) {
        handleHangulInput();
        if (selectedHanjaByIndex.length > 0) {
          syncHanjaInput();
          analyzeName();
          return;
        }
      }
      alert('풀이할 이름을 한글 또는 한자로 입력해 주세요. (예: 민준 / 旻俊)');
      if (hangulInput) hangulInput.focus();
      return;
    }

    // 결과 제목
    if (resultTitle) {
      const displayName = hangul ? `${hangul} (${hanjaList.join('')})` : hanjaList.join('');
      resultTitle.innerHTML = `<span class="res-name-badge">풀이 결과</span> <strong>${displayName}</strong>`;
    }

    // 각 글자 검색
    const charResults = hanjaList.map((ch, idx) => {
      const found = typeof findNameHanja === 'function' ? findNameHanja(ch) : null;
      return {
        char: ch,
        index: idx + 1,
        found: !!found,
        data: found
      };
    });

    // 개별 한자 카드 렌더링
    if (charGrid) {
      charGrid.innerHTML = charResults.map(res => {
        if (res.found && res.data) {
          const d = res.data;
          return `
            <div class="name-char-card found">
              <div class="nc-top">
                <span class="nc-num">${res.index}번째 글자</span>
                <span class="nc-cat">${d.category || '인명용 한자'}</span>
              </div>
              <div class="nc-char">${d.char}</div>
              <div class="nc-hun"><span>${d.meaning}</span> ${d.sound}</div>
              <div class="nc-desc">${d.desc}</div>
              ${d.corePhrase ? `<div class="nc-core"><i class="fa-solid fa-sparkles"></i> ${d.corePhrase}</div>` : ''}
              <div class="nc-links">
                <a href="name-list.html?sound=${encodeURIComponent(d.sound)}" class="nc-sublink">
                  '${d.sound}' 한자 더보기 <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="name-char-card not-found">
              <div class="nc-top">
                <span class="nc-num">${res.index}번째 글자</span>
                <span class="nc-cat warn">안내</span>
              </div>
              <div class="nc-char">${res.char}</div>
              <div class="nc-hun unknown">현재 데이터에 없는 한자입니다.</div>
              <div class="nc-desc">
                공식 인명용 한자 조회를 확인해 주세요.<br>
                대법원 인명용 한자 범위에 수록된 한자인지 공식 시스템에서 정확한 훈음과 등록 가능 여부를 조회하실 수 있습니다.
              </div>
              <div class="nc-links">
                <a href="https://efamily.scourt.go.kr/cs/CsBltnWrtList.do?bltnbordId=0000010" target="_blank" rel="noopener noreferrer" class="nc-sublink official-link">
                  대법원 인명용 한자 조회 <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
            </div>
          `;
        }
      }).join('');
    }

    // 전체 이름 풀이 문장 조합
    if (sentenceBox) {
      const interpretation = typeof generateNameInterpretation === 'function'
        ? generateNameInterpretation(charResults, hangul)
        : '';
      sentenceBox.innerHTML = `
        <div class="sentence-bubble">
          <div class="sb-badge"><i class="fa-solid fa-quote-left"></i> 종합 풀이 해석</div>
          <p class="sb-text">${interpretation}</p>
          <div class="sb-note">
            <i class="fa-solid fa-circle-info"></i>
            사주나 운세가 아닌, 한자 고유의 밝고 긍정적인 뜻을 바탕으로 풀이한 해석입니다.
          </div>
        </div>
      `;
    }

    // 결과 섹션 보이기
    if (resultSection) {
      resultSection.style.display = 'block';
    }
  }

  // URL 파라미터 처리 (다른 페이지에서 ?h=민준&c=旻俊 또는 ?c=旻 으로 넘어올 때 자동 실행)
  function handleUrlParams() {
    const params = new URLSearchParams(location.search);
    const h = params.get('h') || '';
    const c = params.get('c') || params.get('char') || '';
    if (h) {
      if (hangulInput) hangulInput.value = h;
      handleHangulInput(c);
    }
    if (c) {
      if (hanjaInput) hanjaInput.value = c;
      setTimeout(analyzeName, 150);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleUrlParams);
  } else {
    handleUrlParams();
  }
})();
