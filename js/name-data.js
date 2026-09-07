/* ============================================================
   한자야 놀자! - 이름 한자 데이터 및 풀이 로직 (name-data.js)
   - 이름에 많이 쓰이는 대표 인명용 한자 120여 자
   - 6대 주제별 카테고리:
     1. 빛과 밝음 (明, 昭, 晶, 熙, 煥, 朗, 燦, 旭, 晨, 耀 등)
     2. 지혜와 배움 (智, 知, 賢, 文, 學, 哲, 睿, 慧, 淵, 達 등)
     3. 바름과 덕 (正, 義, 仁, 善, 德, 誠, 禮, 忠, 敦, 淳 등)
     4. 자연과 넓음 (河, 海, 山, 林, 星, 天, 宇, 宙, 浩, 瀚, 霖, 雲 등)
     5. 복과 길함 (福, 祥, 瑞, 吉, 慶, 祐, 祉, 祿, 禧 등)
     6. 강함과 큰 뜻 (俊, 健, 雄, 泰, 大, 志, 毅, 剛, 勇, 勳 등)
   - 테마별 추천 태그:
     - 🌸 여자 이름에 좋은 한자
     - 🦁 남자 이름에 좋은 한자
     - ✨ 예쁜 뜻 한자 모음
   - 음별 정리: 민, 서, 지, 하, 윤, 준, 우, 현, 도, 연, 수, 아, 유, 은, 예 등
   - 클라이언트 사이드 자연스러운 이름 의미 조합 엔진
   ============================================================ */

const NAME_CATEGORIES = [
  { id: 'all', name: '전체보기', icon: '🌟', desc: '이름에 쓰이는 모든 한자' },
  { id: 'pretty', name: '✨ 예쁜 뜻 한자', icon: '✨', desc: '새벽, 별빛, 단비처럼 영롱하고 고운 뜻' },
  { id: 'girl', name: '🌸 여자 이름 추천', icon: '🌸', desc: '맑고 고우며 단아하고 사랑스러운 한자' },
  { id: 'boy', name: '🦁 남자 이름 추천', icon: '🦁', desc: '원대하고 굳세며 뛰어난 기개를 품은 한자' },
  { id: 'light', name: '빛과 밝음', icon: '☀️', desc: '세상을 밝히고 환하게 빛나는 뜻' },
  { id: 'wisdom', name: '지혜와 배움', icon: '🧠', desc: '총명하고 슬기로우며 학덕을 쌓는 뜻' },
  { id: 'virtue', name: '바름과 덕', icon: '⚖️', desc: '어질고 바르며 남을 배려하는 덕성' },
  { id: 'nature', name: '자연과 넓음', icon: '🌿', desc: '하늘, 바다, 산처럼 넓고 웅대한 기상' },
  { id: 'fortune', name: '복과 길함', icon: '🍀', desc: '행복, 축복, 번영과 평안이 깃드는 뜻' },
  { id: 'strength', name: '강함과 큰 뜻', icon: '🏆', desc: '굳세고 용감하며 원대한 뜻을 품는 기개' }
];

const POPULAR_SOUNDS = [
  '전체', '민', '서', '지', '하', '윤', '준', '우', '현', '도', '연', '수', '아', '유', '은', '예', '진', '원', '태', '호', '가', '나', '린', '채'
];

