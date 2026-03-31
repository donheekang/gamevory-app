import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { COLORS } from "../styles/theme";
import { SITUATIONS, CURATED_THEMES, GAMES } from "../data/games";
import { GameCard } from "../components/GameCard";
import { GameDetail } from "../components/GameDetail";
import { useSavedGames } from "../hooks/useSavedGames";

const TABS = [
  { key: "situation", label: "상황별", desc: "지금 내 상황에 딱 맞는 게임" },
  { key: "theme", label: "테마별", desc: "인기 테마로 골라보는 게임" },
];

export const CurationPage = ({ games }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("situation");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const { isSaved, toggleSave } = useSavedGames();

  // URL 파라미터로 상황 자동 선택 (홈에서 클릭 시)
  useEffect(() => {
    const situationId = searchParams.get("situation");
    if (situationId) {
      setActiveTab("situation");
      const found = SITUATIONS.find(s => s.id === situationId);
      if (found) setSelectedItem(found);
    }
  }, [searchParams]);

  const items = activeTab === "situation" ? SITUATIONS : CURATED_THEMES;
  const filteredGames = selectedItem
    ? games.filter(activeTab === "situation" ? selectedItem.filters : selectedItem.filterFn)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
    : [];

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Sparkles size={24} color={COLORS.primary} />
            <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.textPrimary, margin: 0 }}>큐레이션</h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: COLORS.primary, padding: "2px 8px", borderRadius: 6 }}>에디터 추천</span>
          </div>
          <p style={{ fontSize: 15, color: COLORS.textSecondary, margin: 0 }}>
            GameVory 에디터가 직접 골라서 한국어로 리뷰한 게임 모음
          </p>
        </div>

        {/* 탭 전환 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, backgroundColor: COLORS.bgGray, borderRadius: 12, padding: 4 }}>
          {TABS.map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedItem(null); }}
              style={{
                flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
                fontSize: 15, fontWeight: activeTab === tab.key ? 700 : 500, cursor: "pointer",
                backgroundColor: activeTab === tab.key ? COLORS.bg : "transparent",
                color: activeTab === tab.key ? COLORS.primary : COLORS.textSecondary,
                boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 상황별 카드 */}
        {activeTab === "situation" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
            {SITUATIONS.map(s => {
              const count = games.filter(s.filters).length;
              const isSelected = selectedItem?.id === s.id;
              return (
                <div key={s.id} onClick={() => setSelectedItem(isSelected ? null : s)}
                  style={{
                    padding: "22px 20px", borderRadius: 18, cursor: "pointer",
                    background: isSelected
                      ? `linear-gradient(135deg, ${s.color}, ${s.color}CC)`
                      : `linear-gradient(135deg, ${s.color}10, ${s.color}20)`,
                    border: `2px solid ${isSelected ? s.color : "transparent"}`,
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: isSelected ? "rgba(255,255,255,0.3)" : s.color, opacity: isSelected ? 1 : 0.3, lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: isSelected ? "#fff" : COLORS.textPrimary, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.8)" : COLORS.textSecondary, marginBottom: 10, lineHeight: 1.4 }}>{s.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.7)" : COLORS.textMuted }}>{count}개 게임</span>
                    <ChevronRight size={16} color={isSelected ? "rgba(255,255,255,0.7)" : COLORS.textMuted} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 테마별 카드 */}
        {activeTab === "theme" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
            {CURATED_THEMES.map((t, i) => {
              const count = games.filter(t.filterFn).length;
              const isSelected = selectedItem === t;
              const previewGames = games.filter(t.filterFn).slice(0, 3);
              return (
                <div key={i} onClick={() => setSelectedItem(isSelected ? null : t)}
                  style={{
                    padding: "22px 20px", borderRadius: 18, cursor: "pointer",
                    backgroundColor: isSelected ? t.accentColor : t.color,
                    border: `2px solid ${isSelected ? t.accentColor : "transparent"}`,
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "#fff" : t.accentColor, backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : `${t.accentColor}15`, padding: "3px 10px", borderRadius: 6 }}>{t.keyword}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? "#fff" : COLORS.textPrimary, lineHeight: 1.4, marginBottom: 12 }}>{t.title}</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {previewGames.map(g => (
                      <img key={g.id} src={g.image} alt={g.title}
                        style={{ width: 52, height: 30, objectFit: "cover", borderRadius: 5, border: "1px solid rgba(0,0,0,0.08)" }}
                        onError={e => { e.target.style.display = "none"; }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: isSelected ? "rgba(255,255,255,0.7)" : COLORS.textSecondary }}>{count}개 게임</span>
                    <ChevronRight size={16} color={isSelected ? "rgba(255,255,255,0.7)" : COLORS.textMuted} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 선택된 아이템의 팁 */}
        {selectedItem && activeTab === "situation" && selectedItem.tip && (
          <div style={{ backgroundColor: `${selectedItem.color}15`, padding: "14px 20px", borderRadius: 12, marginBottom: 24, border: `1px solid ${selectedItem.color}30` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: selectedItem.color, margin: 0 }}>
              💡 {selectedItem.tip}
            </p>
          </div>
        )}

        {/* 결과 게임 그리드 */}
        {selectedItem && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>
                추천 게임
              </h2>
              <span style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 500 }}>
                {filteredGames.length}개
              </span>
            </div>
            {filteredGames.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="responsive-grid">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={isSaved(game.id)} onToggleSave={toggleSave} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textMuted }}>
                <p style={{ fontSize: 16, fontWeight: 600 }}>해당하는 게임이 없습니다</p>
              </div>
            )}
          </>
        )}

        {/* 선택 안 했을 때 안내 */}
        {!selectedItem && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.textMuted }}>
            <Sparkles size={48} color={COLORS.borderLight} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.textSecondary }}>
              {activeTab === "situation" ? "상황을 선택하면 딱 맞는 게임을 추천해줄게요" : "테마를 선택해서 게임을 탐색해보세요"}
            </p>
          </div>
        )}
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}
    </div>
  );
};
