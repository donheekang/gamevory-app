import { useState, useEffect } from "react";
import { getKoreanTitle } from "../data/koreanMappings";
import { getKoreanSupport } from "../data/koreanSupportDb";
import { getGamePrice } from "../data/gamePriceDb";
import { getTrendingGames, getTopRatedGames, getUpcomingGames, getRecentGames, rawgToGameVory } from "../api/rawg";

// Steam 게임 → GameVory 포맷 변환
const steamToGameVory = (item) => {
  if (!item || !item.appId) return null;

  const steamId = String(item.appId);
  const slug = (item.name || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const koTitle = getKoreanTitle({ slug, name: item.name }) || item.name;

  const krSupport = getKoreanSupport({
    slug,
    steamAppId: parseInt(steamId),
    tags: [],
  }) || { ui: false, sub: false, audio: false };

  const isFree = item.isFree || item.finalPrice === 0;
  const price = isFree ? "무료" : item.formattedPrice || (item.finalPrice ? `₩${item.finalPrice.toLocaleString("ko-KR")}` : "가격 확인");
  const discPct = item.discountPercent || 0;
  const originalPrice = discPct > 0 && item.originalPrice ? `₩${item.originalPrice.toLocaleString("ko-KR")}` : "";

  return {
    id: parseInt(steamId),
    title: item.name,
    titleKo: koTitle,
    image: item.headerImage || item.image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/header.jpg`,
    tags: [],
    score: item.metascore || null,
    playtime: "",
    genre: "",
    price,
    discountPct: discPct,
    originalPrice,
    free: isFree,
    kr: krSupport,
    feat: { coop: false, localCoop: false, ctrl: "none", sp: true },
    matchReasons: [],
    warnings: [],
    dev: [],
    date: "",
    screenshots: [],
    steamAppId: steamId,
    isRawg: false,
    isSteam: true,
    slug,
  };
};

export const useSteamHome = () => {
  const [topSellers, setTopSellers] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSteamHome = async () => {
      setLoading(true);
      try {
        // 1차: Steam API 시도
        const res = await fetch("/api/steam-featured");
        if (!res.ok) throw new Error(`Steam API: ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        const ts = (data.topSellers || []).map(steamToGameVory).filter(Boolean);
        const nr = (data.newReleases || []).map(steamToGameVory).filter(Boolean);
        const sp = (data.specials || []).map(steamToGameVory).filter(Boolean);
        const cs = (data.comingSoon || []).map(steamToGameVory).filter(Boolean);

        // Steam 데이터가 비어있으면 RAWG 폴백
        if (ts.length === 0 && nr.length === 0) {
          console.warn("Steam featured empty, falling back to RAWG...", data._debug);
          throw new Error("Steam data empty");
        }

        setTopSellers(ts);
        setNewReleases(nr);
        setSpecials(sp);
        setComingSoon(cs);
      } catch (err) {
        console.warn("Steam home failed, using RAWG fallback:", err.message);
        if (cancelled) return;

        // RAWG 폴백
        try {
          const [trendingData, recentData, upcomingData] = await Promise.allSettled([
            getTrendingGames({ pageSize: 10, ordering: "-added" }),
            getRecentGames(10),
            getUpcomingGames(10),
          ]);

          if (cancelled) return;

          if (trendingData.status === "fulfilled" && trendingData.value?.results) {
            setTopSellers(trendingData.value.results.map(rawgToGameVory).filter(Boolean));
          }
          if (recentData.status === "fulfilled" && recentData.value?.results) {
            setNewReleases(recentData.value.results.map(rawgToGameVory).filter(Boolean));
          }
          if (upcomingData.status === "fulfilled" && upcomingData.value?.results) {
            setComingSoon(upcomingData.value.results.map(rawgToGameVory).filter(Boolean));
          }
        } catch (rawgErr) {
          console.error("RAWG fallback also failed:", rawgErr);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSteamHome();
    return () => { cancelled = true; };
  }, []);

  return { topSellers, newReleases, specials, comingSoon, loading };
};
