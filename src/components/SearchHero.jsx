import { useState, useEffect, useRef } from "react";
import { Search, Star, Loader2, Users, User, Heart, Monitor, Gamepad2, Clock, Swords, TreePine, Ghost, Dumbbell, Sparkles } from "lucide-react";
import { COLORS } from "../styles/theme";
import { WEEKLY_HOT_IDS } from "../data/games";
import { useRawgSearch } from "../hooks/useRawgSearch";

const handleImgError = (e) => {
  const el = e.currentTarget;
  el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='68'%3E%3Crect width='100%' height='100%' fill='%23E8EAED'/%3E%3C/svg%3E";
  el.onerror = null;
};

// ========== 상황 선택 칩 데이터 ==========
const WHO_OPTIONS = [
  { id: "solo", label: "혼자", icon: User, color: "#6C5CE7" },
  { id: "friend", label: "친구랑", icon: Users, color: "#00C073" },
  { id: "couple", label: "연인과", icon: Heart, color: "#FF6B6B" },
];

const MOOD_OPTIONS = [
  { id: "immersive", label: "몰입 스토리", icon: Sparkles, color: "#4361EE" },
  { id: "chill", label: "힐링", icon: TreePine, color: "#00C073" },
  { id: "action", label: "전투/액션", icon: Swords, color: "#FF6F61" },
  { id: "horror", label: "공포", icon: Ghost, color: "#8B5CF6" },
  { id: "challenge", label: "빡겜", icon: Dumbbell, color: "#E17055" },
];

const ENV_OPTIONS = [
  { id: "lowspec", label: "저사양", icon: Monitor, color: "#FFB800" },
  { id: "pad", label: "패드", icon: Gamepad2, color: "#6C5CE7" },
  { id: "short", label: "짧게", icon: Clock, color: "#00C073" },
];