const NAME_HANJA_LIST = [
  // ==================== '민' 한자 모음 ====================
  {
    char: '旻', sound: '민', meaning: '하늘',
    desc: '가을 하늘처럼 높고 맑으며 넓은 도량을 뜻하는 한자입니다.',
    category: '자연과 넓음', popularSound: '민', tag: ['boy', 'both', 'pretty'],
    corePhrase: '높고 맑은 하늘처럼 너른 도량'
  },
  {
    char: '珉', sound: '민', meaning: '옥돌',
    desc: '옥처럼 맑고 곱고 결이 아름다워 고귀한 품격을 나타냅니다.',
    category: '바름과 덕', popularSound: '민', tag: ['girl', 'both', 'pretty'],
    corePhrase: '옥돌처럼 맑고 단아한 품격'
  },
  {
    char: '敏', sound: '민', meaning: '민첩할',
    desc: '총명하고 슬기로우며 일 처리가 빠르고 바른 면모를 나타냅니다.',
    category: '지혜와 배움', popularSound: '민', tag: ['both'],
    corePhrase: '총명하고 사리에 민첩한 지혜'
  },
  {
    char: '民', sound: '민', meaning: '백성',
    desc: '사람들과 두루 화합하며 따뜻하게 품는 포용력을 상징합니다.',
    category: '바름과 덕', popularSound: '민', tag: ['both'],
    corePhrase: '이웃을 따뜻하게 아끼는 어진 마음'
  },
  {
    char: '玟', sound: '민', meaning: '옥돌/붉은옥',
    desc: '영롱한 빛을 내는 귀한 옥돌처럼 티 없이 아름다운 빛을 품습니다.',
    category: '빛과 밝음', popularSound: '민', tag: ['girl', 'pretty'],
    corePhrase: '영롱하게 빛나는 귀한 옥빛'
  },
  {
    char: '旼', sound: '민', meaning: '화할/온화할',
    desc: '온화하고 화목하여 사람들의 마음을 편안하게 해주는 덕성입니다.',
    category: '바름과 덕', popularSound: '민', tag: ['both'],
    corePhrase: '마음을 편안히 덥히는 온화한 기운'
  },

  // ==================== '서' 한자 모음 ====================
  {
    char: '瑞', sound: '서', meaning: '상서로울',
    desc: '경사스럽고 좋은 일이 생길 길한 복과 상서로운 징조를 뜻합니다.',
    category: '복과 길함', popularSound: '서', tag: ['both', 'pretty'],
    corePhrase: '상서롭고 기쁜 복이 가득한 삶'
  },
  {
    char: '曙', sound: '서', meaning: '새벽',
    desc: '어둠을 걷어내고 밝아오는 새 아침의 희망찬 첫 빛을 뜻합니다.',
    category: '빛과 밝음', popularSound: '서', tag: ['both', 'pretty'],
    corePhrase: '어둠을 밝히는 새벽빛 같은 희망'
  },
  {
    char: '書', sound: '서', meaning: '글',
    desc: '지식과 학문을 닦아 교양과 지혜를 세상에 펼침을 의미합니다.',
    category: '지혜와 배움', popularSound: '서', tag: ['both'],
    corePhrase: '학문과 글을 통해 닦은 깊은 소양'
  },
  {
    char: '敍', sound: '서', meaning: '펼',
    desc: '마음속에 품은 포부와 재능을 차분히 온 세상에 펼친다는 뜻입니다.',
    category: '강함과 큰 뜻', popularSound: '서', tag: ['boy', 'both'],
    corePhrase: '원대한 뜻을 세상에 조리 있게 펼침'
  },
  {
    char: '舒', sound: '서', meaning: '펼/너그러울',
    desc: '마음이 여유롭고 너그러우며 자신의 재능을 시원스럽게 펼침입니다.',
    category: '바름과 덕', popularSound: '서', tag: ['girl', 'both'],
    corePhrase: '여유롭고 너그럽게 펼치는 재능'
  },

  // ==================== '준' 한자 모음 ====================
  {
    char: '俊', sound: '준', meaning: '준걸',
    desc: '슬기롭고 뛰어난 재능으로 많은 사람 가운데 우뚝 선 인재를 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '준', tag: ['boy'],
    corePhrase: '남다른 재능과 뛰어난 슬기'
  },
  {
    char: '峻', sound: '준', meaning: '높을',
    desc: '높고 굳센 산처럼 흔들리지 않는 굳은 절개와 기개를 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '준', tag: ['boy'],
    corePhrase: '높은 산처럼 굳세고 당당한 기개'
  },
  {
    char: '準', sound: '준', meaning: '법도',
    desc: '공평하고 바른 기준을 세워 흔들림 없이 바른길을 감을 뜻합니다.',
    category: '바름과 덕', popularSound: '준', tag: ['boy', 'both'],
    corePhrase: '공정하고 바른 도리와 기준'
  },
  {
    char: '浚', sound: '준', meaning: '깊을',
    desc: '강물을 깊이 파내어 맑고 깊은 물길처럼 깊은 생각과 지혜를 뜻합니다.',
    category: '자연과 넓음', popularSound: '준', tag: ['boy'],
    corePhrase: '맑고 깊은 샘물 같은 혜안'
  },
  {
    char: '晙', sound: '준', meaning: '밝을',
    desc: '이른 아침의 햇살처럼 밝고 총명한 기운을 뜻합니다.',
    category: '빛과 밝음', popularSound: '준', tag: ['boy', 'pretty'],
    corePhrase: '아침 햇살처럼 총명하고 밝은 기운'
  },

  // ==================== '지' 한자 모음 ====================
  {
    char: '智', sound: '지', meaning: '지혜',
    desc: '사리를 명확하게 가려내고 올바른 판단을 내리는 슬기로운 마음입니다.',
    category: '지혜와 배움', popularSound: '지', tag: ['both'],
    corePhrase: '사리를 바르게 밝히는 총명한 지혜'
  },
  {
    char: '知', sound: '지', meaning: '알',
    desc: '널리 깨우치고 학문을 깊이 이해하여 세상의 이치를 아는 모습입니다.',
    category: '지혜와 배움', popularSound: '지', tag: ['both'],
    corePhrase: '배움을 게을리하지 않는 앎의 열정'
  },
  {
    char: '志', sound: '지', meaning: '뜻',
    desc: '마음에 품은 높은 목표와 굽히지 않는 원대한 포부를 나타냅니다.',
    category: '강함과 큰 뜻', popularSound: '지', tag: ['boy', 'both'],
    corePhrase: '흔들리지 않는 굳은 지조와 큰 뜻'
  },
  {
    char: '祉', sound: '지', meaning: '복',
    desc: '하늘이 내려주는 순수한 축복과 안녕, 번영의 의미를 지닙니다.',
    category: '복과 길함', popularSound: '지', tag: ['girl', 'both', 'pretty'],
    corePhrase: '온 집안에 넘쳐나는 평안과 축복'
  },

  // ==================== '하' 한자 모음 ====================
  {
    char: '昰', sound: '하', meaning: '여름/옳을',
    desc: '태양처럼 따뜻하고 곧으며 활기찬 생명력을 상징합니다.',
    category: '빛과 밝음', popularSound: '하', tag: ['both', 'pretty'],
    corePhrase: '생명력 넘치는 밝고 따뜻한 기운'
  },
  {
    char: '荷', sound: '하', meaning: '연꽃',
    desc: '진흙 속에서도 청초하고 맑게 피어나는 연꽃처럼 고결함을 뜻합니다.',
    category: '바름과 덕', popularSound: '하', tag: ['girl', 'pretty'],
    corePhrase: '연꽃처럼 맑고 청아한 순수함'
  },
  {
    char: '賀', sound: '하', meaning: '하례할',
    desc: '기쁜 일을 함께 축하하고 많은 사람에게 기쁨을 전하는 뜻입니다.',
    category: '복과 길함', popularSound: '하', tag: ['both'],
    corePhrase: '주변에 기쁨과 축복을 전하는 온기'
  },
  {
    char: '河', sound: '하', meaning: '물',
    desc: '유유히 흘러 넓은 바다로 향하는 강물처럼 유려하고 넓은 도량입니다.',
    category: '자연과 넓음', popularSound: '하', tag: ['boy', 'both'],
    corePhrase: '강물처럼 쉼 없이 흐르는 유려함'
  },
  {
    char: '夏', sound: '하', meaning: '여름',
    desc: '풍성한 초록과 약동하는 생명력으로 눈부시게 성장함을 상징합니다.',
    category: '자연과 넓음', popularSound: '하', tag: ['both', 'pretty'],
    corePhrase: '눈부시게 약동하는 싱그러운 생명력'
  },

  // ==================== '윤' 한자 모음 ====================
  {
    char: '潤', sound: '윤', meaning: '윤택할',
    desc: '메마른 세상을 촉촉이 적셔 풍요롭고 여유롭게 만드는 덕망입니다.',
    category: '복과 길함', popularSound: '윤', tag: ['both', 'pretty'],
    corePhrase: '세상을 풍요롭게 적시는 윤택한 덕'
  },
  {
    char: '允', sound: '윤', meaning: '진실로',
    desc: '진실하고 성실하여 뭇 사람의 신뢰와 공감을 얻는 미덕입니다.',
    category: '바름과 덕', popularSound: '윤', tag: ['both'],
    corePhrase: '신뢰와 진실함으로 가득 찬 인품'
  },
  {
    char: '胤', sound: '윤', meaning: '이을',
    desc: '선조의 훌륭한 덕과 명예를 찬란히 빛내어 이어간다는 뜻입니다.',
    category: '복과 길함', popularSound: '윤', tag: ['boy', 'both'],
    corePhrase: '좋은 가통과 명예를 빛내어 잇는 자긍심'
  },
  {
    char: '侖', sound: '윤/륜', meaning: '생각할',
    desc: '사물의 도리와 이치를 질서정연하게 사유하는 명석함입니다.',
    category: '지혜와 배움', popularSound: '윤', tag: ['both'],
    corePhrase: '조리 있고 균형 잡힌 사유의 힘'
  },

  // ==================== '우' 한자 모음 ====================
  {
    char: '宇', sound: '우', meaning: '집/우주',
    desc: '무한히 넓은 우주처럼 광활한 마음과 포용력을 지닌 큰 그릇을 뜻합니다.',
    category: '자연과 넓음', popularSound: '우', tag: ['boy', 'both'],
    corePhrase: '우주처럼 한계 없이 넓은 포용력'
  },
  {
    char: '佑', sound: '우', meaning: '도울',
    desc: '남을 성심껏 돕고 하늘의 큰 보살핌을 받는 복된 삶을 의미합니다.',
    category: '복과 길함', popularSound: '우', tag: ['both'],
    corePhrase: '이웃을 돕고 하늘의 보살핌을 받는 삶'
  },
  {
    char: '祐', sound: '우', meaning: '복/도울',
    desc: '신의 축복과 평안이 깃들어 삶에 길함이 끊이지 않음을 뜻합니다.',
    category: '복과 길함', popularSound: '우', tag: ['both', 'pretty'],
    corePhrase: '평안과 길함이 머무는 축복'
  },
  {
    char: '遇', sound: '우', meaning: '만날',
    desc: '인생에서 좋은 기회와 귀한 인연을 아름답게 맞이한다는 뜻입니다.',
    category: '복과 길함', popularSound: '우', tag: ['both'],
    corePhrase: '귀한 인연과 기회를 꽃피우는 복'
  },
  {
    char: '羽', sound: '우', meaning: '깃',
    desc: '하늘을 나는 새의 날개처럼 높고 자유롭게 꿈을 펼침을 상징합니다.',
    category: '자연과 넓음', popularSound: '우', tag: ['girl', 'pretty'],
    corePhrase: '자유롭게 날아오르는 깃털의 꿈'
  },

  // ==================== '현' 한자 모음 ====================
  {
    char: '賢', sound: '현', meaning: '어질',
    desc: '마음이 너그럽고 덕망과 지혜가 뛰어나 사람들에게 존경받는 모습입니다.',
    category: '지혜와 배움', popularSound: '현', tag: ['both'],
    corePhrase: '어진 덕망과 뛰어난 현명함'
  },
  {
    char: '炫', sound: '현', meaning: '밝을',
    desc: '눈부시게 타오르는 불빛처럼 자신의 재능과 이름을 밝게 빛냄을 뜻합니다.',
    category: '빛과 밝음', popularSound: '현', tag: ['both', 'pretty'],
    corePhrase: '눈부시게 밝은 빛을 발하는 재능'
  },
  {
    char: '顯', sound: '현', meaning: '나타날',
    desc: '숨은 공덕과 덕행이 세상에 널리 드러나 명예를 얻는다는 의미입니다.',
    category: '빛과 밝음', popularSound: '현', tag: ['boy'],
    corePhrase: '세상에 널리 드러나는 명예와 공덕'
  },
  {
    char: '泫', sound: '현', meaning: '이슬맺힐',
    desc: '맑은 아침 이슬처럼 티 없이 깨끗하고 청초한 마음결을 뜻합니다.',
    category: '자연과 넓음', popularSound: '현', tag: ['girl', 'pretty'],
    corePhrase: '아침 이슬처럼 맑고 순수한 결'
  },
  {
    char: '鉉', sound: '현', meaning: '솥귀',
    desc: '국가를 지탱하는 솥귀처럼 중요한 중책을 맡아 든든히 보필하는 인재입니다.',
    category: '강함과 큰 뜻', popularSound: '현', tag: ['boy'],
    corePhrase: '중심을 든든히 받치는 기둥'
  },

  // ==================== '도' 한자 모음 ====================
  {
    char: '道', sound: '도', meaning: '길',
    desc: '인간으로서 마땅히 가야 할 바른 도리와 진리의 길을 뜻합니다.',
    category: '바름과 덕', popularSound: '도', tag: ['boy', 'both'],
    corePhrase: '올곧은 도리를 지키며 걷는 삶'
  },
  {
    char: '燾', sound: '도', meaning: '비출',
    desc: '온 세상을 따스하게 비추어 만물을 품어 기르는 큰 사랑과 은덕입니다.',
    category: '빛과 밝음', popularSound: '도', tag: ['boy', 'both'],
    corePhrase: '만물을 따뜻하게 비추는 햇살 같은 은덕'
  },
  {
    char: '滔', sound: '도', meaning: '물넓을',
    desc: '도도하게 흐르는 큰 강물처럼 막힘없이 당당한 기세를 뜻합니다.',
    category: '자연과 넓음', popularSound: '도', tag: ['boy'],
    corePhrase: '거침없이 흐르는 큰 강물의 당당함'
  },
  {
    char: '都', sound: '도', meaning: '도읍',
    desc: '많은 사람과 문화가 모여드는 중심처럼 든든하고 아량 있는 모습입니다.',
    category: '강함과 큰 뜻', popularSound: '도', tag: ['boy', 'both'],
    corePhrase: '모두의 중심이 되는 당당한 아량'
  },

  // ==================== '연' 한자 모음 ====================
  {
    char: '延', sound: '연', meaning: '늘일',
    desc: '좋은 복과 수명이 길게 이어지고 선한 영향력이 멀리 뻗침을 뜻합니다.',
    category: '복과 길함', popularSound: '연', tag: ['both'],
    corePhrase: '선한 영향력이 길게 이어지는 복'
  },
  {
    char: '然', sound: '연', meaning: '그러할',
    desc: '자연의 섭리처럼 억지 없이 순수하고 자연스러운 조화로움을 뜻합니다.',
    category: '자연과 넓음', popularSound: '연', tag: ['both', 'pretty'],
    corePhrase: '순리에 따르는 자연스러운 조화'
  },
  {
    char: '淵', sound: '연', meaning: '깊을',
    desc: '깊은 연못처럼 학문과 인품이 깊고 고요하여 경솔하지 않음을 뜻합니다.',
    category: '자연과 넓음', popularSound: '연', tag: ['both'],
    corePhrase: '깊은 못처럼 고요하고 그윽한 인품'
  },
  {
    char: '姸', sound: '연', meaning: '고울',
    desc: '단아하고 우아하며 마음가짐이 아름답게 빛남을 뜻합니다.',
    category: '바름과 덕', popularSound: '연', tag: ['girl', 'pretty'],
    corePhrase: '단아하고 티 없이 고운 마음결'
  },
  {
    char: '怜', sound: '연/련', meaning: '영리할/어여쁠',
    desc: '총명하고 영리하여 사리에 밝고 주변의 사랑을 듬뿍 받는 뜻입니다.',
    category: '지혜와 배움', popularSound: '연', tag: ['girl', 'pretty'],
    corePhrase: '영리하고 사랑받는 총명함'
  },

  // ==================== '수' 한자 모음 ====================
  {
    char: '秀', sound: '수', meaning: '빼어날',
    desc: '곡식의 이삭이 빼어나듯 남보다 뛰어난 재주와 품격을 자랑합니다.',
    category: '강함과 큰 뜻', popularSound: '수', tag: ['both'],
    corePhrase: '많은 사람 중 빼어난 탁월함'
  },
  {
    char: '修', sound: '수', meaning: '닦을',
    desc: '학문과 덕행을 끊임없이 갈고닦아 훌륭한 인격을 완성함을 뜻합니다.',
    category: '바름과 덕', popularSound: '수', tag: ['boy', 'both'],
    corePhrase: '날마다 스스로 갈고닦는 바른 수양'
  },
  {
    char: '洙', sound: '수', meaning: '물가',
    desc: '학문의 발상지인 수수 강변처럼 유서 깊은 지혜와 배움을 상징합니다.',
    category: '지혜와 배움', popularSound: '수', tag: ['both'],
    corePhrase: '학문의 깊은 샘터에서 길어 올린 지혜'
  },
  {
    char: '壽', sound: '수', meaning: '목숨',
    desc: '건강하고 평안하게 장수하며 온갖 복을 누림을 뜻합니다.',
    category: '복과 길함', popularSound: '수', tag: ['both'],
    corePhrase: '건강과 평안이 함께하는 장수'
  },

  // ==================== '아' 한자 모음 ====================
  {
    char: '雅', sound: '아', meaning: '맑을/우아할',
    desc: '품격이 높고 고상하며 바른 도리를 갖춘 단정한 아름다움입니다.',
    category: '바름과 덕', popularSound: '아', tag: ['girl', 'pretty'],
    corePhrase: '기품 있고 우아한 인품의 향기'
  },
  {
    char: '娥', sound: '아', meaning: '예쁠',
    desc: '달빛처럼 맑고 청아하며 고운 자태와 마음씨를 뜻합니다.',
    category: '빛과 밝음', popularSound: '아', tag: ['girl', 'pretty'],
    corePhrase: '달빛처럼 은은하고 맑은 기품'
  },
  {
    char: '芽', sound: '아', meaning: '싹',
    desc: '봄날 대지를 뚫고 돋아나는 새싹처럼 무한한 성장 가능성을 뜻합니다.',
    category: '자연과 넓음', popularSound: '아', tag: ['girl', 'both', 'pretty'],
    corePhrase: '희망차게 움트는 싱그러운 가능성'
  },

  // ==================== '유' 한자 모음 ====================
  {
    char: '裕', sound: '유', meaning: '넉넉할',
    desc: '마음이 여유롭고 관대하여 사람들을 편안하게 감싸주는 넉넉함입니다.',
    category: '복과 길함', popularSound: '유', tag: ['both'],
    corePhrase: '여유롭고 너그러운 포용의 마음'
  },
  {
    char: '宥', sound: '유', meaning: '너그러울',
    desc: '남의 허물을 너그럽게 품어주고 용서하는 따뜻한 아량입니다.',
    category: '바름과 덕', popularSound: '유', tag: ['both'],
    corePhrase: '허물을 감싸 안는 따뜻한 관용'
  },
  {
    char: '柔', sound: '유', meaning: '부드러울',
    desc: '부드러움으로 굳센 것을 이기는 유연하고 깊은 지혜를 뜻합니다.',
    category: '바름과 덕', popularSound: '유', tag: ['girl', 'both'],
    corePhrase: '부드러움으로 세상을 화합하는 덕'
  },
  {
    char: '洧', sound: '유', meaning: '물이름',
    desc: '맑고 잔잔하게 흐르는 물처럼 고요하고 청명한 기상을 뜻합니다.',
    category: '자연과 넓음', popularSound: '유', tag: ['both', 'pretty'],
    corePhrase: '잔잔하고 맑은 물길의 청명함'
  },
  {
    char: '悠', sound: '유', meaning: '멀/유유자적할',
    desc: '조급하지 않고 유유자적하며 품격 있는 여유를 누리는 삶입니다.',
    category: '자연과 넓음', popularSound: '유', tag: ['both', 'pretty'],
    corePhrase: '조급함 없는 유유한 품격'
  },

  // ==================== '은' 한자 모음 ====================
  {
    char: '恩', sound: '은', meaning: '은혜',
    desc: '부모와 이웃의 사랑에 감사하고 세상에 온정을 갚는 따뜻한 덕성입니다.',
    category: '바름과 덕', popularSound: '은', tag: ['girl', 'both', 'pretty'],
    corePhrase: '은혜를 알고 베푸는 따뜻한 온정'
  },
  {
    char: '銀', sound: '은', meaning: '은',
    desc: '순백의 은처럼 변함없이 맑고 빛나는 소중한 가치를 지닙니다.',
    category: '빛과 밝음', popularSound: '은', tag: ['girl', 'both', 'pretty'],
    corePhrase: '순수하고 귀하게 빛나는 가치'
  },
  {
    char: '殷', sound: '은', meaning: '성할',
    desc: '풍요롭고 성대하여 모자람이 없고 넉넉하게 번영함을 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '은', tag: ['boy', 'both'],
    corePhrase: '성대하게 번영하는 풍요로움'
  },

  // ==================== '예' 한자 모음 ====================
  {
    char: '睿', sound: '예', meaning: '밝을',
    desc: '총명한 통찰력으로 먼 앞날을 꿰뚫어 보는 빼어난 지혜입니다.',
    category: '지혜와 배움', popularSound: '예', tag: ['both'],
    corePhrase: '앞날을 밝히는 뛰어난 통찰력'
  },
  {
    char: '藝', sound: '예', meaning: '재주',
    desc: '풍부한 예술적 감성과 다재다능한 재능으로 세상을 아름답게 합니다.',
    category: '지혜와 배움', popularSound: '예', tag: ['girl', 'both'],
    corePhrase: '다재다능한 솜씨와 예술적 감성'
  },
  {
    char: '禮', sound: '예', meaning: '예도',
    desc: '예절과 바른 도리를 솔선하여 지키며 사람을 공경하는 아름다움입니다.',
    category: '바름과 덕', popularSound: '예', tag: ['both'],
    corePhrase: '예절과 공경을 갖춘 바른 자세'
  },
  {
    char: '譽', sound: '예', meaning: '기릴',
    desc: '훌륭한 덕행과 높은 재주로 세상에 칭송과 명예를 얻는 뜻입니다.',
    category: '강함과 큰 뜻', popularSound: '예', tag: ['boy', 'both'],
    corePhrase: '세상에 널리 칭송받는 높은 명예'
  },

  // ==================== '진' 한자 모음 ====================
  {
    char: '眞', sound: '진', meaning: '참',
    desc: '거짓과 꾸밈이 없는 순수한 진실함과 온전함을 뜻합니다.',
    category: '바름과 덕', popularSound: '진', tag: ['both'],
    corePhrase: '한 점 부끄럼 없는 참된 진실함'
  },
  {
    char: '鎭', sound: '진', meaning: '진정할/누를',
    desc: '중심을 묵직하고 든든하게 지켜 혼란을 가라앉히는 듬직한 기둥입니다.',
    category: '강함과 큰 뜻', popularSound: '진', tag: ['boy'],
    corePhrase: '중심을 굳건히 지키는 듬직한 힘'
  },
  {
    char: '辰', sound: '진', meaning: '별',
    desc: '밤하늘의 북극성처럼 어둠 속에서 길잡이가 되어주는 별빛입니다.',
    category: '빛과 밝음', popularSound: '진', tag: ['both', 'pretty'],
    corePhrase: '길을 안내하는 북극성 같은 별빛'
  },
  {
    char: '振', sound: '진', meaning: '떨칠',
    desc: '기세를 크게 떨치어 용기 있게 도약하고 발전해 나가는 기상입니다.',
    category: '강함과 큰 뜻', popularSound: '진', tag: ['boy'],
    corePhrase: '기세를 드높여 세상에 떨침'
  },
  {
    char: '津', sound: '진', meaning: '나루',
    desc: '사람들이 안전하게 건너도록 돕는 나루터처럼 세상을 돕는 디딤돌입니다.',
    category: '바름과 덕', popularSound: '진', tag: ['both'],
    corePhrase: '남을 건네주는 든든한 디딤돌'
  },

  // ==================== '원' 한자 모음 ====================
  {
    char: '源', sound: '원', meaning: '근원',
    desc: '마르지 않고 솟아나는 맑은 샘물처럼 끊임없는 생명력과 창의성입니다.',
    category: '자연과 넓음', popularSound: '원', tag: ['boy', 'both'],
    corePhrase: '마르지 않는 맑은 샘물의 생명력'
  },
  {
    char: '元', sound: '원', meaning: '으뜸',
    desc: '가장 첫머리이자 근본이 되는 으뜸 인재로서의 당당함입니다.',
    category: '강함과 큰 뜻', popularSound: '원', tag: ['boy'],
    corePhrase: '만물의 으뜸이 되는 뛰어난 역량'
  },
  {
    char: '媛', sound: '원', meaning: '미녀/고울',
    desc: '지혜와 덕을 겸비하여 우아하고 곱게 빛나는 인품입니다.',
    category: '바름과 덕', popularSound: '원', tag: ['girl', 'pretty'],
    corePhrase: '우아하고 고운 덕을 겸비한 기품'
  },
  {
    char: '遠', sound: '원', meaning: '멀',
    desc: '눈앞에 얽매이지 않고 먼 미래를 원대하게 내다보는 넓은 안목입니다.',
    category: '강함과 큰 뜻', popularSound: '원', tag: ['boy'],
    corePhrase: '미래를 내다보는 원대한 안목'
  },

  // ==================== '태' 한자 모음 ====================
  {
    char: '泰', sound: '태', meaning: '클/편안할',
    desc: '태산처럼 묵직하고 평온하며 너그럽게 세상의 풍파를 이겨내는 기상입니다.',
    category: '강함과 큰 뜻', popularSound: '태', tag: ['boy'],
    corePhrase: '태산처럼 흔들리지 않는 평온과 웅대함'
  },
  {
    char: '太', sound: '태', meaning: '클',
    desc: '가장 크고 원대하며 당당한 기세를 품어 지도자의 면모를 갖춤입니다.',
    category: '강함과 큰 뜻', popularSound: '태', tag: ['boy'],
    corePhrase: '거대하고 드높은 웅대한 기상'
  },

  // ==================== '호' 한자 모음 ====================
  {
    char: '浩', sound: '호', meaning: '넓을',
    desc: '넓은 바다처럼 호연지기를 품어 무엇이든 포용하는 광활한 마음입니다.',
    category: '자연과 넓음', popularSound: '호', tag: ['boy'],
    corePhrase: '바다처럼 광활한 호연지기'
  },
  {
    char: '鎬', sound: '호', meaning: '빛날/호경',
    desc: '잘 벼려진 쇠처럼 빛나고 귀중하며 탄탄한 역량을 뜻합니다.',
    category: '빛과 밝음', popularSound: '호', tag: ['boy'],
    corePhrase: '단단하고 눈부시게 빛나는 역량'
  },
  {
    char: '豪', sound: '호', meaning: '호걸',
    desc: '기상이 당당하고 도량이 크며 남을 이끄는 지도자의 호방함입니다.',
    category: '강함과 큰 뜻', popularSound: '호', tag: ['boy'],
    corePhrase: '당당하고 호방한 영웅의 기개'
  },

  // ==================== '가', '나', '린', '채' 등 예쁜 한자 모음 ====================
  {
    char: '佳', sound: '가', meaning: '아름다울',
    desc: '마음씨와 품격이 빼어나고 아름다워 사람들에게 기쁨을 줍니다.',
    category: '바름과 덕', popularSound: '가', tag: ['girl', 'pretty'],
    corePhrase: '빼어나고 맑은 아름다움'
  },
  {
    char: '嘉', sound: '가', meaning: '아름다울/기쁠',
    desc: '경사스럽고 착하며 많은 사람의 찬사를 받는 상서로운 뜻입니다.',
    category: '복과 길함', popularSound: '가', tag: ['both', 'pretty'],
    corePhrase: '기쁨과 찬사를 부르는 착한 덕'
  },
  {
    char: '娜', sound: '나', meaning: '아리따울',
    desc: '버들가지처럼 유연하고 단아하며 곱고 아름다운 자태를 뜻합니다.',
    category: '바름과 덕', popularSound: '나', tag: ['girl', 'pretty'],
    corePhrase: '단아하고 고운 마음의 자태'
  },
  {
    char: '璘', sound: '린', meaning: '옥빛',
    desc: '빛나는 옥에서 우러나오는 영롱하고 찬란한 무늬를 뜻합니다.',
    category: '빛과 밝음', popularSound: '린', tag: ['girl', 'both', 'pretty'],
    corePhrase: '옥처럼 영롱하게 빛나는 광채'
  },
  {
    char: '潾', sound: '린', meaning: '맑을',
    desc: '깊은 산골짜기에서 솟아나는 샘물처럼 맑고 깨끗함을 뜻합니다.',
    category: '자연과 넓음', popularSound: '린', tag: ['girl', 'both', 'pretty'],
    corePhrase: '산골 샘물처럼 티 없는 맑음'
  },
  {
    char: '彩', sound: '채', meaning: '채색',
    desc: '다채롭고 고운 빛깔로 세상에 풍성한 아름다움을 전하는 뜻입니다.',
    category: '빛과 밝음', popularSound: '채', tag: ['girl', 'pretty'],
    corePhrase: '다채롭고 아름다운 재능의 빛'
  },

  // ==================== 주제별 대표 한자 (빛, 지혜, 덕, 자연, 복, 강함) ====================
  {
    char: '明', sound: '명', meaning: '밝을',
    desc: '해와 달이 합쳐진 모습으로, 어둠을 환히 밝히는 지혜와 총명함입니다.',
    category: '빛과 밝음', popularSound: '명', tag: ['both'],
    corePhrase: '세상을 환하게 비추는 명석함'
  },
  {
    char: '昭', sound: '소', meaning: '밝을',
    desc: '햇살이 밝게 비추어 사리를 환하게 드러내는 맑은 총기입니다.',
    category: '빛과 밝음', popularSound: '소', tag: ['both', 'pretty'],
    corePhrase: '햇살처럼 환하게 드러나는 명철함'
  },
  {
    char: '晶', sound: '정', meaning: '맑을/수정',
    desc: '세 개의 해가 겹친 모양으로, 보석 수정처럼 티 없이 맑고 영롱함입니다.',
    category: '빛과 밝음', popularSound: '정', tag: ['girl', 'pretty'],
    corePhrase: '수정처럼 영롱하고 투명한 맑음'
  },
  {
    char: '熙', sound: '희', meaning: '빛날/화할',
    desc: '빛이 널리 비추어 온 세상이 따뜻하고 화목해지는 평화의 빛입니다.',
    category: '빛과 밝음', popularSound: '희', tag: ['both', 'pretty'],
    corePhrase: '따뜻한 온기로 세상을 밝히는 화평'
  },
  {
    char: '煥', sound: '환', meaning: '밝을',
    desc: '불꽃처럼 활활 타오르며 눈부시게 세상을 밝히는 환한 영광입니다.',
    category: '빛과 밝음', popularSound: '환', tag: ['boy'],
    corePhrase: '불꽃처럼 환하게 피어나는 눈부심'
  },
  {
    char: '朗', sound: '랑', meaning: '밝을',
    desc: '보름달처럼 밝고 맑으며 성격이 쾌활하고 구김살이 없는 명랑함입니다.',
    category: '빛과 밝음', popularSound: '랑', tag: ['both', 'pretty'],
    corePhrase: '달빛처럼 맑고 명랑한 기운'
  },
  {
    char: '燦', sound: '찬', meaning: '빛날',
    desc: '보석이나 별처럼 찬란하게 반짝이며 돋보이는 재능을 뜻합니다.',
    category: '빛과 밝음', popularSound: '찬', tag: ['both', 'pretty'],
    corePhrase: '보석처럼 찬란하게 빛나는 재능'
  },
  {
    char: '旭', sound: '욱', meaning: '아침해',
    desc: '동녘에서 힘차게 솟구쳐 오르는 아침 해처럼 무궁한 희망과 활력입니다.',
    category: '빛과 밝음', popularSound: '욱', tag: ['boy'],
    corePhrase: '힘차게 솟구치는 아침 해의 활력'
  },
  {
    char: '晨', sound: '신', meaning: '새벽',
    desc: '부지런히 아침을 여는 새벽별처럼 성실하고 맑은 깨어있음입니다.',
    category: '빛과 밝음', popularSound: '신', tag: ['both', 'pretty'],
    corePhrase: '새벽을 여는 성실하고 맑은 별빛'
  },
  {
    char: '耀', sound: '요', meaning: '빛날',
    desc: '광채가 눈부시게 사방으로 뻗어나가는 영광과 명성을 상징합니다.',
    category: '빛과 밝음', popularSound: '요', tag: ['both'],
    corePhrase: '사방으로 뻗어나가는 눈부신 광채'
  },
  {
    char: '文', sound: '문', meaning: '글월/무늬',
    desc: '학문과 교양, 예절의 향기를 갖추어 문채가 빛나는 인재입니다.',
    category: '지혜와 배움', popularSound: '문', tag: ['both'],
    corePhrase: '교양과 학덕이 빛나는 문채'
  },
  {
    char: '學', sound: '학', meaning: '배울',
    desc: '배움의 길을 즐겁게 탐구하여 큰 지식과 도리를 깨닫는 삶입니다.',
    category: '지혜와 배움', popularSound: '학', tag: ['both'],
    corePhrase: '학문을 즐기며 깨달아가는 배움'
  },
  {
    char: '哲', sound: '철', meaning: '밝을/철학',
    desc: '이치를 명확하게 꿰뚫어 보고 현명하게 판단하는 지혜로운 철인입니다.',
    category: '지혜와 배움', popularSound: '철', tag: ['boy'],
    corePhrase: '사물의 본질을 꿰뚫는 명철한 안목'
  },
  {
    char: '慧', sound: '혜', meaning: '지혜',
    desc: '마음이 맑고 총명하여 어려운 일도 슬기롭게 풀어가는 지혜입니다.',
    category: '지혜와 배움', popularSound: '혜', tag: ['girl', 'pretty'],
    corePhrase: '어려움을 슬기롭게 푸는 혜안'
  },
  {
    char: '達', sound: '달', meaning: '통달할',
    desc: '막힘없이 사리에 두루 통달하고 원하던 뜻을 이루어내는 힘입니다.',
    category: '지혜와 배움', popularSound: '달', tag: ['boy'],
    corePhrase: '사리에 통달하여 뜻을 이룸'
  },
  {
    char: '聖', sound: '성', meaning: '성스러울',
    desc: '남의 말을 귀담아듣고 지혜로써 세상을 이끄는 거룩한 인품입니다.',
    category: '지혜와 배움', popularSound: '성', tag: ['both'],
    corePhrase: '사람들의 소리를 경청하는 성스러운 지혜'
  },
  {
    char: '正', sound: '정', meaning: '바를',
    desc: '치우침 없이 곧고 바른 마음으로 정의로운 삶을 살아감을 뜻합니다.',
    category: '바름과 덕', popularSound: '정', tag: ['boy', 'both'],
    corePhrase: '언제나 곧고 바른길을 걷는 정의로움'
  },
  {
    char: '義', sound: '의', meaning: '옳을',
    desc: '도리에 맞고 옳은 행동을 솔선하여 신의와 의리를 지킴입니다.',
    category: '바름과 덕', popularSound: '의', tag: ['boy', 'both'],
    corePhrase: '도리에 맞고 신의를 지키는 올곧음'
  },
  {
    char: '仁', sound: '인', meaning: '어질',
    desc: '사람을 깊이 사랑하고 배려하는 유교의 최고 덕목인 어짊입니다.',
    category: '바름과 덕', popularSound: '인', tag: ['both'],
    corePhrase: '남을 깊이 아끼고 사랑하는 어진 덕'
  },
  {
    char: '善', sound: '선', meaning: '착할',
    desc: '착하고 어진 마음씨로 주변을 따뜻하게 물들이는 선한 본성입니다.',
    category: '바름과 덕', popularSound: '선', tag: ['both'],
    corePhrase: '주변을 온화하게 물들이는 선량함'
  },
  {
    char: '德', sound: '덕', meaning: '큰덕',
    desc: '스스로를 낮추고 남을 높여 저절로 사람들이 따르게 하는 큰 덕망입니다.',
    category: '바름과 덕', popularSound: '덕', tag: ['boy', 'both'],
    corePhrase: '만인을 감화시키는 너른 덕망'
  },
  {
    char: '誠', sound: '성', meaning: '정성',
    desc: '말과 행동이 일치하고 한결같이 쏟는 거짓 없는 진실한 정성입니다.',
    category: '바름과 덕', popularSound: '성', tag: ['both'],
    corePhrase: '한결같이 쏟아붓는 진실한 정성'
  },
  {
    char: '淳', sound: '순', meaning: '순박할/맑을',
    desc: '물처럼 맑고 꾸밈없이 순수한 본성을 지니며 온후한 마음입니다.',
    category: '바름과 덕', popularSound: '순', tag: ['both'],
    corePhrase: '물처럼 맑고 순수한 온후함'
  },
  {
    char: '靜', sound: '정', meaning: '고요할',
    desc: '내면이 고요하고 평온하여 주변의 소란에도 흔들리지 않는 품격입니다.',
    category: '바름과 덕', popularSound: '정', tag: ['girl', 'both', 'pretty'],
    corePhrase: '흔들리지 않는 고요하고 깊은 내면'
  },
  {
    char: '海', sound: '해', meaning: '바다',
    desc: '모든 강물을 품어 안는 넓은 바다처럼 끝없는 포용력과 깊이입니다.',
    category: '자연과 넓음', popularSound: '해', tag: ['both'],
    corePhrase: '모든 물을 받아들이는 바다의 포용력'
  },
  {
    char: '山', sound: '산', meaning: '뫼',
    desc: '비바람에도 의연히 서 있는 산처럼 변함없는 신의와 믿음직함입니다.',
    category: '자연과 넓음', popularSound: '산', tag: ['boy'],
    corePhrase: '비바람에도 흔들리지 않는 굳건한 신뢰'
  },
  {
    char: '林', sound: '림', meaning: '수풀',
    desc: '푸른 나무들이 어우러진 숲처럼 많은 이들에게 쉼과 그늘을 주는 덕입니다.',
    category: '자연과 넓음', popularSound: '림', tag: ['both'],
    corePhrase: '지친 이들에게 쉼터가 되어주는 큰 그늘'
  },
  {
    char: '星', sound: '성', meaning: '별',
    desc: '어둔 밤하늘을 수놓으며 누군가의 꿈과 희망이 되어주는 빛입니다.',
    category: '자연과 넓음', popularSound: '성', tag: ['both', 'pretty'],
    corePhrase: '어둠 속을 밝히는 희망의 길잡이 별'
  },
  {
    char: '天', sound: '천', meaning: '하늘',
    desc: '지극히 높고 공평무사하여 만물을 굽어보는 크나큰 기상입니다.',
    category: '자연과 넓음', popularSound: '천', tag: ['boy'],
    corePhrase: '만물을 굽어보는 드높은 하늘의 기상'
  },
  {
    char: '霖', sound: '림', meaning: '단비',
    desc: '가뭄 끝에 메마른 대지를 적시는 반가운 단비처럼 귀하고 축복받는 존재입니다.',
    category: '자연과 넓음', popularSound: '림', tag: ['both', 'pretty'],
    corePhrase: '메마른 세상을 적시는 반가운 단비'
  },
  {
    char: '雲', sound: '운', meaning: '구름',
    desc: '높은 하늘을 자유롭게 노니는 구름처럼 얽매이지 않는 자유로운 기상입니다.',
    category: '자연과 넓음', popularSound: '운', tag: ['both'],
    corePhrase: '자유롭고 호연한 대자연의 풍류'
  },
  {
    char: '瀚', sound: '한', meaning: '넓을',
    desc: '광대한 바다나 사막처럼 한없이 넓고 장대한 스케일을 상징합니다.',
    category: '자연과 넓음', popularSound: '한', tag: ['boy'],
    corePhrase: '끝없이 펼쳐진 광대한 세계의 기상'
  },
  {
    char: '福', sound: '복', meaning: '복',
    desc: '삶에 물질적·정신적 행복이 가득하고 평안이 넘쳐남을 뜻합니다.',
    category: '복과 길함', popularSound: '복', tag: ['both'],
    corePhrase: '삶에 가득 차오르는 오복과 평안'
  },
  {
    char: '祥', sound: '상', meaning: '상서로울',
    desc: '착한 마음으로 인해 하늘이 내리는 길하고 경사스러운 기운입니다.',
    category: '복과 길함', popularSound: '상', tag: ['both'],
    corePhrase: '착한 마음씨가 부르는 길한 기운'
  },
  {
    char: '吉', sound: '길', meaning: '길할',
    desc: '모든 일이 순조롭게 잘 풀리고 행운이 함께하는 축복입니다.',
    category: '복과 길함', popularSound: '길', tag: ['both'],
    corePhrase: '하는 일마다 순조롭게 풀리는 행운'
  },
  {
    char: '慶', sound: '경', meaning: '경사',
    desc: '가문과 주변에 기쁜 경사가 겹쳐 축하가 끊이지 않는 복입니다.',
    category: '복과 길함', popularSound: '경', tag: ['both'],
    corePhrase: '기쁜 경사가 끊이지 않는 축복'
  },
  {
    char: '祿', sound: '록/녹', meaning: '복/녹',
    desc: '자신의 역량과 노력으로 누리는 풍요롭고 든든한 결실입니다.',
    category: '복과 길함', popularSound: '록', tag: ['boy'],
    corePhrase: '정당한 노력으로 누리는 풍요로운 결실'
  },
  {
    char: '禧', sound: '희', meaning: '복',
    desc: '맑고 큰 행복과 경사스러운 기쁨이 온 집안에 넘쳐남을 뜻합니다.',
    category: '복과 길함', popularSound: '희', tag: ['both', 'pretty'],
    corePhrase: '온 집안에 넘치는 큰 행복과 경사'
  },
  {
    char: '喜', sound: '희', meaning: '기쁠',
    desc: '웃음과 즐거움이 가득하여 사람들에게 긍정의 에너지를 줍니다.',
    category: '복과 길함', popularSound: '희', tag: ['both'],
    corePhrase: '밝은 웃음과 활력을 전하는 기쁨'
  },
  {
    char: '昌', sound: '창', meaning: '창성할',
    desc: '번성하고 융성하여 뜻한 바를 크게 성취함을 나타냅니다.',
    category: '복과 길함', popularSound: '창', tag: ['boy'],
    corePhrase: '뜻한 바를 크게 이루어 번창함'
  },
  {
    char: '寶', sound: '보', meaning: '보배',
    desc: '둘도 없이 소중하고 귀하여 만인의 아낌을 받는 귀한 존재입니다.',
    category: '복과 길함', popularSound: '보', tag: ['both'],
    corePhrase: '둘도 없이 귀하게 사랑받는 존재'
  },
  {
    char: '健', sound: '건', meaning: '굳셀',
    desc: '몸과 마음이 굳건하고 건강하여 어떤 역경도 꿋꿋이 헤쳐 나갑니다.',
    category: '강함과 큰 뜻', popularSound: '건', tag: ['boy'],
    corePhrase: '역경을 꿋꿋이 이겨내는 굳센 건강'
  },
  {
    char: '雄', sound: '웅', meaning: '영웅/수컷',
    desc: '우두머리로서의 웅대한 기백과 과감한 용기로 시대를 이끕니다.',
    category: '강함과 큰 뜻', popularSound: '웅', tag: ['boy'],
    corePhrase: '시대를 이끌어가는 웅대한 기백'
  },
  {
    char: '大', sound: '대', meaning: '큰',
    desc: '작은 일에 연연하지 않고 대범하며 큰 뜻을 품고 나아가는 모습입니다.',
    category: '강함과 큰 뜻', popularSound: '대', tag: ['boy'],
    corePhrase: '대범하고 원대한 포부를 품은 큰 그릇'
  },
  {
    char: '剛', sound: '강', meaning: '굳셀',
    desc: '불의에 굴하지 않고 쇠처럼 단단하게 원칙과 신념을 지키는 힘입니다.',
    category: '강함과 큰 뜻', popularSound: '강', tag: ['boy'],
    corePhrase: '불의에 굽히지 않는 단단한 신념'
  },
  {
    char: '勇', sound: '용', meaning: '날랠',
    desc: '어려움 앞에서도 두려움 없이 옳은 일을 실천하는 당당한 용기입니다.',
    category: '강함과 큰 뜻', popularSound: '용', tag: ['boy'],
    corePhrase: '옳은 일을 향해 주저 없이 나아가는 용기'
  },
  {
    char: '勳', sound: '훈', meaning: '공',
    desc: '사회의 발전에 기여하여 길이 남을 훌륭한 공훈과 업적을 세움을 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '훈', tag: ['boy'],
    corePhrase: '세상에 빛나는 보람찬 공로'
  },
  {
    char: '毅', sound: '의', meaning: '굳셀',
    desc: '꿋꿋한 인내심과 강인한 결단력으로 목표를 완수하는 의지입니다.',
    category: '강함과 큰 뜻', popularSound: '의', tag: ['boy'],
    corePhrase: '흔들리지 않는 꿋꿋한 결단력'
  },
  {
    char: '赫', sound: '혁', meaning: '빛날',
    desc: '불꽃이 크게 일듯 혁혁한 명성과 눈부신 기세를 세상에 떨침입니다.',
    category: '강함과 큰 뜻', popularSound: '혁', tag: ['boy'],
    corePhrase: '세상에 당당히 떨치는 혁혁한 기세'
  },
  {
    char: '彬', sound: '빈', meaning: '빛날',
    desc: '외적인 풍모와 내적인 인품이 조화롭게 어우러져 찬란하게 빛납니다.',
    category: '빛과 밝음', popularSound: '빈', tag: ['boy', 'both'],
    corePhrase: '재주와 덕망이 조화롭게 빛남'
  },
  {
    char: '斌', sound: '빈', meaning: '빛날',
    desc: '문(文)과 무(武)의 역량이 고루 균형을 이루어 당당함을 자랑합니다.',
    category: '강함과 큰 뜻', popularSound: '빈', tag: ['boy'],
    corePhrase: '지혜와 용기를 두루 갖춘 당당함'
  },
  {
    char: '宰', sound: '재', meaning: '재상',
    desc: '뭇사람을 조화롭게 이끌고 큰일을 주관하는 훌륭한 리더십입니다.',
    category: '지혜와 배움', popularSound: '재', tag: ['boy'],
    corePhrase: '모두를 아우르고 이끄는 든든한 지도력'
  },
  {
    char: '在', sound: '재', meaning: '있을',
    desc: '머무는 자리마다 든든한 버팀목이 되어주는 소중한 존재감입니다.',
    category: '바름과 덕', popularSound: '재', tag: ['both'],
    corePhrase: '어디서나 든든한 버팀목이 되는 존재'
  },
  {
    char: '潔', sound: '결', meaning: '깨끗할',
    desc: '흐트러짐 없이 맑고 결백하여 사심 없는 높은 인격을 나타냅니다.',
    category: '바름과 덕', popularSound: '결', tag: ['both', 'pretty'],
    corePhrase: '사심 없이 맑고 청렴한 인격'
  },
  // ==================== 주요 성씨 및 인명 한자 (김, 이, 박, 최, 정, 심 등) ====================
  {
    char: '金', sound: '김', aliasSounds: ['김', '금'], meaning: '성/쇠',
    desc: '성씨 김, 쇠/황금 금. 변치 않는 단단함과 귀한 황금처럼 빛나는 기상을 뜻합니다.',
    category: '복과 길함', popularSound: '김', tag: ['both'],
    corePhrase: '황금처럼 빛나고 단단한 기상'
  },
  {
    char: '李', sound: '이', aliasSounds: ['이', '리'], meaning: '성/오얏',
    desc: '성씨 이, 오얏나무 리. 탐스러운 열매를 맺는 오얏나무처럼 풍요롭고 덕망 있는 기품을 뜻합니다.',
    category: '자연과 넓음', popularSound: '이', tag: ['both'],
    corePhrase: '풍성한 결실과 어진 덕망'
  },
  {
    char: '朴', sound: '박', aliasSounds: ['박'], meaning: '순박할',
    desc: '순박할 박. 거짓 없이 진실하며 통나무처럼 꾸밈없는 맑고 큰 도량을 뜻합니다.',
    category: '바름과 덕', popularSound: '박', tag: ['both'],
    corePhrase: '꾸밈없이 순수하고 큰 도량'
  },
  {
    char: '崔', sound: '최', aliasSounds: ['최'], meaning: '높을',
    desc: '높을 최. 산처럼 높고 우뚝 솟아 탁월한 성취를 이루는 기상을 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '최', tag: ['both'],
    corePhrase: '우뚝 솟은 산처럼 높은 기상'
  },
  {
    char: '鄭', sound: '정', aliasSounds: ['정'], meaning: '나라',
    desc: '나라 정. 엄숙하고 바르며 중심을 지키는 단정한 기품을 뜻합니다.',
    category: '바름과 덕', popularSound: '정', tag: ['both'],
    corePhrase: '바르고 당당한 기품'
  },
  {
    char: '姜', sound: '강', aliasSounds: ['강'], meaning: '성',
    desc: '성씨 강. 오랜 역사와 깊은 뿌리를 지닌 굳건한 기개를 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '강', tag: ['both'],
    corePhrase: '깊은 뿌리와 굳건한 기개'
  },
  {
    char: '趙', sound: '조', aliasSounds: ['조'], meaning: '나라',
    desc: '나라 조. 민첩하고 앞서 나가며 번영을 이끄는 뜻을 지닙니다.',
    category: '강함과 큰 뜻', popularSound: '조', tag: ['both'],
    corePhrase: '번영과 활기찬 전진'
  },
  {
    char: '尹', sound: '윤', aliasSounds: ['윤'], meaning: '다스릴',
    desc: '다스릴 윤. 바른 도로써 세상과 마음을 조화롭게 다스리는 지혜를 뜻합니다.',
    category: '지혜와 배움', popularSound: '윤', tag: ['both'],
    corePhrase: '조화롭게 다스리는 어진 지혜'
  },
  {
    char: '張', sound: '장', aliasSounds: ['장'], meaning: '베풀/활시위',
    desc: '베풀 장, 활시위 당길 장. 원대한 꿈을 펼치고 널리 베푸는 기개를 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '장', tag: ['both'],
    corePhrase: '원대한 뜻을 널리 펼치는 기개'
  },
  {
    char: '林', sound: '임', aliasSounds: ['임', '림'], meaning: '수풀',
    desc: '수풀 림/임. 울창한 숲처럼 생명력이 넘치고 쉼을 주는 너른 포용력을 뜻합니다.',
    category: '자연과 넓음', popularSound: '임', tag: ['both'],
    corePhrase: '울창한 숲처럼 푸르고 너른 포용력'
  },
  {
    char: '柳', sound: '유', aliasSounds: ['유', '류'], meaning: '버들',
    desc: '버들 류/유. 부드럽게 휘어지면서도 꺾이지 않는 유연함과 끈기를 뜻합니다.',
    category: '자연과 넓음', popularSound: '유', tag: ['both'],
    corePhrase: '유연함과 꺾이지 않는 강인함'
  },
  {
    char: '梁', sound: '양', aliasSounds: ['양', '량'], meaning: '들보',
    desc: '들보 량/양. 집과 세상을 굳건히 떠받치는 대들보처럼 든든한 동량을 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '양', tag: ['both'],
    corePhrase: '세상을 든든히 떠받치는 대들보'
  },
  {
    char: '羅', sound: '나', aliasSounds: ['나', '라'], meaning: '비단/벌일',
    desc: '비단 라/나. 비단처럼 곱고 온 세상에 널리 이름을 떨치는 뜻을 담고 있습니다.',
    category: '복과 길함', popularSound: '나', tag: ['both'],
    corePhrase: '비단처럼 곱고 널리 펼쳐지는 뜻'
  },
  {
    char: '盧', sound: '노', aliasSounds: ['노', '로'], meaning: '성/반석',
    desc: '성씨 노/로. 검은 옥돌 또는 든든한 반석처럼 견고한 기상을 상징합니다.',
    category: '강함과 큰 뜻', popularSound: '노', tag: ['both'],
    corePhrase: '반석처럼 든든하고 견고한 기상'
  },
  {
    char: '沈', sound: '심', aliasSounds: ['심', '침'], meaning: '성/잠길',
    desc: '성씨 심, 잠길 침. 깊은 호수처럼 지혜가 깊고 침착하며 그윽한 덕을 뜻합니다.',
    category: '지혜와 배움', popularSound: '심', tag: ['both'],
    corePhrase: '깊은 호수처럼 침착하고 그윽한 지혜'
  },
  {
    char: '韓', sound: '한', aliasSounds: ['한'], meaning: '나라/클',
    desc: '나라 한. 크고 넓으며 온 세상을 감싸 안는 당당한 기개를 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '한', tag: ['both'],
    corePhrase: '크고 넓게 세상을 품는 기개'
  },
  {
    char: '申', sound: '신', aliasSounds: ['신'], meaning: '거듭/펼',
    desc: '거듭 신, 펼칠 신. 자신의 뜻과 이상을 거침없이 펼쳐내는 진취성을 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '신', tag: ['both'],
    corePhrase: '뜻과 이상을 거침없이 펼침'
  },
  {
    char: '徐', sound: '서', aliasSounds: ['서'], meaning: '천천히',
    desc: '천천히 서. 조급하지 않고 침착하게 나아가며 깊이를 더해가는 미덕을 뜻합니다.',
    category: '바름과 덕', popularSound: '서', tag: ['both'],
    corePhrase: '침착하고 여유로운 깊은 미덕'
  },
  {
    char: '權', sound: '권', aliasSounds: ['권'], meaning: '권세/저울추',
    desc: '권세 권, 저울추 권. 중심을 공평하게 잡고 올바른 영향력을 발휘하는 지혜입니다.',
    category: '지혜와 배움', popularSound: '권', tag: ['both'],
    corePhrase: '중심을 바르게 잡는 탁월한 지혜'
  },
  {
    char: '黃', sound: '황', aliasSounds: ['황'], meaning: '누를/황금',
    desc: '누를 황. 대지의 풍요로움과 황금빛 찬란한 번영을 뜻하는 상서로운 한자입니다.',
    category: '복과 길함', popularSound: '황', tag: ['both'],
    corePhrase: '대지의 풍요로움과 찬란한 번영'
  },
  {
    char: '安', sound: '안', aliasSounds: ['안'], meaning: '편안할',
    desc: '편안할 안. 마음이 고요하고 평온하며 주위 사람들을 안도하게 하는 온기를 뜻합니다.',
    category: '바름과 덕', popularSound: '안', tag: ['both', 'pretty'],
    corePhrase: '마음의 평온함과 따스한 안도감'
  },
  {
    char: '宋', sound: '송', aliasSounds: ['송'], meaning: '나라',
    desc: '나라 송. 단정하고 기품 있으며 예를 지키는 품격을 뜻합니다.',
    category: '바름과 덕', popularSound: '송', tag: ['both'],
    corePhrase: '단정하고 기품 있는 미덕'
  },
  {
    char: '洪', sound: '홍', aliasSounds: ['홍'], meaning: '넓을/큰물',
    desc: '넓을 홍. 큰 바다처럼 도량이 넓고 원대한 포부를 품은 기상을 뜻합니다.',
    category: '자연과 넓음', popularSound: '홍', tag: ['both'],
    corePhrase: '바다처럼 넓고 원대한 포부'
  },
  {
    char: '全', sound: '전', aliasSounds: ['전'], meaning: '온전할',
    desc: '온전할 전. 모자람 없이 온전하고 순수하며 완벽을 추구하는 성실함입니다.',
    category: '바름과 덕', popularSound: '전', tag: ['both'],
    corePhrase: '모자람 없이 온전하고 맑은 인품'
  },
  {
    char: '白', sound: '백', aliasSounds: ['백'], meaning: '흰/밝을',
    desc: '흰 백. 눈처럼 깨끗하고 순결하며 거짓 없는 밝은 마음을 뜻합니다.',
    category: '빛과 밝음', popularSound: '백', tag: ['both', 'pretty'],
    corePhrase: '눈처럼 깨끗하고 거짓 없는 순수함'
  },
  {
    char: '許', sound: '허', aliasSounds: ['허'], meaning: '허락할/칭찬할',
    desc: '칭찬할 허, 허락할 허. 관대하게 포용하며 타인의 장점을 북돋는 덕망입니다.',
    category: '바름과 덕', popularSound: '허', tag: ['both'],
    corePhrase: '관대하게 포용하고 칭찬하는 덕망'
  },
  // ==================== 다빈도 인명 한자 보강 (미, 숙, 희, 옥, 순, 영 등) ====================
  {
    char: '美', sound: '미', meaning: '아름다울',
    desc: '아름다울 미. 외면과 내면이 모두 곱고 향기로우며 사람들에게 감동을 주는 훌륭한 덕을 뜻합니다.',
    category: '빛과 밝음', popularSound: '미', tag: ['girl', 'pretty', 'both'],
    corePhrase: '곱고 향기로운 아름다운 덕망'
  },
  {
    char: '薇', sound: '미', meaning: '장미/고사리',
    desc: '장미 미. 장미꽃처럼 화사하고 은은한 향기를 품은 매력을 뜻합니다.',
    category: '자연과 넓음', popularSound: '미', tag: ['girl', 'pretty'],
    corePhrase: '장미꽃처럼 화사하고 은은한 향기'
  },
  {
    char: '淑', sound: '숙', meaning: '맑을/정숙할',
    desc: '맑을 숙. 맑은 물처럼 고요하고 온화하며 품격이 높은 성품을 뜻합니다.',
    category: '바름과 덕', popularSound: '숙', tag: ['girl'],
    corePhrase: '맑은 물처럼 고요하고 단아한 품격'
  },
  {
    char: '姬', sound: '희', meaning: '아가씨/계집',
    desc: '아가씨 희. 귀하고 단아하며 기품 있는 모습을 뜻합니다.',
    category: '복과 길함', popularSound: '희', tag: ['girl'],
    corePhrase: '귀하고 단아하며 상서로운 기품'
  },
  {
    char: '玉', sound: '옥', meaning: '구슬/옥',
    desc: '구슬 옥. 옥처럼 흠 없이 맑고 귀중하여 세상의 보배가 됨을 뜻합니다.',
    category: '복과 길함', popularSound: '옥', tag: ['girl', 'both', 'pretty'],
    corePhrase: '옥처럼 흠 없이 맑고 귀중한 존재'
  },
  {
    char: '順', sound: '순', meaning: '순할/따를',
    desc: '순할 순. 도리에 순응하며 원만하고 부드럽게 세상을 품는 덕망을 뜻합니다.',
    category: '바름과 덕', popularSound: '순', tag: ['both'],
    corePhrase: '원만하고 부드러운 순리의 덕망'
  },
  {
    char: '貞', sound: '정', meaning: '곧을',
    desc: '곧을 정. 지조가 굳고 정결하여 흔들리지 않는 바른 마음을 뜻합니다.',
    category: '바름과 덕', popularSound: '정', tag: ['girl', 'both'],
    corePhrase: '지조가 굳고 흔들림 없는 바른 마음'
  },
  {
    char: '英', sound: '영', meaning: '꽃부리/뛰어날',
    desc: '꽃부리 영. 꽃처럼 화사하고 남들보다 뛰어난 영특함과 총기를 뜻합니다.',
    category: '빛과 밝음', popularSound: '영', tag: ['both', 'pretty'],
    corePhrase: '꽃처럼 화사하고 뛰어난 영특함'
  },
  {
    char: '秀', sound: '수', meaning: '빼어날',
    desc: '빼어날 수. 빼어나게 출중하여 어디서나 두각을 나타냄을 뜻합니다.',
    category: '강함과 큰 뜻', popularSound: '수', tag: ['both'],
    corePhrase: '남달리 빼어나고 출중한 능력'
  }
];

