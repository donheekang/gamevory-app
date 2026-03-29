import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { COLORS } from "../styles/theme";
import { WEEKLY_HOT_IDS, BEST_SELLER_IDS } from "../data/games";

const handleImgError = (e) => {
  const el = e.currentTarget;
  el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='32'%3E%3Crect width='100%' height='100%' fill='%23E8EAED'/%3E%3C/svg%3E";
};

export const WeeklyChart = ({ games, onSelectGame }) => {
  const ranked = WEEKLY_HOT_IDS.map(id => games.find(g => g.id === id)).filter(Boolean);
  if (!ranked.length) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>이번 주 인기</h2>
        <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>3월 4주차</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {ranked.map((game, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const rankColors = ["#FF6F61", "#FF9F1C", "#35C5F0"];
          return (
            <div key={game.id} onClick={() => onSelectGame(game)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer",
                borderBottom: `1px solid ${COLORS.borderLight}`, transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.bgGray}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <span style={{
                fontSize: isTop3 ? 20 : 16, fontWeight: 900, minWidth: 28, textAlign: "center",
                color: isTop3 ? rankColors[i] : COLORS.textMuted,
              }}>{rank}</span>
              <img onError={handleImgError} src={game.image} alt={game.title} style={{ width: 56, height: 32, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{game.titleKo || game.title}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre}</div>
              </div>
              {isTop3 && <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6F61", backgroundColor: "#FFF0EE", padding: "2px 8px", borderRadius: 6 }}>인기</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BestSellerChart = ({ games, onSelectGame }) => {
  const [expanded, setExpanded] = useState(false);
  const ranked = BEST_SELLER_IDS.map(id => games.find(g => g.id === id)).filter(Boolean);
  const visible = expanded ? ranked : ranked.slice(0, 5);

  if (!ranked.length) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>구매 인기 TOP</h2>
          <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>스팀 판매량 기준</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {visible.map((game, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const rankColors = ["#FF6F61", "#FF9F1C", "#35C5F0"];
          return (
            <div key={game.id} onClick={() => onSelectGame(game)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer",
                borderBottom: `1px solid ${COLORS.borderLight}`,
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.bgGray}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <span style={{
                fontSize: isTop3 ? 20 : 16, fontWeight: 900, minWidth: 28,
                color: isTop3 ? rankColors[i] : COLORS.textMuted,
              }}>{rank}</span>
              <img onError={handleImgError} src={game.image} alt={game.title} style={{ width: 56, height: 32, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{game.titleKo || game.title}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{game.free ? "무료" : game.price}</div>
              </div>
              {game.score && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} fill="#FFD700" stroke="#FFD700" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{game.score}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!expanded && ranked.length > 5 && (
        <div onClick={() => setExpanded(true)}
          style={{ textAlign: "center", padding: "14px 0", cursor: "pointer", fontSize: 14, fontWeight: 600,
            color: COLORS.primary, borderTop: `1px solid ${COLORS.borderLight}`, marginTop: 4 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.bgGray}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
          더보기
        </div>
      )}
    </div>
  );
};

export const SaleSection = ({ month, label, icon, color, games, onSelectGame }) => {
  const saleGames = games.filter(g => g.saleMonth === month && g.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct);

  if (saleGames.length === 0) return null;

  const isUpcoming = month > new Date().toISOString().slice(0, 7);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: color }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>{label}</h2>
        {isUpcoming && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", backgroundColor: color, padding: "3px 10px", borderRadius: 8 }}>예정</span>}
        <span style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: "auto" }}>{saleGames.length}개 할인</span>
      </div>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
        {saleGames.map(game => (
          <div key={game.id} onClick={() => onSelectGame(game)}
            style={{ flex: "0 0 auto", width: 220, borderRadius: 16, overflow: "hidden", backgroundColor: COLORS.bg, boxShadow: COLORS.shadowCard, cursor: "pointer", transition: "all 0.2s", border: `1px solid ${COLORS.borderLight}` }}>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <img onError={handleImgError} src={game.image} alt={game.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 8, left: 8, backgroundColor: color, color: "#fff", padding: "3px 10px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                -{game.discountPct}%
              </div>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>{game.titleKo}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted, textDecoration: "line-through" }}>{game.originalPrice}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: color }}>{game.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
