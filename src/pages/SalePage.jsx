import { useState, useEffect } from "react";
import { Tag, Flame, Calendar, Gift, ArrowDown } from "lucide-react";
import { COLORS } from "../styles/theme";
import { GameCard } from "../components/GameCard";
import { GameDetail } from "../components/GameDetail";
import { useSavedGames } from "../hooks/useSavedGames";
import { GAMES } from "../data/games";
import { searchGames, rawgToGameVory } from "../api/rawg";

export const SalePage = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [sortBy, setSortBy] = useState("discount");
  const { isSaved, toggleSave } = useSavedGames();
  const [f2pGames, setF2pGames] = useState([]);
  const [f2pLoading, setF2pLoading] = useState(true);

  // RAWG에서 무료 게임 로드
  useEffect(() => {
    let cancelled = false;
    const fetchF2P = async () => {
      setF2pLoading(true);
      try {
        // RAWG 인기 게임에서 F2P 필터링 (프록시 자동 분기)
        const result = await searchGames("free to play", { pageSize: 20, ordering: "-added" });
        const f2pFiltered = (result?.results || []).filter(g => g.tags?.some(t => t.slug === "free-to-play")).slice(0, 12);
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

  // 하드코딩 게임 세일 데이터
  const now = new Date().toISOString().slice(0, 7);
  const currentSales = GAMES.filter(g => g.discountPct > 0 && g.saleMonth <= now);
  const upcomingSales = GAMES.filter(g => g.discountPct > 0 && g.saleMonth > now);
  const hardcodedFree = GAMES.filter(g => g.free);

  const sortFn = (a, b) => {
    if (sortBy === "discount") return (b.discountPct || 0) - (a.discountPct || 0);
    if (sortBy === "price") return parseInt((a.price || "0").replace(/[^\d]/g, "")) - parseInt((b.price || "0").replace(/[^\d]/g, ""));
    return (b.score || 0) - (a.score || 0);
  };

  const sortedCurrent = [...currentSales].sort(sortFn);
  const sortedUpcoming = [...upcomingSales].sort(sortFn);

  const totalSavings = [...currentSales, ...upcomingSales].reduce((sum, g) => {
    const orig = parseInt((g.originalPrice || "0").replace(/[^\d]/g, ""));
    const curr = parseInt((g.price || "0").replace(/[^\d]/g, ""));
    return sum + (orig - curr);
  }, 0);

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Tag size={24} color="#FF6F61" />
            <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.textPrimary, margin: 0 }}>세일 & 무료</h1>
          </div>
          <p style={{ fontSize: 15, color: COLORS.textSecondary, margin: 0 }}>할인 중인 게임과 무료로 즐길 수 있는 게임을 모아봤어요</p>
        </div>

        {/* 통계 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }} className="responsive-grid-3">
          <div style={{ padding: "20px", borderRadius: 16, background: "linear-gradient(135deg, #FF6F6115, #FF6F6130)", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FF6F61" }}>{currentSales.length + upcomingSales.length}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>할인 게임</div>
          </div>
          <div style={{ padding: "20px", borderRadius: 16, background: "linear-gradient(135deg, #00C07315, #00C07330)", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#00C073" }}>{f2pGames.length + hardcodedFree.length}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>무료 게임</div>
          </div>
          <div style={{ padding: "20px", borderRadius: 16, background: "linear-gradient(135deg, #6C5CE715, #6C5CE730)", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#6C5CE7" }}>₩{totalSavings.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>최대 절약</div>
          </div>
        </div>

        {/* 정렬 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { key: "discount", label: "할인율순" },
            { key: "price", label: "가격 낮은순" },
            { key: "score", label: "평점순" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setSortBy(opt.key)}
              style={{
                padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: sortBy === opt.key ? 700 : 500,
                backgroundColor: sortBy === opt.key ? COLORS.primaryLight : COLORS.bgGray,
                color: sortBy === opt.key ? COLORS.primary : COLORS.textSecondary,
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* 인기 무료 게임 (RAWG) */}
        {f2pGames.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: "#00C073" }} />
              <Gift size={18} color="#00C073" />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>인기 무료 게임</h2>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: "#00C073", padding: "2px 8px", borderRadius: 6 }}>무료</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="responsive-grid">
              {f2pGames.map(game => (
                <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={isSaved(game.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          </div>
        )}
        {f2pLoading && (
          <div style={{ textAlign: "center", padding: "20px", color: COLORS.textMuted, marginBottom: 20 }}>
            <div style={{ fontSize: 13 }}>무료 게임 로딩 중...</div>
          </div>
        )}

        {/* 하드코딩 무료 */}
        {hardcodedFree.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: "#00C073" }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>에디터 추천 무료 게임</h2>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: COLORS.primary, padding: "2px 8px", borderRadius: 6 }}>큐레이션</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="responsive-grid">
              {hardcodedFree.map(game => (
                <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={isSaved(game.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          </div>
        )}

        {/* 현재 세일 */}
        {sortedCurrent.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: "#FF6F61" }} />
              <Flame size={18} color="#FF6F61" />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>지금 세일 중</h2>
              <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{sortedCurrent.length}개</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="responsive-grid">
              {sortedCurrent.map(game => (
                <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={isSaved(game.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          </div>
        )}

        {/* 예정 세일 */}
        {sortedUpcoming.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: "#6C5CE7" }} />
              <Calendar size={18} color="#6C5CE7" />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>할인 예정</h2>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", backgroundColor: "#6C5CE7", padding: "2px 8px", borderRadius: 6 }}>예정</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="responsive-grid">
              {sortedUpcoming.map(game => (
                <GameCard key={game.id} game={game} onSelect={setSelectedGame} isSaved={isSaved(game.id)} onToggleSave={toggleSave} />
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
