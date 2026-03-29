import { useState } from "react";
import { COLORS } from "../styles/theme";
import { SITUATIONS } from "../data/games";
import { GameCard } from "../components/GameCard";
import { GameDetail } from "../components/GameDetail";
import { useSavedGames } from "../hooks/useSavedGames";

export const SituationsPage = ({ games }) => {
  const [selectedSituation, setSelectedSituation] = useState(SITUATIONS[0]);
  const [selectedGame, setSelectedGame] = useState(null);
  const { isSaved, toggleSave } = useSavedGames();

  const filteredGames = selectedSituation ? games.filter(selectedSituation.filters) : games;

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>지금 내 상황에 맞는 게임</h1>
        <p style={{ fontSize: 15, color: COLORS.textSecondary, marginBottom: 32 }}>상황별로 게임을 골라보세요</p>

        {/* Situation Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {SITUATIONS.map(situation => (
            <div key={situation.id}
              onClick={() => setSelectedSituation(situation)}
              style={{
                padding: 20, borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                backgroundColor: selectedSituation.id === situation.id ? situation.color : COLORS.bgGray,
                border: `2px solid ${selectedSituation.id === situation.id ? situation.color : COLORS.borderLight}`
              }}
              onMouseEnter={e => { if (selectedSituation.id !== situation.id) e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: situation.color, marginBottom: 6 }}>#{situation.num}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: selectedSituation.id === situation.id ? "#fff" : COLORS.textPrimary, marginBottom: 6 }}>
                {situation.title}
              </div>
              <div style={{ fontSize: 13, color: selectedSituation.id === situation.id ? "rgba(255,255,255,0.8)" : COLORS.textSecondary }}>
                {situation.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        {selectedSituation && (
          <div style={{ backgroundColor: selectedSituation.color, padding: 16, borderRadius: 12, marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>💡 {selectedSituation.tip}</p>
          </div>
        )}

        {/* Game Grid */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>추천 게임 ({filteredGames.length}개)</h2>
        {filteredGames.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={isSaved(game.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textMuted }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>해당하는 게임이 없습니다</p>
          </div>
        )}
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}
    </div>
  );
};
