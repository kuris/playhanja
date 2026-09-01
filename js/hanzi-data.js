/* ============================================================
   한자야 놀자! - 한자 학습 데이터
   초등 1학년부터 시작하는 생활 한자 54자
   ============================================================ */

// 학습 단계(레벨) 정보
const LEVELS = [
  { id: 1, name: '새싹 단계', badge: '🌱', desc: '가장 쉬운 그림 한자' },
  { id: 2, name: '나무 단계', badge: '🌳', desc: '두 가지 뜻이 합쳐진 한자' },
  { id: 3, name: '열매 단계', badge: '🍎', desc: '조금 더 어려운 한자' }
];

// 카테고리(주제) 정보 - 생활에서 자주 쓰는 순서로 배치
const CATEGORIES = [
  { id: 'nature', name: '자연 & 요일', icon: '🌤️', color: '#2f9e6e', desc: '해, 달, 불, 물처럼 요일 이름에도 쓰이는 한자' },
  { id: 'number', name: '숫자', icon: '🔢', color: '#3b82f6', desc: '하나부터 열까지, 매일 쓰는 숫자 한자' },
  { id: 'body', name: '몸과 사람', icon: '🧍', color: '#f59e0b', desc: '나와 내 몸을 나타내는 한자' },
  { id: 'family', name: '가족', icon: '👨‍👩‍👧', color: '#ef4444', desc: '아빠, 엄마, 형, 동생을 나타내는 한자' },
  { id: 'school', name: '학교', icon: '🏫', color: '#8b5cf6', desc: '학교에서 매일 만나는 한자' },
  { id: 'life', name: '생활', icon: '🏠', color: '#06b6d4', desc: '집, 문, 자동차처럼 생활 속 한자' }
];

