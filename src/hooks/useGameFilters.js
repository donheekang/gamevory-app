import { useState, useMemo } from "react";
import { SEARCH_KEYWORDS, INITIAL_FILTERS } from "../data/games";

export const useGameFilters = (games) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS.map(f => f.key).reduce((acc, key, i) => {
    acc[key] = INITIAL_FILTERS[i].active;
    return acc;
  }, {}));

  const toggleFilter = (key) => {
    setActiveFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setActiveFilters(
      INITIAL_FILTERS.map(f => f.key).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    );
  };

  const filteredGames = useMemo(() => {
    let result = games;

    // Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(game => {
        const titleMatch = game.titleKo?.toLowerCase().includes(q) || game.title.toLowerCase().includes(q);
        const genreMatch = game.genre?.toLowerCase().includes(q);
        const tagsMatch = game.tags?.some(t => t.toLowerCase().includes(q));

        // Check SEARCH_KEYWORDS for automatic matching
        let keywordMatch = false;
        Object.entries(SEARCH_KEYWORDS).forEach(([keyword, filterFn]) => {
          if (q.includes(keyword.toLowerCase()) && filterFn(game)) {
            keywordMatch = true;
          }
        });

        return titleMatch || genreMatch || tagsMatch || keywordMatch;
      });
    }

    // Active filters
    if (Object.values(activeFilters).some(v => v)) {
      result = result.filter(game => {
        const isKorean = game.kr.ui;
        const isCoop = game.feat.coop || game.feat.localCoop;
        const isController = game.feat.ctrl !== "none";
        const isFree = game.free;
        const isShort = ["4~6시간", "6~10시간", "8~12시간", "10~15시간", "12~15시간"].includes(game.playtime);
        const isHighScore = game.score && game.score >= 90;
        const isNewRelease = game.date && new Date(game.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const isOnSale = game.discountPct > 0;
        const isSolo = game.feat.sp;

        let passes = true;

        if (activeFilters.korean && !isKorean) passes = false;
        if (activeFilters.coop && !isCoop) passes = false;
        if (activeFilters.controller && !isController) passes = false;
        if (activeFilters.free && !isFree) passes = false;
        if (activeFilters.short && !isShort) passes = false;
        if (activeFilters.highscore && !isHighScore) passes = false;
        if (activeFilters.newrelease && !isNewRelease) passes = false;
        if (activeFilters.onsale && !isOnSale) passes = false;
        if (activeFilters.solo && !isSolo) passes = false;

        return passes;
      });
    }

    return result;
  }, [games, searchQuery, activeFilters]);

  return {
    searchQuery,
    setSearchQuery,
    activeFilters,
    toggleFilter,
    clearFilters,
    filteredGames,
  };
};
