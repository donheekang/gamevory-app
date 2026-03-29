// ============================================================
// RAWG 게임 데이터로 한국어 설명 자동 생성 v2
// 더 자연스럽고 와닿는 설명 생성
// ============================================================

import { GENRE_KO, TAG_KO } from "../data/koreanMappings";

// 장르별 소개 문장 (여러 개 중 랜덤 느낌 → 태그 조합으로 차별화)
const GENRE_INTRO = {
  "Action": [
    "손에 땀을 쥐는 전투와 박진감 넘치는 액션이 기다리고 있어요.",
    "빠른 전개와 짜릿한 액션으로 시간 가는 줄 모르게 빠져들어요.",
  ],
  "Adventure": [
    "미지의 세계를 탐험하며 하나씩 비밀을 풀어가는 재미가 있어요.",
    "탐험과 발견의 즐거움이 가득한 모험이 펼쳐져요.",
  ],
  "RPG": [
    "캐릭터를 성장시키고, 나만의 방식으로 세계를 경험할 수 있어요.",
    "깊이 있는 스토리와 성장 시스템으로 수백 시간도 부족한 게임이에요.",
  ],
  "Shooter": [
    "정밀한 조준과 긴장감 넘치는 총격전이 펼쳐져요.",
    "다양한 무기로 적을 쓰러뜨리는 짜릿한 슈팅 액션이에요.",
  ],
  "Strategy": [
    "머리를 쓰는 전략과 판단이 승패를 가르는 게임이에요.",
    "한 수 한 수 신중하게, 전략적 사고가 핵심인 게임이에요.",
  ],
  "Simulation": [
    "현실에서 경험하기 어려운 것들을 생생하게 체험할 수 있어요.",
    "디테일한 시뮬레이션으로 몰입감이 남다른 게임이에요.",
  ],
  "Puzzle": [
    "퍼즐을 풀 때마다 느끼는 쾌감이 중독적인 게임이에요.",
    "창의적인 퍼즐 디자인으로 풀 때마다 감탄하게 돼요.",
  ],
  "Racing": [
    "엔진 소리와 함께 속도감 넘치는 레이스를 즐길 수 있어요.",
    "트랙을 질주하며 느끼는 스피드의 쾌감이 최고예요.",
  ],
  "Sports": [
    "좋아하는 스포츠를 게임으로 생생하게 체험할 수 있어요.",
  ],
  "Fighting": [
    "다양한 캐릭터로 박진감 넘치는 대전을 즐길 수 있어요.",
  ],
  "Platformer": [
    "정밀한 점프와 타이밍이 핵심인 플랫포머 게임이에요.",
    "레벨 하나하나가 잘 설계된, 도전 의욕을 자극하는 게임이에요.",
  ],
  "Indie": [
    "대형 게임에서 느낄 수 없는 독창적인 매력이 있는 게임이에요.",
  ],
  "Casual": [
    "부담 없이 가볍게 즐기기 좋은 게임이에요.",
  ],
};

// 태그 조합에 따른 특별 문장 (더 구체적인 설명)
const TAG_COMBO_DESC = {
  "Open World+Story Rich": "광활한 세계를 탐험하면서 깊이 있는 스토리에 빠져들 수 있어요. 메인 퀘스트도 좋지만 사이드 퀘스트와 숨겨진 이야기들도 놓치지 마세요.",
  "Open World+Survival": "넓은 세계에서 자원을 모으고 생존하는 긴장감이 매력이에요. 언제 어디서 위험이 닥칠지 모르는 스릴이 있어요.",
  "Open World+RPG": "자유로운 탐험과 캐릭터 성장이 만나 시간 가는 줄 모르게 빠져들어요.",
  "Story Rich+Choices Matter": "내가 하는 선택 하나하나가 스토리를 바꿔요. 여러 번 플레이해도 새로운 전개를 볼 수 있어요.",
  "Story Rich+Emotional": "감동적인 스토리에 눈물이 날 수도 있어요. 엔딩까지 여운이 오래 남는 게임이에요.",
  "Co-op+Funny": "친구와 함께 웃으면서 즐기기 딱 좋은 게임이에요. 같이 할 사람만 있으면 최고예요.",
  "Horror+Atmospheric": "소름 끼치는 분위기 연출이 압도적이에요. 밤에 하면 더 무서워요.",
  "Roguelike+Difficult": "죽고 또 죽으면서 조금씩 강해지는 쾌감이 있어요. 도전 정신을 자극하는 게임이에요.",
  "Souls-like+Difficult": "높은 난이도를 극복하는 성취감이 최고예요. 보스를 잡았을 때의 희열은 말로 설명할 수 없어요.",
  "Multiplayer+Competitive": "실력이 올라갈수록 더 재미있어지는 경쟁 게임이에요.",
  "Singleplayer+Atmospheric": "혼자만의 공간에서 게임의 분위기에 완전히 몰입할 수 있어요.",
  "Sandbox+Crafting": "상상하는 거의 모든 것을 만들 수 있어요. 창의력의 한계가 곧 게임의 한계예요.",
  "Puzzle+Co-op": "친구와 머리를 맞대고 퍼즐을 푸는 재미가 쏠쏠해요. 혼자 할 때와는 또 다른 매력이 있어요.",
  "Puzzle+Singleplayer": "혼자서 차분하게 퍼즐을 풀며 성취감을 느낄 수 있어요.",
};

