import { useState } from "react";

export const useCompare = () => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (game) => {
    if (compareList.length < 2 && !compareList.find(g => g.id === game.id)) {
      setCompareList([...compareList, game]);
    }
  };

  const removeFromCompare = (gameId) => {
    setCompareList(prev => prev.filter(g => g.id !== gameId));
  };

  const isInCompare = (gameId) => {
    return compareList.some(g => g.id === gameId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    canAdd: compareList.length < 2,
  };
};
