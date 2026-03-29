// Vercel Serverless: RAWG + Steam 통합 API
// GET /api/game-detail?id=3498        (RAWG ID로 조회)
// GET /api/game-detail?slug=gta-v     (slug으로 조회)
//
// 서버에서 RAWG 상세 + 스크린샷 + 트레일러 + 시리즈 + Steam 한국어 데이터를
// 동시에 호출 → 합쳐서 1번 응답. 브라우저 라운드트립 6개 → 1개

const RAWG_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE = "https://api.rawg.io/api";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

// RAWG 게임에서 Steam App ID 추출
function extractSteamId(gameData) {
  if (!gameData?.stores) return null;
  const steamStore = gameData.stores.find(
    (s) => s.store?.id === 1 || s.store?.slug === "steam"
  );
  if (!steamStore?.url) return null;
  const match = steamStore.url.match(/\/app\/(\d+)/);
  return match ? match[1] : null;
}

// Steam 데이터 가져오기
async function fetchSteamData(steamAppId) {
  if (!steamAppId) return null;
  try {
    const data = await fetchJSON(
      `https://store.steampowered.com/api/appdetails?appids=${steamAppId}&cc=kr&l=koreana`
    );
    const info = data?.[steamAppId];
    if (!info?.success || !info?.data) return null;

    const d = info.data;
    const langHtml = d.supported_languages || "";
    const hasKorean = /korean/i.test(langHtml);
    const hasKoreanAudio =
      /korean\s*<strong>/i.test(langHtml) || /korean[^<]*\*/.test(langHtml);

    return {
      name: d.name,
      isFree: d.is_free,
      price: d.price_overview
        ? {
            initial: d.price_overview.initial,
            final: d.price_overview.final,
            discountPercent: d.price_overview.discount_percent,
            initialFormatted: d.price_overview.initial_formatted,
            finalFormatted: d.price_overview.final_formatted,
          }
        : null,
      descriptionKo: d.short_description || "",
      detailedDescKo: d.detailed_description || "",
      headerImage: d.header_image,
      koreanSupport: { ui: hasKorean, sub: hasKorean, audio: hasKoreanAudio },
      supportedLanguages: langHtml,
      categories: (d.categories || []).map((c) => c.description),
      genres: (d.genres || []).map((g) => g.description),
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");

  const { id, slug } = req.query;
  if (!id && !slug) {
    return res.status(400).json({ error: "id or slug parameter required" });
  }

  try {
    // 1단계: slug이면 먼저 RAWG 검색으로 ID 찾기
    let rawgId = id;
    if (!rawgId && slug) {
      const search = await fetchJSON(
        `${RAWG_BASE}/games?key=${RAWG_KEY}&search=${encodeURIComponent(slug)}&page_size=1`
      );
      rawgId = search?.results?.[0]?.id;
      if (!rawgId) {
        return res.status(404).json({ error: "Game not found" });
      }
    }

    // 2단계: RAWG 상세 + 스크린샷 + 트레일러 + 시리즈 동시 호출
    const [detail, screenshots, trailers, series] = await Promise.all([
      fetchJSON(`${RAWG_BASE}/games/${rawgId}?key=${RAWG_KEY}`),
      fetchJSON(`${RAWG_BASE}/games/${rawgId}/screenshots?key=${RAWG_KEY}&page_size=10`),
      fetchJSON(`${RAWG_BASE}/games/${rawgId}/movies?key=${RAWG_KEY}`),
      fetchJSON(`${RAWG_BASE}/games/${rawgId}/game-series?key=${RAWG_KEY}&page_size=6`),
    ]);

    if (!detail) {
      return res.status(404).json({ error: "Game not found on RAWG" });
    }

    // 3단계: Steam ID 추출 → Steam 데이터 호출
    const steamAppId = extractSteamId(detail);
    const steam = await fetchSteamData(steamAppId);

    // 4단계: 통합 응답
    return res.status(200).json({
      // RAWG 기본 정보
      id: detail.id,
      slug: detail.slug,
      name: detail.name,
      description: detail.description_raw || detail.description || "",
      released: detail.released,
      metacritic: detail.metacritic,
      rating: detail.rating,
      ratingsCount: detail.ratings_count,
      backgroundImage: detail.background_image,
      genres: (detail.genres || []).map((g) => ({ id: g.id, name: g.name, slug: g.slug })),
      tags: (detail.tags || []).slice(0, 15).map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      platforms: (detail.platforms || []).map((p) => p.platform?.name).filter(Boolean),
      developers: (detail.developers || []).map((d) => d.name),
      publishers: (detail.publishers || []).map((p) => p.name),
      stores: detail.stores,
      added: detail.added,
      playtime: detail.playtime,

      // 스크린샷
      screenshots: (screenshots?.results || []).map((s) => s.image),

      // 트레일러
      trailers: (trailers?.results || []).map((t) => ({
        id: t.id,
        name: t.name,
        preview: t.preview,
        data: t.data,
      })),

      // 시리즈
      series: (series?.results || []).slice(0, 6).map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        backgroundImage: s.background_image,
        metacritic: s.metacritic,
        rating: s.rating,
      })),

      // Steam 데이터
      steamAppId: steamAppId || null,
      steam: steam || null,
    });
  } catch (err) {
    return res.status(500).json({ error: "API request failed", message: err.message });
  }
}
