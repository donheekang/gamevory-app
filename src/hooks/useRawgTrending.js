import { useState, useEffect } from "react";
import { getTrendingGames, getTopRatedGames, getUpcomingGames, getRecentGames, rawgToGameVory } from "../api/rawg";

export const useRawgTrending = (options = {}) => {
  const { pageSize = 10 } = options;
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [trendingData, topData, upcomingData, recentData] = await Promise.allSettled([
          getTrendingGames({ pageSize, ordering: "-added" }),
          getTopRatedGames(2025, pageSize),
          getUpcomingGames(pageSize),
          getRecentGames(pageSize),
        ]);

        if (cancelled) return;

        if (trendingData.status === "fulfilled" && trendingData.value?.results) {
          setTrending(trendingData.value.results.map(rawgToGameVory));
        }
        if (topData.status === "fulfilled" && topData.value?.results) {
          setTopRated(topData.value.results.map(rawgToGameVory));
        }
        if (upcomingData.status === "fulfilled" && upcomingData.value?.results) {
          setUpcoming(upcomingData.value.results.map(rawgToGameVory));
        }
        if (recentData.status === "fulfilled" && recentData.value?.results) {
          setRecent(recentData.value.results.map(rawgToGameVory));
        }
      } catch (err) {
        console.error("Trending fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [pageSize]);

  return { trending, topRated, upcoming, recent, loading };
};
