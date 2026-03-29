// ============================================================
// 한국어 지원 데이터베이스
// Steam 공식 데이터 기반 — 인기 게임 한국어 지원 정보
// ui: UI/인터페이스 한국어, sub: 자막 한국어, audio: 음성 한국어
// ============================================================

// Steam App ID → 한국어 지원 정보
const KOREAN_SUPPORT_BY_STEAM_ID = {
  // Valve
  620: { ui: true, sub: true, audio: false },     // Portal 2
  570: { ui: true, sub: true, audio: false },      // Dota 2
  730: { ui: true, sub: true, audio: false },      // CS2
  440: { ui: true, sub: true, audio: false },      // TF2
  220: { ui: true, sub: true, audio: false },      // Half-Life 2
  4000: { ui: true, sub: true, audio: false },     // Garry's Mod
  550: { ui: true, sub: true, audio: false },      // L4D2

  // FromSoftware
  1245620: { ui: true, sub: true, audio: false },  // ELDEN RING
  814380: { ui: true, sub: true, audio: false },   // Sekiro
  374320: { ui: true, sub: true, audio: false },   // Dark Souls III
  1888160: { ui: true, sub: true, audio: false },  // ARMORED CORE VI

  // CD Projekt Red
  292030: { ui: true, sub: true, audio: false },   // Witcher 3
  1091500: { ui: true, sub: true, audio: true },   // Cyberpunk 2077

  // Rockstar
  271590: { ui: true, sub: true, audio: false },   // GTA V
  1174180: { ui: true, sub: true, audio: false },  // RDR2

  // Bethesda
  489830: { ui: true, sub: true, audio: false },   // Skyrim SE
  377160: { ui: true, sub: true, audio: false },   // Fallout 4
  611670: { ui: true, sub: true, audio: false },   // Starfield

  // 인디 / 기타
  413150: { ui: true, sub: true, audio: false },   // Stardew Valley
  1145360: { ui: true, sub: true, audio: false },  // Hades
  1100600: { ui: true, sub: true, audio: false },  // Hades II
  367520: { ui: true, sub: true, audio: false },   // Hollow Knight
  105600: { ui: true, sub: true, audio: false },   // Terraria
  504230: { ui: true, sub: true, audio: false },   // Celeste
  391540: { ui: true, sub: true, audio: false },   // Undertale
  1794680: { ui: true, sub: true, audio: false },  // Palworld
  892970: { ui: true, sub: true, audio: false },   // Valheim
  1966720: { ui: true, sub: true, audio: false },  // Lethal Company
  322170: { ui: true, sub: true, audio: false },   // Geometry Dash
  1172470: { ui: true, sub: true, audio: false },  // Apex Legends
  578080: { ui: true, sub: true, audio: true },    // PUBG
  252490: { ui: true, sub: true, audio: false },   // Rust
  1599340: { ui: true, sub: true, audio: false },  // Lost Ark
  1203220: { ui: true, sub: true, audio: false },  // NARAKA
  2358720: { ui: true, sub: true, audio: false },  // Black Myth Wukong
  2379780: { ui: true, sub: true, audio: false },  // Balatro
  1222670: { ui: true, sub: true, audio: false },  // The Sims 4
  381210: { ui: true, sub: true, audio: false },   // Dead by Daylight
  945360: { ui: true, sub: true, audio: true },    // Among Us
  1284210: { ui: true, sub: true, audio: false },  // Guild Wars 2

  // EA / 대형
  1237970: { ui: true, sub: true, audio: true },   // Titanfall 2
  1238020: { ui: true, sub: true, audio: false },  // Battlefront 2
  1238080: { ui: true, sub: true, audio: true },   // NFS Heat
  1222680: { ui: true, sub: true, audio: true },   // FIFA
  1426210: { ui: true, sub: true, audio: true },   // It Takes Two

  // Sony
  1888930: { ui: true, sub: true, audio: false },  // The Last of Us Part I
  2058180: { ui: true, sub: true, audio: true },   // Horizon Forbidden West
  1593500: { ui: true, sub: true, audio: true },   // God of War
  2322010: { ui: true, sub: true, audio: true },   // God of War Ragnarök

  // Capcom
  2050650: { ui: true, sub: true, audio: true },   // RE4 Remake
  883710: { ui: true, sub: true, audio: true },    // RE2 Remake
  1196590: { ui: true, sub: true, audio: false },  // Monster Hunter Rise
  582010: { ui: true, sub: true, audio: false },   // MH World
  1446780: { ui: true, sub: true, audio: true },   // Monster Hunter Wilds
  1548510: { ui: true, sub: true, audio: true },   // Devil May Cry 5

  // Square Enix
  1382330: { ui: true, sub: true, audio: true },   // Persona 5 Royal
  2139520: { ui: true, sub: true, audio: true },   // Persona 3 Reload
  1325200: { ui: true, sub: true, audio: true },   // NieR: Automata
  1113000: { ui: true, sub: true, audio: true },   // Persona 4 Golden
  2115840: { ui: true, sub: true, audio: true },   // FF7 Rebirth
  1462040: { ui: true, sub: true, audio: true },   // FF16

  // Bandai Namco
  1245620: { ui: true, sub: true, audio: false },  // ELDEN RING (duplicate key safe)
  2305020: { ui: true, sub: true, audio: false },  // Tales of Arise
  1240440: { ui: true, sub: true, audio: true },   // Tekken 8

  // 닌텐도 (PC 포트 없음, RAWG에는 있음)
  // 보통 Nintendo 게임은 Steam에 없으므로 slug으로 처리

  // 기타 인기작
  1817070: { ui: true, sub: true, audio: false },  // Marvel Rivals
  548430: { ui: true, sub: true, audio: false },   // Deep Rock Galactic
  526870: { ui: true, sub: true, audio: false },   // Satisfactory
  1151640: { ui: true, sub: true, audio: false },  // Horizon Zero Dawn
  1817190: { ui: true, sub: true, audio: true },   // Marvel's Spider-Man 2
  1328670: { ui: true, sub: true, audio: false },  // Mass Effect LE
  990080: { ui: true, sub: true, audio: false },   // Hogwarts Legacy
  1687950: { ui: true, sub: true, audio: false },  // Baldur's Gate 3
  1085660: { ui: true, sub: true, audio: false },  // Disco Elysium
  668580: { ui: true, sub: true, audio: false },   // Blasphemous
  1097150: { ui: true, sub: true, audio: false },  // Fall Guys
  1062090: { ui: true, sub: true, audio: false },  // Slay the Spire
  1868140: { ui: true, sub: true, audio: false },  // Dave the Diver
  1623730: { ui: true, sub: true, audio: false },  // Palworld
  264710: { ui: true, sub: true, audio: false },   // Subnautica
  1293830: { ui: true, sub: true, audio: false },  // Forza Horizon 4
  1551360: { ui: true, sub: true, audio: false },  // Forza Horizon 5
  1449850: { ui: true, sub: true, audio: false },  // Death Stranding DC
  1238810: { ui: true, sub: true, audio: false },  // Battlefield V
  601150: { ui: true, sub: true, audio: false },   // Devil May Cry 5
  782330: { ui: true, sub: true, audio: false },   // DOOM Eternal
  379720: { ui: true, sub: true, audio: false },   // DOOM (2016)
  976730: { ui: true, sub: true, audio: false },   // Halo Infinite
  1240440: { ui: true, sub: true, audio: true },   // Tekken 8
  1948280: { ui: true, sub: true, audio: false },  // Lies of P
  250900: { ui: true, sub: true, audio: false },   // Binding of Isaac Rebirth

  // 미지원 게임 (확실한 것만)
  // 이 게임들은 한국어 미지원이 확인됨
};