// 태그 기반 핵심 특징 (이모지 포함)
const TAG_HIGHLIGHTS = {
  "Open World": { emoji: "🌍", text: "자유로운 오픈월드 탐험" },
  "Story Rich": { emoji: "📖", text: "몰입도 높은 스토리" },
  "Atmospheric": { emoji: "🎨", text: "압도적인 분위기" },
  "Multiplayer": { emoji: "👥", text: "멀티플레이어 지원" },
  "Co-op": { emoji: "🤝", text: "협동 플레이" },
  "Online Co-Op": { emoji: "🌐", text: "온라인 협동" },
  "Singleplayer": { emoji: "🎮", text: "싱글플레이 최적화" },
  "Great Soundtrack": { emoji: "🎵", text: "명곡 OST" },
  "Exploration": { emoji: "🔍", text: "탐험 요소" },
  "Survival": { emoji: "⚔️", text: "서바이벌" },
  "Horror": { emoji: "👻", text: "공포 요소" },
  "Roguelike": { emoji: "🔄", text: "로그라이크" },
  "Souls-like": { emoji: "💀", text: "소울라이크" },
  "Sandbox": { emoji: "🏗️", text: "높은 자유도" },
  "Crafting": { emoji: "🔧", text: "제작 시스템" },
  "Choices Matter": { emoji: "🔀", text: "선택이 중요" },
  "Multiple Endings": { emoji: "🎭", text: "멀티 엔딩" },
  "Difficult": { emoji: "🔥", text: "높은 난이도" },
  "Relaxing": { emoji: "☕", text: "힐링" },
  "Funny": { emoji: "😂", text: "유머" },
  "Emotional": { emoji: "💧", text: "감동 스토리" },
  "Competitive": { emoji: "🏆", text: "경쟁전" },
  "Full Controller Support": { emoji: "🎮", text: "패드 완벽 지원" },
  "Controller Support": { emoji: "🎮", text: "패드 지원" },
  "VR": { emoji: "🥽", text: "VR 지원" },
  "Free to Play": { emoji: "🆓", text: "무료 게임" },
  "Metroidvania": { emoji: "🗺️", text: "메트로배니아" },
  "City Builder": { emoji: "🏙️", text: "도시 건설" },
  "Battle Royale": { emoji: "🪖", text: "배틀로얄" },
  "Base Building": { emoji: "🏰", text: "기지 건설" },
  "Stealth": { emoji: "🥷", text: "잠입 액션" },
  "Sci-fi": { emoji: "🚀", text: "SF 세계관" },
  "Fantasy": { emoji: "🧙", text: "판타지" },
  "Dark Fantasy": { emoji: "⚫", text: "다크 판타지" },
  "Deckbuilding": { emoji: "🃏", text: "덱빌딩" },
  "Turn-Based": { emoji: "♟️", text: "턴제 전략" },
  "Hack and Slash": { emoji: "⚡", text: "핵앤슬래시" },
  "Pixel Graphics": { emoji: "👾", text: "픽셀 그래픽" },
  "Anime": { emoji: "✨", text: "애니메이션 풍" },
  "Split Screen": { emoji: "📺", text: "분할 화면" },
};

