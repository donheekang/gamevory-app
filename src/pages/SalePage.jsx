import { useState, useEffect } from "react";
import { Tag, Flame, Calendar, Gift, Clock, ChevronRight, Star, Languages, Users, Gamepad2 } from "lucide-react";
import { COLORS } from "../styles/theme";
import { GameDetail } from "../components/GameDetail";
import { useSavedGames } from "../hooks/useSavedGames";
import { GAMES } from "../data/games";
import { searchGames, rawgToGameVory } from "../api/rawg";

const handleImgError = (e) => {
  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='100%25' height='100%25' fill='%23E8EAED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23B0B8C1' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
};

// ========== 세일 게임 카드 (할인 특화) ==========
const SaleGameCard = ({ game, onSelect }) => {
  const savings = parseInt((game.originalPrice || "0").replace(/[^\d]/g, "")) - parseInt((game.price || "0").replace(/[^\d]/g, ""));

  return (
    <div onClick={() => onSelect(game)}
      style={{
        display: "flex", gap: 14, padding: 14, borderRadius: 14,
        border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
        cursor: "pointer", transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = `${COLORS.primary}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = COLORS.borderLight; }}>

      {/* 썸네일 */}
      <div style={{ position: "relative", width: 140, minHeight: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
        <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {game.discountPct > 0 && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            backgroundColor: "#4C6B22", color: "#A4D007",
            padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 800,
          }}>-{game.discountPct}%</div>
        )}
        {/* 신뢰 시그널 */}
        <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", gap: 2 }}>
          {game.kr && (game.kr.ui || game.kr.sub) && (
            <span style={{ display: "flex", alignItems: "center", gap: 1, fontSize: 8, fontWeight: 600, color: "#fff", backgroundColor: "rgba(0,0,0,0.5)", padding: "1px 4px", borderRadius: 2 }}>
              <Languages size={7} /> 한국어
            </span>
          )}
          {(game.feat?.coop || game.feat?.localCoop) && (
            <span style={{ display: "flex", alignItems: "center", gap: 1, fontSize: 8, fontWeight: 600, color: "#fff", backgroundColor: "rgba(0,0,0,0.5)", padding: "1px 4px", borderRadius: 2 }}>
              <Users size={7} /> 협동
            </span>
          )}
        </div>
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {game.titleKo || game.title}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{game.genre}</div>

        {/* 가격 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted, textDecoration: "line-through" }}>{game.originalPrice}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#B04A2F" }}>{game.price}</span>
        </div>
        {savings > 0 && (
          <div style={{ fontSize: 11, color: "#00C073", fontWeight: 600, marginTop: 2 }}>
            {savings.toLocaleString()}원 절약
          </div>
        )}
      </div>

      {/* 점수 */}
      {game.score && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            backgroundColor: game.score >= 90 ? "#00C073" : game.score >= 75 ? "#FFB800" : COLORS.bgGray,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: game.score >= 75 ? "#fff" : COLORS.textSecondary }}>{game.score}</span>
          </div>
          <span style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>평점</span>
        </div>
      )}
    </div>
  );
};

// ========== 무료 게임 카드 ==========
const FreeGameCard = ({ game, onSelect }) => (
  <div onClick={() => onSelect(game)}
    style={{
      borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
      border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
    <div style={{ position: "relative", paddingTop: "56%" }}>
      <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{
        position: "absolute", top: 8, left: 8, backgroundColor: "#00C073",
        padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#fff",
      }}>무료</div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent, rgba(0,0,0,0.5))", padding: "12px 8px 6px",
        display: "flex", gap: 3,
      }}>
        {game.kr && (game.kr.ui || game.kr.sub) && (
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 9, fontWeight: 600, color: "#fff", backgroundColor: "rgba(0,0,0,0.4)", padding: "1px 5px", borderRadius: 3 }}>
            <Languages size={8} /> 한국어
          </span>
        )}
      </div>
    </div>
    <div style={{ padding: "10px 12px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {game.titleKo || game.title}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{game.genre}</div>
    </div>
  </div>
);

// ========== 월별 세일 섹션 ==========
const MonthlySaleSection = ({ month, label, sublabel, color, icon: Icon, games, sortBy, onSelect }) => {
  const sortFn = (a, b) => {
    if (sortBy === "discount") return (b.discountPct || 0) - (a.discountPct || 0);
    if (sortBy === "price") return parseInt((a.price || "0").replace(/[^\d]/g, "")) - parseInt((b.price || "0").replace(/[^\d]/g, ""));
    return (b.score || 0) - (a.score || 0);
  };
  const sorted = [...games].sort(sortFn);

  const totalSavings = games.reduce((sum, g) => {
    const orig = parseInt((g.originalPrice || "0").replace(/[^\d]/g, ""));
    const curr = parseInt((g.price || "0").replace(/[^\d]/g, ""));
    return sum + (orig - curr);
  }, 0);

  if (sorted.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      {/* 월별 헤더 */}
      <div style={{
        padding: "20px 24px", borderRadius: 16, marginBottom: 16,
        background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        border: `1px solid ${color}20`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: color }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>{label}</h2>
                {sublabel && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: color, padding: "2px 8px", borderRadius: 6 }}>{sublabel}</span>}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>
                {sorted.length}개 게임 할인 중 · 최대 {Math.max(...games.map(g => g.discountPct || 0))}% 할인
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color }}>
              {totalSavings.toLocaleString()}원
            </div>
            <div style={{ fontSize: 10, color: COLORS.textMuted }}>절약 가능</div>
          </div>
        </div>
      </div>

      {/* 게임 리스트 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }} className="sale-grid">
        {sorted.map(game => (
          <SaleGameCard key={game.id} game={game} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

// ========== 메인 ==========
export const SalePage = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [sortBy, setSortBy] = useState("discount");
  const { isSaved, toggleSave } = useSavedGames();
  const [f2pGames, setF2pGames] = useState([]);
  const [f2pLoading, setF2pLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchF2P = async () => {
      setF2pLoading(true);
      try {
        const result = await searchGames("free to play", { pageSize: 20, ordering: "-added" });
        const f2pFiltered = (result?.results || []).filter(g => g.tags?.some(t => t.slug === "free-to-play")).slice(0, 8);
        if (!cancelled && f2pFiltered.length > 0) {
          setF2pGames(f2pFiltered.map(g => {
            const converted = rawgToGameVory(g);
            return { ...converted, free: true, price: "무료" };
          }));
        }
      } catch (err) {
        console.error("F2P fetch failed:", err);
      } finally {
        if (!cancelled) setF2pLoading(false);
      }
    };
    fetchF2P();
    return () => { cancelled = true; };
  }, []);

  // 월별 분류
  const marchSales = GAMES.filter(g => g.discountPct > 0 && g.saleMonth === "2026-03");
  const aprilSales = GAMES.filter(g => g.discountPct > 0 && g.saleMonth === "2026-04");
  const hardcodedFree = GAMES.filter(g => g.free);

  const allSaleCount = marchSales.length + aprilSales.length;
  const allFreeCount = f2pGames.length + hardcodedFree.length;
  const totalSavings = [...marchSales, ...aprilSales].reduce((sum, g) => {
    const orig = parseInt((g.originalPrice || "0").replace(/[^\d]/g, ""));
    const curr = parseInt((g.price || "0").replace(/[^\d]/g, ""));
    return sum + (orig - curr);
  }, 0);

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.textPrimary, margin: "0 0 6px" }}>세일 & 무료</h1>
          <p style={{ fontSize: 14, color: COLORS.textSecondary, margin: 0 }}>
            할인 {allSaleCount}개 · 무료 {allFreeCount}개 · 최대 {totalSavings.toLocaleString()}원 절약 가능
          </p>
        </div>

        {/* 정렬 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[
            { key: "discount", label: "할인율순" },
            { key: "price", label: "가격 낮은순" },
            { key: "score", label: "평점순" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setSortBy(opt.key)}
              style={{
                padding: "8px 18px", borderRadius: 20,
                border: sortBy === opt.key ? `1.5px solid ${COLORS.primary}` : `1px solid ${COLORS.borderLight}`,
                cursor: "pointer", fontSize: 13, fontWeight: sortBy === opt.key ? 700 : 500,
                backgroundColor: sortBy === opt.key ? COLORS.primaryLight : COLORS.bg,
                color: sortBy === opt.key ? COLORS.primary : COLORS.textSecondary,
                transition: "all 0.15s",
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* 3월 세일 */}
        <MonthlySaleSection
          month="2026-03"
          label="3월 세일"
          sublabel="진행 중"
          color="#FF6F61"
          icon={Flame}
          games={marchSales}
          sortBy={sortBy}
          onSelect={setSelectedGame}
        />

        {/* 4월 세일 */}
        <MonthlySaleSection
          month="2026-04"
          label="4월 세일"
          sublabel="곧 시작"
          color="#6C5CE7"
          icon={Calendar}
          games={aprilSales}
          sortBy={sortBy}
          onSelect={setSelectedGame}
        />

        {/* 무료 게임 */}
        {(hardcodedFree.length > 0 || f2pGames.length > 0) && (
          <div style={{ marginBottom: 40 }}>
            <div style={{
              padding: "20px 24px", borderRadius: 16, marginBottom: 16,
              background: "linear-gradient(135deg, #00C07312, #00C07306)",
              border: "1px solid #00C07320",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: "#00C073" }} />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>무료 게임</h2>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>
                    {hardcodedFree.length + f2pGames.length}개 무료 게임
                  </div>
                </div>
              </div>
            </div>

            {/* 에디터 추천 무료 */}
            {hardcodedFree.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 10 }}>에디터 추천</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="free-grid">
                  {hardcodedFree.map(game => (
                    <FreeGameCard key={game.id} game={game} onSelect={setSelectedGame} />
                  ))}
                </div>
              </div>
            )}

            {/* RAWG 인기 무료 */}
            {f2pLoading && (
              <div style={{ textAlign: "center", padding: "16px", color: COLORS.textMuted, fontSize: 12 }}>
                인기 무료 게임 불러오는 중...
              </div>
            )}
            {f2pGames.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 10 }}>인기 무료</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="free-grid">
                  {f2pGames.map(game => (
                    <FreeGameCard key={game.id} game={game} onSelect={setSelectedGame} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .sale-grid {
            grid-template-columns: 1fr !important;
          }
          .free-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};
