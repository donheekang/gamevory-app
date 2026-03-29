// ============================================================
// RAWG API Service Layer
// https://rawg.io/apidocs
// ============================================================

import { getKoreanTitle, translateGenres, translateTags } from "../data/koreanMappings";
import { getKoreanSupport } from "../data/koreanSupportDb";
import { getGamePrice, formatKrw } from "../data/gamePriceDb";

// Vercel 환경: /api/rawg 프록시 사용 (API 키 서버에만 보관)
// 로컬 file:// 환경: 직접 호출 폴백
const IS_VERCEL = typeof window !== "undefined" && window.location.protocol === "https:";
const API_KEY = "867484eef09646f5a9e951a0fc27b0fe"; // 로컬 폴백용 (Vercel에서는 미사용)
const BASE_URL = "https://api.rawg.io/api";

// 캐시: 동일 요청 반복 방지
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

// Vercel 프록시를 통한 RAWG API 호출
const fetchRawgProxy = async (path, params = {}) => {
  const cacheKey = `proxy:${path}:${JSON.stringify(params)}`;
  const now = Date.now();
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (now - timestamp < CACHE_TTL) return data;
  }

  try {
    const queryParams = new URLSearchParams({ path, ...params });
    const res = await fetch(`/api/rawg?${queryParams}`);
    if (!res.ok) throw new Error(`RAWG Proxy Error: ${res.status}`);
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (err) {
    console.error("RAWG proxy failed:", err);
    return null;
  }
};

