import { useState, useEffect } from "react";
import { searchGames, getGameDetails, getGameScreenshots, getGameTrailers, getGameSeries, fetchSteamKoreanData } from "../api/rawg";
import { getKoreanTitle, translateGenres, translateTags } from "../data/koreanMappings";

// 하드코딩 게임 이름 → RAWG ID 캐시
const nameToRawgCache = new Map();

// 통합 API 사용 가능 여부 (Vercel 환경에서만 동작)
const USE_COMBINED_API = typeof window !== "undefined" && window.location.protocol === "https:";

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
    if (!gameId && !gameName) return;
    let cancelled = false;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        let resolvedId = gameId;

        // gameId가 없으면 (하드코딩 게임) → 이름으로 RAWG 검색해서 ID 찾기
        if (!resolvedId && gameName) {
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

        // === 통합 API 사용 (Vercel 환경) — 1번 호출로 전부 가져옴 ===
        if (USE_COMBINED_API) {
          try {
            const res = await fetch(`/api/game-detail?id=${resolvedId}`);
            if (res.ok) {
              const data = await res.json();
              if (cancelled) return;

              // RAWG 상세 정보 세팅
              const detailResult = {
                id: data.id,
                slug: data.slug,
                name: data.name,
                description_raw: data.description,
                released: data.released,
                metacritic: data.metacritic,
                rating: data.rating,
                ratings_count: data.ratingsCount,
                background_image: data.backgroundImage,
                genres: data.genres,
                tags: data.tags,
                platforms: data.platforms?.map(name => ({ platform: { name } })),
                developers: data.developers?.map(name => ({ name })),
                publishers: data.publishers?.map(name => ({ name })),
                stores: data.stores,
                added: data.added,
                playtime: data.playtime,
              };

              // 한국어 번역
              if (detailResult.genres) {
                detailResult.genresKo = translateGenres(detailResult.genres);
              }
              if (detailResult.tags) {
                detailResult.tagsKo = translateTags(detailResult.tags.slice(0, 10));
              }
              detailResult.titleKo = getKoreanTitle(detailResult) || detailResult.name;

              setDetails(detailResult);
              setScreenshots(data.screenshots || []);
              setTrailers(data.trailers || []);
              setSeries(data.series || []);

              // Steam 데이터
              if (data.steamAppId) setSteamAppId(data.steamAppId);
              if (data.steam) {
                setSteamKo({
                  nameKo: data.steam.name,
                  descriptionKo: data.steam.descriptionKo || "",
                  detailedDescKo: data.steam.detailedDescKo || "",
                  headerImage: data.steam.headerImage,
                  isFree: data.steam.isFree,
                  priceKo: data.steam.price?.finalFormatted || (data.steam.isFree ? "무료" : null),
                  discountPct: data.steam.price?.discountPercent || 0,
                  priceDetail: data.steam.price ? {
                    full: Math.round(data.steam.price.initial / 100),
                    curr: Math.round(data.steam.price.final / 100),
                    disc: data.steam.price.discountPercent,
                  } : null,
                  koreanSupport: data.steam.koreanSupport || { ui: false, sub: false, audio: false },
                  supportedLanguages: data.steam.supportedLanguages || "",
                  categories: data.steam.categories || [],
                  genres: data.steam.genres || [],
                });
              }

              setLoading(false);
              return; // 통합 API 성공 → 여기서 끝
            }
          } catch (err) {
            console.warn("Combined API failed, falling back to direct calls:", err);
          }
        }

        // === 폴백: 개별 API 직접 호출 (file:// 또는 통합 API 실패 시) ===
        const [detailData, screenshotData, trailerData, seriesData] = await Promise.allSettled([
          getGameDetails(resolvedId),
          getGameScreenshots(resolvedId),
          getGameTrailers(resolvedId),
          getGameSeries(resolvedId),
        ]);

        if (cancelled) return;

        let detailResult = null;
        if (detailData.status === "fulfilled" && detailData.value) {
          detailResult = detailData.value;

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