/*
  각 한자 데이터 구조
  id       : 고유 아이디
  char     : 한자
  sound    : 한자의 소리(음)
  meaning  : 한자의 뜻
  category : 카테고리 id
  level    : 난이도(1~3)
  strokes  : 획수
  parts    : 애니메이션에 쓰이는 부수/구성 요소 배열
             { txt: 표시할 그림/글자, label: 짧은 이름, meaning: 설명, dir: 시작 방향 }
  story    : 한자가 만들어진 이야기(모든 부분이 합쳐진 뜻)
  words    : 실생활에서 자주 쓰는 낱말 예시 [{ word, reading, meaning }]
*/
const HANZI_DATA = [
  // ------------------ 자연 & 요일 ------------------
  { id:'h_day', char:'日', sound:'일', meaning:'해, 날', category:'nature', level:1, strokes:4,
    parts:[{ txt:'☀️', label:'해 모양', meaning:'둥근 해님을 본떠 그리다가 점점 네모난 모양이 되었어요.', dir:'center' }],
    story:'옛날 사람들은 하늘에 뜬 동그란 해를 보고 그림을 그렸어요. 그래서 日은 “해” 또는 “날(하루)”을 뜻해요.',
    words:[ {word:'日요일', reading:'일요일', meaning:'한 주의 첫째 날'}, {word:'生日', reading:'생일', meaning:'태어난 날'} ] },

  { id:'h_moon', char:'月', sound:'월', meaning:'달', category:'nature', level:1, strokes:4,
    parts:[{ txt:'🌙', label:'달 모양', meaning:'초승달처럼 둥그렇게 휘어진 달의 모습을 그렸어요.', dir:'center' }],
    story:'하늘에 떠 있는 달의 모양을 그대로 그린 글자예요. 그래서 月은 “달”이나 “달(月)력의 한 달”을 뜻해요.',
    words:[ {word:'月요일', reading:'월요일', meaning:'한 주의 둘째 날'}, {word:'月光', reading:'월광', meaning:'달빛'} ] },

  { id:'h_fire', char:'火', sound:'화', meaning:'불', category:'nature', level:1, strokes:4,
    parts:[{ txt:'🔥', label:'불꽃 모양', meaning:'불꽃이 위로 타오르는 모습을 그렸어요.', dir:'center' }],
    story:'활활 타오르는 불꽃의 모양을 그린 글자예요. 그래서 火는 “불”을 뜻해요.',
    words:[ {word:'火요일', reading:'화요일', meaning:'한 주의 셋째 날'}, {word:'火山', reading:'화산', meaning:'불을 뿜는 산'} ] },

  { id:'h_water', char:'水', sound:'수', meaning:'물', category:'nature', level:1, strokes:4,
    parts:[{ txt:'💧', label:'물결 모양', meaning:'물이 굽이쳐 흐르는 물결 모습을 그렸어요.', dir:'center' }],
    story:'강물이 흘러가는 물결 모양을 그린 글자예요. 그래서 水는 “물”을 뜻해요.',
    words:[ {word:'水요일', reading:'수요일', meaning:'한 주의 넷째 날'}, {word:'水泳', reading:'수영', meaning:'물에서 헤엄치기'} ] },

  { id:'h_tree', char:'木', sound:'목', meaning:'나무', category:'nature', level:1, strokes:4,
    parts:[{ txt:'🌳', label:'나무 모양', meaning:'뿌리, 줄기, 가지가 있는 나무의 모습을 그렸어요.', dir:'center' }],
    story:'땅에 뿌리를 내리고 서 있는 나무의 모습을 그린 글자예요. 그래서 木은 “나무”를 뜻해요.',
    words:[ {word:'木요일', reading:'목요일', meaning:'한 주의 다섯째 날'}, {word:'植木', reading:'식목', meaning:'나무를 심는 일'} ] },

  { id:'h_gold', char:'金', sound:'금', meaning:'쇠, 금', category:'nature', level:2, strokes:8,
    parts:[{ txt:'⛏️', label:'반짝이는 쇠', meaning:'흙(土) 속에 반짝이는 쇳조각이 묻혀 있는 모습이에요.', dir:'center' }],
    story:'흙 속에 숨어 있는 반짝이는 쇠(금속)를 캐내는 모습을 그린 글자예요. 그래서 金은 “쇠”나 “금”을 뜻해요.',
    words:[ {word:'金요일', reading:'금요일', meaning:'한 주의 여섯째 날'}, {word:'黃金', reading:'황금', meaning:'누런빛의 금'} ] },

  { id:'h_earth', char:'土', sound:'토', meaning:'흙', category:'nature', level:1, strokes:3,
    parts:[{ txt:'🌱', label:'흙더미와 새싹', meaning:'흙더미 위에 새싹이 돋아난 모습을 그렸어요.', dir:'center' }],
    story:'흙이 쌓인 땅 위로 새싹이 솟아난 모습을 그린 글자예요. 그래서 土는 “흙”을 뜻해요.',
    words:[ {word:'土요일', reading:'토요일', meaning:'한 주의 일곱째 날'}, {word:'土地', reading:'토지', meaning:'땅'} ] },

  { id:'h_mountain', char:'山', sound:'산', meaning:'산', category:'nature', level:1, strokes:3,
    parts:[{ txt:'⛰️', label:'세 봉우리', meaning:'우뚝 솟은 세 개의 산봉우리 모양을 그렸어요.', dir:'center' }],
    story:'뾰족뾰족한 산봉우리들이 늘어선 모양을 그린 글자예요. 그래서 山은 “산”을 뜻해요.',
    words:[ {word:'登山', reading:'등산', meaning:'산에 오르는 일'}, {word:'火山', reading:'화산', meaning:'불을 뿜는 산'} ] },

  { id:'h_river', char:'川', sound:'천', meaning:'내, 시내', category:'nature', level:1, strokes:3,
    parts:[{ txt:'🏞️', label:'흐르는 물줄기', meaning:'물이 세 줄기로 굽이굽이 흐르는 모습을 그렸어요.', dir:'center' }],
    story:'졸졸졸 흐르는 시냇물의 물줄기 모양을 그린 글자예요. 그래서 川은 “내(시내)”를 뜻해요.',
    words:[ {word:'山川', reading:'산천', meaning:'산과 시내, 자연'}, {word:'川邊', reading:'천변', meaning:'냇가'} ] },

  { id:'h_sky', char:'天', sound:'천', meaning:'하늘', category:'nature', level:1, strokes:4,
    parts:[{ txt:'☁️', label:'사람 위의 하늘', meaning:'사람(大)의 머리 위로 넓게 펼쳐진 하늘을 나타냈어요.', dir:'center' }],
    story:'사람 머리 위에 끝없이 펼쳐진 것을 그려서 “하늘”을 나타낸 글자예요.',
    words:[ {word:'天氣', reading:'천기→날씨', meaning:'날씨'}, {word:'天國', reading:'천국', meaning:'하늘 나라'} ] },

  { id:'h_land', char:'地', sound:'지', meaning:'땅', category:'nature', level:2, strokes:6,
    parts:[{ txt:'🌍', label:'넓게 펼쳐진 땅', meaning:'흙(土)이 끝없이 넓게 펼쳐진 모습이에요.', dir:'center' }],
    story:'우리가 딱 딛고 서 있는 흙과 땅을 나타낸 글자예요. 그래서 地는 “땅”을 뜻해요.',
    words:[ {word:'地圖', reading:'지도', meaning:'땅의 모양을 그린 그림'}, {word:'天地', reading:'천지', meaning:'하늘과 땅'} ] },

  { id:'h_rain', char:'雨', sound:'우', meaning:'비', category:'nature', level:2, strokes:8,
    parts:[{ txt:'🌧️', label:'떨어지는 빗방울', meaning:'하늘(구름) 아래로 빗방울이 뚝뚝 떨어지는 모습이에요.', dir:'center' }],
    story:'구름에서 빗방울이 떨어지는 모습을 그린 글자예요. 그래서 雨는 “비”를 뜻해요.',
    words:[ {word:'雨山', reading:'우산', meaning:'비를 막는 도구(우산)'}, {word:'雨天', reading:'우천', meaning:'비 오는 날'} ] },

  { id:'h_snow', char:'雪', sound:'설', meaning:'눈', category:'nature', level:3, strokes:11,
    parts:[
      { txt:'🌧️', label:'비(雨)', meaning:'하늘에서 무언가 떨어지는 모습이에요.', dir:'top' },
      { txt:'🧹', label:'손으로 쓸다(彐)', meaning:'손으로 쓸어 담을 수 있는 것이라는 뜻이에요.', dir:'bottom' }
    ],
    story:'하늘에서 내려서 손으로 쓸어 담을 수 있는 비, 바로 “눈”을 나타낸 글자예요.',
    words:[ {word:'雪山', reading:'설산', meaning:'눈이 쌓인 산'}, {word:'大雪', reading:'대설', meaning:'큰 눈'} ] },

  // ------------------ 숫자 ------------------
  { id:'h_1', char:'一', sound:'일', meaning:'하나', category:'number', level:1, strokes:1,
    parts:[{ txt:'①', label:'가로선 한 개', meaning:'가로줄 한 줄로 숫자 1을 나타내는 가장 간단한 글자예요.', dir:'center' }],
    story:'손가락 하나를 옆으로 눕혀 놓은 것처럼, 가로선 하나로 “하나(1)”를 나타냈어요.',
    words:[ {word:'一等', reading:'일등', meaning:'첫째 등수'}, {word:'第一', reading:'제일', meaning:'가장, 첫째'} ] },

  { id:'h_2', char:'二', sound:'이', meaning:'둘', category:'number', level:1, strokes:2,
    parts:[{ txt:'②', label:'가로선 두 개', meaning:'가로줄 두 줄을 나란히 그려서 숫자 2를 나타냈어요.', dir:'center' }],
    story:'가로선을 하나 더 그려서 “둘(2)”을 나타낸 글자예요.',
    words:[ {word:'二十', reading:'이십', meaning:'스물(20)'}, {word:'二重', reading:'이중', meaning:'두 겹'} ] },

  { id:'h_3', char:'三', sound:'삼', meaning:'셋', category:'number', level:1, strokes:3,
    parts:[{ txt:'③', label:'가로선 세 개', meaning:'가로줄 세 줄을 나란히 그려서 숫자 3을 나타냈어요.', dir:'center' }],
    story:'가로선을 세 개 그려서 “셋(3)”을 나타낸 글자예요.',
    words:[ {word:'三角形', reading:'삼각형', meaning:'모서리가 세 개인 모양'}, {word:'三月', reading:'삼월', meaning:'3월'} ] },

  { id:'h_4', char:'四', sound:'사', meaning:'넷', category:'number', level:2, strokes:5,
    parts:[{ txt:'④', label:'네모 속의 나눔', meaning:'사각 테두리 안에서 숨을 나누어 쉰다는 모습으로 4를 나타냈어요.', dir:'center' }],
    story:'네모난 테두리 안에 표시를 해서 “넷(4)”을 나타낸 글자예요.',
    words:[ {word:'四方', reading:'사방', meaning:'동서남북 네 방향'}, {word:'四季', reading:'사계', meaning:'봄여름가을겨울 네 계절'} ] },

  { id:'h_5', char:'五', sound:'오', meaning:'다섯', category:'number', level:1, strokes:4,
    parts:[{ txt:'⑤', label:'엇갈린 모양', meaning:'위아래 선 사이에 엇갈린 모양(X)이 있어 5를 나타냈어요.', dir:'center' }],
    story:'하늘과 땅(위아래 선) 사이에서 다섯 가지 기운이 엇갈린다는 뜻으로 “다섯(5)”을 나타냈어요.',
    words:[ {word:'五感', reading:'오감', meaning:'다섯 가지 감각'}, {word:'五月', reading:'오월', meaning:'5월'} ] },

  { id:'h_6', char:'六', sound:'육', meaning:'여섯', category:'number', level:1, strokes:4,
    parts:[{ txt:'⑥', label:'지붕과 사람', meaning:'지붕 모양 아래에 사람이 나뉘어 있는 모습으로 6을 나타냈어요.', dir:'center' }],
    story:'지붕처럼 생긴 모양 아래로 나뉜 모습을 그려서 “여섯(6)”을 나타낸 글자예요.',
    words:[ {word:'六角形', reading:'육각형', meaning:'모서리가 여섯 개인 모양'}, {word:'六月', reading:'육월→6월', meaning:'6월'} ] },

  { id:'h_7', char:'七', sound:'칠', meaning:'일곱', category:'number', level:1, strokes:2,
    parts:[{ txt:'⑦', label:'구부러진 십(十)', meaning:'열 십(十)과 비슷하지만 아래가 구부러져 7을 나타냈어요.', dir:'center' }],
    story:'십(十)자 모양의 아래쪽을 살짝 구부려서 “일곱(7)”을 나타낸 글자예요.',
    words:[ {word:'七夕', reading:'칠석', meaning:'음력 7월 7일'}, {word:'七十', reading:'칠십', meaning:'일흔(70)'} ] },

  { id:'h_8', char:'八', sound:'팔', meaning:'여덟', category:'number', level:1, strokes:2,
    parts:[{ txt:'⑧', label:'양쪽으로 갈라짐', meaning:'선 두 개가 양쪽으로 갈라지는 모양으로 8을 나타냈어요.', dir:'center' }],
    story:'하나가 둘로 나뉘어 양쪽으로 갈라지는 모양으로 “여덟(8)”을 나타낸 글자예요.',
    words:[ {word:'八月', reading:'팔월', meaning:'8월'}, {word:'四方八方', reading:'사방팔방', meaning:'여러 방향'} ] },

  { id:'h_9', char:'九', sound:'구', meaning:'아홉', category:'number', level:1, strokes:2,
    parts:[{ txt:'⑨', label:'구부러진 선', meaning:'끝까지 구부러진 선 모양으로 9를 나타냈어요.', dir:'center' }],
    story:'꼬불꼬불 구부러진 선 모양을 그려서 “아홉(9)”을 나타낸 글자예요.',
    words:[ {word:'九十九', reading:'구십구', meaning:'아흔아홉(99)'}, {word:'九月', reading:'구월', meaning:'9월'} ] },

  { id:'h_10', char:'十', sound:'십', meaning:'열', category:'number', level:1, strokes:2,
    parts:[{ txt:'⑩', label:'십자 모양', meaning:'가로선과 세로선이 만나 십자(+) 모양으로 10을 나타냈어요.', dir:'center' }],
    story:'가로선과 세로선이 딱 만나는 모양으로 “열(10)”을 나타낸 글자예요.',
    words:[ {word:'十字', reading:'십자', meaning:'십자 모양'}, {word:'十月', reading:'시월', meaning:'10월'} ] },

  // ------------------ 몸과 사람 ------------------
  { id:'h_person', char:'人', sound:'인', meaning:'사람', category:'body', level:1, strokes:2,
    parts:[{ txt:'🧍', label:'옆으로 선 사람', meaning:'두 다리로 서 있는 사람의 옆모습을 그렸어요.', dir:'center' }],
    story:'팔과 다리를 가지고 옆으로 서 있는 사람의 모습을 그린 글자예요.',
    words:[ {word:'人形', reading:'인형', meaning:'사람 모양의 장난감'}, {word:'外國人', reading:'외국인', meaning:'다른 나라 사람'} ] },

  { id:'h_big', char:'大', sound:'대', meaning:'크다', category:'body', level:1, strokes:3,
    parts:[{ txt:'🙆', label:'팔다리를 벌린 사람', meaning:'사람이 두 팔과 두 다리를 크게 벌린 모습이에요.', dir:'center' }],
    story:'사람이 팔다리를 있는 힘껏 크게 벌린 모습으로 “크다”라는 뜻을 나타냈어요.',
    words:[ {word:'大門', reading:'대문', meaning:'큰 문'}, {word:'大王', reading:'대왕', meaning:'큰 임금'} ] },

  { id:'h_small', char:'小', sound:'소', meaning:'작다', category:'body', level:1, strokes:3,
    parts:[{ txt:'✨', label:'작은 점 세 개', meaning:'아주 작은 점 세 개로 “작다”라는 뜻을 나타냈어요.', dir:'center' }],
    story:'모래알처럼 작은 점들을 그려서 “작다”라는 뜻을 나타낸 글자예요.',
    words:[ {word:'小人', reading:'소인', meaning:'키 작은 사람, 어린이'}, {word:'小門', reading:'소문', meaning:'작은 문'} ] },

  { id:'h_woman', char:'女', sound:'녀(여)', meaning:'여자', category:'body', level:1, strokes:3,
    parts:[{ txt:'🙇‍♀️', label:'앉아 있는 모습', meaning:'두 손을 모으고 얌전히 앉아 있는 여자의 모습이에요.', dir:'center' }],
    story:'두 손을 앞으로 모으고 무릎을 꿇은 여자의 모습을 그린 글자예요.',
    words:[ {word:'女子', reading:'여자', meaning:'여성인 사람'}, {word:'少女', reading:'소녀', meaning:'어린 여자아이'} ] },

  { id:'h_child', char:'子', sound:'자', meaning:'아들, 아이', category:'body', level:1, strokes:3,
    parts:[{ txt:'👶', label:'포대기 속 아기', meaning:'머리가 크고 팔다리가 짧은 아기의 모습을 그렸어요.', dir:'center' }],
    story:'포대기에 싸인 통통한 아기의 모습을 그린 글자예요. 그래서 “아이”, “아들”을 뜻해요.',
    words:[ {word:'子女', reading:'자녀', meaning:'아들과 딸'}, {word:'王子', reading:'왕자', meaning:'임금의 아들'} ] },

  { id:'h_man', char:'男', sound:'남', meaning:'사내, 남자', category:'body', level:2, strokes:7,
    parts:[
      { txt:'🌾', label:'밭(田)', meaning:'네모난 밭의 모습을 나타내요.', dir:'top' },
      { txt:'💪', label:'힘(力)', meaning:'팔에 힘을 주는 모습을 나타내요.', dir:'bottom' }
    ],
    story:'밭(田)에 나가 힘(力)써 일하는 사람이라는 뜻에서 “사내, 남자”를 나타냈어요.',
    words:[ {word:'男子', reading:'남자', meaning:'남성인 사람'}, {word:'長男', reading:'장남', meaning:'맏아들'} ] },

  { id:'h_hand', char:'手', sound:'수', meaning:'손', category:'body', level:1, strokes:4,
    parts:[{ txt:'✋', label:'펼친 손', meaning:'손가락 다섯 개가 펼쳐진 손의 모양을 그렸어요.', dir:'center' }],
    story:'다섯 손가락이 펼쳐진 손의 모양을 그대로 그린 글자예요.',
    words:[ {word:'手話', reading:'수화', meaning:'손으로 하는 말'}, {word:'手足', reading:'수족', meaning:'손과 발'} ] },

  { id:'h_mouth', char:'口', sound:'구', meaning:'입', category:'body', level:1, strokes:3,
    parts:[{ txt:'👄', label:'벌린 입', meaning:'둥글게 벌린 입을 네모나게 그렸어요.', dir:'center' }],
    story:'크게 벌린 입의 모양을 네모난 그림으로 그린 글자예요.',
    words:[ {word:'入口', reading:'입구', meaning:'들어가는 문'}, {word:'人口', reading:'인구', meaning:'사람의 수'} ] },

  { id:'h_eye', char:'目', sound:'목', meaning:'눈', category:'body', level:2, strokes:5,
    parts:[{ txt:'👁️', label:'눈동자', meaning:'눈동자가 있는 동그란 눈의 모양을 세워서 그렸어요.', dir:'center' }],
    story:'눈동자가 들어 있는 눈의 모양을 그린 글자예요.',
    words:[ {word:'目擊', reading:'목격', meaning:'눈으로 직접 봄'}, {word:'注目', reading:'주목', meaning:'눈을 모아 봄'} ] },

  { id:'h_heart', char:'心', sound:'심', meaning:'마음', category:'body', level:1, strokes:4,
    parts:[{ txt:'❤️', label:'심장 모양', meaning:'몸속 심장의 모양을 본떠 그렸어요.', dir:'center' }],
    story:'우리 몸속에서 콩닥콩닥 뛰는 심장의 모양을 그린 글자예요. 그래서 “마음”을 뜻해요.',
    words:[ {word:'心臟', reading:'심장', meaning:'몸속 심장'}, {word:'中心', reading:'중심', meaning:'가운데'} ] },

  { id:'h_foot', char:'足', sound:'족', meaning:'발', category:'body', level:2, strokes:7,
    parts:[{ txt:'🦶', label:'무릎에서 발까지', meaning:'무릎부터 발까지 다리의 모양을 그렸어요.', dir:'center' }],
    story:'무릎부터 발끝까지 이어진 다리의 모습을 그린 글자예요. 그래서 “발”을 뜻해요.',
    words:[ {word:'手足', reading:'수족', meaning:'손과 발'}, {word:'足球', reading:'족구', meaning:'발로 하는 공놀이'} ] },

  // ------------------ 가족 ------------------
  { id:'h_father', char:'父', sound:'부', meaning:'아버지', category:'family', level:1, strokes:4,
    parts:[{ txt:'🪓', label:'도끼를 든 손', meaning:'손에 도끼(도구)를 들고 일하는 모습이에요.', dir:'center' }],
    story:'손에 도끼를 들고 밖에서 힘써 일하시는 아버지의 모습을 그린 글자예요.',
    words:[ {word:'父母', reading:'부모', meaning:'아버지와 어머니'}, {word:'祖父', reading:'조부', meaning:'할아버지'} ] },

  { id:'h_mother', char:'母', sound:'모', meaning:'어머니', category:'family', level:2, strokes:5,
    parts:[{ txt:'🤱', label:'아이를 안은 모습', meaning:'두 팔로 아이를 감싸 안은 모습을 나타내요.', dir:'center' }],
    story:'아이를 품에 안고 사랑으로 돌보는 어머니의 모습을 그린 글자예요.',
    words:[ {word:'父母', reading:'부모', meaning:'아버지와 어머니'}, {word:'祖母', reading:'조모', meaning:'할머니'} ] },

  { id:'h_brother', char:'兄', sound:'형', meaning:'형', category:'family', level:2, strokes:5,
    parts:[{ txt:'🧑', label:'큰 입을 가진 사람', meaning:'사람(儿) 위에 입(口)이 있어 말을 잘하는 사람을 나타내요.', dir:'center' }],
    story:'동생들에게 말로 이끌어 주는 사람이라는 뜻에서 “형”을 나타낸 글자예요.',
    words:[ {word:'兄弟', reading:'형제', meaning:'형과 아우'}, {word:'學兄', reading:'학형', meaning:'같이 배우는 벗'} ] },

  { id:'h_younger', char:'弟', sound:'제', meaning:'아우, 동생', category:'family', level:2, strokes:7,
    parts:[{ txt:'🎗️', label:'차례로 감은 끈', meaning:'끈을 차례차례 감아 놓은 모습에서 “순서”의 뜻이 나왔어요.', dir:'center' }],
    story:'차례를 나타내는 모습에서, 형 다음의 순서인 “아우, 동생”을 나타낸 글자예요.',
    words:[ {word:'兄弟', reading:'형제', meaning:'형과 아우'}, {word:'弟子', reading:'제자', meaning:'가르침을 받는 사람'} ] },

  { id:'h_house', char:'家', sound:'가', meaning:'집', category:'family', level:3, strokes:10,
    parts:[
      { txt:'🏠', label:'지붕(宀)', meaning:'사람이 사는 지붕이 있는 집의 모습이에요.', dir:'top' },
      { txt:'🐷', label:'돼지(豕)', meaning:'옛날에는 집 안에서 돼지 같은 가축을 함께 키웠어요.', dir:'bottom' }
    ],
    story:'지붕(宀) 아래에서 돼지(豕)를 함께 기르며 살던 곳, 바로 우리 “집”을 나타낸 글자예요.',
    words:[ {word:'家族', reading:'가족', meaning:'한집에서 사는 사람들'}, {word:'國家', reading:'국가', meaning:'나라'} ] },

  // ------------------ 학교 ------------------
  { id:'h_learn', char:'學', sound:'학', meaning:'배우다', category:'school', level:3, strokes:16,
    parts:[
      { txt:'📖', label:'두 손으로 배우기(爻/臼)', meaning:'두 손으로 무언가를 살펴보며 본받는 모습이에요.', dir:'top' },
      { txt:'👶', label:'아이(子)', meaning:'배우는 주인공인 아이를 나타내요.', dir:'bottom' }
    ],
    story:'아이(子)가 두 손으로 책을 살펴보며 지식을 본받는 모습에서 “배우다”라는 뜻이 나왔어요.',
    words:[ {word:'學校', reading:'학교', meaning:'배우는 곳'}, {word:'學生', reading:'학생', meaning:'배우는 사람'} ] },

  { id:'h_school', char:'校', sound:'교', meaning:'학교', category:'school', level:3, strokes:10,
    parts:[
      { txt:'🌳', label:'나무(木)', meaning:'옛날엔 나무로 만든 도구나 건물을 나타냈어요.', dir:'left' },
      { txt:'🤝', label:'서로 사귀다(交)', meaning:'여러 사람이 서로 만나고 사귄다는 뜻이에요.', dir:'right' }
    ],
    story:'나무(木)로 지은 건물에서 여러 친구들이 서로 사귀며(交) 배우는 곳, 바로 “학교”를 뜻해요.',
    words:[ {word:'學校', reading:'학교', meaning:'배우는 곳'}, {word:'校長', reading:'교장', meaning:'학교의 우두머리'} ] },

  { id:'h_born', char:'生', sound:'생', meaning:'나다, 살다', category:'school', level:2, strokes:5,
    parts:[{ txt:'🌱', label:'솟아나는 새싹', meaning:'땅에서 새싹이 힘차게 솟아나는 모습을 그렸어요.', dir:'center' }],
    story:'흙을 뚫고 새싹이 솟아나는 모습을 그려서 “태어나다, 살다”라는 뜻을 나타낸 글자예요.',
    words:[ {word:'學生', reading:'학생', meaning:'배우는 사람'}, {word:'生日', reading:'생일', meaning:'태어난 날'} ] },

  { id:'h_first', char:'先', sound:'선', meaning:'먼저', category:'school', level:2, strokes:6,
    parts:[{ txt:'🚶', label:'앞서 걷는 사람', meaning:'다른 사람보다 앞서서 걸어가는 모습이에요.', dir:'center' }],
    story:'다른 사람보다 한 발 앞서 걸어가는 모습을 그려서 “먼저”라는 뜻을 나타냈어요.',
    words:[ {word:'先生', reading:'선생', meaning:'가르치는 사람, 선생님'}, {word:'先後', reading:'선후', meaning:'먼저와 나중'} ] },

  { id:'h_teach', char:'敎', sound:'교', meaning:'가르치다', category:'school', level:3, strokes:11,
    parts:[
      { txt:'🙏', label:'본받는 아이(孝)', meaning:'어른을 본받아 배우는 아이의 모습이에요.', dir:'left' },
      { txt:'📏', label:'가르치는 손(攵)', meaning:'손에 회초리를 들고 이끄는 모습이에요.', dir:'right' }
    ],
    story:'어른이 아이가 잘 본받도록 이끌어 주는 모습에서 “가르치다”라는 뜻이 나왔어요.',
    words:[ {word:'敎室', reading:'교실', meaning:'가르치고 배우는 방'}, {word:'敎育', reading:'교육', meaning:'가르치고 기르는 일'} ] },

  { id:'h_room', char:'室', sound:'실', meaning:'집, 방', category:'school', level:3, strokes:9,
    parts:[
      { txt:'🏠', label:'지붕(宀)', meaning:'지붕이 있는 집을 나타내요.', dir:'top' },
      { txt:'🚪', label:'이르다(至)', meaning:'사람이 걸어와 도착해 머무는 곳이라는 뜻이에요.', dir:'bottom' }
    ],
    story:'지붕(宀) 아래에 사람이 도착해서(至) 머무는 곳, 바로 “방”을 나타낸 글자예요.',
    words:[ {word:'敎室', reading:'교실', meaning:'가르치고 배우는 방'}, {word:'室內', reading:'실내', meaning:'방 안'} ] },

  // ------------------ 생활 ------------------
  { id:'h_door', char:'門', sound:'문', meaning:'문', category:'life', level:2, strokes:8,
    parts:[{ txt:'🚪', label:'두 짝의 문', meaning:'양쪽으로 여닫는 문 두 짝의 모양을 그렸어요.', dir:'center' }],
    story:'좌우로 활짝 열리는 문 두 짝의 모양을 그린 글자예요.',
    words:[ {word:'大門', reading:'대문', meaning:'큰 문'}, {word:'窓門', reading:'창문', meaning:'창과 문'} ] },

  { id:'h_car', char:'車', sound:'차/거', meaning:'수레, 차', category:'life', level:2, strokes:7,
    parts:[{ txt:'🛞', label:'바퀴가 있는 수레', meaning:'바퀴가 달린 수레를 위에서 내려다본 모양이에요.', dir:'center' }],
    story:'바퀴가 달려 굴러가는 수레(자동차)를 위에서 본 모양을 그린 글자예요.',
    words:[ {word:'自動車', reading:'자동차', meaning:'스스로 움직이는 차'}, {word:'汽車', reading:'기차', meaning:'철길을 달리는 차'} ] },

  { id:'h_electric', char:'電', sound:'전', meaning:'번개, 전기', category:'life', level:3, strokes:13,
    parts:[
      { txt:'🌧️', label:'비(雨)', meaning:'하늘에서 비가 내리는 모습이에요.', dir:'top' },
      { txt:'⚡', label:'번쩍이는 번개(申)', meaning:'번쩍번쩍 펼쳐지는 번개의 모습이에요.', dir:'bottom' }
    ],
    story:'비가 올 때 번쩍이는 번개의 모습에서 “번개, 전기”라는 뜻이 나왔어요.',
    words:[ {word:'電話', reading:'전화', meaning:'전기로 하는 말'}, {word:'電氣', reading:'전기', meaning:'전기 에너지'} ] },

  { id:'h_speak', char:'話', sound:'화', meaning:'말씀, 이야기', category:'life', level:3, strokes:13,
    parts:[
      { txt:'💬', label:'말씀(言)', meaning:'입에서 말이 퍼져 나가는 모습이에요.', dir:'left' },
      { txt:'👅', label:'혀(舌)', meaning:'혀를 움직여 말을 하는 모습이에요.', dir:'right' }
    ],
    story:'혀(舌)를 움직여 말(言)을 하는 모습에서 “말씀, 이야기”라는 뜻이 나왔어요.',
    words:[ {word:'電話', reading:'전화', meaning:'전기로 하는 말'}, {word:'對話', reading:'대화', meaning:'서로 나누는 말'} ] },

  { id:'h_up', char:'上', sound:'상', meaning:'위', category:'life', level:1, strokes:3,
    parts:[{ txt:'⬆️', label:'선 위의 표시', meaning:'기준이 되는 선 위에 작은 표시를 해서 위쪽을 나타냈어요.', dir:'center' }],
    story:'기준선보다 위쪽에 표시를 하여 “위”라는 뜻을 나타낸 글자예요.',
    words:[ {word:'上下', reading:'상하', meaning:'위와 아래'}, {word:'上級', reading:'상급', meaning:'더 높은 등급'} ] },

  { id:'h_down', char:'下', sound:'하', meaning:'아래', category:'life', level:1, strokes:3,
    parts:[{ txt:'⬇️', label:'선 아래 표시', meaning:'기준이 되는 선 아래에 작은 표시를 해서 아래쪽을 나타냈어요.', dir:'center' }],
    story:'기준선보다 아래쪽에 표시를 하여 “아래”라는 뜻을 나타낸 글자예요.',
    words:[ {word:'上下', reading:'상하', meaning:'위와 아래'}, {word:'下車', reading:'하차', meaning:'차에서 내림'} ] },

  { id:'h_middle', char:'中', sound:'중', meaning:'가운데', category:'life', level:1, strokes:4,
    parts:[{ txt:'🎯', label:'반으로 나눈 가운데', meaning:'네모난 물건을 세로로 딱 반을 갈라 가운데를 나타냈어요.', dir:'center' }],
    story:'무언가를 정확히 반으로 가른 가운데 부분을 그려서 “가운데”라는 뜻을 나타낸 글자예요.',
    words:[ {word:'中心', reading:'중심', meaning:'한가운데'}, {word:'中間', reading:'중간', meaning:'가운데 사이'} ] },

  { id:'h_left', char:'左', sound:'좌', meaning:'왼쪽', category:'life', level:2, strokes:5,
    parts:[{ txt:'🤚', label:'도구를 든 왼손', meaning:'왼손으로 도구(工)를 잡고 돕는 모습이에요.', dir:'center' }],
    story:'왼손으로 도구를 들고 일을 돕는 모습에서 “왼쪽”이라는 뜻이 나왔어요.',
    words:[ {word:'左右', reading:'좌우', meaning:'왼쪽과 오른쪽'}, {word:'左側', reading:'좌측', meaning:'왼쪽'} ] },

  { id:'h_right', char:'右', sound:'우', meaning:'오른쪽', category:'life', level:2, strokes:5,
    parts:[{ txt:'🤙', label:'입에 가져가는 오른손', meaning:'오른손(又)으로 먹을 것을 입(口)에 가져가는 모습이에요.', dir:'center' }],
    story:'주로 쓰는 손인 오른손으로 입에 음식을 가져가는 모습에서 “오른쪽”이라는 뜻이 나왔어요.',
    words:[ {word:'左右', reading:'좌우', meaning:'왼쪽과 오른쪽'}, {word:'右側', reading:'우측', meaning:'오른쪽'} ] }
];

// 다른 파일에서 쉽게 참조할 수 있도록 전역에 등록
window.LEVELS = LEVELS;
window.CATEGORIES = CATEGORIES;
window.HANZI_DATA = HANZI_DATA;
