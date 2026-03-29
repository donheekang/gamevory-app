// ============================================================
// 게임 가격 데이터베이스 (한국 Steam 기준)
// 정가, 역대 최저가, 현재 할인 정보
// 출처: SteamDB / IsThereAnyDeal 기반 수동 입력
// ============================================================

// slug → 가격 정보
const PRICE_DB = {
  // === Valve ===
  "portal-2": { full: 11000, low: 1100, curr: 2750, disc: 75 },
  "portal": { full: 11000, low: 1100, curr: 11000, disc: 0 },
  "counter-strike-2": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "half-life-2": { full: 11000, low: 1100, curr: 11000, disc: 0 },
  "left-4-dead-2": { full: 11000, low: 1100, curr: 11000, disc: 0 },
  "team-fortress-2": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "dota-2": { full: 0, low: 0, curr: 0, disc: 0, free: true },

  // === FromSoftware ===
  "elden-ring": { full: 59800, low: 29900, curr: 35880, disc: 40 },
  "sekiro-shadows-die-twice": { full: 49000, low: 19600, curr: 24500, disc: 50 },
  "dark-souls-iii": { full: 49000, low: 12250, curr: 49000, disc: 0 },
  "armored-core-vi-fires-of-rubicon": { full: 64800, low: 38880, curr: 64800, disc: 0 },

  // === CD Projekt Red ===
  "the-witcher-3-wild-hunt": { full: 34800, low: 5220, curr: 6960, disc: 80 },
  "cyberpunk-2077": { full: 59000, low: 23600, curr: 29500, disc: 50 },

  // === Rockstar ===
  "grand-theft-auto-v": { full: 33000, low: 9900, curr: 33000, disc: 0 },
  "red-dead-redemption-2": { full: 73000, low: 14600, curr: 18250, disc: 75 },

  // === Bethesda ===
  "the-elder-scrolls-v-skyrim-special-edition": { full: 43000, low: 8600, curr: 43000, disc: 0 },
  "fallout-4": { full: 23000, low: 4600, curr: 23000, disc: 0 },
  "starfield": { full: 79800, low: 39900, curr: 79800, disc: 0 },
  "doom-eternal": { full: 43000, low: 8600, curr: 43000, disc: 0 },

  // === 인디 명작 ===
  "stardew-valley": { full: 16000, low: 8000, curr: 9600, disc: 40 },
  "hades": { full: 27000, low: 10800, curr: 27000, disc: 0 },
  "hades-ii": { full: 32400, low: 32400, curr: 32400, disc: 0 },
  "hollow-knight": { full: 16500, low: 4950, curr: 8250, disc: 50 },
  "celeste": { full: 20000, low: 4000, curr: 12000, disc: 40 },
  "terraria": { full: 11000, low: 2750, curr: 5500, disc: 50 },
  "cuphead": { full: 21000, low: 10500, curr: 21000, disc: 0 },
  "undertale": { full: 11000, low: 5500, curr: 11000, disc: 0 },
  "slay-the-spire": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "dave-the-diver": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "disco-elysium-the-final-cut": { full: 43000, low: 10750, curr: 43000, disc: 0 },
  "lies-of-p": { full: 54000, low: 27000, curr: 54000, disc: 0 },
  "dead-cells": { full: 27000, low: 8100, curr: 27000, disc: 0 },

  // === 협동 / 파티 ===
  "it-takes-two": { full: 44000, low: 17600, curr: 44000, disc: 0 },
  "overcooked-2": { full: 26000, low: 5200, curr: 26000, disc: 0 },
  "deep-rock-galactic": { full: 33000, low: 8250, curr: 33000, disc: 0 },
  "lethal-company": { full: 11000, low: 8800, curr: 11000, disc: 0 },
  "valheim": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "among-us": { full: 5500, low: 2750, curr: 5500, disc: 0 },

  // === 오픈월드 / AAA ===
  "hogwarts-legacy": { full: 66000, low: 26400, curr: 66000, disc: 0 },
  "baldurs-gate-3": { full: 66000, low: 46200, curr: 66000, disc: 0 },
  "monster-hunter-world": { full: 33000, low: 9900, curr: 33000, disc: 0 },
  "monster-hunter-rise": { full: 43000, low: 14000, curr: 43000, disc: 0 },
  "death-stranding": { full: 43000, low: 10750, curr: 43000, disc: 0 },
  "subnautica": { full: 33000, low: 8250, curr: 33000, disc: 0 },

  // === Sony / PS 포트 ===
  "god-of-war-2018": { full: 54000, low: 21600, curr: 54000, disc: 0 },
  "god-of-war-ragnarok": { full: 66000, low: 39600, curr: 66000, disc: 0 },
  "horizon-zero-dawn": { full: 54000, low: 16200, curr: 54000, disc: 0 },
  "the-last-of-us-part-i": { full: 66000, low: 26400, curr: 66000, disc: 0 },
  "ghost-of-tsushima": { full: 66000, low: 33000, curr: 66000, disc: 0 },
  "marvels-spider-man-remastered": { full: 66000, low: 26400, curr: 66000, disc: 0 },
  "uncharted-legacy-of-thieves-collection": { full: 54000, low: 21600, curr: 54000, disc: 0 },
  "helldivers-2": { full: 46000, low: 27600, curr: 46000, disc: 0 },

  // === Capcom ===
  "resident-evil-4-2023": { full: 54000, low: 21600, curr: 54000, disc: 0 },
  "resident-evil-2": { full: 43000, low: 10750, curr: 43000, disc: 0 },
  "monster-hunter-wilds": { full: 66000, low: 66000, curr: 66000, disc: 0 },
  "street-fighter-6": { full: 66000, low: 33000, curr: 66000, disc: 0 },
  "resident-evil-village": { full: 43000, low: 12900, curr: 43000, disc: 0 },

  // === 기타 대작 ===
  "persona-5-royal": { full: 66000, low: 26400, curr: 66000, disc: 0 },
  "nier-automata": { full: 43000, low: 17200, curr: 43000, disc: 0 },
  "black-myth-wukong": { full: 66000, low: 52800, curr: 66000, disc: 0 },
  "alan-wake-2": { full: 57000, low: 28500, curr: 57000, disc: 0 },
  "metaphor-refantazio": { full: 77000, low: 53900, curr: 77000, disc: 0 },
  "palworld": { full: 33000, low: 23100, curr: 33000, disc: 0 },

  // === 서바이벌 / 멀티 ===
  "rust": { full: 43000, low: 21500, curr: 21500, disc: 50 },
  "satisfactory": { full: 33000, low: 19800, curr: 33000, disc: 0 },
  "civilization-vi": { full: 66000, low: 6600, curr: 66000, disc: 0 },
  "sid-meiers-civilization-vi": { full: 66000, low: 6600, curr: 66000, disc: 0 },
  "forza-horizon-5": { full: 66000, low: 26400, curr: 66000, disc: 0 },

  // === 무료 ===
  "apex-legends": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "genshin-impact": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "destiny-2": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "path-of-exile": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "path-of-exile-2": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "warframe": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "fall-guys-ultimate-knockout": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "lost-ark": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "marvel-rivals": { full: 0, low: 0, curr: 0, disc: 0, free: true },

  // === 톰 레이더 시리즈 ===
  "tomb-raider": { full: 22000, low: 2200, curr: 22000, disc: 0 },
  "tomb-raider-2013": { full: 22000, low: 2200, curr: 22000, disc: 0 },
  "rise-of-the-tomb-raider": { full: 33000, low: 3300, curr: 33000, disc: 0 },
  "shadow-of-the-tomb-raider": { full: 66000, low: 6600, curr: 66000, disc: 0 },

  // === 추가 인기작 ===
  "slay-the-spire": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "slay-the-spire-2": { full: 36000, low: 36000, curr: 36000, disc: 0 },
  "the-binding-of-isaac-rebirth": { full: 16500, low: 4950, curr: 16500, disc: 0 },
  "enter-the-gungeon": { full: 16500, low: 4950, curr: 16500, disc: 0 },
  "risk-of-rain-2": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "dead-cells": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "inscryption": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "outer-wilds": { full: 27000, low: 13500, curr: 27000, disc: 0 },
  "return-of-the-obra-dinn": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "halo-the-master-chief-collection": { full: 43000, low: 10750, curr: 43000, disc: 0 },
  "bioshock-infinite": { full: 33000, low: 4950, curr: 33000, disc: 0 },
  "bioshock-the-collection": { full: 66000, low: 6600, curr: 66000, disc: 0 },
  "ori-and-the-will-of-the-wisps": { full: 33000, low: 8250, curr: 33000, disc: 0 },
  "ori-and-the-blind-forest-definitive-edition": { full: 22000, low: 4400, curr: 22000, disc: 0 },
  "a-plague-tale-requiem": { full: 54000, low: 16200, curr: 54000, disc: 0 },
  "a-plague-tale-innocence": { full: 43000, low: 6450, curr: 43000, disc: 0 },
  "control": { full: 33000, low: 6600, curr: 33000, disc: 0 },
  "psychonauts-2": { full: 66000, low: 19800, curr: 66000, disc: 0 },
  "yakuza-0": { full: 22000, low: 4400, curr: 22000, disc: 0 },
  "yakuza-like-a-dragon": { full: 43000, low: 12900, curr: 43000, disc: 0 },
  "like-a-dragon-infinite-wealth": { full: 73000, low: 43800, curr: 73000, disc: 0 },
  "like-a-dragon-ishin": { full: 54000, low: 21600, curr: 54000, disc: 0 },
  "sea-of-thieves": { full: 43000, low: 17200, curr: 43000, disc: 0 },
  "no-mans-sky": { full: 66000, low: 19800, curr: 66000, disc: 0 },
  "rimworld": { full: 36000, low: 25200, curr: 36000, disc: 0 },
  "factorio": { full: 33000, low: 33000, curr: 33000, disc: 0 },
  "dyson-sphere-program": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "cities-skylines-ii": { full: 43000, low: 21500, curr: 43000, disc: 0 },
  "cities-skylines": { full: 33000, low: 3300, curr: 33000, disc: 0 },
  "total-war-warhammer-iii": { full: 66000, low: 19800, curr: 66000, disc: 0 },
  "age-of-empires-iv": { full: 66000, low: 19800, curr: 66000, disc: 0 },
  "crusader-kings-iii": { full: 54000, low: 16200, curr: 54000, disc: 0 },
  "stellaris": { full: 43000, low: 8600, curr: 43000, disc: 0 },
  "divinity-original-sin-2": { full: 49000, low: 14700, curr: 49000, disc: 0 },
  "pillars-of-eternity-ii-deadfire": { full: 43000, low: 8600, curr: 43000, disc: 0 },
  "wasteland-3": { full: 43000, low: 10750, curr: 43000, disc: 0 },
  "prey-2017": { full: 43000, low: 4300, curr: 43000, disc: 0 },
  "dishonored-2": { full: 33000, low: 4950, curr: 33000, disc: 0 },
  "hitman-3": { full: 66000, low: 13200, curr: 66000, disc: 0 },
  "hitman-world-of-assassination": { full: 66000, low: 13200, curr: 66000, disc: 0 },
  "metal-gear-solid-v-the-phantom-pain": { full: 33000, low: 4950, curr: 33000, disc: 0 },
  "death-stranding-directors-cut": { full: 43000, low: 10750, curr: 43000, disc: 0 },
  "star-wars-jedi-survivor": { full: 66000, low: 19800, curr: 66000, disc: 0 },
  "star-wars-jedi-fallen-order": { full: 43000, low: 8600, curr: 43000, disc: 0 },
  "detroit-become-human": { full: 43000, low: 12900, curr: 43000, disc: 0 },
  "heavy-rain": { full: 22000, low: 6600, curr: 22000, disc: 0 },
  "beyond-two-souls": { full: 22000, low: 6600, curr: 22000, disc: 0 },
  "life-is-strange": { full: 22000, low: 3300, curr: 22000, disc: 0 },
  "life-is-strange-true-colors": { full: 66000, low: 13200, curr: 66000, disc: 0 },
  "vampyr": { full: 43000, low: 6450, curr: 43000, disc: 0 },
  "little-nightmares-ii": { full: 33000, low: 8250, curr: 33000, disc: 0 },
  "little-nightmares": { full: 22000, low: 3300, curr: 22000, disc: 0 },
  "inside": { full: 22000, low: 4400, curr: 22000, disc: 0 },
  "limbo": { full: 11000, low: 1100, curr: 11000, disc: 0 },
  "what-remains-of-edith-finch": { full: 22000, low: 4400, curr: 22000, disc: 0 },
  "firewatch": { full: 22000, low: 4400, curr: 22000, disc: 0 },
  "the-forest": { full: 22000, low: 6600, curr: 22000, disc: 0 },
  "sons-of-the-forest": { full: 33000, low: 19800, curr: 33000, disc: 0 },
  "phasmophobia": { full: 16500, low: 9900, curr: 16500, disc: 0 },
  "devour": { full: 5500, low: 2750, curr: 5500, disc: 0 },
  "dont-starve-together": { full: 16500, low: 3300, curr: 16500, disc: 0 },
  "raft": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "grounded": { full: 43000, low: 17200, curr: 43000, disc: 0 },
  "7-days-to-die": { full: 49000, low: 8250, curr: 49000, disc: 0 },
  "project-zomboid": { full: 16500, low: 8250, curr: 16500, disc: 0 },
  "the-long-dark": { full: 36000, low: 7200, curr: 36000, disc: 0 },
  "oxygen-not-included": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "unpacking": { full: 22000, low: 8800, curr: 22000, disc: 0 },
  "powerwash-simulator": { full: 27000, low: 10800, curr: 27000, disc: 0 },
  "dredge": { full: 27000, low: 13500, curr: 27000, disc: 0 },
  "vampire-survivors": { full: 5500, low: 2750, curr: 5500, disc: 0 },
  "cult-of-the-lamb": { full: 27000, low: 13500, curr: 27000, disc: 0 },
  "tunic": { full: 33000, low: 13200, curr: 33000, disc: 0 },
  "sifu": { full: 43000, low: 17200, curr: 43000, disc: 0 },
  "katana-zero": { full: 16500, low: 4950, curr: 16500, disc: 0 },
  "neon-white": { full: 27000, low: 13500, curr: 27000, disc: 0 },
  "ultrakill": { full: 27000, low: 13500, curr: 27000, disc: 0 },
  "blasphemous": { full: 27000, low: 5400, curr: 27000, disc: 0 },
  "blasphemous-2": { full: 33000, low: 16500, curr: 33000, disc: 0 },
  "shovel-knight-treasure-trove": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "hyper-light-drifter": { full: 22000, low: 4400, curr: 22000, disc: 0 },
  "crosscode": { full: 22000, low: 6600, curr: 22000, disc: 0 },
  "spiritfarer": { full: 27000, low: 8100, curr: 27000, disc: 0 },
  "coffee-talk": { full: 14000, low: 5600, curr: 14000, disc: 0 },
  "a-short-hike": { full: 9000, low: 3600, curr: 9000, disc: 0 },
  "omori": { full: 22000, low: 11000, curr: 22000, disc: 0 },
  "oneshot": { full: 11000, low: 3300, curr: 11000, disc: 0 },
  "to-the-moon": { full: 11000, low: 1100, curr: 11000, disc: 0 },
  "papers-please": { full: 11000, low: 3300, curr: 11000, disc: 0 },
  "baba-is-you": { full: 16500, low: 6600, curr: 16500, disc: 0 },
  "the-witness": { full: 43000, low: 8600, curr: 43000, disc: 0 },
  "the-talos-principle": { full: 43000, low: 4300, curr: 43000, disc: 0 },
  "the-talos-principle-2": { full: 33000, low: 19800, curr: 33000, disc: 0 },
  "return-to-monkey-island": { full: 27000, low: 10800, curr: 27000, disc: 0 },
  "disco-elysium": { full: 43000, low: 10750, curr: 43000, disc: 0 },

  // === 레이싱 / 스포츠 ===
  "rocket-league": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "assetto-corsa": { full: 22000, low: 2200, curr: 22000, disc: 0 },
  "gran-turismo-7": { full: 66000, low: 33000, curr: 66000, disc: 0 },
  "ea-sports-fc-25": { full: 59000, low: 35400, curr: 59000, disc: 0 },

  // === 호러 ===
  "resident-evil-village": { full: 43000, low: 12900, curr: 43000, disc: 0 },
  "resident-evil-7-biohazard": { full: 22000, low: 6600, curr: 22000, disc: 0 },
  "silent-hill-2": { full: 66000, low: 46200, curr: 66000, disc: 0 },
  "outlast": { full: 22000, low: 2200, curr: 22000, disc: 0 },
  "amnesia-the-bunker": { full: 27000, low: 10800, curr: 27000, disc: 0 },

  // === 최신작 2025-2026 ===
  "crimson-desert": { full: 54000, low: 54000, curr: 54000, disc: 0 },
  "kingdom-come-deliverance-ii": { full: 54000, low: 54000, curr: 54000, disc: 0 },
  "avowed": { full: 66000, low: 52800, curr: 66000, disc: 0 },
  "civilization-vii": { full: 66000, low: 66000, curr: 66000, disc: 0 },
  "clair-obscur-expedition-33": { full: 54000, low: 54000, curr: 54000, disc: 0 },
  "marathon": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "the-finals": { full: 0, low: 0, curr: 0, disc: 0, free: true },
  "resident-evil-9": { full: 79800, low: 79800, curr: 79800, disc: 0 },
  "resident-evil-requiem": { full: 79800, low: 79800, curr: 79800, disc: 0 },
  "greedfall-the-dying-world": { full: 35800, low: 28640, curr: 35800, disc: 0 },
  "greedfall-2-the-dying-world": { full: 35800, low: 28640, curr: 35800, disc: 0 },
  "greedfall-2": { full: 35800, low: 28640, curr: 35800, disc: 0 },
};

