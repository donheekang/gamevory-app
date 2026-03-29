import { useState, useEffect, useRef } from "react";
import { searchGames, rawgToGameVory } from "../api/rawg";
import { getKoreanTitle, translateGenres } from "../data/koreanMappings";

export const useRawgSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  // 자동완성 (300ms 디바운스)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const data = await searchGames(query, { pageSize: 5 });
      if (data?.results) {
        setSuggestions(data.results.map(g => {
          const koTitle = getKoreanTitle(g);
          const genresKo = translateGenres(g.genres || []);
          return {
            id: g.id,
            name: koTitle || g.name,
            nameOriginal: g.name,
            image: g.background_image,
            metacritic: g.metacritic,
            genres: genresKo || (g.genres || []).map(x => x.name).join(", "),
            released: g.released,
          };
        }));
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // 전체 검색
  const search = async (searchQuery, options = {}) => {
    const q = searchQuery || query;
    if (!q) return;

    setLoading(true);
    try {
      const data = await searchGames(q, { pageSize: 20, ...options });
      if (data?.results) {
        setResults(data.results.map(rawgToGameVory));
      }
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
