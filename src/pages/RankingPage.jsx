import { useState } from "react";
import { Trophy, Star, TrendingUp, Flame, Clock, Zap } from "lucide-react";
import { COLORS } from "../styles/theme";
import { GameDetail } from "../components/GameDetail";
import { useSavedGames } from "../hooks/useSavedGames";
import { useRawgTrending } from "../hooks/useRawgTrending";

const handleImgError = (e) => {
  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='34'%3E%3Crect width='100%' height='100%' fill='%23E8EAED'/%3E%3C/svg%3E";
};

const RANK_TABS = [
  { key: "trending", label: "인기 급상승", icon: Flame, color: "#FF6F61" },
  { key: "topRated", label: "최고 평점", icon: Star, color: "#FFB800" },
  { key: "recent", label: "최신 출시", icon: Zap, color: "#6C5CE7" },
  { key: "upcoming", label: "기대작", icon: TrendingUp, color: "#00C073" },
];

const getRatingColor = (score) => {
  if (score >= 85) return "#00C073";
  if (score >= 70) return "#7DC800";
  if (score >= 50) return "#FFB800";
  return "#FF6B6B";
};

export const RankingPage = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedGame, setSelectedGame] = useState(null);
  const { isSaved, toggleSave } = useSavedGames();
  const { trending, topRated, upcoming, recent, loading } = useRawgTrending({ pageSize: 20 });

  const getGames = () => {
    switch (activeTab) {
      case "trending": return trending;
      case "topRated": return topRated;
      case "recent": return recent;
      case "upcoming": return upcoming;
      default: return [];
    }
  };

  const ranked = getGames();
  const activeTabData = RANK_TABS.find(t => t.key === activeTab);
  const rankColors = ["#FF6F61", "#FF9F1C", "#35C5F0"];

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Trophy size={24} color="#FFB800" />
            <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.textPrimary, margin: 0 }}>랭킹</h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: "#FFB800", padding: "2px 8px", borderRadius: 6 }}>실시간</span>
          </div>
          <p style={{ fontSize: 15, color: COLORS.textSecondary, margin: 0 }}>실시간 데이터 기반 게임 차트</p>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
          {RANK_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12,
                  border: isActive ? `2px solid ${tab.color}` : `1px solid ${COLORS.borderLight}`,
                  fontSize: 14, fontWeight: isActive ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap",
                  backgroundColor: isActive ? `${tab.color}10` : COLORS.bg,
                  color: isActive ? tab.color : COLORS.textSecondary,
                  transition: "all 0.2s",
                }}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 로딩 */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: COLORS.textMuted }}>
            <div className="spin" style={{ width: 32, height: 32, border: `3px solid ${COLORS.borderLight}`, borderTop: `3px solid ${COLORS.primary}`, borderRadius: "50%", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>랭킹 데이터 로딩 중...</div>
          </div>
        )}

        {/* 차트 리스트 */}
        {!loading && ranked.length > 0 && (
          <div style={{ backgroundColor: COLORS.bg, borderRadius: 20, border: `1px solid ${COLORS.borderLight}`, overflow: "hidden" }}>
            {/* 1위 하이라이트 */}
            {ranked[0] && (
              <div onClick={() => setSelectedGame(ranked[0])}
                style={{
                  display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", cursor: "pointer",
                  background: `linear-gradient(135deg, ${activeTabData.color}08, ${activeTabData.color}18)`,
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = `${activeTabData.color}15`}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, backgroundColor: rankColors[0],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0,
                  boxShadow: `0 4px 12px ${rankColors[0]}40`,
                }}>1</div>
                <img onError={handleImgError} src={ranked[0].image} alt={ranked[0].titleKo || ranked[0].title}
                  style={{ width: 100, height: 56, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 2 }}>{ranked[0].titleKo || ranked[0].title}</div>
                  {ranked[0].titleKo && ranked[0].titleKo !== ranked[0].title && (
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>{ranked[0].title}</div>
                  )}
                  <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{ranked[0].genre}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {ranked[0].score && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
                      backgroundColor: getRatingColor(ranked[0].score), borderRadius: 8,
                    }}>
                      <Star size={12} fill="#fff" stroke="#fff" />
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{ranked[0].score}</span>
                    </div>
                  )}
                  {ranked[0].rating && !ranked[0].score && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
                      ⭐ {ranked[0].rating}/5
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2위~ */}
            {ranked.slice(1).map((game, i) => {
              const rank = i + 2;
              const isTop3 = rank <= 3;
              return (
                <div key={game.id} onClick={() => setSelectedGame(game)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", cursor: "pointer",
                    borderBottom: `1px solid ${COLORS.borderLight}`, transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.bgGray}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  <span style={{
                    fontSize: isTop3 ? 20 : 15, fontWeight: 900, minWidth: 32, textAlign: "center",
                    color: isTop3 ? rankColors[rank - 1] || COLORS.textMuted : COLORS.textMuted,
                  }}>{rank}</span>
                  <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                    style={{ width: 64, height: 36, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.titleKo || game.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{game.genre}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {game.score && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                        <Star size={11} fill="#FFD700" stroke="#FFD700" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{game.score}</span>
                      </div>
                    )}
                    {game.rating && !game.score && (
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>⭐ {game.rating}/5</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && ranked.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: COLORS.textMuted }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>데이터를 불러올 수 없습니다</p>
            <p style={{ fontSize: 13 }}>잠시 후 다시 시도해주세요</p>
          </div>
        )}

        <div style={{ textAlign: "center", padding: "32px 0", color: COLORS.textMuted, fontSize: 12 }}>
          실시간 데이터 기반 · 50,000+ 게임 데이터베이스
        </div>
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}
    </div>
  );
};
