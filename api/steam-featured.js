// Vercel Serverless Function: Steam 홈페이지 데이터
// GET /api/steam-featured
// Steam Featured API를 통해 인기/신작/할인 게임 데이터 반환

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1200");

  try {
    // Steam Featured Categories API (인기, 신작, 할인 등 한 번에)
    const [featuredRes, categoriesRes] = await Promise.allSettled([
      fetch("https://store.steampowered.com/api/featured/?cc=kr&l=koreana", {
        headers: { "Accept": "application/json", "User-Agent": "GameVory/1.0" },
      }),
      fetch("https://store.steampowered.com/api/featuredcategories/?cc=kr&l=koreana", {
        headers: { "Accept": "application/json", "User-Agent": "GameVory/1.0" },
      }),
    ]);

    let featured = null;
    let categories = null;

    if (featuredRes.status === "fulfilled" && featuredRes.value.ok) {
      try {
        featured = await featuredRes.value.json();
      } catch (e) {
        console.error("Featured JSON parse error:", e.message);
      }
    } else {
      console.error("Featured fetch failed:", featuredRes.status === "rejected" ? featuredRes.reason : featuredRes.value?.status);
    }

    if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
      try {
        categories = await categoriesRes.value.json();
      } catch (e) {
        console.error("Categories JSON parse error:", e.message);
      }
    } else {
      console.error("Categories fetch failed:", categoriesRes.status === "rejected" ? categoriesRes.reason : categoriesRes.value?.status);
    }

    // 게임 데이터 정규화 함수
    const normalizeGame = (item) => {
      if (!item) return null;
      const appId = item.id || item.appid;
      if (!appId) return null;

      // Steam 가격은 센트 단위 (KRW는 원*100)
      const finalPrice = item.final_price != null ? Math.round(item.final_price / 100) : null;
      const originalPrice = item.original_price != null ? Math.round(item.original_price / 100) : null;

      return {
        appId,
        name: item.name || "",
        image: item.header_image || item.large_capsule_image || item.small_capsule_image
          || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
        headerImage: item.header_image
          || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
        discountPercent: item.discount_percent || 0,
        originalPrice,
        finalPrice,
        formattedPrice: item.final_price === 0 || item.is_free
          ? "무료"
          : finalPrice != null
            ? `₩${finalPrice.toLocaleString()}`
            : "",
        isFree: item.final_price === 0 || item.is_free || false,
        platforms: {
          windows: item.windows_available ?? item.platforms?.windows ?? true,
          mac: item.mac_available ?? item.platforms?.mac ?? false,
          linux: item.linux_available ?? item.platforms?.linux ?? false,
        },
        metascore: item.metascore || null,
      };
    };

    const result = {
      largeCapsules: (featured?.large_capsules || []).slice(0, 5).map(normalizeGame).filter(Boolean),
      specials: (categories?.specials?.items || []).slice(0, 12).map(normalizeGame).filter(Boolean),
      newReleases: (categories?.new_releases?.items || []).slice(0, 12).map(normalizeGame).filter(Boolean),
      topSellers: (categories?.top_sellers?.items || []).slice(0, 12).map(normalizeGame).filter(Boolean),
      comingSoon: (categories?.coming_soon?.items || []).slice(0, 12).map(normalizeGame).filter(Boolean),
      // 디버그 정보
      _debug: {
        featuredOk: !!featured,
        categoriesOk: !!categories,
        featuredKeys: featured ? Object.keys(featured).slice(0, 10) : [],
        categoriesKeys: categories ? Object.keys(categories).slice(0, 10) : [],
        topSellersCount: categories?.top_sellers?.items?.length || 0,
        newReleasesCount: categories?.new_releases?.items?.length || 0,
        specialsCount: categories?.specials?.items?.length || 0,
      },
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Steam featured API error:", err);
    return res.status(500).json({ error: "Steam featured API failed", message: err.message });
  }
}
