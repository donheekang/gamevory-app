import { useState } from "react";
import { TrendingUp, Flame, Star, Zap, Sparkles, ChevronRight, Languages, Users, Gamepad2, Clock, Calendar, Award, Filter, X } from "lucide-react";
import { SearchHero } from "../components/SearchHero";
import { GameDetail } from "../components/GameDetail";
import { COLORS } from "../styles/theme";
import { useSavedGames } from "../hooks/useSavedGames";
import { useRawgTrending } from "../hooks/useRawgTrending";
import { GAMES } from "../data/games";

const handleImgError = (e) => {
  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='100%25' height='100%25' fill='%23E8EAED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23B0B8C1' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
};

// 신뢰 시그널 뱃지 (공통)
const TrustBadges = ({ game, size = "sm" }) => {
  const fontSize = size === "lg" ? 10 : 9;
  const iconSize = size === "lg" ? 10 : 8;
  const padding = size === "lg" ? "2px 7px" : "1px 5px";
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {game.kr && (game.kr.ui || game.kr.sub) && (
        <span style={{
          display: "flex", alignItems: "center", gap: 2,
          fontSize, fontWeight: 600, color: "#fff",
          backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          padding, borderRadius: 3,
        }}>
          <Languages size={iconSize} /> 한국어
        </span>
      )}
      {(game.feat?.coop || game.feat?.localCoop) && (
        <span style={{
          display: "flex", alignItems: "center", gap: 2,
          fontSize, fontWeight: 600, color: "#fff",
          backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          padding, borderRadius: 3,
        }}>
          <Users size={iconSize} /> 협동
        </span>
      )}
      {game.feat?.ctrl === "full" && (
        <span style={{
          display: "flex", alignItems: "center", gap: 2,
          fontSize, fontWeight: 600, color: "#fff",
          backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          padding, borderRadius: 3,
        }}>
          <Gamepad2 size={iconSize} /> 패드
        </span>
      )}
    </div>
  );
};

// 가격 표시 (공통) — RAWG 카드에서 "가격 확인" 숨김
const PriceTag = ({ game, size = "sm" }) => {
  if (!game.price || game.price === "가격 확인" || game.price === "Steam에서 확인") return null;
  const fontSize = size === "lg" ? 14 : 11;
  const color = game.free ? "#00A363" : game.discountPct > 0 ? "#B04A2F" : COLORS.textPrimary;
  return (
    <span style={{ fontSize, fontWeight: 700, color }}>{game.price}</span>
  );
};

// 할인 뱃지 (공통)
const DiscountBadge = ({ game, position = "absolute" }) => {
  if (game.free && !game.discountPct) {
    return (
      <div style={{
        position, top: 8, left: 8, backgroundColor: "#00C073",
        padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#fff",
      }}>무료</div>
    );
  }
  if (game.discountPct > 0) {
    return (
      <div style={{
        position, top: 8, left: 8,
        backgroundColor: "#4C6B22", color: "#A4D007",
        padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800,
      }}>-{game.discountPct}%</div>
    );
  }
  return null;
};

// 점수 뱃지 (공통)
const ScoreBadge = ({ score, style = {} }) => {
  if (!score) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 3,
      backgroundColor: "rgba(0,0,0,0.7)", padding: "3px 8px", borderRadius: 6,
      ...style,
    }}>
      <Star size={10} fill="#FFD700" stroke="#FFD700" />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{score}</span>
    </div>
  );
};

// 섹션 헤더 (공통)
const SectionHeader = ({ title, icon: Icon, color, badge, moreLink }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: color }} />
      <Icon size={18} color={color} />
      <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>{title}</h2>
      {badge && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: color, padding: "2px 8px", borderRadius: 6 }}>{badge}</span>}
    </div>
    {moreLink && (
      <a href={moreLink} style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
        전체보기 <ChevronRight size={14} />
      </a>
    )}
  </div>
);