// Steam App ID → slug 매핑 (하드코딩 게임용)
const STEAM_ID_TO_SLUG = {
  620: "portal-2",
  400: "portal",
  730: "counter-strike-2",
  220: "half-life-2",
  550: "left-4-dead-2",
  440: "team-fortress-2",
  570: "dota-2",
  1245620: "elden-ring",
  814380: "sekiro-shadows-die-twice",
  374320: "dark-souls-iii",
  292030: "the-witcher-3-wild-hunt",
  1091500: "cyberpunk-2077",
  271590: "grand-theft-auto-v",
  1174180: "red-dead-redemption-2",
  489830: "the-elder-scrolls-v-skyrim-special-edition",
  377160: "fallout-4",
  413150: "stardew-valley",
  1145360: "hades",
  1100600: "hades-ii",
  367520: "hollow-knight",
  105600: "terraria",
  504230: "celeste",
  391540: "undertale",
  1426210: "it-takes-two",
  728880: "overcooked-2",
  548430: "deep-rock-galactic",
  1966720: "lethal-company",
  892970: "valheim",
  945360: "among-us",
  990080: "hogwarts-legacy",
  1687950: "baldurs-gate-3",
  582010: "monster-hunter-world",
  1593500: "god-of-war-2018",
  252490: "rust",
  526870: "satisfactory",
  264710: "subnautica",
  1449850: "death-stranding",
  203160: "tomb-raider",
  3764200: "resident-evil-requiem",
  1997660: "greedfall-the-dying-world",
};

/**
 * 게임 가격 정보를 가져옵니다.
 * @param {string} slug - RAWG slug
 * @param {number|string} steamId - Steam App ID
 * @returns {{ full: number, low: number, curr: number, disc: number, free?: boolean } | null}
 */
export const getGamePrice = (slug, steamId) => {
  // 1. slug으로 직접 조회
  if (slug && PRICE_DB[slug]) {
    return PRICE_DB[slug];
  }

  // 2. slug 정규화
  if (slug) {
    const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
    if (PRICE_DB[normalized]) return PRICE_DB[normalized];
  }

  // 3. Steam ID → slug 변환 후 조회
  const sid = typeof steamId === "string" ? parseInt(steamId) : steamId;
  if (sid && STEAM_ID_TO_SLUG[sid]) {
    const mappedSlug = STEAM_ID_TO_SLUG[sid];
    if (PRICE_DB[mappedSlug]) return PRICE_DB[mappedSlug];
  }

  return null;
};

/**
 * 가격을 한국 원화 형식으로 포맷
 */
export const formatKrw = (amount) => {
  if (amount === 0) return "무료";
  if (!amount) return "-";
  return `₩${amount.toLocaleString()}`;
};
