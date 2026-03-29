import { useState, useEffect } from "react";
import { searchGames, getGameDetails, getGameScreenshots, getGameTrailers, getGameSeries, getGameAchievements, fetchSteamKoreanData } from "../api/rawg";
import { getKoreanTitle, translateGenres, translateTags } from "../data/koreanMappings";

// 하드코딩 게임 이름 → RAWG ID 캐시
const nameToRawgCache = new Map();

export const useRawgGameDetail = (gameId, enabled = false, gameName = null) => {
  const [details, setDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [series, setSeries] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [steamKo, setSteamKo] = useState(null);
  const [steamAppId, setSteamAppId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // gameId가 없고 gameName도 없으면 실행 안함
    if (!gameId && !gameName) return;
    let cancelled = false;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        let resolvedId = gameId;

        // gameId가 없으면 (하드코딩 게임) → 이름으로 RAWG 검색해서 ID 찾기
        if (!resolvedId && gameName) {
          // 캐시 확인
          if (nameToRawgCache.has(gameName)) {
            resolvedId = nameToRawgCache.get(gameName);
          } else {
            const searchResult = await searchGames(gameName, { pageSize: 1 });
            if (searchResult?.results?.[0]) {
              resolvedId = searchResult.results[0].id;
              nameToRawgCache.set(gameName, resolvedId);
            }
          }
        }

        if (!resolvedId || cancelled) {
          setLoading(false);
          return;
        }

        const [detailData, screenshotData, trailerData, seriesData, achievementData] = await Promise.allSettled([
          getGameDetails(resolvedId),
          getGameScreenshots(resolvedId),
          getGameTrailers(resolvedId),
          getGameSeries(resolvedId),
          getGameAchievements(resolvedId),
        ]);

        if (cancelled) return;

        let detailResult = null;
        if (detailData.status === "fulfilled" && detailData.value) {
          detailResult = detailData.value;

          // 장르/태그 한국어 번역
          if (detailResult.genres) {
            detailResult.genresKo = translateGenres(detailResult.genres);
          }
          if (detailResult.tags) {
            detailResult.tagsKo = translateTags(detailResult.tags.slice(0, 10));
          }
          detailResult.titleKo = getKoreanTitle(detailResult) || detailResult.name;

          setDetails(detailResult);

          // Steam 한국어 데이터 로드
          const steamStore = detailResult.stores?.find(
            s => s.store?.id === 1 || s.store?.slug === "steam"
          );
          let steamId = null;
          if (steamStore?.url) {
            const match = steamStore.url.match(/\/app\/(\d+)/);
            if (match) steamId = match[1];
          }
          // Steam ID 저장 (가격 링크 등에 사용)
          if (!cancelled && steamId) {
            setSteamAppId(steamId);
          }
          if (steamId) {
            const koData = await fetchSteamKoreanData(steamId);
            if (!cancelled && koData) {
              setSteamKo(koData);
            }
          }
        }

        if (screenshotData.status === "fulfilled" && screenshotData.value?.results) {
          setScreenshots(screenshotData.value.results.map(s => s.image));
        }
        if (trailerData.status === "fulfilled" && trailerData.value?.results) {
          setTrailers(trailerData.value.results);
        }
        if (seriesData.status === "fulfilled" && seriesData.value?.results) {
          setSeries(seriesData.value.results.slice(0, 6));
        }
        if (achievementData.status === "fulfilled" && achievementData.value?.results) {
          setAchievements(achievementData.value.results.slice(0, 8));
        }
      } catch (err) {
        console.error("Game detail fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetails();
    return () => { cancelled = true; };
  }, [gameId, enabled, gameName]);

  return { details, screenshots, trailers, series, achievements, steamKo, steamAppId, loading };
};