// RAWG slug → 한국어 지원 정보
const KOREAN_SUPPORT_BY_SLUG = {
  "portal-2": { ui: true, sub: true, audio: false },
  "portal": { ui: true, sub: true, audio: false },
  "counter-strike-2": { ui: true, sub: true, audio: false },
  "counter-strike-global-offensive": { ui: true, sub: true, audio: false },
  "dota-2": { ui: true, sub: true, audio: false },
  "team-fortress-2": { ui: true, sub: true, audio: false },
  "half-life-2": { ui: true, sub: true, audio: false },
  "garrys-mod": { ui: true, sub: true, audio: false },
  "left-4-dead-2": { ui: true, sub: true, audio: false },
  "elden-ring": { ui: true, sub: true, audio: false },
  "sekiro-shadows-die-twice": { ui: true, sub: true, audio: false },
  "dark-souls-iii": { ui: true, sub: true, audio: false },
  "dark-souls-remastered": { ui: true, sub: true, audio: false },
  "armored-core-vi-fires-of-rubicon": { ui: true, sub: true, audio: false },
  "the-witcher-3-wild-hunt": { ui: true, sub: true, audio: false },
  "cyberpunk-2077": { ui: true, sub: true, audio: true },
  "grand-theft-auto-v": { ui: true, sub: true, audio: false },
  "red-dead-redemption-2": { ui: true, sub: true, audio: false },
  "the-elder-scrolls-v-skyrim-special-edition": { ui: true, sub: true, audio: false },
  "the-elder-scrolls-v-skyrim": { ui: true, sub: true, audio: false },
  "fallout-4": { ui: true, sub: true, audio: false },
  "starfield": { ui: true, sub: true, audio: false },
  "stardew-valley": { ui: true, sub: true, audio: false },
  "hades": { ui: true, sub: true, audio: false },
  "hades-ii": { ui: true, sub: true, audio: false },
  "hollow-knight": { ui: true, sub: true, audio: false },
  "terraria": { ui: true, sub: true, audio: false },
  "celeste": { ui: true, sub: true, audio: false },
  "undertale": { ui: true, sub: true, audio: false },
  "palworld": { ui: true, sub: true, audio: false },
  "valheim": { ui: true, sub: true, audio: false },
  "lethal-company": { ui: true, sub: true, audio: false },
  "apex-legends": { ui: true, sub: true, audio: false },
  "playerunknowns-battlegrounds": { ui: true, sub: true, audio: true },
  "rust": { ui: true, sub: true, audio: false },
  "lost-ark": { ui: true, sub: true, audio: false },
  "black-myth-wukong": { ui: true, sub: true, audio: false },
  "balatro": { ui: true, sub: true, audio: false },
  "the-sims-4": { ui: true, sub: true, audio: false },
  "dead-by-daylight": { ui: true, sub: true, audio: false },
  "among-us": { ui: true, sub: true, audio: true },
  "it-takes-two": { ui: true, sub: true, audio: true },
  "the-last-of-us-part-i": { ui: true, sub: true, audio: false },
  "god-of-war-2018": { ui: true, sub: true, audio: true },
  "god-of-war-ragnarok": { ui: true, sub: true, audio: true },
  "horizon-zero-dawn": { ui: true, sub: true, audio: false },
  "horizon-forbidden-west": { ui: true, sub: true, audio: true },
  "resident-evil-4-2023": { ui: true, sub: true, audio: true },
  "resident-evil-2": { ui: true, sub: true, audio: true },
  "monster-hunter-world": { ui: true, sub: true, audio: false },
  "monster-hunter-rise": { ui: true, sub: true, audio: false },
  "monster-hunter-wilds": { ui: true, sub: true, audio: true },
  "persona-5-royal": { ui: true, sub: true, audio: true },
  "persona-3-reload": { ui: true, sub: true, audio: true },
  "nier-automata": { ui: true, sub: true, audio: true },
  "hogwarts-legacy": { ui: true, sub: true, audio: false },
  "baldurs-gate-3": { ui: true, sub: true, audio: false },
  "disco-elysium": { ui: true, sub: true, audio: false },
  "disco-elysium-the-final-cut": { ui: true, sub: true, audio: false },
  "fall-guys-ultimate-knockout": { ui: true, sub: true, audio: false },
  "slay-the-spire": { ui: true, sub: true, audio: false },
  "dave-the-diver": { ui: true, sub: true, audio: false },
  "subnautica": { ui: true, sub: true, audio: false },
  "forza-horizon-5": { ui: true, sub: true, audio: false },
  "forza-horizon-4": { ui: true, sub: true, audio: false },
  "death-stranding": { ui: true, sub: true, audio: false },
  "doom-eternal": { ui: true, sub: true, audio: false },
  "doom-2016": { ui: true, sub: true, audio: false },
  "halo-infinite": { ui: true, sub: true, audio: false },
  "tekken-8": { ui: true, sub: true, audio: true },
  "lies-of-p": { ui: true, sub: true, audio: false },
  "the-binding-of-isaac-rebirth": { ui: true, sub: true, audio: false },
  "deep-rock-galactic": { ui: true, sub: true, audio: false },
  "satisfactory": { ui: true, sub: true, audio: false },
  "overcooked-2": { ui: true, sub: true, audio: false },
  "cuphead": { ui: true, sub: true, audio: false },
  "minecraft": { ui: true, sub: true, audio: false },
  "marvels-spider-man-remastered": { ui: true, sub: true, audio: true },
  "marvels-spider-man-miles-morales": { ui: true, sub: true, audio: true },
  "uncharted-legacy-of-thieves-collection": { ui: true, sub: true, audio: true },
  "ghost-of-tsushima": { ui: true, sub: true, audio: true },
  "final-fantasy-vii-remake-intergrade": { ui: true, sub: true, audio: true },
  "final-fantasy-vii-rebirth": { ui: true, sub: true, audio: true },
  "final-fantasy-xvi": { ui: true, sub: true, audio: true },
  "marvels-guardians-of-the-galaxy": { ui: true, sub: true, audio: false },
  "mass-effect-legendary-edition": { ui: true, sub: true, audio: false },
  "civilization-vi": { ui: true, sub: true, audio: false },
  "sid-meiers-civilization-vi": { ui: true, sub: true, audio: false },
  "animal-crossing-new-horizons": { ui: true, sub: true, audio: false },
  "the-legend-of-zelda-breath-of-the-wild": { ui: true, sub: true, audio: false },
  "the-legend-of-zelda-tears-of-the-kingdom": { ui: true, sub: true, audio: false },
  "overwatch-2": { ui: true, sub: true, audio: true },
  "league-of-legends": { ui: true, sub: true, audio: true },
  "valorant": { ui: true, sub: true, audio: true },
  "maplestory": { ui: true, sub: true, audio: true },
  "lostark": { ui: true, sub: true, audio: true },
  "diablo-iv": { ui: true, sub: true, audio: false },
  "diablo-4": { ui: true, sub: true, audio: false },
  "world-of-warcraft": { ui: true, sub: true, audio: false },
  "destiny-2": { ui: true, sub: true, audio: false },
  "path-of-exile": { ui: true, sub: true, audio: false },
  "path-of-exile-2": { ui: true, sub: true, audio: false },
  "warframe": { ui: true, sub: true, audio: false },
  "genshin-impact": { ui: true, sub: true, audio: true },
  "honkai-star-rail": { ui: true, sub: true, audio: true },
  "wuthering-waves": { ui: true, sub: true, audio: true },
  "zenless-zone-zero": { ui: true, sub: true, audio: true },
  "metaphor-refantazio": { ui: true, sub: true, audio: true },
  "stellar-blade": { ui: true, sub: true, audio: true },
  "marvel-rivals": { ui: true, sub: true, audio: false },
  "the-finals": { ui: true, sub: true, audio: false },
  "helldivers-2": { ui: true, sub: true, audio: false },
  "dragon-age-the-veilguard": { ui: true, sub: true, audio: false },
  "star-wars-outlaws": { ui: true, sub: true, audio: true },
  "warhammer-40000-space-marine-2": { ui: true, sub: true, audio: false },
  "alan-wake-2": { ui: true, sub: true, audio: false },
  "like-a-dragon-infinite-wealth": { ui: true, sub: true, audio: true },
  "yakuza-like-a-dragon": { ui: true, sub: true, audio: true },
  "crimson-desert": { ui: true, sub: true, audio: true },
  "street-fighter-6": { ui: true, sub: true, audio: true },
};