const fetchWithCache = async (url) => {
  const now = Date.now();
  if (cache.has(url)) {
    const { data, timestamp } = cache.get(url);
    if (now - timestamp < CACHE_TTL) return data;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RAWG API Error: ${res.status}`);
    const data = await res.json();
    cache.set(url, { data, timestamp: now });
    return data;
  } catch (err) {
    console.error("RAWG API fetch failed:", err);
    return null;
  }
};

// ============================================================
// 게임 검색
// ============================================================
export const searchGames = async (query, options = {}) => {
  const { page = 1, pageSize = 20, ordering, genres, platforms } = options;
  const params = { search: query, page: page.toString(), page_size: pageSize.toString(), search_precise: "true" };
  if (ordering) params.ordering = ordering;
  if (genres) params.genres = genres;
  if (platforms) params.platforms = platforms;

  if (IS_VERCEL) return fetchRawgProxy("/games", params);
  return fetchWithCache(`${BASE_URL}/games?${new URLSearchParams({ key: API_KEY, ...params })}`);
};

// ============================================================
// 게임 상세 정보
// ============================================================
export const getGameDetails = async (gameId) => {
  if (IS_VERCEL) return fetchRawgProxy(`/games/${gameId}`);
  return fetchWithCache(`${BASE_URL}/games/${gameId}?key=${API_KEY}`);
};

export const getGameScreenshots = async (gameId, pageSize = 10) => {
  if (IS_VERCEL) return fetchRawgProxy(`/games/${gameId}/screenshots`, { page_size: pageSize.toString() });
  return fetchWithCache(`${BASE_URL}/games/${gameId}/screenshots?key=${API_KEY}&page_size=${pageSize}`);
};

export const getGameTrailers = async (gameId) => {
  if (IS_VERCEL) return fetchRawgProxy(`/games/${gameId}/movies`);
  return fetchWithCache(`${BASE_URL}/games/${gameId}/movies?key=${API_KEY}`);
};

export const getGameSeries = async (gameId) => {
  if (IS_VERCEL) return fetchRawgProxy(`/games/${gameId}/game-series`);
  return fetchWithCache(`${BASE_URL}/games/${gameId}/game-series?key=${API_KEY}`);
};

export const getGameAchievements = async (gameId) => {
  if (IS_VERCEL) return fetchRawgProxy(`/games/${gameId}/achievements`);
  return fetchWithCache(`${BASE_URL}/games/${gameId}/achievements?key=${API_KEY}`);
};

// ============================================================
// 인기 게임 (트렌딩)
// ============================================================
export const getTrendingGames = async (options = {}) => {
  const { page = 1, pageSize = 20, ordering = "-added", dates } = options;
  const params = { page: page.toString(), page_size: pageSize.toString(), ordering };
  if (dates) params.dates = dates;

  if (IS_VERCEL) return fetchRawgProxy("/games", params);
  return fetchWithCache(`${BASE_URL}/games?${new URLSearchParams({ key: API_KEY, ...params })}`);
};

export const getTopRatedGames = async (year = 2025, pageSize = 20) => {
  const params = { dates: `${year}-01-01,${year}-12-31`, ordering: "-metacritic", page_size: pageSize.toString(), metacritic: "70,100" };
  if (IS_VERCEL) return fetchRawgProxy("/games", params);
  return fetchWithCache(`${BASE_URL}/games?${new URLSearchParams({ key: API_KEY, ...params })}`);
};

export const getUpcomingGames = async (pageSize = 20) => {
  const today = new Date().toISOString().slice(0, 10);
  const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const params = { dates: `${today},${futureDate}`, ordering: "-added", page_size: pageSize.toString() };
  if (IS_VERCEL) return fetchRawgProxy("/games", params);
  return fetchWithCache(`${BASE_URL}/games?${new URLSearchParams({ key: API_KEY, ...params })}`);
};

export const getRecentGames = async (pageSize = 20) => {
  const today = new Date().toISOString().slice(0, 10);
  const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const params = {
    dates: `${pastDate},${today}`,
    ordering: "-rating,-ratings_count",
    page_size: pageSize.toString(),
  };
  if (IS_VERCEL) return fetchRawgProxy("/games", params);
  return fetchWithCache(`${BASE_URL}/games?${new URLSearchParams({ key: API_KEY, ...params })}`);
};

export const getGenres = async () => {
  if (IS_VERCEL) return fetchRawgProxy("/genres");
  return fetchWithCache(`${BASE_URL}/genres?key=${API_KEY}`);
};

export const getPlatforms = async () => {
  if (IS_VERCEL) return fetchRawgProxy("/platforms", { page_size: "50" });
  return fetchWithCache(`${BASE_URL}/platforms?key=${API_KEY}&page_size=50`);
};

// ============================================================
// RAWG 게임 → GameVory 포맷 변환
// ============================================================
// ============================================================
// Steam Store API 한국어 데이터 로드
// Steam은 language=koreana로 한국어 제목/설명 제공
// ============================================================
const steamKoCache = new Map();

export const fetchSteamKoreanData = async (steamAppId) => {
  if (!steamAppId) return null;
  if (steamKoCache.has(steamAppId)) return steamKoCache.get(steamAppId);

  try {
    // Vercel API 프록시를 통해 Steam 데이터 가져오기 (CORS 우회)
    const res = await fetch(`/api/steam-price?appid=${steamAppId}`);
    if (!res.ok) return null;
    const data = await res.json();
    const info = data?.[steamAppId];
    if (!info) return null;

    const result = {
      nameKo: info.name,
      descriptionKo: info.descriptionKo || "",
      detailedDescKo: info.detailedDescKo || "",
      headerImage: info.headerImage,
      isFree: info.isFree,
      priceKo: info.price?.finalFormatted || (info.isFree ? "무료" : null),
      discountPct: info.price?.discountPercent || 0,
      // 가격 상세 (차트용)
      priceDetail: info.price ? {
        full: Math.round(info.price.initial / 100),   // Steam은 센트 단위 → 원 단위
        curr: Math.round(info.price.final / 100),
        disc: info.price.discountPercent,
      } : null,
      categories: info.categories || [],
      genres: info.genres || [],
      koreanSupport: info.koreanSupport || { ui: false, sub: false, audio: false },
      supportedLanguages: info.supportedLanguages || "",
    };
    steamKoCache.set(steamAppId, result);
    return result;
  } catch (err) {
    // API 실패 시 — 정적 DB 폴백
    steamKoCache.set(steamAppId, null);
    return null;
  }
};

// ============================================================
// Steam 검색 API (한국어 검색 지원)
// ============================================================
const steamSearchCache = new Map();

export const searchSteamKorean = async (query) => {
  if (!query || query.length < 2) return [];
  const cacheKey = `steam-search:${query}`;
  if (steamSearchCache.has(cacheKey)) return steamSearchCache.get(cacheKey);

  try {
    const res = await fetch(`/api/steam-search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.items || [];
    steamSearchCache.set(cacheKey, items);
    return items;
  } catch {
    return [];
  }
};

