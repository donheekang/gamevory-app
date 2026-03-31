import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Flame, Star, Zap, Sparkles, ChevronRight, Languages, Users, Gamepad2, Clock, Calendar, Award, Filter, X, Heart, User, Home, Laptop, Globe, Tag, ArrowRight, TreePine } from "lucide-react";
import { SearchHero } from "../components/SearchHero";
import { GameDetail } from "../components/GameDetail";
import { COLORS } from "../styles/theme";
import { useSavedGames } from "../hooks/useSavedGames";
import { useRawgTrending } from "../hooks/useRawgTrending";
import { GAMES, SITUATIONS } from "../data/games";

const handleImgError = (e) => {
  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='100%25' height='100%25' fill='%23E8EAED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23B0B8C1' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
};

// ========== 공통 컴포넌트 ==========
const TrustBadges = ({ game, size = "sm" }) => {
  const fontSize = size === "lg" ? 10 : 9;
  const iconSize = size === "lg" ? 10 : 8;
  const padding = size === "lg" ? "2px 7px" : "1px 5px";
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {game.kr && (game.kr.ui || game.kr.sub) && (
        <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize, fontWeight: 600, color: "#fff", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding, borderRadius: 3 }}>
          <Languages size={iconSize} /> 한국어
        </span>
      )}
      {(game.feat?.coop || game.feat?.localCoop) && (
        <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize, fontWeight: 600, color: "#fff", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding, borderRadius: 3 }}>
          <Users size={iconSize} /> 협동
        </span>
      )}
      {game.feat?.ctrl === "full" && (
        <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize, fontWeight: 600, color: "#fff", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding, borderRadius: 3 }}>
          <Gamepad2 size={iconSize} /> 패드
        </span>
      )}
    </div>
  );
};

const PriceTag = ({ game, size = "sm" }) => {
  if (!game.price || game.price === "가격 확인" || game.price === "Steam에서 확인") return null;
  const fontSize = size === "lg" ? 14 : 11;
  const color = game.free ? "#00A363" : game.discountPct > 0 ? "#B04A2F" : COLORS.textPrimary;
  return <span style={{ fontSize, fontWeight: 700, color }}>{game.price}</span>;
};

const DiscountBadge = ({ game, position = "absolute" }) => {
  if (game.free && !game.discountPct) {
    return <div style={{ position, top: 8, left: 8, backgroundColor: "#00C073", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#fff" }}>무료</div>;
  }
  if (game.discountPct > 0) {
    return <div style={{ position, top: 8, left: 8, backgroundColor: "#4C6B22", color: "#A4D007", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800 }}>-{game.discountPct}%</div>;
  }
  return null;
};

const ScoreBadge = ({ score, style = {} }) => {
  if (!score) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.7)", padding: "3px 8px", borderRadius: 6, ...style }}>
      <Star size={10} fill="#FFD700" stroke="#FFD700" />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{score}</span>
    </div>
  );
};