// 한국어 미지원이 확실한 게임 (영어만 지원)
const KNOWN_NO_KOREAN = new Set([
  // 이 게임들은 확실히 한국어 미지원
  // (RAWG에서 korean 태그 없으면 기본적으로 미지원 처리하므로, 여기는 필요시만 추가)
]);

/**
 * 게임의 한국어 지원 정보를 가져옵니다.
 * @param {Object} options - { slug, steamAppId, tags }
 * @returns {{ ui: boolean, sub: boolean, audio: boolean } | null}
 */
export const getKoreanSupport = ({ slug, steamAppId, tags } = {}) => {
  // 1순위: slug으로 DB 조회
  if (slug && KOREAN_SUPPORT_BY_SLUG[slug]) {
    return KOREAN_SUPPORT_BY_SLUG[slug];
  }

  // slug 변형 시도 (하이픈 정규화)
  if (slug) {
    const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
    if (KOREAN_SUPPORT_BY_SLUG[normalized]) {
      return KOREAN_SUPPORT_BY_SLUG[normalized];
    }
  }

  // 2순위: Steam App ID로 DB 조회
  if (steamAppId && KOREAN_SUPPORT_BY_STEAM_ID[steamAppId]) {
    return KOREAN_SUPPORT_BY_STEAM_ID[steamAppId];
  }

  // 3순위: 태그에서 Korean 감지 (ALL 태그 확인)
  if (tags && Array.isArray(tags)) {
    const hasKorean = tags.some(t => {
      const name = (t.name || t || "").toString().toLowerCase();
      const tagSlug = (t.slug || "").toString().toLowerCase();
      return name.includes("korean") || tagSlug.includes("korean");
    });
    if (hasKorean) {
      return { ui: true, sub: true, audio: false };
    }
  }

  // DB에 없고 태그에도 없으면 null (알 수 없음)
  return null;
};
