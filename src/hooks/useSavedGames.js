import { useState, useEffect } from "react";

const STORAGE_KEY = "gamevory_saved";

export const useSavedGames = () => {
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist to localStorage whenever savedIds changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.error("Failed to save games to localStorage", e);
    }
  }, [savedIds]);

  const toggleSave = (gameId) => {
    setSavedIds(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const isSaved = (gameId) => {
    return savedIds.includes(gameId);
  };

  const getSavedGames = (games) => {
    return games.filter(g => savedIds.includes(g.id));
  };

  const clearAll = () => {
    setSavedIds([]);
  };

  return {
    savedIds,
    toggleSave,
    isSaved,
    getSavedGames,
    clearAll,
    count: savedIds.length,
  };
};
