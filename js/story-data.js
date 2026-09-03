/* ============================================================
   한자야 놀자! - 재미로 보는 이야기 (story-data.js)
   - 한글 이야기 속 한자어를 눌러 한자와 훈음을 익힙니다
   - 본문 표기법: [한글|漢字]  예) [사막|沙漠]
     → 훈음·급수·획수는 급수 한자 데이터에서 자동으로 찾아옵니다
   - ⚠️ 저작권 안내
     『어린 왕자』 원작(1943, 생텍쥐페리)은 저작권이 만료된 퍼블릭 도메인이지만
     기존 한국어 번역문에는 번역자의 저작권이 있습니다.
     아래 본문은 원작의 줄거리를 바탕으로 **직접 새로 쓴 각색본**입니다.
   ============================================================ */

const STORIES = [
  {
    id: 'prince',
    title: '어린 왕자',
    subtitle: '재미로 보는 이야기',
    author: '생텍쥐페리 원작 · 한자야 놀자 각색',
    cover: '🌟',
    color: '#8b5cf6',
    intro: '사막에 떨어진 비행사가 별에서 온 어린 왕자를 만나는 이야기예요. 한글 속 한자어를 눌러 보세요!',
    chapters: [
      {
        no: 1,
        title: '모자가 아니라 코끼리',
        emoji: '🎩',
        paragraphs: [
          [
            '내가 여섯 살이던 [시절|時節]의 일이다.',
            '[정글|-]에 대한 책에서 나는 놀라운 그림 하나를 보았다.',
            '커다란 뱀이 [야생|野生] [동물|動物]을 통째로 삼키는 그림이었다.'
          ],
          [
            '나는 [연필|鉛筆]을 들고 내 [최초|最初]의 [작품|作品]을 그렸다.',
            '그리고 어른들에게 물었다. "이 그림이 [무섭|-]지 않나요?"',
            '어른들은 [대답|對答]했다. "모자가 왜 무섭니?"'
          ],
          [
            '내 그림은 모자가 아니었다.',
            '코끼리를 삼킨 뱀의 [내부|內部]를 그린 것이었다.',
            '나는 어른들이 [이해|理解]할 수 있게 [속|-]을 다시 그려 주어야 했다.'
          ],
          [
            '어른들은 늘 [설명|說明]을 [요구|要求]한다.',
            '그래서 나는 [화가|畫家]가 되려던 [희망|希望]을 접고,',
            '[비행기|飛行機] [조종|操縱]을 배워 [세계|世界] 곳곳을 날아다녔다.'
          ],
          [
            '어른이 된 뒤에도 나는 [가끔|-] 그 그림을 꺼내 보였다.',
            '하지만 누구도 코끼리를 알아보지 못했다.',
            '그럴 때마다 나는 [상대|相對]에게 [날씨|-] 이야기만 했다.'
          ]
        ]
      },
      {
        no: 2,
        title: '양 한 마리만 그려 줘',
        emoji: '🐑',
        paragraphs: [
          [
            '[육|六] 년 전, 내 [비행기|飛行機]가 [사막|沙漠] 한가운데 [고장|故障] 났다.',
            '[기계|機械]를 [수리|修理]할 사람도, 나눠 마실 물도 없었다.',
            '[식수|食水]는 [일|一] 주일 치가 [전부|全部]였다.'
          ],
          [
            '첫날 밤 나는 모래 위에서 잠이 들었다.',
            '사람이 사는 곳에서 [천|千] [리|里]나 떨어진 곳이었다.',
            '[대양|大洋] 한가운데 뗏목 위에 있는 것보다 더 [고독|孤獨]했다.'
          ],
          [
            '[해|-]가 뜰 무렵, 이상한 목소리가 나를 깨웠다.',
            '"[미안|未安]하지만... 양 한 마리만 그려 줘."',
            '나는 [순간|瞬間] 벌떡 일어났다.'
          ],
          [
            '눈앞에 아주 [특별|特別]한 [소년|少年]이 서 있었다.',
            '[사막|沙漠] 한가운데인데 [조금|-]도 [당황|唐慌]한 [기색|氣色]이 없었다.',
            '길을 잃은 아이 같지도, 지친 아이 같지도 않았다.'
          ],
          [
            '나는 [연필|鉛筆]을 꺼냈지만 그릴 줄 아는 것이 없었다.',
            '그래서 [예전|-]의 그 그림, 뱀의 [내부|內部]를 그려 보였다.',
            '그러자 [소년|少年]이 말했다. "코끼리를 삼킨 뱀이잖아!"'
          ],
          [
            '나는 [깜짝|-] 놀랐다.',
            '어른들이 여섯 살 때부터 [한|-] 번도 알아보지 못한 그림이었다.',
            '그날부터 나와 어린 [왕자|王子]의 [우정|友情]이 [시작|始作]되었다.'
          ]
        ]
      }
    ]
  }
];

/* ---------- 본문 파서 ----------
   "[사막|沙漠]에서" → [{ko:'사막', hanja:'沙漠'}, {text:'에서'}]
   [단어|-] 는 한자 없이 표시만 하는 낱말입니다.                       */
function parseStoryLine(line) {
  const tokens = [];
  const re = /\[([^\|\]]+)\|([^\]]*)\]/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push({ text: line.slice(last, m.index) });
    const hanja = m[2] === '-' ? '' : m[2];
    if (hanja) tokens.push({ ko: m[1], hanja: hanja });
    else tokens.push({ text: m[1] });
    last = re.lastIndex;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}

// 이야기에 쓰인 한자어 목록 (급수 정보 포함)
function getStoryWords(chapter) {
  const seen = {};
  const out = [];
  chapter.paragraphs.forEach(function (para) {
    para.forEach(function (line) {
      parseStoryLine(line).forEach(function (t) {
        if (!t.hanja || seen[t.hanja]) return;
        seen[t.hanja] = true;
        out.push({ ko: t.ko, hanja: t.hanja });
      });
    });
  });
  return out;
}

if (typeof window !== 'undefined') {
  window.STORIES = STORIES;
  window.parseStoryLine = parseStoryLine;
  window.getStoryWords = getStoryWords;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STORIES, parseStoryLine, getStoryWords };
}
