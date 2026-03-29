import { useState } from "react";
import { User, Bookmark, Trash2, Gamepad2, ExternalLink } from "lucide-react";
import { COLORS } from "../styles/theme";
import { GAMES } from "../data/games";
import { GameCard } from "../components/GameCard";
import { GameDetail } from "../components/GameDetail";
import { useSavedGames } from "../hooks/useSavedGames";

export const MyPage = () => {
  const { savedIds, isSaved, toggleSave, getSavedGames, clearAll, count } = useSavedGames();
  const [selectedGame, setSelectedGame] = useState(null);
  const savedGames = getSavedGames(GAMES);

  // 저장한 게임 총 가격 계산
  const totalPrice = savedGames.reduce((sum, g) => {
    if (g.free) return sum;
    const price = parseInt((g.price || "0").replace(/[^\d]/g, ""));
    return sum + price;
  }, 0);

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* 프로필 헤더 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20, padding: "28px 32px",
          borderRadius: 20, marginBottom: 32,
          background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.primary}25)`,
          border: `1px solid ${COLORS.primary}20`,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            backgroundColor: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center",
            border: `3px solid ${COLORS.primary}`,
          }}>
            <User size={28} color={COLORS.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, margin: 0, marginBottom: 4 }}>마이 페이지</h1>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, margin: 0 }}>저장한 게임을 관리하고 위시리스트를 확인하세요</p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }} className="responsive-grid-3">
          <div style={{ padding: "20px", borderRadius: 16, backgroundColor: COLORS.bgGray, textAlign: "center" }}>
            <Bookmark size={22} color={COLORS.primary} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.primary }}>{count}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>저장한 게임</div>
          </div>
          <div style={{ padding: "20px", borderRadius: 16, backgroundColor: COLORS.bgGray, textAlign: "center" }}>
            <Gamepad2 size={22} color="#FF6F61" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FF6F61" }}>
              {savedGames.filter(g => g.discountPct > 0).length}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>세일 중</div>
          </div>
          <div style={{ padding: "20px", borderRadius: 16, backgroundColor: COLORS.bgGray, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>총 예상 금액</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.textPrimary }}>₩{totalPrice.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>위시리스트</div>
          </div>
        </div>

        {/* 저장한 게임 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bookmark size={20} color={COLORS.primary} />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>저장한 게임</h2>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>{count}개</span>
            </div>
            {count > 0 && (
              <button onClick={clearAll}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10,
                  border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
                  fontSize: 13, color: COLORS.textMuted, cursor: "pointer", fontWeight: 500,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF6F61"; e.currentTarget.style.color = "#FF6F61"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.color = COLORS.textMuted; }}>
                <Trash2 size={14} />
                전체 삭제
              </button>
            )}
          </div>

          {count > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="responsive-grid">
              {savedGames.map(game => (
                <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={true} onToggleSave={toggleSave} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "60px 20px", borderRadius: 20,
              backgroundColor: COLORS.bgGray, border: `1px dashed ${COLORS.border}`,
            }}>
              <Bookmark size={48} color={COLORS.borderLight} style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 8 }}>아직 저장한 게임이 없어요</p>
              <p style={{ fontSize: 14, color: COLORS.textMuted }}>마음에 드는 게임의 북마크 버튼을 눌러보세요!</p>
            </div>
          )}
        </div>

        {/* 세일 알림 추천 */}
        {savedGames.filter(g => !g.free && g.discountPct === 0).length > 0 && (
          <div style={{
            padding: "20px 24px", borderRadius: 16,
            background: `linear-gradient(135deg, #FF6F6108, #FF6F6118)`,
            border: `1px solid #FF6F6120`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, margin: "0 0 12px" }}>
              할인 대기 중인 게임 ({savedGames.filter(g => !g.free && g.discountPct === 0).length}개)
            </h3>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {savedGames.filter(g => !g.free && g.discountPct === 0).map(game => (
                <div key={game.id} onClick={() => setSelectedGame(game)}
                  style={{
                    flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.borderLight}`, cursor: "pointer",
                  }}>
                  <img src={game.image} alt={game.title}
                    style={{ width: 48, height: 28, objectFit: "cover", borderRadius: 6 }}
                    onError={e => { e.target.style.display = "none"; }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{game.titleKo}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{game.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}
    </div>
  );
};
