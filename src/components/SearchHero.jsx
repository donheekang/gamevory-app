import { useState, useEffect, useRef } from "react";
import { Search, Star, ExternalLink, Loader2 } from "lucide-react";
import { COLORS } from "../styles/theme";
import { WEEKLY_HOT_IDS } from "../data/games";
import { useRawgSearch } from "../hooks/useRawgSearch";

const handleImgError = (e) => {
  const el = e.currentTarget;
  el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='68'%3E%3Crect width='100%' height='100%' fill='%23E8EAED'/%3E%3C/svg%3E";
  el.onerror = null;
};

export const SearchHero = ({ searchQuery, setSearchQuery, games, onSelectGame }) => {
  const examples = ["혼자 몰입할 수 있는 스토리 명작", "친구랑 같이 할 무료 협동 게임", "패드로 즐기는 짧은 인디 갓겜", "한글 지원되는 오픈월드 RPG"];
  const [curExample, setCurExample] = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef(null);

  const { query: rawgQuery, setQuery: setRawgQuery, suggestions, loading: rawgLoading, search: rawgSearch, results: rawgResults } = useRawgSearch();

  const bannerGames = WEEKLY_HOT_IDS.slice(0, 5).map(id => games.find(g => g.id === id)).filter(Boolean);
  const bg = bannerGames[bannerIdx];

  useEffect(() => {
    if (!bannerGames.length) return;
    const timer = setInterval(() => setBannerIdx(p => (p + 1) % bannerGames.length), 4500);
    return () => clearInterval(timer);
  }, [bannerGames.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurExample(p => (p + 1) % examples.length), 3000);
    return () => clearInterval(timer);
  }, []);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setRawgQuery(val);
    setShowSuggestions(val.length >= 2);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", height: 340 }}>
        {bg && <img onError={handleImgError} src={`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${bg.id}/library_hero.jpg`} alt={bg.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.6s" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.7) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6, letterSpacing: "0.03em" }}>지금 내 조건에 맞는 게임 찾기</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.4)", lineHeight: 1.3 }}>어떤 게임 찾으세요?</h1>
          </div>

          <div style={{ width: "100%", maxWidth: 560, position: "relative" }} ref={suggestRef}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 18px", borderRadius: showSuggestions && suggestions.length > 0 ? "16px 16px 0 0" : 16,
              backgroundColor: searchFocused ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              boxShadow: searchFocused ? "0 8px 32px rgba(53,197,240,0.25), 0 0 0 2px rgba(53,197,240,0.4)" : "0 4px 20px rgba(0,0,0,0.15)",
              transition: "all 0.25s ease"
            }}>
              {rawgLoading ? (
                <Loader2 size={20} color={COLORS.primary} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
              ) : (
                <Search size={20} color={searchFocused ? COLORS.primary : COLORS.textMuted} style={{ transition: "color 0.2s", flexShrink: 0 }} />
              )}
              <input type="text" value={searchQuery} onChange={handleInputChange}
                placeholder={examples[curExample]}
                onFocus={() => { setSearchFocused(true); if (searchQuery.length >= 2) setShowSuggestions(true); }}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter") { rawgSearch(searchQuery); setShowSuggestions(false); } }}
                style={{ border: "none", outline: "none", fontSize: 15, color: COLORS.textPrimary, width: "100%", fontFamily: "inherit", backgroundColor: "transparent", fontWeight: 500 }} />
              <button onClick={() => { rawgSearch(searchQuery); setShowSuggestions(false); }}
                style={{
                  padding: "10px 24px", borderRadius: 12,
                  backgroundColor: COLORS.primary, border: "none", color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(53,197,240,0.3)",
                  transition: "transform 0.15s, box-shadow 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                찾기
              </button>
            </div>

            {/* RAWG 자동완성 드롭다운 */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                backgroundColor: "#fff", borderRadius: "0 0 16px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden",
                border: `1px solid ${COLORS.borderLight}`, borderTop: "none",
              }}>
                <div style={{ padding: "6px 12px", fontSize: 10, fontWeight: 600, color: COLORS.textMuted, backgroundColor: COLORS.bgGray, letterSpacing: "0.05em" }}>
                  검색 결과
                </div>
                {suggestions.map(s => (
                  <div key={s.id}
                    onMouseDown={() => handleSuggestionClick(s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      cursor: "pointer", transition: "background 0.1s",
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.bgGray}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    {s.image && <img src={s.image} alt={s.name} style={{ width: 48, height: 28, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} onError={handleImgError} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                      {s.nameOriginal && s.nameOriginal !== s.name && (
                        <div style={{ fontSize: 10, color: COLORS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.nameOriginal}</div>
                      )}
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.genres}{s.released ? ` · ${s.released.slice(0, 4)}` : ""}</div>
                    </div>
                    {s.metacritic && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                        <Star size={11} fill="#FFD700" stroke="#FFD700" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>{s.metacritic}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>
              {examples.map((q, i) => (
                <button key={i} onClick={() => { setCurExample(i); setSearchQuery(q); setRawgQuery(q); setShowSuggestions(false); }} style={{
                  padding: "7px 14px", borderRadius: 20, fontSize: 12,
                  backgroundColor: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer",
                  transition: "all 0.15s", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 500
                }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"; }}>
                  {q.length > 14 ? q.substring(0, 14) + "..." : q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 배너 인디케이터 */}
        {bannerGames.length > 1 && (
          <div style={{ position: "absolute", bottom: 16, right: 24, display: "flex", gap: 5, zIndex: 2 }}>
            {bannerGames.map((_, i) => (
              <div key={i} onClick={() => setBannerIdx(i)}
                style={{ width: i === bannerIdx ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === bannerIdx ? "#fff" : "rgba(255,255,255,0.35)", cursor: "pointer", transition: "all 0.25s" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
