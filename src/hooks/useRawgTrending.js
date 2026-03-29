import { useState, useEffect, useRef } from "react";
import { getTrendingGames, getTopRatedGames, getUpcomingGames, getRecentGames, rawgToGameVory } from "../api/rawg";
import { GAMES } from "../data/games";

// 안전한 map — 개별 변환 에러 시 해당 항목만 스킵
const safeMap = (arr) => {
  if (!arr) return [];
  const result = [];
  for (const item of arr) {
    try {
      const converted = rawgToGameVory(item);
      if (converted) result.push(converted);
    } catch (e) {
      console.warn("rawgToGameVory failed:", item?.name, e);
    }
  }
  return result;
};

// 타임아웃 래퍼 (8초)
const withTimeout = (promise, ms = 8000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

// ============================================================
// 로컬 GAMES DB에서 즉시 데이터 생성 (0ms 로딩)
// ============================================================
const buildLocalData = () => {
  const sorted = [...GAMES].sort((a, b) => (b.score || 0) - (a.score || 0));

  // 지금 뜨는 게임 — 점수 높은 순 상위
  const trending = sorted.slice(0, 10);

  // 최고 평점 — 90점 이상
  const topRated = sorted.filter(g => g.score >= 88).slice(0, 6);

  // 최근 출시 신작 — date 기준 2024 이후 (또는 전체에서 랜덤 6개)
  const recentish = GAMES.filter(g => {
    if (!g.date) return false;
    const year = parseInt(g.date);
    return year >= 2024;
  });
  const recent = recentish.length >= 3
    ? recentish.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6)
    : sorted.slice(5, 11);

  // 출시 예정 — 가격이 없거나 date에 "예정" 포함
  const upcoming = GAMES.filter(g =>
    g.tags?.some(t => t.includes("예정")) || (g.date && g.date.includes("예정"))
  );

  return { trending, topRated, recent, upcoming };
};

export const useRawgTrending = (options = {}) => {
  const { pageSize = 10 } = options;

  // 로컬 데이터로 즉시 초기화 (스켈레톤 없이 바로 표시)
  const localData = useRef(buildLocalData());
  const [trending, setTrending] = useState(localData.current.trending);
  const [topRated, setTopRated] = useState(localData.current.topRated);
  const [upcoming, setUpcoming] = useState(localData.current.upcoming);
  const [recent, setRecent] = useState(localData.current.recent);
  const [loading, setLoading] = useState(false); // false! 로컬 데이터 있으니까

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      // 배치 1: 최근 출시 + 트렌딩
      try {
        const [recentData, trendingData] = await Promise.allSettled([
          withTimeout(getRecentGames(pageSize)),
          withTimeout(getTrendingGames({ pageSize, ordering: "-added" })),
        ]);
        if (cancelled) return;

        if (recentData.status === "fulfilled" && recentData.value?.results?.length > 0) {
          setRecent(safeMap(recentData.value.results));
        }
        if (trendingData.status === "fulfilled" && trendingData.value?.results?.length > 0) {
          setTrending(safeMap(trendingData.value.results));
        }
      } catch (e) { /* 로컬 폴백 유지 */ }

      // 배치 2: 최고 평점 + 출시 예정
      try {
        const [topData, upcomingData] = await Promise.allSettled([
          withTimeout(getTopRatedGames(2025, pageSize)),
          withTimeout(getUpcomingGames(pageSize)),
        ]);
        if (cancelled) return;

        if (topData.status === "fulfilled" && topData.value?.results?.length > 0) {
          setTopRated(safeMap(topData.value.results));
        }
        if (upcomingData.status === "fulfilled" && upcomingData.value?.results?.length > 0) {
          setUpcoming(safeMap(upcomingData.value.results));
        }
      } catch (e) { /* 로컬 폴백 유지 */ }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [pageSize]);

  return { trending, topRated, upcoming, recent, loading };
};