// ============================================================
// 1. 지금 뜨는 게임 — TOP 순위 가로 스크롤 카드
// ============================================================
const TrendingHeroSection = ({ games, onSelect }) => {
  if (!games || games.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="지금 뜨는 게임" icon={Flame} color="#FF6F61" badge="실시간" />
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
        {games.slice(0, 8).map((game, idx) => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              flex: "0 0 auto", width: 220, borderRadius: 14, overflow: "hidden",
              cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ position: "relative", paddingTop: "56%" }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              {/* 순위 뱃지 */}
              <div style={{
                position: "absolute", top: 8, left: 8,
                width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: idx < 3 ? "#FF6F61" : "rgba(0,0,0,0.6)",
                color: "#fff", fontSize: 13, fontWeight: 800,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}>
                {idx + 1}
              </div>
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <ScoreBadge score={game.score} />
              </div>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "16px 8px 6px",
              }}>
                <TrustBadges game={game} />
              </div>
              <DiscountBadge game={game} position="absolute" style={{ top: 8, left: 42 }} />
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {game.titleKo || game.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre ? game.genre.slice(0, 15) : ""}</span>
                <PriceTag game={game} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 2. 에디터 추천 큐레이션 — 오버레이 그리드 (기존 유지 + 개선)
// ============================================================
const CurationPreview = ({ games, onSelect }) => {
  const picks = games.filter(g => g.score >= 90).slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="GameVory 에디터 추천" icon={Sparkles} color={COLORS.primary} badge="큐레이션" moreLink="#/curation" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid">
        {picks.map(game => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ position: "relative", paddingTop: "56%" }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }} />
              <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                  <TrustBadges game={game} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{game.titleKo}</div>
              </div>
              {game.score && (
                <div style={{
                  position: "absolute", top: 8, right: 8, backgroundColor: game.score >= 90 ? "#00C073" : "#FFB800",
                  padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#fff",
                }}>{game.score}</div>
              )}
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre}</div>
              {game.discountPct > 0 && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6F61", marginTop: 2 }}>-{game.discountPct}% {game.price}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 3. 최근 출시 신작 — 대형 히어로 (1큰 + 2x2 그리드)
// ============================================================
const RecentReleasesSection = ({ games, onSelect }) => {
  if (!games || games.length === 0) return null;
  // 이미지 있는 게임만 히어로에 배치 (No Image 방지)
  const hasImage = (g) => g.image && g.image.startsWith("http");
  const withImg = games.filter(hasImage);
  const noImg = games.filter(g => !hasImage(g));
  const sorted = [...withImg, ...noImg]; // 이미지 있는 것 우선
  if (sorted.length === 0) return null;
  const hero = sorted[0];
  const side = sorted.slice(1, 5);

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="최근 출시 신작" icon={Zap} color="#6C5CE7" badge="신작" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minHeight: 340 }} className="recent-hero-grid">
        {/* 메인 히어로 카드 */}
        <div onClick={() => onSelect(hero)}
          style={{
            position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer",
            gridRow: "1 / 3", transition: "all 0.25s",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}>
          <img onError={handleImgError} src={hero.image} alt={hero.titleKo || hero.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent 0%, rgba(0,0,0,0.8) 100%)",
            padding: "60px 20px 20px",
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "#6C5CE7", padding: "2px 10px", borderRadius: 6, marginBottom: 8 }}>
              <Zap size={10} color="#fff" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>NEW</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <TrustBadges game={hero} size="lg" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              {hero.titleKo || hero.title}
            </div>
            {hero.titleKo && hero.titleKo !== hero.title && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>{hero.title}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hero.genre && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{hero.genre}</span>}
              <PriceTag game={hero} size="lg" />
            </div>
          </div>
          <DiscountBadge game={hero} />
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <ScoreBadge score={hero.score} />
          </div>
        </div>

        {/* 사이드 카드 2x2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {side.map(game => (
            <div key={game.id} onClick={() => onSelect(game)}
              style={{
                position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: `1px solid ${COLORS.borderLight}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
              <div style={{ position: "relative", paddingTop: "56%" }}>
                <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "4px 6px",
                  display: "flex", gap: 3,
                }}>
                  <TrustBadges game={game} />
                </div>
                <DiscountBadge game={game} />
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <ScoreBadge score={game.score} />
                </div>
              </div>
              <div style={{ padding: "8px 10px", backgroundColor: COLORS.bg }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {game.titleKo || game.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre ? game.genre.slice(0, 15) : ""}</span>
                  <PriceTag game={game} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 4. 올해 최고 평점 — 순위 리스트 (번호 + 가로 바)
// ============================================================
const TopRatedSection = ({ games, onSelect }) => {
  if (!games || games.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="올해 최고 평점" icon={Award} color="#FFB800" />
      <div style={{
        backgroundColor: COLORS.bgGray, borderRadius: 16, padding: 16,
        border: `1px solid ${COLORS.borderLight}`,
      }}>
        {games.slice(0, 5).map((game, idx) => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "10px 8px",
              cursor: "pointer", transition: "all 0.15s", borderRadius: 10,
              borderBottom: idx < Math.min(games.length, 5) - 1 ? `1px solid ${COLORS.borderLight}` : "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = COLORS.bg; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            {/* 순위 */}
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: idx < 3 ? "#FFB800" : COLORS.border,
              color: idx < 3 ? "#fff" : COLORS.textSecondary,
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>
              {idx + 1}
            </div>
            {/* 썸네일 */}
            <div style={{ width: 56, height: 32, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {game.titleKo || game.title}
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre ? game.genre.slice(0, 25) : ""}</div>
            </div>
            {/* 뱃지 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <TrustBadges game={game} />
              {game.score && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 3, padding: "3px 10px",
                  backgroundColor: game.score >= 90 ? "#00C073" : game.score >= 75 ? "#FFB800" : COLORS.textMuted,
                  borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#fff",
                }}>
                  <Star size={10} fill="#fff" stroke="#fff" /> {game.score}
                </div>
              )}
              <PriceTag game={game} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 5. 출시 예정작 — 타임라인 스타일 컴팩트 리스트
// ============================================================
const UpcomingSection = ({ games, onSelect }) => {
  if (!games || games.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="출시 예정작" icon={Calendar} color="#00C073" badge="예정" />
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
        {games.map(game => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              flex: "0 0 auto", width: 160, borderRadius: 14, overflow: "hidden",
              backgroundColor: COLORS.bg, border: `1px solid ${COLORS.borderLight}`,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ position: "relative", paddingTop: "75%" }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                padding: "20px 8px 8px",
              }}>
                <TrustBadges game={game} />
              </div>
              {/* 출시 예정 태그 */}
              <div style={{
                position: "absolute", top: 8, left: 8,
                display: "flex", alignItems: "center", gap: 3,
                backgroundColor: "rgba(0,192,115,0.9)", padding: "2px 8px",
                borderRadius: 6, fontSize: 9, fontWeight: 700, color: "#fff",
              }}>
                <Clock size={8} /> 예정
              </div>
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {game.titleKo || game.title}
              </div>
              {game.date && (
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                  <Calendar size={9} /> {game.date}
                </div>
              )}
              {game.genre && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>{game.genre.slice(0, 18)}</div>}
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
// ============================================================
// 필터 결과 섹션
// ============================================================
const FilterResultsSection = ({ games, label, onSelect, onClear }) => {
  if (!games || games.length === 0) return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: COLORS.primary }} />
          <Filter size={18} color={COLORS.primary} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>"{label}" 결과</h2>
        </div>
        <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer" }}>
          <X size={12} /> 필터 해제
        </button>
      </div>
      <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: COLORS.bgGray, borderRadius: 16, color: COLORS.textMuted, fontSize: 14 }}>
        조건에 맞는 게임이 없습니다. 필터를 변경해 보세요.
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: COLORS.primary }} />
          <Filter size={18} color={COLORS.primary} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>"{label}" 추천</h2>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: COLORS.primary, padding: "2px 8px", borderRadius: 6 }}>{games.length}개</span>
        </div>
        <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer" }}>
          <X size={12} /> 필터 해제
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="filter-grid">
        {games.map(game => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
              border: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.bg,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ position: "relative", paddingTop: "50%" }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "12px 8px 6px" }}>
                <TrustBadges game={game} />
              </div>
              <DiscountBadge game={game} />
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <ScoreBadge score={game.score} />
              </div>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {game.titleKo || game.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre}</span>
                <PriceTag game={game} />
              </div>
              {game.playtime && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{game.playtime}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HomePage = ({ searchQuery: externalSearchQuery, setSearchQuery: externalSetSearchQuery }) => {
  const { isSaved, toggleSave } = useSavedGames();
  const { trending, topRated, upcoming, recent } = useRawgTrending({ pageSize: 6 });
  const [selectedGame, setSelectedGame] = useState(null);
  const [filterResults, setFilterResults] = useState(null); // { games: [], label: "" }

  const handleFilterResults = (games, label) => {
    setFilterResults({ games, label });
    // 스크롤 이동
    setTimeout(() => {
      document.getElementById("filter-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div style={{ backgroundColor: COLORS.bg }}>
      <SearchHero searchQuery={externalSearchQuery} setSearchQuery={externalSetSearchQuery} games={GAMES} onSelectGame={setSelectedGame} onFilterResults={handleFilterResults} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", marginBottom: 40 }}>

        {/* 필터 결과 (칩 선택 시) */}
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

        {/* 메인 섹션들 — 로컬 DB 즉시 표시 + RAWG 백그라운드 보강 */}
        <RecentReleasesSection games={recent} onSelect={setSelectedGame} />
        <TrendingHeroSection games={trending} onSelect={setSelectedGame} />
        <CurationPreview games={GAMES} onSelect={setSelectedGame} />
        <TopRatedSection games={topRated} onSelect={setSelectedGame} />
        <UpcomingSection games={upcoming} onSelect={setSelectedGame} />

        <div style={{ textAlign: "center", padding: "32px 0", color: COLORS.textMuted, fontSize: 12 }}>
          GameVory · 실시간 게임 데이터 기반 · 50,000+ 게임 탐색 가능
        </div>
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}

      {/* 반응형 스타일 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .recent-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .recent-hero-grid > div:first-child {
            grid-row: auto !important;
            min-height: 200px !important;
          }
          .recent-hero-grid > div:last-child {
            grid-template-columns: 1fr 1fr !important;
          }
          .responsive-grid {
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
