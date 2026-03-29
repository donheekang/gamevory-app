import { useState, useEffect, useRef } from "react";
import { searchGames, rawgToGameVory, searchSteamKorean, steamSearchToGameVory } from "../api/rawg";
import { getKoreanTitle, translateGenres, isKorean, searchKoreanToEnglish, slugToEnglishName } from "../data/koreanMappings";
import { GAMES } from "../data/games";

// 로컬 DB에서 한국어 검색 (정적 49개 게임)
const searchLocalGames = (query) => {
  const q = query.toLowerCase().trim();
  return GAMES.filter(game => {
    const titleKo = (game.titleKo || "").toLowerCase();
    const title = (game.title || "").toLowerCase();
    const tags = (game.tags || []).join(" ").toLowerCase();
    return titleKo.includes(q) || title.includes(q) || tags.includes(q);
  }).slice(0, 5);
};

export const useRawgSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  // 자동완성 (300ms 디바운스) — 한국어 + 영어 모두 지원
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const allSuggestions = [];
      const seenIds = new Set();

      // 1단계: 로컬 DB 즉시 검색 (한국어/영어 모두)
      const localMatches = searchLocalGames(query);
      localMatches.forEach(game => {
        if (!seenIds.has(game.id)) {
          seenIds.add(game.id);
          allSuggestions.push({
            id: game.id,
            name: game.titleKo || game.title,
            nameOriginal: game.title,
            image: game.image,
            metacritic: game.score,
            genres: game.genre,
            released: game.date,
            source: "gamevory",
          });
        }
      });

      if (isKorean(query)) {
        // 2단계: 한국어 매핑 DB에서 역방향 검색
        const koMatches = searchKoreanToEnglish(query);
        for (const match of koMatches.slice(0, 3)) {
          const englishName = slugToEnglishName(match.slug);
          // RAWG에서 영문 이름으로 검색
          const data = await searchGames(englishName, { pageSize: 2 });
          if (data?.results) {
            data.results.forEach(g => {
              if (!seenIds.has(g.id)) {
                seenIds.add(g.id);
                const koTitle = getKoreanTitle(g);
                const genresKo = translateGenres(g.genres || []);
                allSuggestions.push({
                  id: g.id,
                  name: koTitle || match.koTitle || g.name,
                  nameOriginal: g.name,
                  image: g.background_image,
                  metacritic: g.metacritic,
                  genres: genresKo || (g.genres || []).map(x => x.name).join(", "),
                  released: g.released,
                  source: "rawg",
                });
              }
            });
          }
        }

        // 3단계: Steam 한국어 검색 API (DB에 없는 게임도 찾기)
        const steamResults = await searchSteamKorean(query);
        steamResults.slice(0, 5).forEach(item => {
          const steamId = `steam-${item.appId}`;
          if (!seenIds.has(steamId) && !seenIds.has(item.appId)) {
            seenIds.add(steamId);
            allSuggestions.push({
              id: item.appId,
              name: item.name,
              nameOriginal: item.name,
              image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.appId}/header.jpg`,
              metacritic: item.metascore,
              genres: "",
              released: "",
              price: item.price?.formatted || "",
              source: "steam",
              steamAppId: item.appId,
            });
          }
        });
      } else {
        // 영문 검색: RAWG API 직접 검색
        const data = await searchGames(query, { pageSize: 5 });
        if (data?.results) {
          data.results.forEach(g => {
            if (!seenIds.has(g.id)) {
              seenIds.add(g.id);
              const koTitle = getKoreanTitle(g);
              const genresKo = translateGenres(g.genres || []);
              allSuggestions.push({
                id: g.id,
                name: koTitle || g.name,
                nameOriginal: g.name,
                image: g.background_image,
                metacritic: g.metacritic,
                genres: genresKo || (g.genres || []).map(x => x.name).join(", "),
                released: g.released,
                source: "rawg",
              });
            }
          });
        }
      }

      setSuggestions(allSuggestions.slice(0, 8));
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // 전체 검색 — 한국어 + 영어 통합
  const search = async (searchQuery, options = {}) => {
    const q = searchQuery || query;
    if (!q) return;

    setLoading(true);
    try {
      const allResults = [];
      const seenIds = new Set();

      // 1단계: 로컬 DB 검색 (즉시)
      const localMatches = searchLocalGames(q);
      localMatches.forEach(game => {
        seenIds.add(game.id);
        allResults.push(game);
      });

      if (isKorean(q)) {
        // 2단계: 한국어 매핑 → RAWG 영문 검색
        const koMatches = searchKoreanToEnglish(q);
        for (const match of koMatches.slice(0, 5)) {
          const englishName = slugToEnglishName(match.slug);
          const data = await searchGames(englishName, { pageSize: 3, ...options });
          if (data?.results) {
            data.results.forEach(g => {
              if (!seenIds.has(g.id)) {
                seenIds.add(g.id);
                allResults.push(rawgToGameVory(g));
              }
            });
          }
        }

        // 3단계: Steam 한국어 검색
        const steamResults = await searchSteamKorean(q);
        steamResults.forEach(item => {
          if (!seenIds.has(item.appId) && !seenIds.has(`steam-${item.appId}`)) {
            seenIds.add(item.appId);
            allResults.push(steamSearchToGameVory(item));
          }
        });
      } else {
        // 영문 검색: RAWG 직접
        const data = await searchGames(q, { pageSize: 20, ...options });
        if (data?.results) {
          data.results.forEach(g => {
            if (!seenIds.has(g.id)) {
              seenIds.add(g.id);
              allResults.push(rawgToGameVory(g));
            }
          });
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
  };

  return {
    query, setQuery,
    results, loading,
    suggestions, setSuggestions,
    search, clearSearch,
  };
};
