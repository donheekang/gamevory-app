// Vercel Serverless Function: Steam 검색 프록시 (한국어 검색 지원)
// GET /api/steam-search?q=붉은사막
// Steam Store 검색 API를 통해 한국어로 게임 검색

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1200"); // 10분 캐시

  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: "q parameter required (min 2 chars)" });
  }

  try {
    // Steam Store 검색 API (한국어 지원)
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=koreana&cc=kr`;
    const searchRes = await fetch(searchUrl, {
      headers: { "Accept-Language": "ko-KR,ko" },
    });

    if (!searchRes.ok) {
      throw new Error(`Steam search API error: ${searchRes.status}`);
    }

    const data = await searchRes.json();
    const items = (data?.items || []).slice(0, 10).map(item => ({
      appId: item.id,
      name: item.name,
      image: item.tiny_image || item.small_capsule_image || "",
      price: item.price ? {
        final: item.price.final,
        initial: item.price.initial,
        discountPercent: item.price.discount_percent,
        formatted: item.price.final_formatted,
      } : item.free ? { final: 0, initial: 0, discountPercent: 0, formatted: "무료" } : null,
      metascore: item.metascore || null,
      platforms: {
        windows: item.platforms?.windows || false,
        mac: item.platforms?.mac || false,
        linux: item.platforms?.linux || false,
      },
    }));

    return res.status(200).json({ total: data?.total || 0, items });
  } catch (err) {
    console.error("Steam search proxy error:", err);
    return res.status(500).json({ error: "Steam search failed" });
  }
}
