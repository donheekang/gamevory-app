import { useState } from "react";
import { TrendingUp, Flame, Star, Zap, Sparkles, ChevronRight } from "lucide-react";
import { SearchHero } from "../components/SearchHero";
import { GameDetail } from "../components/GameDetail";
import { COLORS } from "../styles/theme";
import { useSavedGames } from "../hooks/useSavedGames";
import { useRawgTrending } from "../hooks/useRawgTrending";
import { GAMES } from "../data/games";

const handleImgError = (e) => {
  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='100%' height='100%' fill='%23E8EAED'/%3E%3C/svg%3E";
};

// 가로 스크롤 게임 섹션
const GameScrollSection = ({ title, icon, color, games, onSelect, badge }) => {
  if (!games || games.length === 0) return null;
  const Icon = icon;
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: color }} />
        <Icon size={18} color={color} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>{title}</h2>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: color, padding: "2px 8px", borderRadius: 6 }}>{badge}</span>}
      </div>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
        {games.map(game => (
          <div key={game.id} onClick={() => onSelect(game)}
            style={{
              flex: "0 0 auto", width: 200, borderRadius: 14, overflow: "hidden",
              backgroundColor: COLORS.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              cursor: "pointer", transition: "all 0.2s", border: `1px solid ${COLORS.borderLight}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ position: "relative", paddingTop: "56%" }}>
              <img onError={handleImgError} src={game.image} alt={game.titleKo || game.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              {game.score && (
                <div style={{
                  position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 3,
                  backgroundColor: "rgba(0,0,0,0.7)", padding: "3px 8px", borderRadius: 6,
                }}>
                  <Star size={10} fill="#FFD700" stroke="#FFD700" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{game.score}</span>
                </div>
              )}
              {game.free && (
                <div style={{
                  position: "absolute", top: 8, left: 8, backgroundColor: "#00C073",
                  padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#fff",
                }}>무료</div>
              )}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.titleKo || game.title}</div>
              {game.titleKo && game.titleKo !== game.title && (
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.title}</div>
              )}
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{game.genre ? game.genre.slice(0, 25) : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 큐레이션 미리보기 (하드코딩 추천 3개)
const CurationPreview = ({ games, onSelect }) => {
  const picks = games.filter(g => g.score >= 90).slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: COLORS.primary }} />
          <Sparkles size={18} color={COLORS.primary} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>GameVory 에디터 추천</h2>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: COLORS.primary, padding: "2px 8px", borderRadius: 6 }}>큐레이션</span>
        </div>
        <a href="#/curation" style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          전체보기 <ChevronRight size={14} />
        </a>
      </div>
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
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }} />
              <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
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

export const HomePage = ({ searchQuery: externalSearchQuery, setSearchQuery: externalSetSearchQuery }) => {
  const { isSaved, toggleSave } = useSavedGames();
  const { trending, topRated, upcoming, recent, loading: rawgLoading } = useRawgTrending({ pageSize: 6 });
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <div style={{ backgroundColor: COLORS.bg }}>
      <SearchHero searchQuery={externalSearchQuery} setSearchQuery={externalSetSearchQuery} games={GAMES} onSelectGame={setSelectedGame} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", marginBottom: 40 }}>

        {/* 스켈레톤 로딩 */}
        {rawgLoading && (
          <div>
            {[1, 2].map(section => (
              <div key={section} style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                  <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: COLORS.borderLight }} />
                  <div style={{ width: 140, height: 20, borderRadius: 6, backgroundColor: COLORS.bgGray, animation: "pulse 1.5s infinite" }} />
                </div>
                <div style={{ display: "flex", gap: 14, overflowX: "hidden" }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ flex: "0 0 auto", width: 200, borderRadius: 14, overflow: "hidden", border: `1px solid ${COLORS.borderLight}` }}>
                      <div style={{ paddingTop: "56%", backgroundColor: COLORS.bgGray, animation: "pulse 1.5s infinite" }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ width: "80%", height: 14, borderRadius: 4, backgroundColor: COLORS.bgGray, marginBottom: 6, animation: "pulse 1.5s infinite" }} />
                        <div style={{ width: "50%", height: 10, borderRadius: 4, backgroundColor: COLORS.bgGray, animation: "pulse 1.5s infinite" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RAWG 메인 섹션들 */}
        {!rawgLoading && (
          <>
            <GameScrollSection title="지금 뜨는 게임" icon={Flame} color="#FF6F61" games={trending} onSelect={setSelectedGame} badge="실시간" />

            {/* 에디터 추천 (하드코딩 49개 중 명작만 미리보기) */}
            <CurationPreview games={GAMES} onSelect={setSelectedGame} />

            <GameScrollSection title="최근 출시 신작" icon={Zap} color="#6C5CE7" games={recent} onSelect={setSelectedGame} badge="신작" />
            <GameScrollSection title="올해 최고 평점" icon={Star} color="#FFB800" games={topRated} onSelect={setSelectedGame} />
            <GameScrollSection title="출시 예정작" icon={TrendingUp} color="#00C073" games={upcoming} onSelect={setSelectedGame} badge="예정" />
          </>
        )}

        <div style={{ textAlign: "center", padding: "32px 0", color: COLORS.textMuted, fontSize: 12 }}>
          GameVory · 실시간 게임 데이터 기반 · 50,000+ 게임 탐색 가능
        </div>
      </div>

      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} isSaved={isSaved(selectedGame.id)} onToggleSave={toggleSave} />
      )}
    </div>
  );
};