// Steam 검색 결과 → GameVory 포맷 변환
export const steamSearchToGameVory = (steamItem) => {
  if (!steamItem) return null;
  const isFree = steamItem.price?.final === 0;
  const discPct = steamItem.price?.discountPercent || 0;
  const priceFormatted = isFree ? "무료" : steamItem.price?.formatted || "가격 확인 필요";

  return {
    id: steamItem.appId,
    title: steamItem.name,
    titleKo: steamItem.name, // Steam 한국어 API에서 이미 한국어 이름 반환
    image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamItem.appId}/header.jpg`,
    tags: [],
    score: steamItem.metascore || null,
    playtime: "정보 없음",
    genre: "Steam에서 확인",
    price: priceFormatted,
    discountPct: discPct,
    originalPrice: discPct > 0 && steamItem.price?.initial ? `₩${Math.round(steamItem.price.initial / 100).toLocaleString()}` : "",
    free: isFree,
    kr: { ui: false, sub: false, audio: false }, // Steam 상세에서 추후 로드
    feat: { coop: false, localCoop: false, ctrl: "none", sp: true },
    matchReasons: [],
    warnings: [],
    dev: [],
    date: "",
    screenshots: [],
    steamAppId: String(steamItem.appId),
    isRawg: false,
    isSteamSearch: true,
  };
};

// RAWG 게임에서 Steam App ID 추출
export const extractSteamId = (rawgGame) => {
  if (!rawgGame?.stores) return null;
  const steamStore = rawgGame.stores.find(s => s.store?.id === 1 || s.store?.slug === "steam");
  if (steamStore?.url) {
    const match = steamStore.url.match(/\/app\/(\d+)/);
    if (match) return match[1];
  }
  return null;
};

export const rawgToGameVory = (rawgGame) => {
  if (!rawgGame) return null;

  const platforms = (rawgGame.platforms || []).map(p => p.platform?.name || "").join(", ");
  const genres = (rawgGame.genres || []).map(g => g.name).join(" / ");
  const genresKo = translateGenres(rawgGame.genres || []);
  const tags = (rawgGame.tags || []).slice(0, 6).map(t => t.name);
  const tagsKo = translateTags((rawgGame.tags || []).slice(0, 6));
  const screenshots = (rawgGame.short_screenshots || []).filter(s => s.id !== -1).map(s => s.image);

  // 한국어 제목 찾기
  const koreanTitle = getKoreanTitle(rawgGame);

  // Steam App ID 추출 (나중에 한국어 설명 로드용)
  const steamAppId = extractSteamId(rawgGame);

  // 한글 지원 여부 — DB 우선, 없으면 태그 기반 추정
  const krFromDb = getKoreanSupport({
    slug: rawgGame.slug,
    steamAppId: steamAppId ? parseInt(steamAppId) : null,
    tags: rawgGame.tags || [],
  });
  const krSupport = krFromDb || { ui: false, sub: false, audio: false };

  // 가격 DB 조회 (1회만)
  let gamePrice = null;
  let gamePriceStr = null;
  let gameDisc = 0;
  let gameOriginal = "";
  let gameFree = rawgGame.tags?.some(t => t.slug === "free-to-play") || false;
  try {
    gamePrice = getGamePrice(rawgGame.slug, steamAppId);
    if (gamePrice) {
      gameFree = !!gamePrice.free;
      gameDisc = gamePrice.disc || 0;
      gamePriceStr = gameFree ? "무료" : formatKrw(gamePrice.curr);
      if (gameDisc > 0) gameOriginal = formatKrw(gamePrice.full);
    } else if (gameFree) {
      gamePriceStr = "무료";
    }
  } catch (e) {
    // 가격 DB 에러 무시
  }

  return {
    id: rawgGame.id,
    title: rawgGame.name,
    titleKo: koreanTitle || rawgGame.name,
    image: rawgGame.background_image || "",
    tags: tagsKo.length > 0 ? tagsKo : [genresKo],
    tagsOriginal: tags,
    score: rawgGame.metacritic || null,
    playtime: rawgGame.playtime ? `${rawgGame.playtime}시간+` : "정보 없음",
    genre: genresKo || "장르 미분류",
    genreOriginal: genres,
    price: gamePriceStr,
    discountPct: gameDisc,
    originalPrice: gameOriginal,
    free: gameFree,
    kr: krSupport,
    feat: {
      coop: rawgGame.tags?.some(t => ["co-op", "cooperative", "online-co-op"].includes(t.slug)) || false,
      localCoop: rawgGame.tags?.some(t => t.slug === "local-co-op") || false,
      ctrl: rawgGame.tags?.some(t => t.slug === "controller-support" || t.slug === "full-controller-support") ? "full" : "none",
      sp: rawgGame.tags?.some(t => t.slug === "singleplayer") || true,
    },
    matchReasons: [
      rawgGame.metacritic ? `메타크리틱 ${rawgGame.metacritic}점` : "다양한 유저 호평",
      genresKo ? `장르: ${genresKo}` : "",
      rawgGame.playtime ? `평균 플레이타임 ${rawgGame.playtime}시간` : "",
      platforms ? `지원 플랫폼: ${platforms.slice(0, 60)}` : "",
    ].filter(Boolean),
    warnings: [],
    dev: (rawgGame.developers || []).map(d => d.name),
    date: rawgGame.released || "",
    screenshots,
    rawgId: rawgGame.id,
    isRawg: true,
    slug: rawgGame.slug,
    rating: rawgGame.rating,
    ratingsCount: rawgGame.ratings_count,
    clip: rawgGame.clip,
    steamAppId, // Steam 한국어 데이터 로드용
  };
};