// 플레이타임 코멘트
const getPlaytimeComment = (hours) => {
  if (!hours || hours === 0) return null;
  if (hours >= 100) return "엄청난 분량! 오래오래 즐길 수 있어요";
  if (hours >= 50) return "넉넉한 볼륨으로 오랫동안 재밌어요";
  if (hours >= 25) return "적당한 볼륨으로 질리지 않아요";
  if (hours >= 10) return "주말에 몰아서 하기 딱 좋은 분량이에요";
  if (hours >= 5) return "가볍게 즐기기 좋은 분량이에요";
  return "짧지만 임팩트 있는 경험이에요";
};

// 메타크리틱 코멘트
const getScoreComment = (score) => {
  if (!score) return null;
  if (score >= 95) return "역사에 남을 명작이에요";
  if (score >= 90) return "누가 해도 만족할 명작이에요";
  if (score >= 85) return "대부분의 유저가 만족한 수작이에요";
  if (score >= 80) return "안심하고 구매해도 좋아요";
  if (score >= 70) return "장르를 좋아한다면 추천이에요";
  if (score >= 60) return "취향에 따라 호불호가 갈려요";
  return "구매 전에 리뷰를 꼭 확인하세요";
};

// ==============================
// 한국어 게임 소개 생성 v2
// ==============================
const generateKoreanDescription = (game, details) => {
  if (!details) return null;

  const genres = details?.genres || [];
  const tags = details?.tags || [];
  const tagNames = tags.map(t => t.name || t);
  const genreNames = genres.map(g => g.name || g);
  const mainGenre = genreNames[0];
  const playtime = details?.playtime || (game.playtime ? parseInt(game.playtime) : 0);
  const score = details?.metacritic || game.score;

  const parts = [];

  // 1. 장르 기반 인트로 (랜덤성 부여 - 태그 수 기반)
  if (mainGenre && GENRE_INTRO[mainGenre]) {
    const intros = GENRE_INTRO[mainGenre];
    const idx = tagNames.length % intros.length;
    parts.push(intros[idx]);
  }

  // 2. 태그 조합 특별 설명 (가장 매칭 되는 것 하나)
  let comboUsed = false;
  for (const [combo, desc] of Object.entries(TAG_COMBO_DESC)) {
    const comboTags = combo.split("+");
    if (comboTags.every(ct => tagNames.includes(ct))) {
      parts.push(desc);
      comboUsed = true;
      break;
    }
  }

  // 3. 조합 매칭 안 되면 개별 태그 특징 2-3개
  if (!comboUsed) {
    const features = [];
    const usedFeatures = new Set();
    const TAG_FEATURES_SHORT = {
      "Open World": "광활한 세계를 자유롭게 돌아다닐 수 있어요",
      "Story Rich": "스토리가 탄탄해서 몰입감이 남달라요",
      "Atmospheric": "분위기 연출이 정말 예술이에요",
      "Multiplayer": "친구들과 함께 플레이할 수 있어요",
      "Co-op": "협동 플레이로 친구와 함께하면 재미 두 배예요",
      "Singleplayer": "혼자서 차분하게 몰입할 수 있어요",
      "Great Soundtrack": "BGM이 정말 좋아서 OST만 따로 들을 정도예요",
      "Exploration": "구석구석 탐험하는 재미가 있어요",
      "Survival": "자원 관리와 생존의 긴장감이 매력이에요",
      "Horror": "공포 분위기가 압도적이에요",
      "Roguelike": "할 때마다 다른 경험을 할 수 있어요",
      "Souls-like": "높은 난이도를 극복하는 성취감이 핵심이에요",
      "Sandbox": "상상력만 있으면 뭐든 할 수 있어요",
      "Choices Matter": "내 선택이 스토리를 바꿔요",
      "Difficult": "도전적인 난이도가 매력이에요",
      "Relaxing": "바쁜 일상에서 힐링하기 좋아요",
      "Funny": "유머 센스가 넘치는 게임이에요",
      "Emotional": "감동적인 이야기에 마음이 따뜻해져요",
      "Crafting": "다양한 아이템을 직접 만드는 재미가 있어요",
      "Stealth": "잠입의 쾌감이 뛰어난 게임이에요",
      "Turn-Based": "턴제라 천천히 생각하며 플레이할 수 있어요",
    };
    for (const tag of tagNames) {
      if (TAG_FEATURES_SHORT[tag] && features.length < 2 && !usedFeatures.has(tag)) {
        features.push(TAG_FEATURES_SHORT[tag]);
        usedFeatures.add(tag);
      }
    }
    if (features.length > 0) {
      parts.push(features.join(" "));
    }
  }

  // 4. 플레이타임 코멘트 (자연스럽게)
  if (playtime > 0) {
    const ptComment = getPlaytimeComment(playtime);
    if (ptComment) parts.push(ptComment + ".");
  }

  // 5. 평점 코멘트
  if (score) {
    const scoreComment = getScoreComment(score);
    if (scoreComment) parts.push(scoreComment + ".");
  }

  return parts.length > 0 ? parts.join(" ") : null;
};

