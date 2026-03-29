// Vercel Serverless Function: Steam 가격 프록시
// GET /api/steam-price?appid=620
// GET /api/steam-price?appid=620,1245620,292030 (복수 조회)

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600"); // 30분 캐시

  const { appid } = req.query;
  if (!appid) {
    return res.status(400).json({ error: "appid parameter required" });
  }

  const appIds = appid.split(",").map(id => id.trim()).filter(Boolean).slice(0, 20); // 최대 20개

  try {
    const results = {};

    // 동시에 여러 Steam API 호출
    await Promise.all(appIds.map(async (id) => {
      try {
        const steamRes = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${id}&cc=kr&l=koreana`
        );
        if (!steamRes.ok) {
          results[id] = null;
          return;
        }
        const data = await steamRes.json();
        const info = data?.[id];

        if (!info?.success || !info?.data) {
          results[id] = null;
          return;
        }

        const d = info.data;
        const priceOverview = d.price_overview;
        const isFree = d.is_free;

        // 한국어 지원 여부 파싱
        const langHtml = d.supported_languages || "";
        const hasKorean = /korean/i.test(langHtml);
        const hasKoreanAudio = /korean\s*<strong>/i.test(langHtml) || /korean[^<]*\*/.test(langHtml);

        results[id] = {
          name: d.name,
          isFree,
          price: priceOverview ? {
            currency: priceOverview.currency,
            initial: priceOverview.initial, // 원 단위 (예: 1100000 = ₩11,000)
            final: priceOverview.final,
            discountPercent: priceOverview.discount_percent,
            initialFormatted: priceOverview.initial_formatted,
            finalFormatted: priceOverview.final_formatted,
          } : null,
          descriptionKo: d.short_description || "",
          detailedDescKo: d.detailed_description || "",
          headerImage: d.header_image,
          koreanSupport: {
            ui: hasKorean,
            sub: hasKorean,
            audio: hasKoreanAudio,
          },
          supportedLanguages: langHtml,
          categories: (d.categories || []).map(c => c.description),
          genres: (d.genres || []).map(g => g.description),
        };
      } catch {
        results[id] = null;
      }
    }));

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: "Steam API request failed", message: err.message });
  }
}
