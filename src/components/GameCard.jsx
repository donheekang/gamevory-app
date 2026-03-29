import { Star, Bookmark, BookmarkPlus, Languages, Gamepad2, Users } from "lucide-react";
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

// 한국어 지원 레벨 텍스트
const getKrLabel = (kr) => {
  if (!kr) return null;
  if (kr.audio) return "한국어 음성";
  if (kr.ui) return "한국어 지원";
  if (kr.sub) return "자막 지원";
  return null;
};

export const GameCard = ({ game, onSelect, isSaved, onToggleSave }) => {
  const kr = game.kr;
  const krLabel = getKrLabel(kr);
  const hasKr = kr && (kr.ui || kr.sub || kr.audio);
  const hasCoop = game.feat?.coop || game.feat?.localCoop;
  const hasCtrl = game.feat?.ctrl === "full";

  return (
    <div onClick={() => onSelect(game)}
      style={{
        borderRadius: 14, overflow: "hidden", backgroundColor: COLORS.bg, boxShadow: COLORS.shadowCard,
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
          <div style={{
            position: "absolute", top: 8, left: 8,
            backgroundColor: "#4C6B22", color: "#A4D007",
            padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 800,
          }}>
            -{game.discountPct}%
          </div>
        )}

        {/* Save button */}
        <button onClick={e => { e.stopPropagation(); onToggleSave(game.id); }}
          style={{
            position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "scale(1)"; }}>
          {isSaved ? <Bookmark size={18} fill={COLORS.primary} color={COLORS.primary} /> : <BookmarkPlus size={18} color={COLORS.textSecondary} />}
        </button>

        {/* 하단 신뢰 시그널 오버레이 */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          display: "flex", gap: 4, padding: "6px 8px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
        }}>
          {hasKr && (
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 600, color: "#fff",
              backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
              padding: "2px 7px", borderRadius: 4,
            }}>
              <Languages size={10} />
              {krLabel}
            </span>
          )}
          {hasCoop && (
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 600, color: "#fff",
              backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
              padding: "2px 7px", borderRadius: 4,
            }}>
              <Users size={10} />
              협동
            </span>
          )}
          {hasCtrl && (
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 600, color: "#fff",
              backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
              padding: "2px 7px", borderRadius: 4,
            }}>
              <Gamepad2 size={10} />
              패드
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "10px 14px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {game.titleKo || game.title}
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{game.genre}</div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {game.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} style={{
              fontSize: 10, backgroundColor: "#F3F4F6", color: COLORS.textSecondary,
              padding: "2px 8px", borderRadius: 4, border: "1px solid #ECEEF0",
            }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {game.discountPct > 0 && game.originalPrice && (
              <span style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>
                {game.originalPrice}
              </span>
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: game.free ? "#00A363" : COLORS.textPrimary }}>
              {game.free ? "무료" : game.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