// 빠른 조회를 위한 Map 생성
const NAME_HANJA_MAP = new Map();
NAME_HANJA_LIST.forEach(item => {
  NAME_HANJA_MAP.set(item.char, item);
});

// GRADE_HANJA 빠른 조회를 위한 Map 캐시 (3,500자 전체 지원)
let _GRADE_HANJA_MAP = null;
function getGradeHanjaMap() {
  if (!_GRADE_HANJA_MAP && typeof GRADE_HANJA !== 'undefined' && Array.isArray(GRADE_HANJA)) {
    _GRADE_HANJA_MAP = new Map();
    GRADE_HANJA.forEach(item => {
      _GRADE_HANJA_MAP.set(item.char, item);
    });
  }
  return _GRADE_HANJA_MAP;
}

// 한자 찾기 함수 (NAME_HANJA_LIST 우선, 없으면 GRADE_HANJA 3,500자 fallback 검색)
function findNameHanja(ch) {
  if (NAME_HANJA_MAP.has(ch)) {
    return NAME_HANJA_MAP.get(ch);
  }
  const gradeMap = getGradeHanjaMap();
  if (gradeMap && gradeMap.has(ch)) {
    const g = gradeMap.get(ch);
    const meaningText = g.meaning || g.hun || '';
    const soundText = g.sound || '';
    return {
      char: ch,
      sound: soundText,
      meaning: meaningText,
      desc: `${meaningText} ${soundText}을(를) 뜻하며, ${g.hunmum || `${meaningText} ${soundText}`} 배정한자입니다.`,
      category: '배정한자',
      popularSound: soundText,
      corePhrase: `${meaningText} ${soundText}의 뜻`
    };
  }
  return null;
}