// ========== 게임 카드 ==========
const GameCardCompact = ({ game, onSelect }) => (
  <div onClick={() => onSelect(game)}
    style={{
      borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
      border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
    <div style={{ position: "relative", paddingTop: "56%" }}>
      <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "12px 8px 6px" }}>
        <TrustBadges game={game} />
      </div>
      <DiscountBadge game={game} />
      <div style={{ position: "absolute", top: 8, right: 8 }}><ScoreBadge score={game.score} /></div>
    </div>
    <div style={{ padding: "10px 12px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {game.titleKo || game.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre}</span>
        <PriceTag game={game} />
      </div>
      {game.playtime && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}><Clock size={9} /> {game.playtime}</div>}
    </div>
  </div>
);

// ============================================================
// 섹션 1: 상황형 큐레이션 — 3열 카드, 대표 이미지 배경
// ============================================================
const SituationCurationSection = () => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 4px" }}>이런 상황이면 이 게임</h2>
          <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0 }}>태그 뒤지지 말고, 상황으로 찾으세요</p>
        </div>
        <button onClick={() => navigate("/curation")}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.color = COLORS.textSecondary; }}>
          전체보기 <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="situation-grid">
        {SITUATIONS.map(situation => {
          const matchedGames = GAMES.filter(situation.filters).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6);
          const heroGame = matchedGames[0];

          return (
            <div key={situation.id}
              onClick={() => navigate(`/curation?situation=${situation.id}`)}
              style={{
                position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer",
                height: 180, transition: "all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              {/* 배경 이미지 */}
              {heroGame && (
                <img src={heroGame.image} alt="" onError={handleImgError}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${situation.color}DD 0%, ${situation.color}99 40%, rgba(0,0,0,0.6) 100%)` }} />

              {/* 내용 */}
              <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px 16px" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.35, marginBottom: 4, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                    {situation.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    {situation.desc}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* 미니 썸네일 */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {matchedGames.slice(0, 4).map(g => (
                      <img key={g.id} src={g.image} alt="" onError={handleImgError}
                        style={{ width: 36, height: 22, borderRadius: 4, objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)" }} />
                    ))}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                    borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{matchedGames.length}개</span>
                    <ChevronRight size={12} color="#fff" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 섹션 2: 인기 조건 — 2열 그리드 칩 (아이콘 제거, 숫자 강조)
// ============================================================
const POPULAR_CONDITIONS = [
  { label: "한글 + 스토리 RPG", color: "#4361EE",
    filter: (g) => g.kr?.ui && ((g.genre || "").includes("RPG") || g.tags?.some(t => t.includes("스토리"))) },
  { label: "2인 로컬 협동", color: "#FF6B6B",
    filter: (g) => g.feat?.localCoop },
  { label: "패드로 즐기는 게임", color: "#6C5CE7",
    filter: (g) => g.feat?.ctrl === "full" },
  { label: "세일 / 할인 중", color: "#00C073",
    filter: (g) => g.discountPct > 0 || g.free },
  { label: "혼자 몰입 가능", color: "#4361EE",
    filter: (g) => g.feat?.sp && (g.tags?.some(t => t.includes("몰입") || t.includes("스토리")) || (g.genre || "").includes("RPG")) },
  { label: "짧고 강렬한", color: "#FF6F61",
    filter: (g) => { const pt = g.playtime || ""; const m = pt.match(/(\d+)/); return m && parseInt(m[1]) <= 12; } },
];

const PopularConditionsSection = ({ onSelect }) => {
  const [selectedCondition, setSelectedCondition] = useState(null);

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 4px" }}>인기 조건으로 찾기</h2>
        <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0 }}>다른 유저들이 많이 찾는 조건이에요</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="condition-chip-grid">
        {POPULAR_CONDITIONS.map((cond, i) => {
          const games = GAMES.filter(cond.filter);
          const isSelected = selectedCondition === i;
          return (
            <button key={i} onClick={() => setSelectedCondition(isSelected ? null : i)}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: isSelected ? `2px solid ${cond.color}` : `1px solid ${COLORS.borderLight}`,
                background: isSelected ? `${cond.color}08` : COLORS.bg,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: isSelected ? `0 4px 16px ${cond.color}15` : "none",
              }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = `${cond.color}50`; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.transform = "none"; } }}>
              <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 600, color: isSelected ? cond.color : COLORS.textPrimary }}>{cond.label}</span>
              <span style={{
                fontSize: 13, fontWeight: 800, color: isSelected ? cond.color : COLORS.textMuted,
                backgroundColor: isSelected ? `${cond.color}15` : COLORS.bgGray,
                padding: "2px 10px", borderRadius: 20, minWidth: 32, textAlign: "center",
              }}>{games.length}</span>
            </button>
          );
        })}
      </div>

      {/* 선택된 조건의 게임 */}
      {selectedCondition !== null && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="condition-game-grid">
          {GAMES.filter(POPULAR_CONDITIONS[selectedCondition].filter)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 6)
            .map(game => (
              <GameCardCompact key={game.id} game={game} onSelect={onSelect} />
            ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 섹션 3: 할인 하이라이트 — 가로 스크롤, 카드 크게
// ============================================================
const SaleHighlightSection = ({ onSelect }) => {
  const saleGames = GAMES.filter(g => g.discountPct > 0).sort((a, b) => b.discountPct - a.discountPct).slice(0, 8);
  if (saleGames.length === 0) return null;

  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 4px" }}>지금 할인 중</h2>
          <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0 }}>놓치면 아까운 할인 게임 {saleGames.length}개</p>
        </div>
        <button onClick={() => navigate("/sale")}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#00C073"; e.currentTarget.style.color = "#00C073"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.color = COLORS.textSecondary; }}>
          전체보기 <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "4px 4px 12px", margin: "0 -4px", scrollbarWidth: "thin" }}>
        {saleGames.map(game => {
          const savings = parseInt((game.originalPrice || "0").replace(/[^\d]/g, "")) - parseInt((game.price || "0").replace(/[^\d]/g, ""));
          return (
            <div key={game.id} onClick={() => onSelect(game)}
              style={{
                flex: "0 0 auto", width: 220, borderRadius: 14, overflow: "hidden",
                cursor: "pointer", transition: "all 0.2s",
                border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
              <div style={{ position: "relative", paddingTop: "56%" }}>
                <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <DiscountBadge game={game} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "12px 8px 6px" }}>
                  <TrustBadges game={game} />
                </div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                  {game.titleKo || game.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: COLORS.textMuted, textDecoration: "line-through" }}>{game.originalPrice}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#B04A2F" }}>{game.price}</span>
                </div>
                {savings > 0 && (
                  <div style={{ fontSize: 10, color: "#00C073", fontWeight: 600, marginTop: 2 }}>{savings.toLocaleString()}원 절약</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 필터 결과 섹션
// ============================================================
const FilterResultsSection = ({ games, label, onSelect, onClear }) => {
  if (!games || games.length === 0) return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>"{label}" 결과</h2>
        <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer" }}>
          <X size={12} /> 초기화
        </button>
      </div>
      <div style={{ textAlign: "center", padding: "48px 20px", backgroundColor: COLORS.bgGray, borderRadius: 16, color: COLORS.textMuted, fontSize: 14 }}>
        조건에 맞는 게임이 없습니다. 조건을 변경해 보세요.
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>"{label}" 추천 결과</h2>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, backgroundColor: `${COLORS.primary}12`, padding: "3px 10px", borderRadius: 20 }}>{games.length}개</span>
        </div>
        <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer" }}>
          <X size={12} /> 초기화
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="filter-grid">
        {games.map(game => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
            <div style={{ position: "relative", paddingTop: "50%" }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "12px 8px 6px" }}>
                <TrustBadges game={game} />
              </div>
              <DiscountBadge game={game} />
              <div style={{ position: "absolute", top: 8, right: 8 }}><ScoreBadge score={game.score} /></div>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {game.titleKo || game.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre}</span>
                <PriceTag game={game} />
              </div>
              {game.matchReasons && game.matchReasons[0] && (
                <div style={{ fontSize: 10, color: COLORS.primary, marginTop: 4, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {game.matchReasons[0]}
                </div>
              )}
              {game.playtime && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}><Clock size={9} /> {game.playtime}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 메인 페이지
// ============================================================
export const HomePage = ({ searchQuery: externalSearchQuery, setSearchQuery: externalSetSearchQuery }) => {
  const { isSaved, toggleSave } = useSavedGames();
  const { trending, topRated, upcoming, recent } = useRawgTrending({ pageSize: 6 });
  const [selectedGame, setSelectedGame] = useState(null);
  const [filterResults, setFilterResults] = useState(null);

  const handleFilterResults = (games, label) => {
    setFilterResults({ games, label });
    setTimeout(() => {
      document.getElementById("filter-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div style={{ backgroundColor: COLORS.bg }}>
      <SearchHero searchQuery={externalSearchQuery} setSearchQuery={externalSetSearchQuery} games={GAMES} onSelectGame={setSelectedGame} onFilterResults={handleFilterResults} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 24px 40px" }}>

        {/* 필터 결과 */}
        {filterResults && (
          <div id="filter-results">
            <FilterResultsSection
              games={filterResults.games}
              label={filterResults.label}
              onSelect={setSelectedGame}
              onClear={() => setFilterResults(null)}
            />
          </div>
        )}

        {/* 섹션 1: 상황형 큐레이션 */}
        <SituationCurationSection />

        {/* 구분선 */}
        <div style={{ height: 1, backgroundColor: COLORS.borderLight, margin: "0 0 48px" }} />

        {/* 섹션 2: 인기 조건 */}
        <PopularConditionsSection onSelect={setSelectedGame} />

        {/* 구분선 */}
        <div style={{ height: 1, backgroundColor: COLORS.borderLight, margin: "0 0 48px" }} />

        {/* 섹션 3: 할인 하이라이트 */}
        <SaleHighlightSection onSelect={setSelectedGame} />

        {/* 푸터 */}
        <div style={{
          textAlign: "center", padding: "40px 0 20px",
          borderTop: `1px solid ${COLORS.borderLight}`,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 6 }}>
            GameVory
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
            지금 내 상황에 맞는 게임을 빠르게 찾는<br />한국어 게임 탐색 서비스
          </div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 10 }}>
            50,000+ 게임 데이터 기반 · 실시간 할인 정보 반영
          </div>
        </div>
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1024px) {
          .situation-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .situation-grid {
            grid-template-columns: 1fr !important;
          }
          .condition-chip-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .condition-game-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .filter-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};
