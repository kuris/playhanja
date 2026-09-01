/* ============================================================
   한자야 놀자! - 한자 학습 데이터
   초등 1학년부터 시작해 천자문 마스터까지! (총 135자)
   ============================================================ */

// 학습 단계(레벨) 정보 - 6단계 성장 체계
const LEVELS = [
  { id: 1, name: '씨앗 단계', badge: '🌱', desc: '가장 쉬운 기초 그림 한자 (상형자·지사자)' },
  { id: 2, name: '새싹 단계', badge: '🌿', desc: '자연과 몸, 기본 방향을 나타내는 한자' },
  { id: 3, name: '줄기 단계', badge: '🎍', desc: '두 글자가 합쳐져 새로운 뜻이 되는 한자' },
  { id: 4, name: '나무 단계', badge: '🌳', desc: '학교와 시간, 색깔을 나타내는 7급 한자' },
  { id: 5, name: '열매 단계', badge: '🍎', desc: '이야기와 부수가 풍부한 심화 한자' },
  { id: 6, name: '천자문 마스터', badge: '🎓', desc: '천자문의 깊은 울림과 명구를 배우는 최고 난이도 한자' }
];

// 카테고리(주제) 정보 - 11개 주제별 분류
const CATEGORIES = [
  { id: 'nature', name: '자연 & 요일', icon: '🌤️', color: '#2f9e6e', desc: '해, 달, 불, 물처럼 자연과 요일 이름 한자' },
  { id: 'number', name: '숫자 & 단위', icon: '🔢', color: '#3b82f6', desc: '하나부터 일만까지, 수와 양을 세는 한자' },
  { id: 'direction', name: '방향 & 위치', icon: '🧭', color: '#0ea5e9', desc: '동서남북과 앞뒤, 안팎을 나타내는 한자' },
  { id: 'body', name: '몸과 사람', icon: '🧍', color: '#f59e0b', desc: '얼굴, 손발, 마음 등 나와 사람을 나타내는 한자' },
  { id: 'family', name: '가족 & 이웃', icon: '👨‍👩‍👧', color: '#ef4444', desc: '부모님, 형제, 친구와 집을 나타내는 한자' },
  { id: 'season', name: '시간 & 계절', icon: '⏳', color: '#ec4899', desc: '아침과 밤, 사계절과 시간을 나타내는 한자' },
  { id: 'animal', name: '동물 & 식물', icon: '🐾', color: '#10b981', desc: '동물과 풀, 꽃, 숲을 나타내는 한자' },
  { id: 'color', name: '색깔 & 모양', icon: '🎨', color: '#8b5cf6', desc: '파랑, 하양 등 다채로운 색과 모양 한자' },
  { id: 'school', name: '학교 & 배움', icon: '🏫', color: '#6366f1', desc: '교실, 책, 글자처럼 배움터 속 한자' },
  { id: 'life', name: '생활 & 나라', icon: '🏠', color: '#14b8a6', desc: '자동차, 전기, 나라와 마을을 나타내는 한자' },
  { id: 'thousand', name: '천자문 명구', icon: '📜', color: '#d97706', desc: '천지현황, 우주홍황 등 천자문 명구 속 핵심 한자' }
];

