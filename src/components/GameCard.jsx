import { Star, Bookmark, BookmarkPlus } from "lucide-react";
import { COLORS } from "../styles/theme";

const handleImgError = (e) => {
  const el = e.currentTarget;
  const alt = el.alt || "?";
  const w = el.width || el.offsetWidth || 120;
  const h = el.height || el.offsetHeight || 68;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='%23E8EAED'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-family='Pretendard,sans-serif' font-size='${Math.min(w / alt.length * 1.2, h * 0.35)}' font-weight='700' fill='%23828C94'>${encodeURIComponent(alt)}</text></svg>`;
  el.src = "data:image/svg+xml," + svg;
  el.onerror = null;
};

export const GameCard = ({ game, onSelect, isSaved, onToggleSave }) => {
  return (
    <div onClick={() => onSelect(game)}
      style={{
        borderRadius: 16, overflow: "hidden", backgroundColor: COLORS.bg, boxShadow: COLORS.shadowCard,
        cursor: "pointer", transition: "all 0.2s", border: `1px solid ${COLORS.borderLight}`,
        position: "relative", height: "100%", display: "flex", flexDirection: "column"
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = COLORS.shadowHover; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = COLORS.shadowCard; e.currentTarget.style.transform = "none"; }}>

      {/* Image */}
      <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden", backgroundColor: COLORS.bgGray }}>
        <img onError={handleImgError} src={game.image} alt={game.title}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Sale badge */}
        {game.discountPct > 0 && (
          <div style={{ position: "absolute", top: 8, left: 8, backgroundColor: COLORS.accent, color: "#fff", padding: "4px 12px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
            -{game.discountPct}%
          </div>
        )}

        {/* Save button */}
        <button onClick={e => { e.stopPropagation(); onToggleSave(game.id); }}
          style={{
            position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "scale(1)"; }}>
          {isSaved ? <Bookmark size={20} fill={COLORS.primary} color={COLORS.primary} /> : <BookmarkPlus size={20} color={COLORS.textSecondary} />}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {game.titleKo || game.title}
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{game.genre}</div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {game.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} style={{ fontSize: 10, backgroundColor: COLORS.tagBg, color: COLORS.textSecondary, padding: "2px 8px", borderRadius: 4 }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div>
            {game.score && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={12} fill="#FFB800" color="#FFB800" />
                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>{game.score}</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary }}>
            {game.free ? "무료" : game.price}
          </div>
        </div>
      </div>
    </div>
  );
};