/**
 * 이름 전체 의미를 자연스럽고 부드럽게 조합하는 함수
 * @param {Array<Object>} charResults - 분석된 한자 객체 배열
 * @param {string} hangulName - 입력받은 한글 이름 (선택)
 * @returns {string} 조합된 해석 문장
 */
function generateNameInterpretation(charResults, hangulName) {
  if (!charResults || charResults.length === 0) return '';

  const knownList = charResults.filter(r => r.found && r.data);
  const unknownCount = charResults.length - knownList.length;

  // 전체가 미등록인 경우
  if (knownList.length === 0) {
    return '입력하신 한자는 현재 기본 인명용 데이터에 수록되지 않은 글자입니다. 법원 인명용 한자 조회를 통해 공인된 훈음과 등록 가능 여부를 확인해 보시기를 권해 드립니다.';
  }

  // 1글자인 경우
  if (knownList.length === 1 && charResults.length === 1) {
    const d = knownList[0].data;
    return `‘${d.char}(${d.meaning} ${d.sound})’은(는) ${d.corePhrase || d.meaning}의 의미를 담고 있어, ${d.desc} 삶의 중심을 바르게 세우고 자신의 뜻을 펼쳐 나가는 사람이라는 의미로 해석할 수 있습니다.`;
  }

  // 2글자인 경우 (가장 흔함 예: 민준, 서연, 지우 등)
  if (knownList.length === 2 && charResults.length === 2) {
    const c1 = knownList[0].data;
    const c2 = knownList[1].data;

    const p1 = c1.corePhrase || `${c1.meaning} ${c1.sound}의 의미`;
    const p2 = c2.corePhrase || `${c2.meaning} ${c2.sound}의 의미`;

    const templates = [
      `‘${c1.char}(${c1.meaning} ${c1.sound})’의 ${p1}과 ‘${c2.char}(${c2.meaning} ${c2.sound})’의 ${p2}이(가) 조화롭게 어우러진 이름입니다. 넓은 마음과 지혜로운 실천으로 자신만의 밝은 길을 열어가는 사람이라는 의미로 해석할 수 있습니다.`,
      `첫 글자 ‘${c1.char}(${c1.meaning} ${c1.sound})’이(가) 품은 ${p1}과 둘째 글자 ‘${c2.char}(${c2.meaning} ${c2.sound})’의 ${p2}이(가) 함께 빛납니다. 스스로를 귀하게 가꾸고 세상에 선한 기운을 전하는 사람이라는 느낌을 줄 수 있습니다.`,
      `‘${c1.char}’과 ‘${c2.char}’의 결합은 ${p1}을(를) 바탕으로 ${p2}을(를) 활짝 꽃피우는 뜻을 담고 있습니다. 매사에 정성을 다하며 주변을 훈훈하게 비추는 긍정적인 뜻으로 풀이해 볼 수 있습니다.`
    ];

    const hash = (c1.char.charCodeAt(0) + c2.char.charCodeAt(0)) % templates.length;
    let result = templates[hash];

    if (hangulName) {
      result = `‘${hangulName}(${c1.char}${c2.char})’은(는) ` + result;
    }
    return result;
  }

  // 3글자 이상 또는 일부만 확인된 경우
  const phrases = knownList.map(item => `‘${item.data.char}(${item.data.meaning} ${item.data.sound})’의 ${item.data.corePhrase || item.data.meaning}`);
  let combined = phrases.join('과(와) ');
  let sentence = `${combined}의 소중한 뜻이 한데 모인 이름입니다. 각 글자가 지닌 좋은 기운이 서로를 북돋아 주며, 세상에 따뜻하고 밝은 발자취를 남기는 사람이라는 의미로 해석할 수 있습니다.`;

  if (unknownCount > 0) {
    sentence += ` (※ 일부 글자는 기본 데이터에 없어 안내된 공식 인명용 한자 조회를 함께 참고하시면 더욱 좋습니다.)`;
  }
  return sentence;
}