/*
  각 한자 데이터 구조
  id       : 고유 아이디
  char     : 한자
  sound    : 한자의 소리(음)
  meaning  : 한자의 뜻(훈)
  category : 카테고리 id
  level    : 난이도(1~6)
  strokes  : 획수
  parts    : 애니메이션에 쓰이는 부수/구성 요소 배열
             { txt: 표시할 그림/이모지/글자, label: 짧은 이름, meaning: 설명, dir: 시작 방향(top, bottom, left, right, center) }
  story    : 한자가 만들어진 이야기(모든 부분이 합쳐진 뜻)
  words    : 실생활에서 자주 쓰는 낱말 예시 [{ word, reading, meaning }]
*/
const HANZI_DATA = [
  // ==========================================
  // 1. 자연 & 요일 (nature)
  // ==========================================
  { id:'h_day', char:'日', sound:'일', meaning:'해, 날', category:'nature', level:1, strokes:4,
    parts:[{ txt:'☀️', label:'해 모양', meaning:'둥근 해님 가운데 점을 찍어 빛나는 태양을 그렸어요.', dir:'center' }],
    story:'하늘에 높이 뜬 동그란 해의 모습을 본떠 그렸어요. 해가 한 번 뜨고 지면 하루가 지나므로 “해”와 “날(하루)”을 뜻해요.',
    words:[ {word:'日曜日', reading:'일요일', meaning:'한 주의 첫째 날'}, {word:'生日', reading:'생일', meaning:'태어난 날'}, {word:'日記', reading:'일기', meaning:'날마다 쓰는 기록'} ] },

  { id:'h_moon', char:'月', sound:'월', meaning:'달, 달 월', category:'nature', level:1, strokes:4,
    parts:[{ txt:'🌙', label:'초승달 모양', meaning:'둥글게 휘어진 어여쁜 초승달의 모습을 그렸어요.', dir:'center' }],
    story:'밤하늘에 은은하게 빛나는 초승달 모양을 그린 글자예요. 달이 차고 지는 주기로 한 달을 세었기에 “달”과 “월(달력)”을 뜻해요.',
    words:[ {word:'月曜日', reading:'월요일', meaning:'한 주의 둘째 날'}, {word:'月光', reading:'월광', meaning:'달빛'}, {word:'歲月', reading:'세월', meaning:'흘러가는 시간'} ] },

  { id:'h_fire', char:'火', sound:'화', meaning:'불', category:'nature', level:1, strokes:4,
    parts:[{ txt:'🔥', label:'타오르는 불꽃', meaning:'장작 위로 불꽃이 활활 치솟는 모습을 그렸어요.', dir:'center' }],
    story:'나무 장작 위로 붉은 불꽃이 위로 타오르는 모습을 그대로 그렸어요. 그래서 “불”을 뜻해요.',
    words:[ {word:'火曜日', reading:'화요일', meaning:'한 주의 셋째 날'}, {word:'火山', reading:'화산', meaning:'불을 뿜는 산'}, {word:'消火器', reading:'소화기', meaning:'불을 끄는 기구'} ] },

  { id:'h_water', char:'水', sound:'수', meaning:'물', category:'nature', level:1, strokes:4,
    parts:[{ txt:'💧', label:'굽이치는 물결', meaning:'시냇물이 굽이굽이 흘러가는 물줄기 모습을 그렸어요.', dir:'center' }],
    story:'강과 냇물이 졸졸 굽이치며 흘러가는 물결 모양을 그렸어요. 그래서 시원하고 맑은 “물”을 뜻해요.',
    words:[ {word:'水曜日', reading:'수요일', meaning:'한 주의 넷째 날'}, {word:'水泳', reading:'수영', meaning:'물에서 헤엄침'}, {word:'飮用水', reading:'음용수', meaning:'마시는 물'} ] },

  { id:'h_tree', char:'木', sound:'목', meaning:'나무', category:'nature', level:1, strokes:4,
    parts:[{ txt:'🌳', label:'서 있는 나무', meaning:'줄기 위로는 가지가 뻗고 아래로는 뿌리가 내린 모양이에요.', dir:'center' }],
    story:'땅속 깊이 뿌리를 내리고 하늘을 향해 가지를 펼친 나무의 온전한 모습을 그린 글자예요. 그래서 “나무”를 뜻해요.',
    words:[ {word:'木曜日', reading:'목요일', meaning:'한 주의 다섯째 날'}, {word:'植木日', reading:'식목일', meaning:'나무를 심는 날'}, {word:'木手', reading:'목수', meaning:'나무를 다루는 장인'} ] },

  { id:'h_gold', char:'金', sound:'금/김', meaning:'쇠, 금', category:'nature', level:3, strokes:8,
    parts:[
      { txt:'🏠', label:'지붕(亼)', meaning:'땅을 덮고 있는 흙더미 지붕 모양이에요.', dir:'top' },
      { txt:'🌱', label:'흙(土)', meaning:'흙 속에 묻혀 있음을 나타내요.', dir:'center' },
      { txt:'✨', label:'광물 알갱이(丷)', meaning:'흙 속에 반짝이는 쇳조각 알갱이예요.', dir:'bottom' }
    ],
    story:'흙(土) 깊은 곳에 묻혀 반짝반짝 빛나는 쇳조각과 금덩이를 캐내는 모습에서 “쇠”와 “금”을 뜻해요.',
    words:[ {word:'金曜日', reading:'금요일', meaning:'한 주의 여섯째 날'}, {word:'黃金', reading:'황금', meaning:'누런 금'}, {word:'金庫', reading:'금고', meaning:'귀한 물건을 넣는 통'} ] },

  { id:'h_earth', char:'土', sound:'토', meaning:'흙', category:'nature', level:1, strokes:3,
    parts:[{ txt:'🌱', label:'땅과 새싹', meaning:'단단한 땅(一) 위로 흙더미와 새싹(十)이 돋은 모양이에요.', dir:'center' }],
    story:'넓은 땅 위로 흙이 북돋아 있고 그 위로 생명이 싹터 오르는 모습을 그렸어요. 그래서 만물을 키워내는 “흙”을 뜻해요.',
    words:[ {word:'土曜日', reading:'토요일', meaning:'한 주의 일곱째 날'}, {word:'土地', reading:'토지', meaning:'땅'}, {word:'風土', reading:'풍토', meaning:'그 지방의 기후와 토양'} ] },

  { id:'h_mountain', char:'山', sound:'산', meaning:'산', category:'nature', level:1, strokes:3,
    parts:[{ txt:'⛰️', label:'우뚝 솟은 봉우리', meaning:'가운데 높은 봉우리와 양옆의 봉우리가 나란히 솟았어요.', dir:'center' }],
    story:'하늘 높이 솟아오른 뾰족뾰족한 세 산봉우리의 웅장한 윤곽을 그대로 본떠 “산”을 나타냈어요.',
    words:[ {word:'登山', reading:'등산', meaning:'산에 오름'}, {word:'山川', reading:'산천', meaning:'산과 시내'}, {word:'火山', reading:'화산', meaning:'불을 뿜는 산'} ] },

  { id:'h_river', char:'川', sound:'천', meaning:'내, 시내', category:'nature', level:1, strokes:3,
    parts:[{ txt:'🏞️', label:'세 줄기 시냇물', meaning:'물이 굽이치며 아래로 흘러내려 가는 물줄기 모양이에요.', dir:'center' }],
    story:'산골짜기에서 시작해 들판으로 굽이굽이 흘러가는 세 갈래 시냇물 줄기를 그려 “내(시내)”를 뜻해요.',
    words:[ {word:'河川', reading:'하천', meaning:'강과 시내'}, {word:'川邊', reading:'천변', meaning:'시냇가'}, {word:'淸溪川', reading:'청계천', meaning:'서울의 유명한 하천'} ] },

  { id:'h_sky', char:'天', sound:'천', meaning:'하늘', category:'nature', level:2, strokes:4,
    parts:[
      { txt:'一', label:'넓은 하늘선', meaning:'사람 머리 위로 아득히 펼쳐진 하늘이에요.', dir:'top' },
      { txt:'🧍', label:'큰 사람(大)', meaning:'두 팔과 다리를 벌리고 선 사람의 모습이에요.', dir:'bottom' }
    ],
    story:'사람(大)의 머리 위로 끝없이 넓고 푸르게 펼쳐진 우주와 공간을 가리켜 “하늘”을 나타냈어요.',
    words:[ {word:'天氣', reading:'천기', meaning:'날씨'}, {word:'天國', reading:'천국', meaning:'하늘나라'}, {word:'天體', reading:'천체', meaning:'우주의 모든 별'} ] },

  { id:'h_land', char:'地', sound:'지', meaning:'땅', category:'nature', level:3, strokes:6,
    parts:[
      { txt:'🌱', label:'흙(土)', meaning:'우리가 딛고 서 있는 흙이에요.', dir:'left' },
      { txt:'🐍', label:'굽이치는 땅(也)', meaning:'들판과 산줄기가 뱀처럼 길게 이어진 모습이에요.', dir:'right' }
    ],
    story:'흙(土)이 끝없이 굽이치며 넓게 펼쳐져 온갖 생명을 품어 안는 “땅”을 나타낸 글자예요.',
    words:[ {word:'地圖', reading:'지도', meaning:'땅의 모양을 그린 그림'}, {word:'地下', reading:'지하', meaning:'땅의 아래'}, {word:'地球', reading:'지구', meaning:'우리가 사는 행성'} ] },

  { id:'h_rain', char:'雨', sound:'우', meaning:'비', category:'nature', level:3, strokes:8,
    parts:[
      { txt:'☁️', label:'하늘과 구름(一/冂)', meaning:'하늘에 먹구름이 가득 차 있는 모습이에요.', dir:'top' },
      { txt:'💧', label:'떨어지는 빗방울(丨/::::)', meaning:'구름 속에서 빗방울이 후수수 떨어져요.', dir:'bottom' }
    ],
    story:'하늘을 뒤덮은 짙은 먹구름 사이로 투명한 빗방울들이 땅으로 떨어지는 모습을 그대로 그려 “비”를 뜻해요.',
    words:[ {word:'雨傘', reading:'우산', meaning:'비를 가리는 도구'}, {word:'雨天', reading:'우천', meaning:'비가 오는 날씨'}, {word:'暴雨', reading:'폭우', meaning:'갑자기 쏟아지는 큰비'} ] },

  { id:'h_snow', char:'雪', sound:'설', meaning:'눈', category:'nature', level:4, strokes:11,
    parts:[
      { txt:'🌧️', label:'비(雨)', meaning:'하늘에서 떨어지는 차가운 얼음 알갱이예요.', dir:'top' },
      { txt:'🧹', label:'손으로 비질(彐)', meaning:'손으로 빗자루를 쥐고 쓸어 담는 모습이에요.', dir:'bottom' }
    ],
    story:'하늘에서 비(雨)처럼 내려와 땅에 소복이 쌓여 손으로 빗자루질(彐)해 쓸어 담을 수 있는 하얀 “눈”을 뜻해요.',
    words:[ {word:'雪山', reading:'설산', meaning:'눈 덮인 산'}, {word:'白雪', reading:'백설', meaning:'하얀 눈'}, {word:'大雪', reading:'대설', meaning:'아주 많이 내리는 눈'} ] },

  { id:'h_river_big', char:'江', sound:'강', meaning:'강', category:'nature', level:3, strokes:6,
    parts:[
      { txt:'💧', label:'물(氵/水)', meaning:'도도하게 흐르는 물이에요.', dir:'left' },
      { txt:'🛠️', label:'장인 공(工)', meaning:'큰 공사처럼 넓고 웅장하게 이어진 모양이에요.', dir:'right' }
    ],
    story:'맑은 물(氵)이 큰 물줄기를 이루며 끝없이 흘러 바다로 향하는 큰 “강”을 뜻해요.',
    words:[ {word:'江邊', reading:'강변', meaning:'강의 가장자리'}, {word:'漢江', reading:'한강', meaning:'서울을 가로지르는 큰 강'}, {word:'江山', reading:'강산', meaning:'강과 산, 우리 강토'} ] },

  { id:'h_sea', char:'海', sound:'해', meaning:'바다', category:'nature', level:4, strokes:9,
    parts:[
      { txt:'💧', label:'물(氵/水)', meaning:'끝없이 넓은 물결이에요.', dir:'left' },
      { txt:'🤱', label:'어머니(每)', meaning:'모든 물을 품어주는 어머니 같은 모습이에요.', dir:'right' }
    ],
    story:'모든 강물(氵)을 어머니(每)처럼 넓고 깊은 품으로 다 받아들이는 거대한 푸른 “바다”를 뜻해요.',
    words:[ {word:'海洋', reading:'해양', meaning:'넓은 바다'}, {word:'海邊', reading:'해변', meaning:'바닷가'}, {word:'東海', reading:'동해', meaning:'우리나라 동쪽 바다'} ] },

  // ==========================================
  // 2. 숫자 & 단위 (number)
  // ==========================================
  { id:'h_1', char:'一', sound:'일', meaning:'하나', category:'number', level:1, strokes:1,
    parts:[{ txt:'①', label:'가로 획 한 개', meaning:'손가락 하나를 눕힌 모양으로 가장 완벽한 시작이에요.', dir:'center' }],
    story:'손가락 하나를 옆으로 곧게 눕힌 모양에서 모든 숫자의 시작인 “하나(1)”를 나타냈어요.',
    words:[ {word:'一等', reading:'일등', meaning:'첫째 등수'}, {word:'第一', reading:'제일', meaning:'가장 첫째'}, {word:'統一', reading:'통일', meaning:'하나로 합침'} ] },

  { id:'h_2', char:'二', sound:'이', meaning:'둘', category:'number', level:1, strokes:2,
    parts:[{ txt:'②', label:'가로 획 두 개', meaning:'하늘과 땅처럼 나란히 그은 두 개의 선이에요.', dir:'center' }],
    story:'가로선 두 개를 나란히 그려 손가락 두 개 또는 짝을 이루는 “둘(2)”을 나타냈어요.',
    words:[ {word:'二月', reading:'이월', meaning:'두 번째 달'}, {word:'二十', reading:'이십', meaning:'스물'}, {word:'二重', reading:'이중', meaning:'두 겹으로 됨'} ] },

  { id:'h_3', char:'三', sound:'삼', meaning:'셋', category:'number', level:1, strokes:3,
    parts:[{ txt:'③', label:'가로 획 세 개', meaning:'하늘, 사람, 땅의 조화를 나타내는 세 개의 선이에요.', dir:'center' }],
    story:'가로선 세 개를 층층이 나란히 그어 손가락 세 개와 완성을 뜻하는 “셋(3)”을 나타냈어요.',
    words:[ {word:'三角形', reading:'삼각형', meaning:'세 각을 가진 도형'}, {word:'三寸', reading:'삼촌', meaning:'아버지의 형제'}, {word:'三月', reading:'삼월', meaning:'세 번째 달'} ] },

  { id:'h_4', char:'四', sound:'사', meaning:'넷', category:'number', level:2, strokes:5,
    parts:[
      { txt:'🔲', label:'네모난 울타리(囗)', meaning:'사방을 둘러싼 테두리 모양이에요.', dir:'center' },
      { txt:'🌬️', label:'나뉘는 숨결(八/儿)', meaning:'코나 입으로 숨을 내쉬며 나뉘는 모습이에요.', dir:'bottom' }
    ],
    story:'사방 테두리(囗) 안에서 숨결이 고르게 사방으로 갈라져 나가는 모습에서 “넷(4)”을 나타냈어요.',
    words:[ {word:'四方', reading:'사방', meaning:'동서남북 네 방향'}, {word:'四季', reading:'사계', meaning:'네 계절'}, {word:'四角形', reading:'사각형', meaning:'네 모난 도형'} ] },

  { id:'h_5', char:'五', sound:'오', meaning:'다섯', category:'number', level:1, strokes:4,
    parts:[{ txt:'⑤', label:'위아래와 교차선', meaning:'하늘과 땅 사이에서 기운이 서로 엇갈리는 모양이에요.', dir:'center' }],
    story:'하늘(위의 一)과 땅(아래의 一) 사이에서 다섯 가지 원소가 서로 교차(X)하는 모습으로 “다섯(5)”을 뜻해요.',
    words:[ {word:'五感', reading:'오감', meaning:'다섯 가지 감각'}, {word:'五月', reading:'오월', meaning:'다섯 번째 달'}, {word:'五穀', reading:'오곡', meaning:'다섯 가지 곡식'} ] },

  { id:'h_6', char:'六', sound:'육', meaning:'여섯', category:'number', level:1, strokes:4,
    parts:[
      { txt:'⛺', label:'집 지붕(亠)', meaning:'작은 오두막의 지붕 모양이에요.', dir:'top' },
      { txt:'🧍', label:'나뉘는 기둥(八)', meaning:'양쪽으로 튼튼하게 나뉜 기둥이에요.', dir:'bottom' }
    ],
    story:'오두막집 모양을 본떠 만든 글자로, 손가락을 꼽아 세는 순서에서 “여섯(6)”을 가리키게 되었어요.',
    words:[ {word:'六角形', reading:'육각형', meaning:'여섯 모가 난 도형'}, {word:'六月', reading:'유월', meaning:'여섯 번째 달'}, {word:'六親', reading:'육친', meaning:'가까운 여섯 친척'} ] },

  { id:'h_7', char:'七', sound:'칠', meaning:'일곱', category:'number', level:1, strokes:2,
    parts:[{ txt:'✂️', label:'자르고 굽은 선', meaning:'선을 긋고 아래로 살짝 구부려 끊어낸 모양이에요.', dir:'center' }],
    story:'가로선을 세로로 자르며 아래로 삐친 모습에서 숫자 “일곱(7)”을 나타낸 글자예요.',
    words:[ {word:'七夕', reading:'칠석', meaning:'음력 7월 7일'}, {word:'七十', reading:'칠십', meaning:'일흔'}, {word:'七寶', reading:'칠보', meaning:'일곱 가지 보물'} ] },

  { id:'h_8', char:'八', sound:'팔', meaning:'여덟', category:'number', level:1, strokes:2,
    parts:[{ txt:'👐', label:'양쪽으로 갈라짐', meaning:'두 손을 벌리듯 선 두 개가 반대로 갈라져요.', dir:'center' }],
    story:'하나의 물건이 반으로 쪼개져 양쪽으로 등돌려 나뉘는 모양에서 “여덟(8)”을 뜻하게 되었어요.',
    words:[ {word:'八月', reading:'팔월', meaning:'여덟 번째 달'}, {word:'四通八達', reading:'사통팔달', meaning:'사방으로 통함'}, {word:'八字', reading:'팔자', meaning:'사람의 운수'} ] },

  { id:'h_9', char:'九', sound:'구', meaning:'아홉', category:'number', level:1, strokes:2,
    parts:[{ txt:'🦾', label:'구부린 팔꿈치', meaning:'사람의 팔을 굽혀 끝까지 밀어올리는 모습이에요.', dir:'center' }],
    story:'팔꿈치를 굽혀 끝까지 힘을 다해 뻗는 모습으로 한 자리 수의 가장 끝이자 큰 수인 “아홉(9)”을 나타냈어요.',
    words:[ {word:'九月', reading:'구월', meaning:'아홉 번째 달'}, {word:'九十', reading:'구십', meaning:'아흔'}, {word:'九死一生', reading:'구사일생', meaning:'죽을 고비에서 살아남'} ] },

  { id:'h_10', char:'十', sound:'십', meaning:'열', category:'number', level:1, strokes:2,
    parts:[{ txt:'🔟', label:'가로와 세로의 만남', meaning:'동서(一)와 남북(丨)이 하나로 온전히 묶인 십자예요.', dir:'center' }],
    story:'가로선과 세로선이 정중앙에서 만나 동서남북 사방이 꽉 찬 완성을 뜻하는 “열(10)”을 나타냈어요.',
    words:[ {word:'十字架', reading:'십자가', meaning:'열 십자 모양의 틀'}, {word:'十月', reading:'시월', meaning:'열 번째 달'}, {word:'十分', reading:'십분', meaning:'아주 넉넉하게'} ] },

  { id:'h_100', char:'百', sound:'백', meaning:'일백, 백', category:'number', level:3, strokes:6,
    parts:[
      { txt:'一', label:'하나의 선', meaning:'모든 수의 기준을 세워요.', dir:'top' },
      { txt:'🗣️', label:'흰 백/말할 백(白)', meaning:'말을 명백하게 다 하여 채운 모습이에요.', dir:'bottom' }
    ],
    story:'하나(一)부터 시작해 백 번을 말하고(白) 가득 채운 큰 수라는 뜻에서 “일백(100)”을 뜻해요.',
    words:[ {word:'百萬', reading:'백만', meaning:'백만(1,000,000)'}, {word:'百貨店', reading:'백화점', meaning:'온갖 물건을 파는 가게'}, {word:'百年', reading:'백년', meaning:'백 해, 긴 세월'} ] },

  { id:'h_1000', char:'千', sound:'천', meaning:'일천, 천', category:'number', level:3, strokes:3,
    parts:[
      { txt:'🧍', label:'사람(人)', meaning:'많은 사람이 모여 있는 모습이에요.', dir:'top' },
      { txt:'十', label:'열(十)', meaning:'사람 몸에 선(一)을 더해 곱절로 커짐을 나타내요.', dir:'bottom' }
    ],
    story:'사람(人) 몸에 표식을 더해 백보다 열 배나 더 많은 수많은 사람의 수, 즉 “일천(1,000)”을 나타냈어요.',
    words:[ {word:'千里馬', reading:'천리마', meaning:'하루에 천 리를 달리는 명마'}, {word:'千萬', reading:'천만', meaning:'천만, 무수히 많음'}, {word:'千秋', reading:'천추', meaning:'오랜 세월'} ] },

  { id:'h_10000', char:'萬', sound:'만', meaning:'일만, 만', category:'number', level:4, strokes:13,
    parts:[
      { txt:'🦂', label:'전갈의 집게발(艹)', meaning:'전갈의 머리와 앞발 모습이에요.', dir:'top' },
      { txt:'🪲', label:'전갈의 몸통과 꼬리(禺)', meaning:'알을 수만 개씩 낳는 전갈의 몸이에요.', dir:'bottom' }
    ],
    story:'한 번에 수없이 많은 새끼를 낳아 번성하는 전갈의 모습을 본떠 헤아릴 수 없이 큰 수 “일만(10,000)”을 뜻해요.',
    words:[ {word:'萬歲', reading:'만세', meaning:'만년토록 삶, 기쁨의 외침'}, {word:'萬里長城', reading:'만리장성', meaning:'만 리나 되는 긴 성벽'}, {word:'萬事', reading:'만사', meaning:'모든 일'} ] },

  // ==========================================
  // 3. 방향 & 위치 (direction)
  // ==========================================
  { id:'h_east', char:'東', sound:'동', meaning:'동녘, 동쪽', category:'direction', level:3, strokes:8,
    parts:[
      { txt:'🌳', label:'나무(木)', meaning:'푸른 나무의 줄기와 가지예요.', dir:'center' },
      { txt:'☀️', label:'떠오르는 해(日)', meaning:'나무 뒤로 붉은 해가 솟아올라요.', dir:'center' }
    ],
    story:'아침에 울창한 숲속 나무(木) 뒤로 붉은 해(日)가 둥실 솟아오르는 방향인 “동쪽”을 나타낸 글자예요.',
    words:[ {word:'東洋', reading:'동양', meaning:'아시아 여러 나라'}, {word:'東門', reading:'동문', meaning:'동쪽에 있는 문'}, {word:'東風', reading:'동풍', meaning:'동쪽에서 부는 바람'} ] },

  { id:'h_west', char:'西', sound:'서', meaning:'서녘, 서쪽', category:'direction', level:3, strokes:6,
    parts:[{ txt:'🪹', label:'둥지에 앉은 새', meaning:'해 질 녘에 새가 둥지로 돌아와 깃든 모습이에요.', dir:'center' }],
    story:'하루 종일 날아다니던 새가 해가 뉘엿뉘엿 질 때 둥지로 깃드는 방향이라는 뜻에서 “서쪽”을 나타냈어요.',
    words:[ {word:'西洋', reading:'서양', meaning:'유럽과 아메리카 여러 나라'}, {word:'西海', reading:'서해', meaning:'서쪽 바다'}, {word:'西風', reading:'서풍', meaning:'서쪽에서 부는 바람'} ] },

  { id:'h_south', char:'南', sound:'남', meaning:'남녘, 남쪽', category:'direction', level:3, strokes:9,
    parts:[
      { txt:'🌿', label:'초목의 싹(十/冂)', meaning:'따스한 남쪽 햇살을 받아 자라는 풀이에요.', dir:'top' },
      { txt:'🪘', label:'악기 모양(羊/干)', meaning:'남방의 악기처럼 따스하고 풍요로운 울림이에요.', dir:'bottom' }
    ],
    story:'따뜻한 햇살이 비추어 초목이 울창하게 자라나고 풍악을 울리는 포근한 방향인 “남쪽”을 나타냈어요.',
    words:[ {word:'南極', reading:'남극', meaning:'지구의 가장 남쪽 끝'}, {word:'江南', reading:'강남', meaning:'강의 남쪽 지역'}, {word:'南山', reading:'남산', meaning:'남쪽에 있는 산'} ] },

  { id:'h_north', char:'北', sound:'북', meaning:'북녘, 북쪽', category:'direction', level:3, strokes:5,
    parts:[
      { txt:'🧍', label:'왼쪽 사람(匕)', meaning:'차가운 바람을 피해 등을 돌린 사람이에요.', dir:'left' },
      { txt:'🧍', label:'오른쪽 사람', meaning:'서로 등을 맞대고 추위를 견디는 모습이에요.', dir:'right' }
    ],
    story:'두 사람이 차가운 겨울바람을 피해 서로 등을 돌리고(背) 서 있는 모습에서 춥고 시린 “북쪽”을 뜻해요.',
    words:[ {word:'北極', reading:'북극', meaning:'지구의 가장 북쪽 끝'}, {word:'南北', reading:'남북', meaning:'남쪽과 북쪽'}, {word:'北風', reading:'북풍', meaning:'북쪽에서 불어오는 찬 바람'} ] },

  { id:'h_up', char:'上', sound:'상', meaning:'위', category:'direction', level:1, strokes:3,
    parts:[{ txt:'⬆️', label:'기준선과 위쪽 점', meaning:'기준선(一) 위에 기둥을 세우고 위를 가리켰어요.', dir:'center' }],
    story:'땅이나 기준이 되는 선(一)을 긋고, 그보다 높은 위쪽에 획을 더해 “위”라는 방향을 나타냈어요.',
    words:[ {word:'上下', reading:'상하', meaning:'위와 아래'}, {word:'地上', reading:'지상', meaning:'땅의 위'}, {word:'上級', reading:'상급', meaning:'높은 계급이나 학년'} ] },

  { id:'h_down', char:'下', sound:'하', meaning:'아래', category:'direction', level:1, strokes:3,
    parts:[{ txt:'⬇️', label:'기준선과 아래쪽 점', meaning:'기준선(一) 아래로 기둥을 내리고 아래를 가리켰어요.', dir:'center' }],
    story:'기준이 되는 선(一)을 긋고, 그보다 낮은 아래쪽에 획을 그어 바닥 쪽인 “아래”를 나타냈어요.',
    words:[ {word:'地下', reading:'지하', meaning:'땅의 밑'}, {word:'下車', reading:'하차', meaning:'차에서 내림'}, {word:'降下', reading:'강하', meaning:'아래로 내려옴'} ] },

  { id:'h_left', char:'左', sound:'좌', meaning:'왼쪽', category:'direction', level:2, strokes:5,
    parts:[
      { txt:'🤚', label:'손 모양(𠂇)', meaning:'왼손을 펼쳐 뻗은 모습이에요.', dir:'top' },
      { txt:'📐', label:'도구 자(工)', meaning:'자로 길이를 재며 일을 돕는 도구예요.', dir:'bottom' }
    ],
    story:'왼손(𠂇)으로 자나 도구(工)를 쥐고 오른손이 하는 일을 옆에서 돕는 위치라는 뜻에서 “왼쪽”을 나타냈어요.',
    words:[ {word:'左右', reading:'좌우', meaning:'왼쪽과 오른쪽'}, {word:'左側', reading:'좌측', meaning:'왼쪽 편'}, {word:'左回轉', reading:'좌회전', meaning:'왼쪽으로 돎'} ] },

  { id:'h_right', char:'右', sound:'우', meaning:'오른쪽', category:'direction', level:2, strokes:5,
    parts:[
      { txt:'🤚', label:'손 모양(𠂇)', meaning:'오른손을 뻗은 모습이에요.', dir:'top' },
      { txt:'👄', label:'입(口)', meaning:'맛있는 음식을 먹는 입이에요.', dir:'bottom' }
    ],
    story:'음식을 집어 입(口)으로 가져가는 데 주로 쓰는 익숙한 손(𠂇)이라는 뜻에서 “오른쪽”을 나타냈어요.',
    words:[ {word:'右側', reading:'우측', meaning:'오른쪽 편'}, {word:'右往左往', reading:'우왕좌왕', meaning:'갈팡질팡함'}, {word:'右回轉', reading:'우회전', meaning:'오른쪽으로 돎'} ] },

  { id:'h_middle', char:'中', sound:'중', meaning:'가운데', category:'direction', level:1, strokes:4,
    parts:[{ txt:'🎯', label:'깃발과 한가운데', meaning:'네모난 과녁 한가운데에 깃대를 똑바로 꽂았어요.', dir:'center' }],
    story:'네모난 공간이나 과녁의 정중앙을 세로로 곧게 꿰뚫은 깃대의 모양을 그려 “가운데”를 나타냈어요.',
    words:[ {word:'中心', reading:'중심', meaning:'한가운데'}, {word:'學校中', reading:'학중', meaning:'학교 안'}, {word:'中間', reading:'중간', meaning:'사이에 있는 곳'} ] },

  { id:'h_front', char:'前', sound:'전', meaning:'앞, 먼저', category:'direction', level:3, strokes:9,
    parts:[
      { txt:'🦶', label:'발자국(止/𣦵)', meaning:'앞을 향해 뚜벅뚜벅 걸어가는 발이에요.', dir:'top' },
      { txt:'⛵', label:'배(舟/月)', meaning:'물살을 가르며 앞으로 나아가는 배예요.', dir:'bottom' },
      { txt:'🔪', label:'나아감(刂)', meaning:'장애물을 헤치고 길을 뚫어요.', dir:'right' }
    ],
    story:'배(舟)를 타고 물살을 가르며 남들보다 먼저 발(止)을 딛고 나아가는 자리인 “앞”과 “먼저”를 뜻해요.',
    words:[ {word:'前進', reading:'전진', meaning:'앞으로 나아감'}, {word:'以前', reading:'이전', meaning:'그 전의 때'}, {word:'前方', reading:'전방', meaning:'앞쪽 방향'} ] },

  { id:'h_back', char:'後', sound:'후', meaning:'뒤, 나중', category:'direction', level:3, strokes:9,
    parts:[
      { txt:'🚶', label:'천천히 걷기(彳)', meaning:'길을 조심스럽게 걸어가는 모습이에요.', dir:'left' },
      { txt:'🧶', label:'끈에 묶임(幺)', meaning:'작은 끈에 발목이 얽매인 모양이에요.', dir:'center' },
      { txt:'🦶', label:'뒤처진 발(夂)', meaning:'발걸음이 늦어 뒤따라가는 발이에요.', dir:'right' }
    ],
    story:'발목에 끈이 얽혀(幺) 다른 사람들보다 느린 걸음(彳)으로 뒤따라오는(夂) 모습에서 “뒤”와 “나중”을 뜻해요.',
    words:[ {word:'前後', reading:'전후', meaning:'앞과 뒤'}, {word:'午後', reading:'오후', meaning:'낮 열두 시 뒤'}, {word:'後輩', reading:'후배', meaning:'나중에 들어온 사람'} ] },

  { id:'h_in', char:'內', sound:'내', meaning:'안, 속', category:'direction', level:2, strokes:4,
    parts:[
      { txt:'🏠', label:'집 안으로 들어감(冂)', meaning:'문이나 집의 안쪽 공간이에요.', dir:'center' },
      { txt:'🚶', label:'들어갈 입(入)', meaning:'바깥에서 안으로 쏙 들어가는 모습이에요.', dir:'center' }
    ],
    story:'집이나 방 안(冂)으로 사람이나 물건이 쏙 들어가는(入) 모습에서 “안”과 “속”을 뜻해요.',
    words:[ {word:'室內', reading:'실내', meaning:'방 안'}, {word:'國內', reading:'국내', meaning:'나라 안'}, {word:'內容', reading:'내용', meaning:'속에 담긴 것'} ] },

  { id:'h_out', char:'外', sound:'외', meaning:'밖, 바깥', category:'direction', level:2, strokes:5,
    parts:[
      { txt:'🌙', label:'저녁 석(夕)', meaning:'해가 지고 어둠이 깔리는 저녁이에요.', dir:'left' },
      { txt:'🔮', label:'점칠 복(卜)', meaning:'불에 거북등을 지져 점괘를 보는 모양이에요.', dir:'right' }
    ],
    story:'보통 아침에 점을 치는데 저녁(夕) 늦게 점(卜)을 치는 것은 통례에서 벗어났다는 뜻에서 “밖”과 “겉”을 뜻해요.',
    words:[ {word:'外國', reading:'외국', meaning:'다른 나라'}, {word:'屋外', reading:'옥외', meaning:'집 밖'}, {word:'例外', reading:'예외', meaning:'규칙 밖의 일'} ] },

  // ==========================================
  // 4. 몸과 사람 (body)
  // ==========================================
  { id:'h_person', char:'人', sound:'인', meaning:'사람', category:'body', level:1, strokes:2,
    parts:[{ txt:'🧍', label:'서 있는 사람', meaning:'두 다리로 당당히 대지를 딛고 선 사람의 옆모습이에요.', dir:'center' }],
    story:'두 다리를 벌리고 허리를 꼿꼿이 세워 직립보행하는 사람의 옆모습을 간결하게 그려 “사람”을 나타냈어요.',
    words:[ {word:'人間', reading:'인간', meaning:'사람'}, {word:'人形', reading:'인형', meaning:'사람 모양의 장난감'}, {word:'偉人', reading:'위인', meaning:'훌륭한 사람'} ] },

  { id:'h_big', char:'大', sound:'대', meaning:'크다, 큰', category:'body', level:1, strokes:3,
    parts:[{ txt:'🙆', label:'팔다리를 벌린 사람', meaning:'사람이 두 팔과 두 다리를 최대한 넓게 펼쳤어요.', dir:'center' }],
    story:'사람(人)이 양팔과 두 다리를 있는 힘껏 활짝 벌려 몸집을 가장 크게 만든 모습에서 “크다”를 나타냈어요.',
    words:[ {word:'大人', reading:'대인', meaning:'어른, 마음이 넓은 사람'}, {word:'大門', reading:'대문', meaning:'큰 문'}, {word:'大會', reading:'대회', meaning:'큰 모임'} ] },

  { id:'h_small', char:'小', sound:'소', meaning:'작다, 작은', category:'body', level:1, strokes:3,
    parts:[{ txt:'✨', label:'작은 모래알 세 개', meaning:'미세한 알갱이 세 개가 쪼개져 흩어진 모습이에요.', dir:'center' }],
    story:'작은 모래알이나 물건을 쪼개어 아주 가늘고 작은 알갱이로 나눈 모양에서 “작다”를 나타냈어요.',
    words:[ {word:'小學校', reading:'초등학교', meaning:'초등 교육 기관'}, {word:'少女', reading:'소녀', meaning:'어린 여자아이'}, {word:'小人', reading:'소인', meaning:'어린아이'} ] },

  { id:'h_woman', char:'女', sound:'녀(여)', meaning:'여자, 계집', category:'body', level:1, strokes:3,
    parts:[{ txt:'🙇‍♀️', label:'소복이 앉은 여인', meaning:'두 손을 공손히 모으고 무릎 꿇어 앉은 모습이에요.', dir:'center' }],
    story:'두 손을 앞으로 가지런히 모으고 다소곳하게 무릎을 꿇고 앉아 있는 여인의 아름다운 모습을 본떠 “여자”를 나타냈어요.',
    words:[ {word:'女子', reading:'여자', meaning:'여성'}, {word:'女優', reading:'여우', meaning:'여자 배우'}, {word:'王女', reading:'왕녀', meaning:'임금의 딸, 공주'} ] },

  { id:'h_man', char:'男', sound:'남', meaning:'사내, 남자', category:'body', level:3, strokes:7,
    parts:[
      { txt:'🌾', label:'밭 전(田)', meaning:'농사를 짓는 네모난 밭이에요.', dir:'top' },
      { txt:'💪', label:'힘 력(力)', meaning:'쟁기를 쥐고 힘쓰는 튼튼한 팔뚝이에요.', dir:'bottom' }
    ],
    story:'밭(田)에 나가 쟁기를 잡고 힘(力)차게 땀 흘려 일하는 씩씩한 사람이라는 뜻에서 “사내, 남자”를 나타냈어요.',
    words:[ {word:'男子', reading:'남자', meaning:'남성'}, {word:'男妹', reading:'남매', meaning:'오빠와 누이'}, {word:'長男', reading:'장남', meaning:'첫째 아들'} ] },

  { id:'h_child', char:'子', sound:'자', meaning:'아들, 아이', category:'body', level:1, strokes:3,
    parts:[{ txt:'👶', label:'포대기 속 아기', meaning:'머리가 크고 두 팔을 흔들며 다리는 감싼 아기예요.', dir:'center' }],
    story:'포대기에 싸여 두 팔을 바둥거리는 귀여운 어린 아기의 모습을 본떠 “아이”와 “아들”을 나타냈어요.',
    words:[ {word:'子女', reading:'자녀', meaning:'아들과 딸'}, {word:'王子', reading:'왕자', meaning:'임금의 아들'}, {word:'帽子', reading:'모자', meaning:'머리에 쓰는 것'} ] },

  { id:'h_hand', char:'手', sound:'수', meaning:'손', category:'body', level:1, strokes:4,
    parts:[{ txt:'✋', label:'펼친 다섯 손가락', meaning:'손바닥과 손목, 다섯 개 손가락의 뼈마디 모양이에요.', dir:'center' }],
    story:'다섯 손가락을 쫙 펴고 있는 손바닥과 손목의 선을 그대로 그려 만능 도구인 “손”을 나타냈어요.',
    words:[ {word:'手話', reading:'수화', meaning:'손으로 하는 말'}, {word:'握手', reading:'악수', meaning:'손을 마주 잡음'}, {word:'選手', reading:'선수', meaning:'경기하는 사람'} ] },

  { id:'h_foot', char:'足', sound:'족', meaning:'발, 넉넉할', category:'body', level:2, strokes:7,
    parts:[
      { txt:'🦵', label:'무릎(口)', meaning:'다리의 둥근 무릎뼈 모습이에요.', dir:'top' },
      { txt:'🦶', label:'종아리와 발바닥(止)', meaning:'발목과 발바닥이 땅을 디딘 모습이에요.', dir:'bottom' }
    ],
    story:'무릎에서부터 발목, 땅을 힘차게 딛고 서 있는 발바닥까지의 온 다리를 그려 “발”을 나타냈어요.',
    words:[ {word:'手足', reading:'수족', meaning:'손과 발'}, {word:'遠足', reading:'원족(소풍)', meaning:'멀리 걸어감'}, {word:'滿足', reading:'만족', meaning:'마음에 참'} ] },

  { id:'h_eye', char:'目', sound:'목', meaning:'눈', category:'body', level:2, strokes:5,
    parts:[{ txt:'👁️', label:'동그란 눈동자', meaning:'눈꺼풀 속에 까만 눈동자가 들어 있는 모양을 세워 그렸어요.', dir:'center' }],
    story:'사람의 눈과 가운데 까만 눈동자의 모양을 본뜬 글자예요. 글씨를 쓰기 편하게 세로로 세워 “눈”을 나타냈어요.',
    words:[ {word:'科目', reading:'과목', meaning:'공부하는 갈래'}, {word:'注目', reading:'주목', meaning:'눈길을 모음'}, {word:'目標', reading:'목표', meaning:'이루려는 기준'} ] },

  { id:'h_ear', char:'耳', sound:'이', meaning:'귀', category:'body', level:2, strokes:6,
    parts:[{ txt:'👂', label:'귓바퀴와 귓구멍', meaning:'소리를 모으는 오목한 귓바퀴의 굴곡을 그렸어요.', dir:'center' }],
    story:'사람 머리 양옆에서 온갖 소리를 듣는 귓바퀴의 부드러운 굴곡과 귓불 모양을 본떠 “귀”를 나타냈어요.',
    words:[ {word:'耳目', reading:'이목', meaning:'귀와 눈, 남의 관심'}, {word:'中耳炎', reading:'중이염', meaning:'귀에 나는 염증'}, {word:'耳鳴', reading:'이명', meaning:'귀울림'} ] },

  { id:'h_mouth', char:'口', sound:'구', meaning:'입', category:'body', level:1, strokes:3,
    parts:[{ txt:'👄', label:'벌린 입술', meaning:'말하고 밥을 먹는 둥글게 벌린 입 모양이에요.', dir:'center' }],
    story:'말을 하거나 음식을 먹기 위해 활짝 벌린 사람의 입 모양을 네모나게 그려 “입”을 나타냈어요.',
    words:[ {word:'入口', reading:'입구', meaning:'들어가는 문'}, {word:'人口', reading:'인구', meaning:'사람의 수'}, {word:'出口', reading:'출구', meaning:'나가는 문'} ] },

  { id:'h_heart', char:'心', sound:'심', meaning:'마음, 심장', category:'body', level:1, strokes:4,
    parts:[{ txt:'❤️', label:'두근대는 심장', meaning:'가슴속에서 콩닥콩닥 피를 뿜는 심장의 판막과 핏줄이에요.', dir:'center' }],
    story:'가슴 한가운데서 두근두근 뛰는 붉은 심장의 모양을 본떠, 사람의 생각과 감정이 샘솟는 “마음”을 나타냈어요.',
    words:[ {word:'中心', reading:'중심', meaning:'한가운데'}, {word:'安心', reading:'안심', meaning:'마음이 편안함'}, {word:'心理', reading:'심리', meaning:'마음의 작용'} ] },

  { id:'h_body', char:'身', sound:'신', meaning:'몸', category:'body', level:3, strokes:7,
    parts:[{ txt:'🤰', label:'배가 부른 사람', meaning:'아기를 품어 불룩 나온 사람의 옆모습이에요.', dir:'center' }],
    story:'새 생명을 품어 배가 볼록하게 나온 사람의 옆태를 본떠 생명을 담고 있는 소중한 “몸”을 나타냈어요.',
    words:[ {word:'身體', reading:'신체', meaning:'사람의 몸'}, {word:'自身', reading:'자신', meaning:'자기 몸, 나'}, {word:'出身', reading:'출신', meaning:'자라난 곳'} ] },

  { id:'h_face', char:'面', sound:'면', meaning:'낯, 얼굴, 면', category:'body', level:3, strokes:9,
    parts:[
      { txt:'🔲', label:'얼굴 윤곽(𦣻)', meaning:'이마와 턱까지 둥근 얼굴 테두리예요.', dir:'top' },
      { txt:'👁️', label:'눈(目)', meaning:'얼굴 한가운데 반짝이는 눈동자예요.', dir:'center' }
    ],
    story:'사람의 이마와 턱, 뺨으로 이어지는 얼굴 윤곽 속에 눈(目)이 담겨 있는 모습을 그려 “얼굴(낯)”과 “표면”을 뜻해요.',
    words:[ {word:'面會', reading:'면회', meaning:'직접 만나 봄'}, {word:'前面', reading:'전면', meaning:'앞쪽 얼굴'}, {word:'地面', reading:'지면', meaning:'땅의 겉면'} ] },

  // ==========================================
  // 5. 가족 & 이웃 (family)
  // ==========================================
  { id:'h_father', char:'父', sound:'부', meaning:'아버지', category:'family', level:1, strokes:4,
    parts:[{ txt:'🪓', label:'도끼를 든 손', meaning:'가족을 지키고 일하기 위해 돌도끼를 쥔 손이에요.', dir:'center' }],
    story:'손에 도끼나 도구를 굳세게 쥐고 밖에서 땀 흘려 가족을 돌보고 지키시는 든든한 “아버지”를 나타낸 글자예요.',
    words:[ {word:'父母', reading:'부모', meaning:'아버지와 어머니'}, {word:'祖父', reading:'조부', meaning:'할아버지'}, {word:'父子', reading:'부자', meaning:'아버지와 아들'} ] },

  { id:'h_mother', char:'母', sound:'모', meaning:'어머니', category:'family', level:2, strokes:5,
    parts:[
      { txt:'🙇‍♀️', label:'품에 안은 여인(女)', meaning:'아이를 안고 돌보는 어머니예요.', dir:'center' },
      { txt:'🤱', label:'젖을 먹이는 두 점(··)', meaning:'가슴으로 젖을 먹여 아기를 키워요.', dir:'center' }
    ],
    story:'여인(女)의 가슴에 두 점(··)을 더해, 젖을 물려 지극한 사랑으로 아기를 키워내시는 은혜로운 “어머니”를 나타냈어요.',
    words:[ {word:'母性', reading:'모성', meaning:'어머니의 본능'}, {word:'祖母', reading:'조모', meaning:'할머니'}, {word:'母校', reading:'모교', meaning:'내가 졸업한 학교'} ] },

  { id:'h_brother_older', char:'兄', sound:'형', meaning:'형', category:'family', level:2, strokes:5,
    parts:[
      { txt:'👄', label:'입 구(口)', meaning:'제사를 지내며 축문을 읽는 큰 입이에요.', dir:'top' },
      { txt:'🧍', label:'사람 인(儿)', meaning:'집안을 대표해 든든하게 선 사람이에요.', dir:'bottom' }
    ],
    story:'집안을 대표하여 어른들 앞에서 말을 하고(口) 동생들을 지혜롭게 이끄는 듬직한 맏이인 “형”을 나타냈어요.',
    words:[ {word:'兄弟', reading:'형제', meaning:'형과 아우'}, {word:'長兄', reading:'장형', meaning:'맏형'}, {word:'學兄', reading:'학형', meaning:'공부하는 벗'} ] },

  { id:'h_brother_younger', char:'弟', sound:'제', meaning:'아우, 동생', category:'family', level:2, strokes:7,
    parts:[{ txt:'🎗️', label:'차례로 감긴 가죽끈', meaning:'나무 막대에 가죽끈을 아래로 차례차례 감은 모양이에요.', dir:'center' }],
    story:'막대에 끈을 위에서부터 차례차례 감아 내려가듯, 형의 뒤를 이어 태어난 귀여운 “아우(동생)”를 뜻해요.',
    words:[ {word:'弟子', reading:'제자', meaning:'스승의 가르침을 받는 사람'}, {word:'兄弟', reading:'형제', meaning:'형과 동생'}, {word:'師弟', reading:'사제', meaning:'스승과 제자'} ] },

  { id:'h_sister_older', char:'姉', sound:'자', meaning:'손윗누이, 언니, 누나', category:'family', level:4, strokes:8,
    parts:[
      { txt:'🙇‍♀️', label:'여자(女)', meaning:'어여쁜 여성이에요.', dir:'left' },
      { txt:'🏛️', label:'사당 시장(市)', meaning:'집안의 제사를 돕는 의젓한 모습이에요.', dir:'right' }
    ],
    story:'집안 살림과 예절을 어머니 곁에서 돕는 의젓한 손위 여자 형제인 “언니/누나”를 나타낸 글자예요.',
    words:[ {word:'姉妹', reading:'자매', meaning:'언니와 여동생'}, {word:'姉兄', reading:'자형', meaning:'누나의 남편'} ] },

  { id:'h_sister_younger', char:'妹', sound:'매', meaning:'손아래누이, 여동생', category:'family', level:4, strokes:8,
    parts:[
      { txt:'🙇‍♀️', label:'여자(女)', meaning:'사랑스러운 여성이에요.', dir:'left' },
      { txt:'🌱', label:'아직 어린 나무(未)', meaning:'아직 완전히 다 자라지 않은 어린 싹이에요.', dir:'right' }
    ],
    story:'나무가 아직 여리듯(未), 집안에서 가장 나이가 어리고 사랑을 듬뿍 받는 여자아이인 “손아래누이(여동생)”를 뜻해요.',
    words:[ {word:'姉妹', reading:'자매', meaning:'언니와 여동생'}, {word:'男妹', reading:'남매', meaning:'오빠와 누이'}, {word:'妹夫', reading:'매부', meaning:'누이동생의 남편'} ] },

  { id:'h_friend', char:'友', sound:'우', meaning:'벗, 친구', category:'family', level:2, strokes:4,
    parts:[
      { txt:'🤚', label:'내 오른손(又)', meaning:'친구를 향해 반갑게 내민 손이에요.', dir:'top' },
      { txt:'🤚', label:'친구의 손(𠂇)', meaning:'서로 마주 잡은 따뜻한 손이에요.', dir:'bottom' }
    ],
    story:'두 사람이 서로 손(又, 𠂇)을 마주 잡고 돕는 따뜻한 모습에서 평생을 함께하는 “벗(친구)”을 나타냈어요.',
    words:[ {word:'友人', reading:'우인', meaning:'친구'}, {word:'友情', reading:'우정', meaning:'친구 사이의 정'}, {word:'親友', reading:'친우', meaning:'친한 친구'} ] },

  { id:'h_house', char:'家', sound:'가', meaning:'집, 집안', category:'family', level:3, strokes:10,
    parts:[
      { txt:'🏠', label:'지붕 집 면(宀)', meaning:'비바람을 막아주는 아늑한 지붕이에요.', dir:'top' },
      { txt:'🐷', label:'돼지 시(豕)', meaning:'집 아래 울타리에서 복을 주는 가축이에요.', dir:'bottom' }
    ],
    story:'비바람을 막아주는 지붕(宀) 아래에서 가축(豕)을 기르며 온 식구가 오순도순 모여 사는 행복한 우리 “집”을 뜻해요.',
    words:[ {word:'家族', reading:'가족', meaning:'한집에 사는 사람들'}, {word:'國家', reading:'국가', meaning:'나라'}, {word:'家屋', reading:'가옥', meaning:'사람이 사는 집'} ] },

  // ==========================================
  // 6. 시간 & 계절 (season)
  // ==========================================
  { id:'h_year', char:'年', sound:'년', meaning:'해, 해 년, 나이', category:'season', level:2, strokes:6,
    parts:[
      { txt:'🌾', label:'익은 벼(禾)', meaning:'가을이 되어 누렇게 고개 숙인 벼예요.', dir:'top' },
      { txt:'🧍', label:'짊어진 사람(千/人)', meaning:'추수한 볏단을 등에 지고 가는 모습이에요.', dir:'bottom' }
    ],
    story:'벼(禾)가 싹터서 가을에 황금빛으로 익어 추수하기까지 걸리는 한 번의 순환인 “한 해(1년)”를 나타냈어요.',
    words:[ {word:'新年', reading:'신년', meaning:'새해'}, {word:'學年', reading:'학년', meaning:'학교의 학업 연차'}, {word:'每年', reading:'매년', meaning:'해마다'} ] },

  { id:'h_time', char:'時', sound:'시', meaning:'때, 시간', category:'season', level:3, strokes:10,
    parts:[
      { txt:'☀️', label:'해 일(日)', meaning:'하늘을 움직이는 태양의 위치예요.', dir:'left' },
      { txt:'🏛️', label:'절 사/마디 촌(寺/寸)', meaning:'규칙적으로 종을 치며 때를 재는 모양이에요.', dir:'right' }
    ],
    story:'하늘에 뜬 해(日)의 높낮이를 재어 규칙적으로 흘러가는 순간순간을 가리켜 “때”와 “시간”을 나타냈어요.',
    words:[ {word:'時間', reading:'시간', meaning:'때의 길이'}, {word:'時計', reading:'시계', meaning:'시간을 재는 기계'}, {word:'定時', reading:'정시', meaning:'정해진 때'} ] },

  { id:'h_minute', char:'分', sound:'분', meaning:'나눌, 분', category:'season', level:2, strokes:4,
    parts:[
      { txt:'八', label:'나눌 팔(八)', meaning:'양쪽으로 갈라놓는 모습이에요.', dir:'top' },
      { txt:'🔪', label:'칼 도(刀)', meaning:'칼로 물건을 깔끔하게 자르는 도구예요.', dir:'bottom' }
    ],
    story:'칼(刀)로 물건을 둘로 나누는(八) 모습에서 “나누다”와 함께 1시간을 잘게 쪼갠 “분(minute)”을 뜻해요.',
    words:[ {word:'十分', reading:'십분', meaning:'10분, 아주 넉넉함'}, {word:'半分', reading:'반분', meaning:'절반으로 나눔'}, {word:'分明', reading:'분명', meaning:'또렷하게 확실함'} ] },

  { id:'h_morning', char:'朝', sound:'조', meaning:'아침', category:'season', level:4, strokes:12,
    parts:[
      { txt:'🌿', label:'풀 사이의 해(十/日/十)', meaning:'아침 풀잎 사이로 해가 솟아올라요.', dir:'left' },
      { txt:'🌙', label:'아직 남은 달(月)', meaning:'서쪽 하늘에 하얗게 달이 남아 있어요.', dir:'right' }
    ],
    story:'풀숲 사이로 붉은 해가 솟아오르고 서쪽에는 아직 달(月)빛이 은은하게 남아 있는 상쾌한 “아침”을 나타냈어요.',
    words:[ {word:'朝食', reading:'조식', meaning:'아침밥'}, {word:'今朝', reading:'금조', meaning:'오늘 아침'}, {word:'王朝', reading:'왕조', meaning:'임금의 시대'} ] },

  { id:'h_evening', char:'夕', sound:'석', meaning:'저녁', category:'season', level:2, strokes:3,
    parts:[{ txt:'🌙', label:'반쯤 가려진 달', meaning:'해 질 녘 산 너머로 살포시 고개를 내민 초승달이에요.', dir:'center' }],
    story:'해가 지고 어스름해질 무렵 서쪽 하늘에 살며시 떠오르는 초승달의 모양을 그려 “저녁”을 나타냈어요.',
    words:[ {word:'夕陽', reading:'석양', meaning:'저녁에 지는 해'}, {word:'朝夕', reading:'조석', meaning:'아침과 저녁'}, {word:'夕食', reading:'석식', meaning:'저녁밥'} ] },

  { id:'h_daytime', char:'晝', sound:'주', meaning:'낮', category:'season', level:4, strokes:11,
    parts:[
      { txt:'🖌️', label:'붓(聿)', meaning:'해의 길이를 손에 붓을 쥐고 기록해요.', dir:'top' },
      { txt:'☀️', label:'해 일(日)', meaning:'하늘 높이 떠서 온 세상을 비추는 해예요.', dir:'bottom' }
    ],
    story:'해(日)가 머리 위에 높이 떠서 온 천지가 환하게 밝아 활동하기 좋은 “낮”을 나타낸 글자예요.',
    words:[ {word:'晝夜', reading:'주야', meaning:'낮과 밤'}, {word:'白晝', reading:'백주', meaning:'대낮'}, {word:'晝食', reading:'주식', meaning:'점심밥'} ] },

  { id:'h_night', char:'夜', sound:'야', meaning:'밤', category:'season', level:3, strokes:8,
    parts:[
      { txt:'🌌', label:'어둠이 내린 지붕(亠)', meaning:'하늘에 어둠이 깔린 모습이에요.', dir:'top' },
      { txt:'🧍', label:'팔을 괴고 쉼(夕/亻)', meaning:'달빛 아래서 사람이 편안히 쉬고 있어요.', dir:'bottom' }
    ],
    story:'해(日)가 지고 달(夕)이 떠올라 사람들이 하루 일과를 마치고 잠자리에 들어 쉬는 고요한 “밤”을 뜻해요.',
    words:[ {word:'夜間', reading:'야간', meaning:'밤의 동안'}, {word:'深夜', reading:'심야', meaning:'깊은 밤'}, {word:'夜景', reading:'야경', meaning:'밤의 경치'} ] },

  { id:'h_spring', char:'春', sound:'춘', meaning:'봄', category:'season', level:4, strokes:9,
    parts:[
      { txt:'🌱', label:'돋아나는 풀싹(𡗗)', meaning:'겨울을 이겨내고 솟아오르는 새싹이에요.', dir:'top' },
      { txt:'☀️', label:'따스한 햇살(日)', meaning:'얼음을 녹이는 따스한 봄볕이에요.', dir:'bottom' }
    ],
    story:'따스한 봄 햇살(日)을 듬뿍 받아 겨우내 얼었던 땅속에서 파릇파릇 새싹(𡗗)이 움터 나오는 따뜻한 “봄”을 뜻해요.',
    words:[ {word:'青春', reading:'청춘', meaning:'젊은 시절'}, {word:'春分', reading:'춘분', meaning:'낮과 밤의 길이가 같은 봄날'}, {word:'新春', reading:'신춘', meaning:'새봄'} ] },

  { id:'h_summer', char:'夏', sound:'하', meaning:'여름', category:'season', level:4, strokes:10,
    parts:[
      { txt:'🎭', label:'화려한 가면(頁)', meaning:'큰 머리 장식을 한 모습이에요.', dir:'top' },
      { txt:'💃', label:'춤추는 발(夂)', meaning:'신나게 발을 구르며 축제를 즐겨요.', dir:'bottom' }
    ],
    story:'태양이 뜨겁게 내리쬐는 계절에 가면(頁)을 쓰고 춤추며(夂) 풍년을 기원하는 열정적인 “여름”을 나타냈어요.',
    words:[ {word:'夏季', reading:'하계', meaning:'여름철'}, {word:'初夏', reading:'초하', meaning:'초여름'}, {word:'夏服', reading:'하복', meaning:'여름 옷'} ] },

  { id:'h_autumn', char:'秋', sound:'추', meaning:'가을', category:'season', level:4, strokes:9,
    parts:[
      { txt:'🌾', label:'벼 화(禾)', meaning:'알곡이 누렇게 꽉 찬 볏이삭이에요.', dir:'left' },
      { txt:'🔥', label:'불 화(火)', meaning:'가을볕에 곡식이 붉게 익어가는 모습이에요.', dir:'right' }
    ],
    story:'볏이삭(禾)이 마치 붉은 불꽃(火)처럼 탐스럽게 익어 풍요롭게 결실을 맺는 시원한 “가을”을 나타냈어요.',
    words:[ {word:'秋夕', reading:'추석', meaning:'한가위 명절'}, {word:'千秋', reading:'천추', meaning:'오랜 세월'}, {word:'秋收', reading:'추수', meaning:'가을에 곡식을 거둠'} ] },

  { id:'h_winter', char:'冬', sound:'동', meaning:'겨울', category:'season', level:4, strokes:5,
    parts:[
      { txt:'🧵', label:'매듭지어 끝냄(夂)', meaning:'한 해의 모든 농사가 끝난 매듭이에요.', dir:'top' },
      { txt:'🧊', label:'얼음 빙(冫)', meaning:'추위로 꽁꽁 언 얼음 알갱이예요.', dir:'bottom' }
    ],
    story:'한 해의 순환이 매듭(夂)지어 끝나고, 차가운 얼음(冫)이 얼어붙는 하얗고 추운 “겨울”을 나타냈어요.',
    words:[ {word:'冬眠', reading:'동면', meaning:'겨울잠'}, {word:'冬季', reading:'동계', meaning:'겨울철'}, {word:'冬至', reading:'동지', meaning:'밤이 가장 긴 겨울날'} ] },

  // ==========================================
  // 7. 동물 & 식물 (animal)
  // ==========================================
  { id:'h_dog', char:'犬', sound:'견', meaning:'개', category:'animal', level:2, strokes:4,
    parts:[
      { txt:'🐕', label:'큰 몸집의 개(大)', meaning:'네 다리로 서 있는 늠름한 개의 몸이에요.', dir:'center' },
      { txt:'🐾', label:'쫑긋한 귀/꼬리 점(丶)', meaning:'주인을 보고 반갑게 흔드는 꼬리예요.', dir:'top' }
    ],
    story:'주인을 향해 꼬리(丶)를 흔들며 충성스럽게 곁을 지키는 친근한 동물 “개”의 모습을 본떠 그렸어요.',
    words:[ {word:'愛犬', reading:'애견', meaning:'사랑하는 개'}, {word:'軍犬', reading:'군견', meaning:'군대에서 훈련받은 개'}, {word:'犬猿之間', reading:'견원지간', meaning:'개와 원숭이처럼 사이가 나쁨'} ] },

  { id:'h_cow', char:'牛', sound:'우', meaning:'소', category:'animal', level:2, strokes:4,
    parts:[{ txt:'🐂', label:'솟은 소의 뿔', meaning:'양옆으로 힘차게 뻗은 두 뿔과 콧등 모양이에요.', dir:'center' }],
    story:'양옆으로 멋지게 뻗은 두 뿔과 듬직한 코의 모양을 위에서 내려다보고 그린 글자로 “소”를 뜻해요.',
    words:[ {word:'牛乳', reading:'우유', meaning:'소의 젖'}, {word:'牛肉', reading:'우육(소고기)', meaning:'소의 고기'}, {word:'牛耳讀經', reading:'우이독경', meaning:'소귀에 경 읽기'} ] },

  { id:'h_horse', char:'馬', sound:'마', meaning:'말', category:'animal', level:3, strokes:10,
    parts:[
      { txt:'🐴', label:'갈기와 머리', meaning:'바람에 휘날리는 멋진 말갈기예요.', dir:'top' },
      { txt:'🐎', label:'네 다리와 꼬리(灬)', meaning:'들판을 힘차게 달리는 튼튼한 네 굽이에요.', dir:'bottom' }
    ],
    story:'바람에 멋진 갈기를 휘날리며 튼튼한 네 굽(灬)으로 들판을 번개처럼 내달리는 동물 “말”을 그렸어요.',
    words:[ {word:'馬車', reading:'마차', meaning:'말이 끄는 수레'}, {word:'乘馬', reading:'승마', meaning:'말을 탐'}, {word:'千里馬', reading:'천리마', meaning:'하루에 천 리를 달리는 말'} ] },

  { id:'h_sheep', char:'羊', sound:'양', meaning:'양', category:'animal', level:2, strokes:6,
    parts:[{ txt:'🐑', label:'구부러진 뿔과 수염', meaning:'돌돌 말린 두 뿔과 온순한 턱수염 모양이에요.', dir:'center' }],
    story:'머리에 둥글게 말린 두 뿔과 보드라운 털을 가진 착하고 순한 동물 “양”의 얼굴을 정면에서 본떠 그렸어요.',
    words:[ {word:'羊毛', reading:'양모', meaning:'양의 털'}, {word:'山羊', reading:'산양', meaning:'산에 사는 야생 양'}, {word:'羊肉', reading:'양육(양고기)', meaning:'양의 고기'} ] },

  { id:'h_pig', char:'豚', sound:'돈', meaning:'돼지', category:'animal', level:4, strokes:11,
    parts:[
      { txt:'🥩', label:'고기 육(月/肉)', meaning:'토실토실 살이 오른 몸이에요.', dir:'left' },
      { txt:'🐷', label:'돼지 시(豕)', meaning:'주둥이가 긴 아기 돼지의 모양이에요.', dir:'right' }
    ],
    story:'살이 통통하게 올라(月) 복스럽게 꿀꿀거리는 귀여운 가축 “돼지”를 나타낸 글자예요.',
    words:[ {word:'豚肉', reading:'돈육(돼지고기)', meaning:'돼지의 고기'}, {word:'養豚', reading:'양돈', meaning:'돼지를 기름'} ] },

  { id:'h_bird', char:'鳥', sound:'조', meaning:'새', category:'animal', level:4, strokes:11,
    parts:[
      { txt:'🦜', label:'부리와 깃털', meaning:'뾰족한 부리와 동그란 눈, 벼슬 모양이에요.', dir:'top' },
      { txt:'🪶', label:'날개와 발톱(灬)', meaning:'푸른 하늘을 날아오르는 깃털과 발이에요.', dir:'bottom' }
    ],
    story:'뾰족한 부리, 동그란 눈, 몸을 감싼 고운 깃털과 나뭇가지를 꼭 쥐는 발톱(灬)을 가진 “새”의 모습을 그렸어요.',
    words:[ {word:'鳥類', reading:'조류', meaning:'새 종류'}, {word:'白鳥', reading:'백조', meaning:'하얀 고니'}, {word:'小鳥', reading:'소조', meaning:'작은 새'} ] },

  { id:'h_fish', char:'魚', sound:'어', meaning:'물고기', category:'animal', level:3, strokes:11,
    parts:[
      { txt:'🐟', label:'머리와 입(⺈)', meaning:'헤엄치는 물고기의 머리통이에요.', dir:'top' },
      { txt:'🛡️', label:'비늘 몸통(田)', meaning:'그물 모양의 반짝이는 비늘이에요.', dir:'center' },
      { txt:'🌊', label:'지느러미 꼬리(灬)', meaning:'물살을 가르는 꼬리지느러미예요.', dir:'bottom' }
    ],
    story:'물고기의 뾰족한 주둥이, 반짝이는 비늘 몸통(田), 힘차게 헤엄치는 지느러미(灬)를 본떠 “물고기”를 나타냈어요.',
    words:[ {word:'魚類', reading:'어류', meaning:'물고기 무리'}, {word:'金魚', reading:'금어(금붕어)', meaning:'황금빛 물고기'}, {word:'人魚', reading:'인어', meaning:'전설 속 물고기 사람'} ] },

  { id:'h_insect', char:'蟲', sound:'충', meaning:'벌레', category:'animal', level:4, strokes:18,
    parts:[
      { txt:'🐛', label:'벌레 한 마리(虫)', meaning:'꿈틀꿈틀 기어가는 곤충이에요.', dir:'top' },
      { txt:'🐜', label:'벌레 두 마리(虫虫)', meaning:'수많은 벌레가 떼를 지어 모여 있어요.', dir:'bottom' }
    ],
    story:'꿈틀거리는 벌레(虫) 세 마리를 모아 그려, 땅속과 풀숲에 셀 수 없이 많이 번성하는 “벌레/곤충”을 나타냈어요.',
    words:[ {word:'昆蟲', reading:'곤충', meaning:'몸이 세 부분으로 된 벌레'}, {word:'益蟲', reading:'익충', meaning:'이로운 벌레'}, {word:'害蟲', reading:'해충', meaning:'해로운 벌레'} ] },

  { id:'h_grass', char:'草', sound:'초', meaning:'풀', category:'animal', level:3, strokes:9,
    parts:[
      { txt:'🌱', label:'풀초 머리(艹)', meaning:'땅 위로 돋아난 파릇한 싹이에요.', dir:'top' },
      { txt:'☀️', label:'이른 아침 조(早)', meaning:'아침 햇살을 받고 싱그럽게 자라나요.', dir:'bottom' }
    ],
    story:'이른 아침(早) 이슬을 머금고 푸른 들판에 파릇파릇 돋아나는 싱그러운 “풀”을 나타낸 글자예요.',
    words:[ {word:'草木', reading:'초목', meaning:'풀과 나무'}, {word:'雜草', reading:'잡초', meaning:'거칠게 자란 풀'}, {word:'草地', reading:'초지', meaning:'풀밭'} ] },

  { id:'h_flower', char:'花', sound:'화', meaning:'꽃', category:'animal', level:3, strokes:7,
    parts:[
      { txt:'🌱', label:'풀초 머리(艹)', meaning:'꽃을 피워내는 식물의 줄기예요.', dir:'top' },
      { txt:'✨', label:'변할 화(化)', meaning:'모양이 신비롭게 활짝 변신해요.', dir:'bottom' }
    ],
    story:'풀(艹) 줄기 끝에서 봉오리가 맺히더니 알록달록 눈부신 아름다움으로 변신(化)하여 피어나는 “꽃”을 뜻해요.',
    words:[ {word:'花園', reading:'화원', meaning:'꽃밭, 꽃집'}, {word:'草花', reading:'초화', meaning:'풀에 피는 꽃'}, {word:'花盆', reading:'화분', meaning:'꽃을 심는 그릇'} ] },

  { id:'h_forest_small', char:'林', sound:'림', meaning:'수풀, 숲', category:'animal', level:2, strokes:8,
    parts:[
      { txt:'🌳', label:'왼쪽 나무(木)', meaning:'푸르게 자란 한 그루 나무예요.', dir:'left' },
      { txt:'🌳', label:'오른쪽 나무(木)', meaning:'나란히 어깨를 맞댄 나무예요.', dir:'right' }
    ],
    story:'나무(木)와 나무(木)가 나란히 어깨를 맞대고 빽빽하게 모여 싱그러운 그늘을 만드는 “수풀(숲)”을 뜻해요.',
    words:[ {word:'森林', reading:'산림/삼림', meaning:'울창한 숲'}, {word:'林道', reading:'임도', meaning:'숲속의 길'}, {word:'松林', reading:'송림', meaning:'소나무 숲'} ] },

  { id:'h_forest_big', char:'森', sound:'삼', meaning:'빽빽할, 숲', category:'animal', level:3, strokes:12,
    parts:[
      { txt:'🌳', label:'위쪽 나무(木)', meaning:'하늘 높이 솟은 큰 나무예요.', dir:'top' },
      { txt:'🌲', label:'아래 두 나무(木木)', meaning:'땅을 가득 메운 나무들이에요.', dir:'bottom' }
    ],
    story:'나무(木) 세 그루가 위아래로 가득 차서 하늘이 보이지 않을 정도로 나무가 무성하고 빽빽한 “깊은 숲”을 뜻해요.',
    words:[ {word:'森林浴', reading:'산림욕', meaning:'숲속에서 맑은 공기를 마심'}, {word:'森嚴', reading:'삼엄', meaning:'매우 엄숙하고 빈틈없음'} ] },

  // ==========================================
  // 8. 색깔 & 모양 (color)
  // ==========================================
  { id:'h_color', char:'色', sound:'색', meaning:'빛, 색', category:'color', level:2, strokes:6,
    parts:[
      { txt:'👤', label:'사람의 얼굴(ク)', meaning:'표정과 기운이 드러나는 얼굴이에요.', dir:'top' },
      { txt:'🧍', label:'구부린 몸(巴)', meaning:'마음의 상태가 겉으로 드러나는 모습이에요.', dir:'bottom' }
    ],
    story:'사람의 감정과 마음이 얼굴빛과 자태로 환하게 드러나는 모습에서 세상의 다채로운 “빛깔과 색”을 나타냈어요.',
    words:[ {word:'色彩', reading:'색채', meaning:'다양한 빛깔'}, {word:'赤色', reading:'적색', meaning:'붉은 색'}, {word:'景色', reading:'경색(경치)', meaning:'아름다운 풍경'} ] },

  { id:'h_blue', char:'靑', sound:'청', meaning:'푸를, 파랑', category:'color', level:2, strokes:8,
    parts:[
      { txt:'🌱', label:'돋아나는 싹(生)', meaning:'땅을 뚫고 솟아난 새싹의 빛깔이에요.', dir:'top' },
      { txt:'🪨', label:'우물 정/광물(丹/井)', meaning:'맑은 우물물과 푸른빛 광석이에요.', dir:'bottom' }
    ],
    story:'봄에 힘차게 돋아나는 새싹(生)과 맑고 깨끗한 우물물처럼 싱그럽고 청명한 “푸른색(파랑)”을 뜻해요.',
    words:[ {word:'靑空', reading:'청공(청천)', meaning:'푸른 하늘'}, {word:'靑年', reading:'청년', meaning:'젊은 사람'}, {word:'靑少年', reading:'청소년', meaning:'어린이와 청년 사이'} ] },

  { id:'h_white', char:'白', sound:'백', meaning:'흰, 하양, 밝을', category:'color', level:1, strokes:5,
    parts:[
      { txt:'☀️', label:'해 일(日)', meaning:'눈부시게 비추는 햇살이에요.', dir:'center' },
      { txt:'✨', label:'햇살 삐침(丿)', meaning:'햇빛이 사방으로 번지는 알갱이예요.', dir:'top' }
    ],
    story:'아침 햇살이 사방으로 번쩍이며 비칠 때 눈이 부시도록 깨끗하고 환한 “하얀색”과 “밝음”을 나타냈어요.',
    words:[ {word:'白紙', reading:'백지', meaning:'하얀 종이'}, {word:'白雪', reading:'백설', meaning:'하얀 눈'}, {word:'明白', reading:'명백', meaning:'아주 환하고 똑똑함'} ] },

  { id:'h_red', char:'赤', sound:'적', meaning:'붉을, 빨강', category:'color', level:3, strokes:7,
    parts:[
      { txt:'🌱', label:'흙 토(土/大)', meaning:'뜨거운 흙과 사람의 모습이에요.', dir:'top' },
      { txt:'🔥', label:'불 화(火)', meaning:'이글이글 타오르는 붉은 불꽃이에요.', dir:'bottom' }
    ],
    story:'활활 타오르는 불꽃(火)의 뜨겁고 찬란한 빛깔을 본떠 강렬한 “붉은색(빨강)”을 나타낸 글자예요.',
    words:[ {word:'赤十字', reading:'적십자', meaning:'붉은 십자 표지'}, {word:'赤色', reading:'적색', meaning:'빨간색'}, {word:'赤道', reading:'적도', meaning:'지구 한가운데를 두른 붉은 선'} ] },

  { id:'h_black', char:'黑', sound:'흑', meaning:'검을, 검정', category:'color', level:4, strokes:12,
    parts:[
      { txt:'🪵', label:'굴뚝과 그을음(里)', meaning:'아궁이 굴뚝에 검은 연기가 낀 모양이에요.', dir:'top' },
      { txt:'🔥', label:'타는 불꽃(灬)', meaning:'불을 때고 남은 까만 숯댕이예요.', dir:'bottom' }
    ],
    story:'아궁이에 불(灬)을 지피고 난 뒤 굴뚝에 묻은 까만 그을음과 숯처럼 깊고 짙은 “검은색”을 뜻해요.',
    words:[ {word:'黑板', reading:'흑판(칠판)', meaning:'글씨를 쓰는 검은 판'}, {word:'黑白', reading:'흑백', meaning:'검정과 하양'}, {word:'暗黑', reading:'암흑', meaning:'캄캄한 어둠'} ] },

  { id:'h_yellow', char:'黃', sound:'황', meaning:'누를, 노랑', category:'color', level:4, strokes:12,
    parts:[
      { txt:'🌱', label:'빛나는 싹(廿)', meaning:'가을 햇살 아래 황금빛이에요.', dir:'top' },
      { txt:'🌍', label:'기름진 흙(田/由/八)', meaning:'가슴에 옥을 품은 기름진 황토 땅이에요.', dir:'bottom' }
    ],
    story:'곡식을 살찌우는 기름진 황토 흙과 가을 들판에 가득 찬 벼이삭의 따뜻한 “노란색(누런빛)”을 나타냈어요.',
    words:[ {word:'黃金', reading:'황금', meaning:'누런 금'}, {word:'黃土', reading:'황토', meaning:'누런 흙'}, {word:'黃海', reading:'황해', meaning:'누런 모래 바다'} ] },

  { id:'h_square', char:'方', sound:'방', meaning:'모, 방향, 네모', category:'color', level:2, strokes:4,
    parts:[{ txt:'🛶', label:'나란히 묶은 두 배', meaning:'배 두 척을 나란히 묶어 네모지게 나아가는 모양이에요.', dir:'center' }],
    story:'배 두 척을 나란히 묶어(쟁기 모양) 곧게 나아가는 모습에서 반듯한 “네모(모)”와 나아가는 “방향”을 뜻해요.',
    words:[ {word:'四方', reading:'사방', meaning:'동서남북 네 방향'}, {word:'方向', reading:'방향', meaning:'향하는 쪽'}, {word:'方法', reading:'방법', meaning:'하는 방식'} ] },

  { id:'h_circle', char:'圓', sound:'원', meaning:'둥글, 둥글 원, 원', category:'color', level:4, strokes:13,
    parts:[
      { txt:'🔲', label:'둘러싼 테두리(囗)', meaning:'둥글게 감싸 안은 둘레예요.', dir:'center' },
      { txt:'🪙', label:'조개/솥 패(員)', meaning:'둥근 솥이나 동전 모양이에요.', dir:'center' }
    ],
    story:'모난 곳 없이 둥글게 둘러싼 테두리(囗) 안에 둥근 동전(員)을 담은 모습에서 모서리 없이 매끄러운 “둥긂”을 뜻해요.',
    words:[ {word:'圓形', reading:'원형', meaning:'동그란 모양'}, {word:'圓滿', reading:'원만', meaning:'모나지 않고 너그러움'}, {word:'萬圓', reading:'만원', meaning:'화폐 단위 만 원'} ] },

  { id:'h_long', char:'長', sound:'장', meaning:'길, 어른, 길 장', category:'color', level:3, strokes:8,
    parts:[{ txt:'👴', label:'긴 머리칼의 노인', meaning:'지팡이를 짚고 긴 수염과 머리카락을 흩날리는 어른이에요.', dir:'center' }],
    story:'수염과 머리카락을 길게 기른 어르신이 지팡이를 짚고 서 있는 모습에서 “길다”와 지혜로운 “어른/우두머리”를 뜻해요.',
    words:[ {word:'校長', reading:'교장', meaning:'학교의 우두머리'}, {word:'身長', reading:'신장(키)', meaning:'몸의 길이'}, {word:'長點', reading:'장점', meaning:'뛰어난 좋은 점'} ] },

  { id:'h_short', char:'短', sound:'단', meaning:'짧을, 짧을 단', category:'color', level:4, strokes:12,
    parts:[
      { txt:'🏹', label:'화살 시(矢)', meaning:'길이를 재는 곧은 화살이에요.', dir:'left' },
      { txt:'🥣', label:'제기 두(豆)', meaning:'키가 낮은 작은 그릇이에요.', dir:'right' }
    ],
    story:'화살(矢)로 낮은 제사용 콩 그릇(豆)의 높이를 재어 보니 기준보다 턱없이 낮고 모자라다는 뜻에서 “짧다”를 나타냈어요.',
    words:[ {word:'短點', reading:'단점', meaning:'부족한 점'}, {word:'短期', reading:'단기', meaning:'짧은 기간'}, {word:'短縮', reading:'단축', meaning:'줄여서 짧게 함'} ] },

  { id:'h_high', char:'高', sound:'고', meaning:'높을, 높을 고', category:'color', level:3, strokes:10,
    parts:[
      { txt:'🏯', label:'높은 성루 지붕(亠/口)', meaning:'하늘 높이 솟은 누각의 지붕이에요.', dir:'top' },
      { txt:'🚪', label:'성벽과 문(冂/口)', meaning:'웅장하게 쌓아 올린 높은 누각의 문이에요.', dir:'bottom' }
    ],
    story:'적을 멀리서 감시하기 위해 땅 위에 성벽과 기둥을 겹겹이 쌓아 올려 하늘 높이 우뚝 솟은 누각의 모습으로 “높다”를 뜻해요.',
    words:[ {word:'最高', reading:'최고', meaning:'가장 높음'}, {word:'高校', reading:'고교(고등학교)', meaning:'고등 교육 기관'}, {word:'高熱', reading:'고열', meaning:'높은 열'} ] },

  { id:'h_low', char:'低', sound:'저', meaning:'낮을, 낮을 저', category:'color', level:4, strokes:7,
    parts:[
      { txt:'🧍', label:'사람 인(亻)', meaning:'고개를 숙인 사람이에요.', dir:'left' },
      { txt:'🌱', label:'밑바닥 저(氐)', meaning:'뿌리가 땅바닥에 닿아 있는 모양이에요.', dir:'right' }
    ],
    story:'사람(亻)이 땅바닥(氐) 쪽으로 몸을 숙이거나 기준선보다 아래로 내려앉아 높이가 모자란 “낮음”을 나타냈어요.',
    words:[ {word:'低氣壓', reading:'저기압', meaning:'낮은 기압'}, {word:'低級', reading:'저급', meaning:'낮은 등급'}, {word:'高低', reading:'고저', meaning:'높음과 낮음'} ] },

  // ==========================================
  // 9. 학교 & 배움 (school)
  // ==========================================
  { id:'h_learn', char:'學', sound:'학', meaning:'배울, 배울 학', category:'school', level:4, strokes:16,
    parts:[
      { txt:'📖', label:'두 손으로 산가지 셈(爻/臼)', meaning:'선생님의 가르침을 두 손으로 받드는 모양이에요.', dir:'top' },
      { txt:'🏠', label:'배움터 지붕(冖)', meaning:'친구들이 모인 글방의 지붕이에요.', dir:'center' },
      { txt:'👶', label:'어린아이(子)', meaning:'초롱초롱한 눈으로 배우는 학생이에요.', dir:'bottom' }
    ],
    story:'글방(冖)에서 어린아이(子)가 두 손(臼)으로 지식의 본보기(爻)를 받아 익히며 깨우치는 “배우다”를 나타낸 글자예요.',
    words:[ {word:'學校', reading:'학교', meaning:'배우는 배움터'}, {word:'學生', reading:'학생', meaning:'공부하는 사람'}, {word:'見學', reading:'견학', meaning:'보고 배움'} ] },

  { id:'h_school', char:'校', sound:'교', meaning:'학교, 견줄 교', category:'school', level:4, strokes:10,
    parts:[
      { txt:'🌳', label:'나무 목(木)', meaning:'나무로 지은 크고 튼튼한 건물이에요.', dir:'left' },
      { txt:'🤝', label:'사귈 교(交)', meaning:'친구들이 다리를 꼬고 어울려 사귀는 모습이에요.', dir:'right' }
    ],
    story:'나무(木)로 지은 튼튼한 배움터에서 여러 동무들이 모여 서로 사귀고(交) 가르침을 나누는 “학교”를 뜻해요.',
    words:[ {word:'學校', reading:'학교', meaning:'배움을 닦는 곳'}, {word:'校門', reading:'교문', meaning:'학교의 문'}, {word:'登校', reading:'등교', meaning:'학교에 감'} ] },

  { id:'h_born', char:'生', sound:'생', meaning:'날, 살, 날 생', category:'school', level:2, strokes:5,
    parts:[{ txt:'🌱', label:'흙을 뚫고 솟은 싹', meaning:'기름진 땅 위로 새싹이 쑥 고개를 내밀었어요.', dir:'center' }],
    story:'흙을 힘차게 뚫고 푸른 새싹이 돋아나는 모습을 그려 세상에 처음 태어나는 “나다”와 생명력 넘치는 “살다”를 뜻해요.',
    words:[ {word:'先生', reading:'선생', meaning:'먼저 태어나 가르치는 분'}, {word:'生日', reading:'생일', meaning:'태어난 날'}, {word:'生活', reading:'생활', meaning:'살아가는 활동'} ] },

  { id:'h_first', char:'先', sound:'선', meaning:'먼저, 먼저 선', category:'school', level:2, strokes:6,
    parts:[
      { txt:'🦶', label:'나아가는 발(止/牛)', meaning:'앞을 향해 씩씩하게 내딛는 발걸음이에요.', dir:'top' },
      { txt:'🧍', label:'사람 인(儿)', meaning:'남들보다 앞장서서 걷는 사람이에요.', dir:'bottom' }
    ],
    story:'다른 사람(儿)보다 발(止)을 한 발짝 먼저 내밀어 앞장서서 걸어가는 모습에서 “먼저”와 “앞”을 뜻해요.',
    words:[ {word:'先生', reading:'선생', meaning:'먼저 배운 선생님'}, {word:'先後', reading:'선후', meaning:'먼저와 나중'}, {word:'祖先', reading:'조선(조상)', meaning:'먼저 살다 간 어른'} ] },

  { id:'h_teach', char:'敎', sound:'교', meaning:'가르칠, 가르칠 교', category:'school', level:4, strokes:11,
    parts:[
      { txt:'🙏', label:'효도 효(孝)', meaning:'어른의 본을 받아 배우는 어린아이의 모습이에요.', dir:'left' },
      { txt:'📏', label:'이끄는 손 회초리(攵)', meaning:'올바른 길로 가도록 손에 도구를 쥐고 이끌어요.', dir:'right' }
    ],
    story:'선생님이 손(攵)에 회초리를 들고 사랑으로 아이(孝)가 바른길을 걷도록 지혜를 일깨워 주는 “가르치다”를 뜻해요.',
    words:[ {word:'敎室', reading:'교실', meaning:'가르치고 배우는 방'}, {word:'敎育', reading:'교육', meaning:'가르쳐 기르는 일'}, {word:'敎科書', reading:'교과서', meaning:'학습용 책'} ] },

  { id:'h_room', char:'室', sound:'실', meaning:'집, 방, 방 실', category:'school', level:3, strokes:9,
    parts:[
      { txt:'🏠', label:'집 면(宀)', meaning:'지붕이 덮인 아늑한 건물이에요.', dir:'top' },
      { txt:'🎯', label:'이를 지(至)', meaning:'화살이 표적에 이르듯 사람이 찾아와 머물러요.', dir:'bottom' }
    ],
    story:'지붕(宀) 아래에 사람이 딱 도착하여(至) 편안하게 머무르며 공부하거나 쉬는 공간인 “방(집)”을 나타냈어요.',
    words:[ {word:'敎室', reading:'교실', meaning:'수업하는 방'}, {word:'室內', reading:'실내', meaning:'방 안'}, {word:'圖書室', reading:'도서실', meaning:'책을 모아둔 방'} ] },

  { id:'h_letter', char:'文', sound:'문', meaning:'글월, 무늬, 글월 문', category:'school', level:2, strokes:4,
    parts:[{ txt:'紋', label:'가슴의 아름다운 무늬', meaning:'사람 가슴에 새겨진 정교한 문양 모양이에요.', dir:'center' }],
    story:'사람의 몸이나 옷에 새긴 아름다운 무늬의 모습을 본떠 마음의 생각을 곱게 새겨 표현한 “글/문장”을 뜻해요.',
    words:[ {word:'文字', reading:'문자', meaning:'글자와 말'}, {word:'文盲', reading:'문맹', meaning:'글을 모르는 사람'}, {word:'本文', reading:'본문', meaning:'글의 중심 내용'} ] },

  { id:'h_character', char:'字', sound:'자', meaning:'글자, 글자 자', category:'school', level:2, strokes:6,
    parts:[
      { txt:'🏠', label:'집 면(宀)', meaning:'지붕 아래 따뜻한 배움의 보금자리예요.', dir:'top' },
      { txt:'👶', label:'아이 자(子)', meaning:'아이가 무럭무럭 자라나듯 번성해요.', dir:'bottom' }
    ],
    story:'지붕(宀) 아래에서 아이(子)가 태어나 자라나듯, 기본 부수에서 파생되어 수없이 불어나는 “글자”를 뜻해요.',
    words:[ {word:'漢字', reading:'한자', meaning:'한문 글자'}, {word:'數字', reading:'숫자', meaning:'수를 나타내는 글자'}, {word:'點字', reading:'점자', meaning:'눈으로 못 볼 때 만지는 점 글자'} ] },

  { id:'h_book', char:'書', sound:'서', meaning:'글, 쓸, 책, 글 서', category:'school', level:4, strokes:10,
    parts:[
      { txt:'🖌️', label:'붓 율(聿)', meaning:'손에 붓대를 똑바로 쥐고 있는 모양이에요.', dir:'top' },
      { txt:'☀️', label:'말할 왈/먹물(曰)', meaning:'마음속 진리를 먹물로 종이에 드러내요.', dir:'bottom' }
    ],
    story:'손에 붓(聿)을 쥐고 먹물을 듬뿍 묻혀 마음속의 생각과 말(曰)을 하얀 종이에 정성껏 “쓰다”와 그렇게 엮은 “책”을 뜻해요.',
    words:[ {word:'讀書', reading:'독서', meaning:'책을 읽음'}, {word:'圖書館', reading:'도서관', meaning:'책을 보관하는 곳'}, {word:'書店', reading:'서점', meaning:'책을 파는 가게'} ] },

  { id:'h_brush', char:'筆', sound:'필', meaning:'붓, 필', category:'school', level:4, strokes:12,
    parts:[
      { txt:'🎋', label:'대나무 죽(竹/⺮)', meaning:'매끄러운 대나무 붓대예요.', dir:'top' },
      { txt:'🖌️', label:'붓 율(聿)', meaning:'손가락으로 쥐고 털을 맨 붓이에요.', dir:'bottom' }
    ],
    story:'속이 빈 가볍고 곧은 대나무(竹) 대롱 끝에 짐승의 부드러운 털을 묶어 손으로 쥐고 쓰는 도구인 “붓”을 나타냈어요.',
    words:[ {word:'筆記', reading:'필기', meaning:'붓이나 펜으로 적음'}, {word:'萬年筆', reading:'만년필', meaning:'잉크가 나오는 펜'}, {word:'鉛筆', reading:'연필', meaning:'흑심으로 쓰는 연필'} ] },

  { id:'h_door_gate', char:'門', sound:'문', meaning:'문, 문 문', category:'school', level:2, strokes:8,
    parts:[{ txt:'🚪', label:'좌우 두 짝의 문', meaning:'양옆으로 기둥을 세우고 가운데로 여닫는 문이에요.', dir:'center' }],
    story:'집이나 성의 입구에 양쪽으로 활짝 열리고 닫히는 두 짝짜리 문의 웅장한 모양을 그대로 그려 “문”을 나타냈어요.',
    words:[ {word:'校門', reading:'교문', meaning:'학교의 문'}, {word:'大門', reading:'대문', meaning:'큰 문'}, {word:'門口', reading:'문구', meaning:'문어귀'} ] },

  { id:'h_answer', char:'答', sound:'답', meaning:'대답할, 답할 답', category:'school', level:3, strokes:12,
    parts:[
      { txt:'🎋', label:'대나무 죽(竹/⺮)', meaning:'글을 적는 대나무 쪽지(죽간)예요.', dir:'top' },
      { txt:'🤝', label:'합할 합(合)', meaning:'물음에 꼭 맞게 뜻을 합쳐요.', dir:'bottom' }
    ],
    story:'상대방이 물어본 대나무 쪽지(竹)에 꼭 들어맞게(合) 알맞은 말을 전해주는 모습에서 “대답하다”를 뜻해요.',
    words:[ {word:'問答', reading:'문답', meaning:'묻고 답함'}, {word:'正答', reading:'정답', meaning:'바른 답'}, {word:'解答', reading:'해답', meaning:'문제를 푼 답'} ] },

  // ==========================================
  // 10. 생활 & 나라 (life)
  // ==========================================
  { id:'h_car', char:'車', sound:'차/거', meaning:'수레, 차, 수레 차', category:'life', level:2, strokes:7,
    parts:[
      { txt:'🛞', label:'양쪽 바퀴', meaning:'굴러가는 튼튼한 나무 바퀴 두 개예요.', dir:'center' },
      { txt:'🪵', label:'차축과 짐칸', meaning:'사람이 타고 짐을 싣는 널찍한 틀이에요.', dir:'center' }
    ],
    story:'두 바퀴가 굴러가고 짐칸이 달린 수레를 하늘 위에서 내려다본 모습을 본떠 “수레”와 “자동차”를 나타냈어요.',
    words:[ {word:'自動車', reading:'자동차', meaning:'스스로 움직이는 차'}, {word:'汽車', reading:'기차', meaning:'철길을 달리는 차'}, {word:'車道', reading:'차도', meaning:'차가 다니는 길'} ] },

  { id:'h_electric', char:'電', sound:'전', meaning:'번개, 전기, 번개 전', category:'life', level:4, strokes:13,
    parts:[
      { txt:'🌧️', label:'비 우(雨)', meaning:'먹구름에서 비가 쏟아지는 날씨예요.', dir:'top' },
      { txt:'⚡', label:'번쩍이는 번개(申)', meaning:'하늘에서 지그재그로 내리꽂히는 불빛이에요.', dir:'bottom' }
    ],
    story:'비(雨)가 쏟아질 때 먹구름 사이로 지그재그 번쩍이며 내리꽂히는 번개불(申)의 모습에서 “번개”와 “전기”를 뜻해요.',
    words:[ {word:'電話', reading:'전화', meaning:'전기로 말을 주고받는 기계'}, {word:'電氣', reading:'전기', meaning:'전기 에너지'}, {word:'電車', reading:'전차', meaning:'전기로 달리는 차'} ] },

  { id:'h_speak', char:'話', sound:'화', meaning:'말씀, 이야기, 말씀 화', category:'life', level:3, strokes:13,
    parts:[
      { txt:'💬', label:'말씀 언(言)', meaning:'입에서 정성스런 말이 퍼져나가요.', dir:'left' },
      { txt:'👅', label:'혀 설(舌)', meaning:'혀를 움직여 고운 소리를 내요.', dir:'right' }
    ],
    story:'입속의 혀(舌)를 부드럽게 움직여 마음속 생각(言)을 서로 소통하며 나누는 “말씀”과 “이야기”를 뜻해요.',
    words:[ {word:'對話', reading:'대화', meaning:'마주 보고 나누는 말'}, {word:'童話', reading:'동화', meaning:'어린이를 위한 이야기'}, {word:'話題', reading:'화제', meaning:'이야깃거리'} ] },

  { id:'h_air', char:'氣', sound:'기', meaning:'기운, 공기, 기운 기', category:'life', level:3, strokes:10,
    parts:[
      { txt:'☁️', label:'피어오르는 구름(气)', meaning:'하늘로 솟구치는 기운과 아지랑이예요.', dir:'top' },
      { txt:'🍚', label:'쌀 미(米)', meaning:'김이 모락모락 나는 따뜻한 밥이에요.', dir:'bottom' }
    ],
    story:'따뜻한 쌀밥(米)에서 피어오르는 모락모락 김과 온 우주에 가득 차 생명을 움직이는 보이지 않는 “기운(공기)”을 뜻해요.',
    words:[ {word:'空氣', reading:'공기', meaning:'숨 쉬는 맑은 기운'}, {word:'氣溫', reading:'기온', meaning:'공기의 온도'}, {word:'人氣', reading:'인기', meaning:'사람들의 호감'} ] },

  { id:'h_power', char:'力', sound:'력', meaning:'힘, 힘 력', category:'life', level:1, strokes:2,
    parts:[{ txt:'💪', label:'알통이 솟은 팔', meaning:'근육에 팽팽하게 힘을 준 튼튼한 팔뚝이에요.', dir:'center' }],
    story:'팔에 힘을 꽉 주었을 때 불끈 솟아오르는 튼튼한 알통과 쟁기를 쥐고 밭을 가는 힘센 모습을 본떠 “힘”을 나타냈어요.',
    words:[ {word:'努力', reading:'노력', meaning:'힘을 다해 애씀'}, {word:'能力', reading:'능력', meaning:'일을 해내는 힘'}, {word:'氣力', reading:'기력', meaning:'몸과 마음의 힘'} ] },

  { id:'h_country', char:'國', sound:'국', meaning:'나라, 나라 국', category:'life', level:4, strokes:11,
    parts:[
      { txt:'🏰', label:'사방의 국경선(囗)', meaning:'나라를 튼튼하게 지키는 성벽이에요.', dir:'center' },
      { txt:'🪖', label:'창으로 지킴(或)', meaning:'창(戈)을 들고 백성과 영토(一)를 수호해요.', dir:'center' }
    ],
    story:'사방 성벽 국경선(囗) 안에서 용감한 군사가 창(戈)을 쥐고 땅과 백성을 소중히 지켜내는 “나라”를 나타낸 글자예요.',
    words:[ {word:'國家', reading:'국가', meaning:'나라'}, {word:'國民', reading:'국민', meaning:'그 나라의 백성'}, {word:'國旗', reading:'국기', meaning:'나라의 상징 깃발'} ] },

  { id:'h_people', char:'民', sound:'민', meaning:'백성, 사람, 백성 민', category:'life', level:3, strokes:5,
    parts:[{ txt:'👁️', label:'지혜의 눈을 뜬 백성', meaning:'침으로 눈을 찔리듯 억압받던 사람이 눈을 뜨는 모양이에요.', dir:'center' }],
    story:'한 나라의 흙을 일구고 나라의 굳건한 뿌리가 되는 평범하고 지혜로운 수많은 “백성(국민)”을 나타낸 글자예요.',
    words:[ {word:'市民', reading:'시민', meaning:'도시의 주민'}, {word:'民主', reading:'민주', meaning:'백성이 주인이 됨'}, {word:'民族', reading:'민족', meaning:'같은 핏줄의 겨레'} ] },

  { id:'h_king', char:'王', sound:'왕', meaning:'임금, 우두머리, 임금 왕', category:'life', level:2, strokes:4,
    parts:[
      { txt:'三', label:'하늘, 사람, 땅(三)', meaning:'세상의 3대 기본 요소예요.', dir:'center' },
      { txt:'丨', label:'꿰뚫어 잇는 기둥(丨)', meaning:'천지인의 이치를 하나로 통솔해요.', dir:'center' }
    ],
    story:'하늘(위 一), 사람(중간 一), 땅(아래 一)의 조화를 하나의 큰 기둥(丨)으로 꿰뚫어 다스리는 으뜸 “임금”을 나타냈어요.',
    words:[ {word:'王國', reading:'왕국', meaning:'임금이 다스리는 나라'}, {word:'王子', reading:'왕자', meaning:'임금의 아들'}, {word:'女王', reading:'여왕', meaning:'여자 임금'} ] },

  { id:'h_army', char:'軍', sound:'군', meaning:'군사, 군대, 군사 군', category:'life', level:4, strokes:9,
    parts:[
      { txt:'⛺', label:'진영 덮개(冖)', meaning:'군사들이 머무는 막사의 지붕이에요.', dir:'top' },
      { txt:'🛞', label:'전쟁 수레(車)', meaning:'성벽을 둘러싸고 진을 친 전차예요.', dir:'bottom' }
    ],
    story:'진지(冖) 주위에 전쟁 수레(車)를 둥글게 둘러싸 진을 치고 나라를 지키는 늠름한 “군사/군대”를 뜻해요.',
    words:[ {word:'軍隊', reading:'군대', meaning:'나라를 지키는 군사 조직'}, {word:'海軍', reading:'해군', meaning:'바다를 지키는 군대'}, {word:'將軍', reading:'장군', meaning:'군대를 이끄는 장수'} ] },

  { id:'h_city', char:'市', sound:'시', meaning:'저자, 시, 저자 시', category:'life', level:3, strokes:5,
    parts:[
      { txt:'🚩', label:'시장 깃발(亠)', meaning:'사람들이 모여드는 장터의 깃발이에요.', dir:'top' },
      { txt:'🧺', label:'가득 찬 장터(巾)', meaning:'온갖 물건을 펼쳐놓고 파는 모습이에요.', dir:'bottom' }
    ],
    story:'높이 깃발(亠)을 꽂아 장이 섰음을 알리고, 수많은 사람들이 모여 물건을 사고파는 번화한 “시장(저자)”과 “도시”를 뜻해요.',
    words:[ {word:'市場', reading:'시장', meaning:'물건을 사고파는 장소'}, {word:'都市', reading:'도시', meaning:'사람이 많이 모여 사는 번화한 곳'}, {word:'市民', reading:'시민', meaning:'도시의 사람'} ] },

  { id:'h_town', char:'邑', sound:'읍', meaning:'고을, 마을, 고을 읍', category:'life', level:4, strokes:7,
    parts:[
      { txt:'🔲', label:'둘러싼 성곽(囗)', meaning:'마을을 아늑하게 둘러싼 울타리예요.', dir:'top' },
      { txt:'🙇', label:'무릎 꿇은 사람(巴)', meaning:'성안에서 정답게 모여 사는 백성이에요.', dir:'bottom' }
    ],
    story:'성곽(囗) 안에서 수많은 사람들이 무릎을 맞대고(巴) 옹기종기 정답게 모여 사는 평화로운 “고을(마을)”을 나타냈어요.',
    words:[ {word:'面邑', reading:'면읍', meaning:'지방 행정 구역'}, {word:'邑內', reading:'읍내', meaning:'고을의 중심지'} ] },

  { id:'h_village', char:'里', sound:'리', meaning:'마을, 거리 단위, 마을 리', category:'life', level:2, strokes:7,
    parts:[
      { txt:'🌾', label:'밭 전(田)', meaning:'농사를 짓는 비옥한 밭이에요.', dir:'top' },
      { txt:'🌱', label:'흙 토(土)', meaning:'생명을 길러내는 넉넉한 흙이에요.', dir:'bottom' }
    ],
    story:'비옥한 밭(田)과 기름진 흙(土)이 있어 농사를 지으며 이웃끼리 터전을 이루고 모여 사는 “마을”을 나타냈어요.',
    words:[ {word:'里長', reading:'이장', meaning:'마을의 우두머리'}, {word:'千里', reading:'천리', meaning:'아주 먼 거리'}, {word:'隣里', reading:'인리(이웃)', meaning:'이웃 마을'} ] },

  { id:'h_way', char:'道', sound:'도', meaning:'길, 도리, 길 도', category:'life', level:3, strokes:12,
    parts:[
      { txt:'🚶', label:'걸어갈 착(辶/辵)', meaning:'발걸음으로 앞으로 나아가는 모습이에요.', dir:'left' },
      { txt:'🧠', label:'머리 수(首)', meaning:'생각하고 눈으로 앞을 바라보는 머리예요.', dir:'right' }
    ],
    story:'사람이 머리(首)로 바른 방향을 생각하며 발(辶)로 뚜벅뚜벅 걸어가는 사람의 “길”과 마땅히 지켜야 할 “도리”를 뜻해요.',
    words:[ {word:'道路', reading:'도로', meaning:'사람과 차가 다니는 길'}, {word:'道徳', reading:'도덕', meaning:'사람으로서 지킬 도리'}, {word:'車道', reading:'차도', meaning:'차가 다니는 길'} ] },

  // ==========================================
  // 11. 천자문 명구 (thousand) - 최고 난이도 6단계
  // ==========================================
  { id:'h_dark', char:'玄', sound:'현', meaning:'검을, 아득할, 검을 현', category:'thousand', level:6, strokes:5,
    parts:[
      { txt:'🌌', label:'아득한 하늘 지붕(亠)', meaning:'끝없이 펼쳐진 아득한 우주의 덮개예요.', dir:'top' },
      { txt:'🧶', label:'가느다란 실타래(幺)', meaning:'실타래를 검푸르게 물들인 깊은 빛깔이에요.', dir:'bottom' }
    ],
    story:'천자문의 첫 구절 "天地玄黃(천지현황)"에 나오는 글자로, 끝없이 아득한 우주 하늘의 깊고 검푸른 신비로운 “검은빛”을 뜻해요.',
    words:[ {word:'天地玄黃', reading:'천지현황', meaning:'하늘은 검고 땅은 누르다'}, {word:'玄關', reading:'현관', meaning:'건물의 주된 출입구'}, {word:'玄妙', reading:'현묘', meaning:'이치가 깊고 묘함'} ] },

  { id:'h_space_u', char:'宇', sound:'우', meaning:'집, 무한한 공간, 집 우', category:'thousand', level:6, strokes:6,
    parts:[
      { txt:'🏠', label:'지붕 집 면(宀)', meaning:'온 세상을 덮고 있는 거대한 지붕이에요.', dir:'top' },
      { txt:'🪓', label:'굽은 처마 우(于)', meaning:'사방으로 끝없이 뻗어나간 처마예요.', dir:'bottom' }
    ],
    story:'천자문 "宇宙洪荒(우주홍황)"의 첫 글자로, 지붕(宀)처럼 상하사방 끝없이 넓게 펼쳐진 삼차원 “공간(우주)”을 뜻해요.',
    words:[ {word:'宇宙', reading:'우주', meaning:'온 세상의 무한한 시공간'}, {word:'宇宙船', reading:'우주선', meaning:'우주를 비행하는 배'}, {word:'宇內', reading:'우내', meaning:'천하, 온 세상'} ] },

  { id:'h_space_ju', char:'宙', sound:'주', meaning:'집, 영원한 시간, 집 주', category:'thousand', level:6, strokes:8,
    parts:[
      { txt:'🏠', label:'지붕 집 면(宀)', meaning:'과거와 미래를 품은 시간의 집이에요.', dir:'top' },
      { txt:'🌱', label:'말미암을 유(由)', meaning:'과거에서 오늘로 이어져 내려오는 줄기예요.', dir:'bottom' }
    ],
    story:'천자문 "宇宙洪荒(우주홍황)"의 둘째 글자로, 태초부터 영원히 쉼 없이 흘러가는 무한한 “시간(역사)”을 뜻해요.',
    words:[ {word:'宇宙', reading:'우주', meaning:'무한한 공간과 영원한 시간'}, {word:'宙合', reading:'주합', meaning:'천지와 시공간의 조화'} ] },

  { id:'h_flood', char:'洪', sound:'홍', meaning:'넓을, 클, 넓을 홍', category:'thousand', level:6, strokes:9,
    parts:[
      { txt:'💧', label:'삼수변 물(氵)', meaning:'도도하게 넘쳐흐르는 거대한 물결이에요.', dir:'left' },
      { txt:'🤝', label:'함께 공(共)', meaning:'온 강물이 다 함께 합쳐져요.', dir:'right' }
    ],
    story:'온 세상의 물(氵)이 다 함께(共) 합쳐져 끝없이 넓고 거대하게 넘실대는 광대한 “넓음/큼”을 뜻해요.',
    words:[ {word:'洪水', reading:'홍수', meaning:'비가 많이 와서 물이 크게 넘침'}, {word:'宇宙洪荒', reading:'우주홍황', meaning:'우주는 넓고 아득히 거칠다'}, {word:'洪恩', reading:'홍은', meaning:'넓고 큰 은혜'} ] },

  { id:'h_wild', char:'荒', sound:'황', meaning:'거칠, 아득할, 거칠 황', category:'thousand', level:6, strokes:9,
    parts:[
      { txt:'🌱', label:'풀초 머리(艹)', meaning:'원시 대자연에 무성한 풀이에요.', dir:'top' },
      { txt:'💧', label:'망할 망/흐를 망(亡/川)', meaning:'길도 없이 아득하게 펼쳐진 황야예요.', dir:'bottom' }
    ],
    story:'천자문 "宇宙洪荒"의 구절로, 사람의 손길이 닿지 않은 태초의 대우주가 아득하고 거대하게 펼쳐진 “거침/아득함”을 뜻해요.',
    words:[ {word:'荒野', reading:'황야', meaning:'거칠고 넓은 들판'}, {word:'荒唐', reading:'황당', meaning:'말이나 행동이 터무니없음'}, {word:'荒蕪地', reading:'황무지', meaning:'버려진 거친 땅'} ] },

  { id:'h_star_jin', char:'辰', sound:'진/신', meaning:'별, 때, 지지 진', category:'thousand', level:6, strokes:7,
    parts:[
      { txt:'🪨', label:'바위 언덕(厂)', meaning:'하늘의 높은 언덕이에요.', dir:'top' },
      { txt:'🐚', label:'조개와 발(𧘇/二)', meaning:'봄이 되어 조개가 입을 벌리듯 별이 반짝여요.', dir:'bottom' }
    ],
    story:'천자문 "辰宿列張(진숙열장)"에 나오는 글자로, 밤하늘 언덕 위에서 찬란하게 반짝이는 모든 “별”과 농사짓는 “때”를 뜻해요.',
    words:[ {word:'星辰', reading:'성진', meaning:'밤하늘의 모든 별'}, {word:'辰宿列張', reading:'진숙열장', meaning:'별자리가 하늘에 벌여 베풀어지다'}, {word:'生辰', reading:'생신/생진', meaning:'생일의 높임말'} ] },

  { id:'h_star_suk', char:'宿', sound:'숙/수', meaning:'잘 숙, 별자리 수', category:'thousand', level:6, strokes:11,
    parts:[
      { txt:'🏠', label:'지붕 집 면(宀)', meaning:'밤하늘 별들이 깃드는 우주의 집이에요.', dir:'top' },
      { txt:'🛏️', label:'자리 백(百/亻/一)', meaning:'사람이 누워 곤히 잠드는 돗자리예요.', dir:'bottom' }
    ],
    story:'사람이 집(宀)에 머물러 자듯(숙), 밤하늘의 28개 별자리들이 하늘에 질서 있게 깃들어 빛나는 “별자리(수)”를 뜻해요.',
    words:[ {word:'星座', reading:'성수(성좌)', meaning:'하늘의 별자리'}, {word:'宿題', reading:'숙제', meaning:'집에서 해 오는 과제'}, {word:'宿泊', reading:'숙박', meaning:'여관 등에 묵음'} ] },

  { id:'h_line_yeol', char:'列', sound:'렬(열)', meaning:'벌일, 줄지을, 줄 열', category:'thousand', level:6, strokes:6,
    parts:[
      { txt:'🦴', label:'뼈 앙상할 알(歹)', meaning:'가지런히 정돈된 뼈대 모양이에요.', dir:'left' },
      { txt:'🔪', label:'칼 도(刂)', meaning:'칼로 반듯반듯하게 줄을 맞추어 정렬해요.', dir:'right' }
    ],
    story:'칼(刂)로 자른 듯 밤하늘의 수많은 별자리들이 규칙에 따라 질서정연하게 늘어서 있는 “줄지음/벌임”을 뜻해요.',
    words:[ {word:'列車', reading:'열차', meaning:'줄지어 이어진 기차'}, {word:'行列', reading:'행렬', meaning:'줄을 지어 감'}, {word:'列島', reading:'열도', meaning:'줄지어 늘어선 섬들'} ] },

  { id:'h_spread', char:'張', sound:'장', meaning:'베풀, 펼, 베풀 장', category:'thousand', level:6, strokes:11,
    parts:[
      { txt:'🏹', label:'활 궁(弓)', meaning:'팽팽하게 시위를 당긴 활이에요.', dir:'left' },
      { txt:'👴', label:'길 장(長)', meaning:'활시위를 길게 끝까지 당겨 펼쳐요.', dir:'right' }
    ],
    story:'활(弓)시위를 길게(長) 힘껏 당겨 활짝 펴듯, 광활한 밤하늘에 은하수와 별빛이 눈부시게 펼쳐진 “베풂/펼침”을 뜻해요.',
    words:[ {word:'主張', reading:'주장', meaning:'자기 뜻을 펼침'}, {word:'緊張', reading:'긴장', meaning:'마음을 팽팽하게 죔'}, {word:'擴張', reading:'확장', meaning:'넓혀서 크게 펼침'} ] },

  { id:'h_cold', char:'寒', sound:'한', meaning:'찰, 추울, 찰 한', category:'thousand', level:6, strokes:12,
    parts:[
      { txt:'🏠', label:'집 면(宀)', meaning:'추위를 피하는 집이에요.', dir:'top' },
      { txt:'🌾', label:'풀과 짚(艸/人)', meaning:'짚풀을 몸에 두르고 추위를 견뎌요.', dir:'center' },
      { txt:'🧊', label:'얼음 빙(冫/井)', meaning:'마루 밑에 꽁꽁 언 얼음 알갱이예요.', dir:'bottom' }
    ],
    story:'천자문 "寒來暑往(한래서왕)"의 첫 글자로, 집(宀) 안에서 짚풀을 덮고 있어도 얼음(冫)이 얼 만큼 살을 에는 “추위”를 뜻해요.',
    words:[ {word:'寒來暑往', reading:'한래서왕', meaning:'추위가 오면 더위가 가고'}, {word:'寒波', reading:'한파', meaning:'매서운 추위'}, {word:'惡戰苦鬪', reading:'대한(大寒)', meaning:'가장 추운 절기'} ] },

  { id:'h_come', char:'來', sound:'래(내)', meaning:'올, 올 래', category:'thousand', level:6, strokes:8,
    parts:[
      { txt:'🌾', label:'보리 이삭 모양', meaning:'줄기 끝에 알곡이 주렁주렁 매달린 보리예요.', dir:'center' },
      { txt:'🧍', label:'사람들(人人)', meaning:'하늘이 내려준 보리를 거두러 모여들어요.', dir:'center' }
    ],
    story:'하늘에서 백성들을 살리기 위해 곡식(보리)이 내려오듯, 시간과 계절이 순서대로 우리에게 다가오는 “오다”를 뜻해요.',
    words:[ {word:'未來', reading:'미래', meaning:'아직 오지 않은 앞날'}, {word:'來年', reading:'내년', meaning:'오는 해, 다음 해'}, {word:'往來', reading:'왕래', meaning:'오고 감'} ] },

  { id:'h_hot', char:'暑', sound:'서', meaning:'더울, 더울 서', category:'thousand', level:6, strokes:12,
    parts:[
      { txt:'☀️', label:'해 일(日)', meaning:'하늘에서 이글이글 타오르는 붉은 태양이에요.', dir:'top' },
      { txt:'🧑‍🌾', label:'놈 자/사람(者)', meaning:'뜨거운 햇볕 아래 땀 흘리는 사람이에요.', dir:'bottom' }
    ],
    story:'천자문 "寒來暑往(한래서왕)"의 구절로, 머리 위에서 태양(日)이 맹렬하게 내리쬐어 온 대지가 펄펄 끓는 “더위”를 뜻해요.',
    words:[ {word:'避暑', reading:'피서', meaning:'더위를 피하여 감'}, {word:'酷暑', reading:'혹서', meaning:'혹독한 더위'}, {word:'暑中', reading:'서중', meaning:'더위의 한가운데'} ] },

  { id:'h_go', char:'往', sound:'왕', meaning:'갈, 지난, 갈 왕', category:'thousand', level:6, strokes:8,
    parts:[
      { txt:'🚶', label:'걸어갈 척(彳)', meaning:'길을 따라 걸어가는 발걸음이에요.', dir:'left' },
      { txt:'🕯️', label:'주인 주/촛불(主)', meaning:'목적지를 향해 똑바로 나아가요.', dir:'right' }
    ],
    story:'길(彳)을 따라 발걸음을 멈추지 않고 저 멀리 목적지를 향해 앞으로 나아가 지나치는 “가다”와 “지나간 때”를 뜻해요.',
    words:[ {word:'往復', reading:'왕복', meaning:'갔다가 돌아옴'}, {word:'往生', reading:'왕생', meaning:'극락에 감'}, {word:'往年', reading:'왕년', meaning:'지나간 옛 시절'} ] },

  { id:'h_gather', char:'收', sound:'수', meaning:'거둘, 거둘 수', category:'thousand', level:6, strokes:6,
    parts:[
      { txt:'🧵', label:'얽힐 구(丩)', meaning:'잘 익은 곡식 단을 끈으로 묶는 모양이에요.', dir:'left' },
      { txt:'🌾', label:'손에 든 칠 복(攵)', meaning:'손으로 볏단을 쳐서 알곡을 알뜰히 거두어요.', dir:'right' }
    ],
    story:'천자문 "秋收冬藏(추수동장)"에 나오는 글자로, 가을에 풍성하게 익은 곡식 단을 손(攵)으로 알뜰하게 “거두어들임”을 뜻해요.',
    words:[ {word:'秋收', reading:'추수', meaning:'가을에 곡식을 거둠'}, {word:'收穫', reading:'수확', meaning:'농작물을 거두어들임'}, {word:'收入', reading:'수입', meaning:'벌어들이는 돈'} ] },

  { id:'h_store', char:'藏', sound:'장', meaning:'감출, 간직할, 감출 장', category:'thousand', level:6, strokes:17,
    parts:[
      { txt:'🌱', label:'풀초 머리(艹)', meaning:'곡식과 보물을 풀과 짚으로 감싸요.', dir:'top' },
      { txt:'🪖', label:'착할 장/창(臧/戈)', meaning:'신하와 군사가 비밀 곳간을 굳게 지켜요.', dir:'bottom' }
    ],
    story:'천자문 "秋收冬藏"의 구절로, 거둔 귀한 알곡과 보물을 겨우내 안전하게 곳간 깊숙이 소중하게 “감추고 간직함”을 뜻해요.',
    words:[ {word:'貯藏', reading:'저장', meaning:'물건을 모아 간직함'}, {word:'冷藏庫', reading:'냉장고', meaning:'차갑게 보관하는 통'}, {word:'萬寶藏', reading:'만보장', meaning:'온갖 보물을 감춘 곳'} ] },

  { id:'h_cry', char:'鳴', sound:'명', meaning:'울, 소리낼, 울 명', category:'thousand', level:6, strokes:14,
    parts:[
      { txt:'👄', label:'입 구(口)', meaning:'맑고 고운 소리를 내는 입이에요.', dir:'left' },
      { txt:'🦜', label:'새 조(鳥)', meaning:'나뭇가지에 앉은 아름다운 새예요.', dir:'right' }
    ],
    story:'천자문 "鳴鳳在樹(명봉재수)"에 나오는 글자로, 나뭇가지에 앉은 새(鳥)가 입(口)을 벌려 청아하게 노래하며 “우는 소리”를 뜻해요.',
    words:[ {word:'鳴鳳在樹', reading:'명봉재수', meaning:'우는 봉황이 나무에 앉아 있다'}, {word:'悲鳴', reading:'비명', meaning:'놀라거나 슬퍼서 지르는 소리'}, {word:'共鳴', reading:'공명', meaning:'남의 마음에 깊이 울려 퍼짐'} ] },

  { id:'h_phoenix', char:'鳳', sound:'봉', meaning:'봉황, 봉황 봉', category:'thousand', level:6, strokes:14,
    parts:[
      { txt:'🪶', label:'바람 풍(凡/風)', meaning:'신비로운 바람을 일으키며 날아요.', dir:'center' },
      { txt:'🦜', label:'새 조(鳥)', meaning:'성스러운 임금의 덕을 상징하는 전설의 새예요.', dir:'center' }
    ],
    story:'천자문 "鳴鳳在樹"의 구절로, 세상이 평화롭고 성스러울 때 나타나 영롱한 소리로 노래하는 전설 속 상서로운 영물 “봉황”을 뜻해요.',
    words:[ {word:'鳳凰', reading:'봉황', meaning:'전설 속 성스러운 영물 새'}, {word:'鳳仙花', reading:'봉선화', meaning:'봉황 모양의 고운 꽃'} ] },

  { id:'h_white_colt', char:'駒', sound:'구', meaning:'망아지, 망아지 구', category:'thousand', level:6, strokes:15,
    parts:[
      { txt:'🐴', label:'말 마(馬)', meaning:'늠름한 기상을 지닌 말이에요.', dir:'left' },
      { txt:'👶', label:'글귀 구/어릴 구(句)', meaning:'아직 몸이 작은 어린 새끼예요.', dir:'right' }
    ],
    story:'천자문 "白駒食場(백구식장: 흰 망아지가 마당의 풀을 뜯는다)"에 나오는 글자로, 힘차고 티 없이 뛰노는 건강한 “어린 망아지”를 뜻해요.',
    words:[ {word:'白駒食場', reading:'백구식장', meaning:'흰 망아지가 마당의 풀을 뜯음(어진 선비의 평화)'}, {word:'千里駒', reading:'천리구', meaning:'장차 큰 인물이 될 뛰어난 아이'} ] },

  { id:'h_eat', char:'食', sound:'식/사', meaning:'밥, 먹을, 밥 식', category:'thousand', level:2, strokes:9,
    parts:[
      { txt:'🏠', label:'모을 집(亼)', meaning:'뚜껑을 덮어 따뜻하게 모은 그릇이에요.', dir:'top' },
      { txt:'🥣', label:'고소한 밥그릇(皀)', meaning:'하얀 쌀밥이 소복하게 담긴 밥그릇이에요.', dir:'bottom' }
    ],
    story:'천자문 "白駒食場"의 글자로, 밥그릇(皀)에 소복하게 담긴 맛있는 곡식을 뚜껑(亼)을 열고 맛있게 “먹다”와 그 “밥”을 뜻해요.',
    words:[ {word:'食事', reading:'식사', meaning:'밥을 먹는 일'}, {word:'飮食', reading:'음식', meaning:'마시고 먹는 온갖 것'}, {word:'朝食', reading:'조식', meaning:'아침밥'} ] }
];

// 다른 파일에서 쉽게 참조할 수 있도록 전역에 등록
if (typeof window !== 'undefined') {
  window.LEVELS = LEVELS;
  window.CATEGORIES = CATEGORIES;
  window.HANZI_DATA = HANZI_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LEVELS, CATEGORIES, HANZI_DATA };
}