export const SearchHero = ({ searchQuery, setSearchQuery, games, onSelectGame, onFilterResults }) => {
  const examples = ["한글 지원 오픈월드 RPG", "친구랑 할 무료 협동", "패드로 즐기는 인디 명작", "저사양 스토리 게임"];
  const [curExample, setCurExample] = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef(null);

  // 상황 선택 상태
  const [selectedWho, setSelectedWho] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedEnvs, setSelectedEnvs] = useState([]);

  const { query: rawgQuery, setQuery: setRawgQuery, suggestions, loading: rawgLoading, search: rawgSearch } = useRawgSearch();

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

  const toggleMood = (id) => {
    setSelectedMoods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };
  const toggleEnv = (id) => {
    setSelectedEnvs(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  // 선택된 조건으로 자동 검색어 생성
  const hasFilters = selectedWho || selectedMoods.length > 0 || selectedEnvs.length > 0;

  const handleQuickSearch = () => {
    // 로컬 GAMES DB에서 태그/feat 기반 필터링
    let filtered = [...games];

    // WHO 필터
    if (selectedWho === "solo") {
      filtered = filtered.filter(g => g.feat?.sp);
    } else if (selectedWho === "friend") {
      filtered = filtered.filter(g => g.feat?.coop || g.feat?.localCoop);
    } else if (selectedWho === "couple") {
      filtered = filtered.filter(g =>
        g.tags?.some(t => t.includes("커플")) || g.feat?.localCoop || (g.feat?.coop && g.feat?.localCoop)
      );
    }

    // MOOD 필터 (OR 조건 — 하나라도 매칭)
    if (selectedMoods.length > 0) {
      filtered = filtered.filter(g => {
        const tags = (g.tags || []).join(" ").toLowerCase();
        const genre = (g.genre || "").toLowerCase();
        return selectedMoods.some(m => {
          if (m === "immersive") return tags.includes("스토리") || tags.includes("몰입") || genre.includes("rpg") || genre.includes("어드벤처");
          if (m === "chill") return tags.includes("힐링") || genre.includes("시뮬레이션") || genre.includes("캐주얼");
          if (m === "action") return tags.includes("액션") || tags.includes("전투") || tags.includes("보스전") || genre.includes("액션") || genre.includes("슈팅");
          if (m === "horror") return tags.includes("공포") || tags.includes("호러") || genre.includes("호러");
          if (m === "challenge") return tags.includes("하드코어") || tags.includes("도전") || tags.includes("빡겜") || tags.includes("소울라이크");
          return false;
        });
      });
    }

    // ENV 필터 (AND 조건)
    selectedEnvs.forEach(e => {
      if (e === "pad") filtered = filtered.filter(g => g.feat?.ctrl === "full");
      if (e === "short") filtered = filtered.filter(g => {
        const pt = g.playtime || "";
        const match = pt.match(/(\d+)/);
        return match && parseInt(match[1]) <= 15;
      });
      if (e === "lowspec") filtered = filtered.filter(g =>
        g.tags?.some(t => t.includes("저사양") || t.includes("인디")) || (g.genre || "").includes("인디")
      );
    });

    // 점수 높은 순 정렬
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 필터 결과 전달
    if (onFilterResults) {
      const label = [
        selectedWho === "solo" ? "혼자" : selectedWho === "friend" ? "친구랑" : selectedWho === "couple" ? "연인과" : "",
        ...selectedMoods.map(m => ({ immersive: "몰입 스토리", chill: "힐링", action: "전투/액션", horror: "공포", challenge: "빡겜" }[m] || "")),
        ...selectedEnvs.map(e => ({ lowspec: "저사양", pad: "패드", short: "짧게" }[e] || "")),
      ].filter(Boolean).join(" + ");
      onFilterResults(filtered, label);
    }
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", minHeight: 420 }}>
        {/* 배경 이미지 */}
        {bg && <img onError={handleImgError} src={`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${bg.id}/library_hero.jpg`} alt={bg.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.6s" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 28px" }}>

          {/* 헤드라인 */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-block", padding: "4px 14px", borderRadius: 20, marginBottom: 10,
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: 0.5 }}>
                시간 낭비 없이, 지금 할 게임 찾기
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: 0, textShadow: "0 2px 16px rgba(0,0,0,0.5)", lineHeight: 1.35 }}>
              어떤 상황에서 게임하세요?
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 6, fontWeight: 500 }}>
              조건만 골라보세요. 딱 맞는 게임을 찾아드릴게요.
            </p>
          </div>

          {/* ========== 상황 선택 칩 ========== */}
          <div style={{ width: "100%", maxWidth: 580, marginBottom: 18 }}>

            {/* 누구와? */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>누구와 하나요?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WHO_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const sel = selectedWho === opt.id;
                  return (
                    <button key={opt.id} onClick={() => setSelectedWho(sel ? null : opt.id)} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 24,
                      border: sel ? `2px solid ${opt.color}` : "2px solid rgba(255,255,255,0.15)",
                      background: sel ? `${opt.color}22` : "rgba(255,255,255,0.08)",
                      color: sel ? opt.color : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(8px)",
                    }}>
                      <Icon size={15} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 어떤 느낌? */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>어떤 느낌?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MOOD_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const sel = selectedMoods.includes(opt.id);
                  return (
                    <button key={opt.id} onClick={() => toggleMood(opt.id)} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 24,
                      border: sel ? `2px solid ${opt.color}` : "2px solid rgba(255,255,255,0.15)",
                      background: sel ? `${opt.color}22` : "rgba(255,255,255,0.08)",
                      color: sel ? opt.color : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(8px)",
                    }}>
                      <Icon size={15} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 환경 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>환경 조건</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ENV_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const sel = selectedEnvs.includes(opt.id);
                  return (
                    <button key={opt.id} onClick={() => toggleEnv(opt.id)} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 24,
                      border: sel ? `2px solid ${opt.color}` : "2px solid rgba(255,255,255,0.15)",
                      background: sel ? `${opt.color}22` : "rgba(255,255,255,0.08)",
                      color: sel ? opt.color : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(8px)",
                    }}>
                      <Icon size={15} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 조건 선택 시 검색 버튼 */}
            {hasFilters && (
              <button onClick={handleQuickSearch} style={{
                marginTop: 16, width: "100%", padding: "14px", borderRadius: 14,
                background: `linear-gradient(135deg, ${COLORS.primary}, #2B9FD0)`, border: "none",
                color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
                boxShadow: `0 4px 20px rgba(53,197,240,0.4)`, transition: "all 0.2s",
                letterSpacing: 0.5,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(53,197,240,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(53,197,240,0.4)"; }}>
                맞춤 게임 찾기
              </button>
            )}
          </div>

          {/* 구분선 */}
          <div style={{ width: "100%", maxWidth: 580, borderTop: "1px solid rgba(255,255,255,0.1)", margin: "4px 0 16px" }} />

          {/* 직접 검색 */}
          <div style={{ width: "100%", maxWidth: 580, position: "relative" }} ref={suggestRef}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: showSuggestions && suggestions.length > 0 ? "14px 14px 0 0" : 14,
              backgroundColor: searchFocused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: searchFocused ? "2px solid rgba(53,197,240,0.4)" : "2px solid rgba(255,255,255,0.15)",
              transition: "all 0.25s ease"
            }}>
              {rawgLoading ? (
                <Loader2 size={18} color={searchFocused ? COLORS.primary : "rgba(255,255,255,0.6)"} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
              ) : (
                <Search size={18} color={searchFocused ? COLORS.primary : "rgba(255,255,255,0.5)"} style={{ transition: "color 0.2s", flexShrink: 0 }} />
              )}
              <input type="text" value={searchQuery} onChange={handleInputChange}
                placeholder={`또는 직접 검색: ${examples[curExample]}`}
                onFocus={() => { setSearchFocused(true); if (searchQuery.length >= 2) setShowSuggestions(true); }}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter") { rawgSearch(searchQuery); setShowSuggestions(false); } }}
                style={{
                  border: "none", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", backgroundColor: "transparent", fontWeight: 500,
                  color: searchFocused ? COLORS.textPrimary : "rgba(255,255,255,0.9)",
                  "::placeholder": { color: "rgba(255,255,255,0.4)" },
                }} />
              <button onClick={() => { rawgSearch(searchQuery); setShowSuggestions(false); }}
                style={{
                  padding: "8px 20px", borderRadius: 10,
                  backgroundColor: searchFocused ? COLORS.primary : "rgba(255,255,255,0.15)", border: "none",
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.15s"
                }}>
                검색
              </button>
            </div>

            {/* RAWG 자동완성 */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                backgroundColor: "#fff", borderRadius: "0 0 14px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden",
                border: `1px solid ${COLORS.borderLight}`, borderTop: "none",
              }}>
                <div style={{ padding: "6px 12px", fontSize: 10, fontWeight: 600, color: COLORS.textMuted, backgroundColor: COLORS.bgGray, letterSpacing: "0.05em" }}>
                  검색 결과
                </div>
                {suggestions.map(s => (
                  <div key={`${s.source || "g"}-${s.id}`}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        {s.source === "gamevory" && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.primary, backgroundColor: COLORS.primary + "12", padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>추천</span>
                        )}
                        {s.source === "steam" && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#1B2838", backgroundColor: "#1B283815", padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>Steam</span>
                        )}
                      </div>
                      {s.nameOriginal && s.nameOriginal !== s.name && (
                        <div style={{ fontSize: 10, color: COLORS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.nameOriginal}</div>
                      )}
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                        {s.genres}{s.released ? ` · ${s.released.slice(0, 4)}` : ""}
                        {s.price && !s.genres ? s.price : ""}
                      </div>
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