// "이런 분에게 추천" 리스트 생성
const RECOMMEND_FOR = {
  "Open World": "넓은 세계를 탐험하고 싶은 분",
  "Story Rich": "스토리에 몰입하고 싶은 분",
  "Multiplayer": "친구와 함께 게임하고 싶은 분",
  "Co-op": "협동 플레이를 좋아하는 분",
  "Singleplayer": "혼자만의 시간을 즐기고 싶은 분",
  "Horror": "무서운 게임을 좋아하는 분",
  "Survival": "서바이벌 장르를 좋아하는 분",
  "Souls-like": "높은 난이도에 도전하고 싶은 분",
  "Difficult": "하드코어 게이머",
  "Relaxing": "힐링이 필요한 분",
  "Competitive": "경쟁을 즐기는 분",
  "Strategy": "전략 게임을 좋아하는 분",
  "Sandbox": "자유도 높은 게임을 원하는 분",
  "Crafting": "만들고 제작하는 걸 좋아하는 분",
  "Roguelike": "반복 플레이를 좋아하는 분",
  "Emotional": "감동적인 이야기를 원하는 분",
  "City Builder": "건설/경영 게임을 좋아하는 분",
  "Battle Royale": "배틀로얄 팬",
  "JRPG": "일본 RPG를 좋아하는 분",
  "Fantasy": "판타지 세계를 좋아하는 분",
  "Sci-fi": "SF를 좋아하는 분",
  "Anime": "애니메이션 풍을 좋아하는 분",
  "Visual Novel": "스토리 중심 게임을 좋아하는 분",
  "Funny": "유머러스한 게임을 좋아하는 분",
  "VR": "VR 기기가 있는 분",
};

const generateRecommendFor = (details) => {
  if (!details?.tags) return [];
  const tagNames = details.tags.map(t => t.name || t);
  const recs = [];
  for (const tag of tagNames) {
    if (RECOMMEND_FOR[tag] && recs.length < 4) {
      recs.push(RECOMMEND_FOR[tag]);
    }
  }
  const playtime = details?.playtime || 0;
  if (playtime >= 50 && recs.length < 4) recs.push("긴 게임을 좋아하는 분");
  if (playtime > 0 && playtime <= 8 && recs.length < 4) recs.push("짧고 강렬한 경험을 원하는 분");
  return recs;
};

// 핵심 특징 배지 생성 (이모지 + 한글 라벨)
const generateHighlights = (details) => {
  if (!details?.tags) return [];
  const tagNames = details.tags.map(t => t.name || t);
  const highlights = [];
  for (const tag of tagNames) {
    if (TAG_HIGHLIGHTS[tag] && highlights.length < 6) {
      highlights.push(TAG_HIGHLIGHTS[tag]);
    }
  }
  return highlights;
};

// 게임 특징 한글 태그 생성
const generateKoreanTags = (details) => {
  if (!details?.tags) return [];
  const tags = details.tags.slice(0, 10);
  return tags.map(t => {
    const name = t.name || t;
    return TAG_KO[name] || GENRE_KO[name] || name;
  }).filter(t => {
    // 영어만 있는 태그 중 너무 기술적인 것 필터
    const skipPatterns = /^(steam-|Steam |Includes |Remote Play|Valve |HDR |DLSS|Stats$|Captions|Commentary)/i;
    return !skipPatterns.test(t);
  });
};

export { generateKoreanDescription, generateRecommendFor, generateHighlights, generateKoreanTags, getPlaytimeComment, getScoreComment };
