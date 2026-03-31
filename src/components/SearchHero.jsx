import { useState, useEffect, useRef } from "react";
import { Search, Star, Loader2, Users, User, Heart, Home, Monitor, Gamepad2, Clock, Swords, TreePine, Ghost, Dumbbell, Sparkles, Smile, Zap, Globe, Tag, ChevronRight, Laptop } from "lucide-react";
import { COLORS } from "../styles/theme";
import { WEEKLY_HOT_IDS } from "../data/games";
import { useRawgSearch } from "../hooks/useRawgSearch";

const handleImgError = (e) => {
  const el = e.currentTarget;
  el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='68'%3E%3Crect width='100%' height='100%' fill='%23E8EAED'/%3E%3C/svg%3E";
  el.onerror = null;
};

// ========== 피드백 반영: 확장된 조건 필터 데이터 ==========
const WHO_OPTIONS = [
  { id: "solo", label: "혼자", icon: User, color: "#6C5CE7" },
  { id: "friend", label: "친구랑", icon: Users, color: "#00C073" },
  { id: "couple", label: "연인과", icon: Heart, color: "#FF6B6B" },
  { id: "family", label: "가족과", icon: Home, color: "#FFB800" },
];

const MOOD_OPTIONS = [
  { id: "immersive", label: "몰입 스토리", icon: Sparkles, color: "#4361EE" },
  { id: "chill", label: "힐링", icon: TreePine, color: "#00C073" },
  { id: "action", label: "빡센 액션", icon: Swords, color: "#FF6F61" },
  { id: "funny", label: "웃긴", icon: Smile, color: "#FFB800" },
  { id: "horror", label: "무서운", icon: Ghost, color: "#8B5CF6" },
];

const TIME_OPTIONS = [
  { id: "short30", label: "30분", icon: Clock, color: "#00C073" },
  { id: "mid", label: "1~2시간", icon: Clock, color: "#4361EE" },
  { id: "long", label: "오래 할 거예요", icon: Clock, color: "#6C5CE7" },
];

const CONDITION_OPTIONS = [
  { id: "korean", label: "한글 지원", icon: Globe, color: "#35C5F0" },
  { id: "lowspec", label: "저사양", icon: Laptop, color: "#FFB800" },
  { id: "pad", label: "패드 지원", icon: Gamepad2, color: "#6C5CE7" },
  { id: "free", label: "무료 / 할인 중", icon: Tag, color: "#00C073" },
];

// ========== 인기 조건 프리셋 (빠른 칩) ==========
const QUICK_PRESETS = [
  { label: "커플 게임", who: "couple", moods: [], time: null, conditions: [] },
  { label: "친구 4명이서", who: "friend", moods: [], time: null, conditions: [] },
  { label: "저사양 갓겜", who: null, moods: [], time: null, conditions: ["lowspec"] },
  { label: "한글 스토리", who: null, moods: ["immersive"], time: null, conditions: ["korean"] },
  { label: "짧게 끝나는 명작", who: null, moods: [], time: "short30", conditions: [] },
  { label: "혼자 힐링", who: "solo", moods: ["chill"], time: null, conditions: [] },
];

export const SearchHero = ({ searchQuery, setSearchQuery, games, onSelectGame, onFilterResults }) => {
  const examples = ["여자친구랑 할 게임", "스팀덱에서 잘 돌아가는 게임", "저사양인데 재밌는 게임", "한글 지원되는 스토리 게임"];
  const [curExample, setCurExample] = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef(null);

  // 상황 선택 상태
  const [selectedWho, setSelectedWho] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);

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
  const toggleCondition = (id) => {
    setSelectedConditions(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // 빠른 프리셋 적용
  const applyPreset = (preset) => {
    setSelectedWho(preset.who);
    setSelectedMoods(preset.moods);
    setSelectedTime(preset.time);
    setSelectedConditions(preset.conditions);
    // 바로 검색 실행
    setTimeout(() => {
      executeFilter(preset.who, preset.moods, preset.time, preset.conditions);
    }, 50);
  };

  const hasFilters = selectedWho || selectedMoods.length > 0 || selectedTime || selectedConditions.length > 0;

  const executeFilter = (who, moods, time, conditions) => {
    let filtered = [...games];

    // WHO 필터
    if (who === "solo") {
      filtered = filtered.filter(g => g.feat?.sp);
    } else if (who === "friend") {
      filtered = filtered.filter(g => g.feat?.coop || g.feat?.localCoop);
    } else if (who === "couple") {
      filtered = filtered.filter(g =>
        g.tags?.some(t => t.includes("커플")) || g.feat?.localCoop || (g.feat?.coop && g.feat?.localCoop)
      );
    } else if (who === "family") {
      filtered = filtered.filter(g =>
        g.feat?.localCoop || g.tags?.some(t => t.includes("파티") || t.includes("캐주얼"))
      );
    }

    // MOOD 필터 (OR 조건)
    if (moods.length > 0) {
      filtered = filtered.filter(g => {
        const tags = (g.tags || []).join(" ").toLowerCase();
        const genre = (g.genre || "").toLowerCase();
        return moods.some(m => {
          if (m === "immersive") return tags.includes("스토리") || tags.includes("몰입") || genre.includes("rpg") || genre.includes("어드벤처");
          if (m === "chill") return tags.includes("힐링") || genre.includes("시뮬레이션") || genre.includes("캐주얼");
          if (m === "action") return tags.includes("액션") || tags.includes("전투") || tags.includes("보스전") || genre.includes("액션") || genre.includes("슈팅");
          if (m === "funny") return tags.includes("유머") || tags.includes("웃긴") || tags.includes("파티") || genre.includes("파티") || genre.includes("캐주얼");
          if (m === "horror") return tags.includes("공포") || tags.includes("호러") || genre.includes("호러");
          return false;
        });
      });
    }

    // TIME 필터
    if (time) {
      filtered = filtered.filter(g => {
        const pt = g.playtime || "";
        const match = pt.match(/(\d+)/);
        if (!match) return true;
        const hours = parseInt(match[1]);
        if (time === "short30") return hours <= 5;
        if (time === "mid") return hours <= 15;
        if (time === "long") return hours >= 30;
        return true;
      });
    }

    // CONDITION 필터 (AND 조건)
    conditions.forEach(c => {
      if (c === "korean") filtered = filtered.filter(g => g.kr && (g.kr.ui || g.kr.sub));
      if (c === "lowspec") filtered = filtered.filter(g =>
        g.tags?.some(t => t.includes("저사양") || t.includes("인디")) || (g.genre || "").includes("인디")
      );
      if (c === "pad") filtered = filtered.filter(g => g.feat?.ctrl === "full");
      if (c === "free") filtered = filtered.filter(g => g.free || g.discountPct > 0);
    });

    // 점수 높은 순 정렬
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

    if (onFilterResults) {
      const label = [
        who === "solo" ? "혼자" : who === "friend" ? "친구랑" : who === "couple" ? "연인과" : who === "family" ? "가족과" : "",
        ...moods.map(m => ({ immersive: "몰입 스토리", chill: "힐링", action: "빡센 액션", funny: "웃긴", horror: "무서운" }[m] || "")),
        time === "short30" ? "짧게" : time === "mid" ? "1~2시간" : time === "long" ? "오래" : "",
        ...conditions.map(c => ({ korean: "한글", lowspec: "저사양", pad: "패드", free: "무료/할인" }[c] || "")),
      ].filter(Boolean).join(" + ");
      onFilterResults(filtered, label);
    }
  };

  const handleQuickSearch = () => {
    executeFilter(selectedWho, selectedMoods, selectedTime, selectedConditions);
  };

  // 칩 버튼 공통 스타일
  const ChipButton = ({ selected, color, icon: Icon, label, onClick }) => (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 24,
      border: selected ? `2px solid ${color}` : "2px solid rgba(255,255,255,0.15)",
      background: selected ? `${color}22` : "rgba(255,255,255,0.08)",
      color: selected ? color : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700,
      cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(8px)",
    }}>
      <Icon size={15} />
      {label}
    </button>
  );

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", minHeight: 520 }}>
        {/* 배경 이미지 */}
        {bg && <img onError={handleImgError} src={`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${bg.id}/library_hero.jpg`} alt={bg.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.6s" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.85) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 32px" }}>

          {/* ========== 새 헤드라인 (피드백 반영) ========== */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{
              fontSize: 32, fontWeight: 900, color: "#fff", margin: 0,
              textShadow: "0 2px 16px rgba(0,0,0,0.5)", lineHeight: 1.4,
              letterSpacing: -0.5,
            }}>
              조건만 고르면,<br />지금 할 게임이 바로 나옵니다
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 10, fontWeight: 500, lineHeight: 1.5 }}>
              혼자, 친구, 연인, 저사양, 한글지원, 플레이타임까지 한 번에 골라보세요.
            </p>
          </div>

          {/* ========== 인기 조건 빠른 칩 ========== */}
          <div style={{ width: "100%", maxWidth: 620, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {QUICK_PRESETS.map((preset, i) => (
                <button key={i} onClick={() => applyPreset(preset)}
                  style={{
                    padding: "7px 16px", borderRadius: 20,
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
                    color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(53,197,240,0.25)"; e.currentTarget.style.borderColor = "rgba(53,197,240,0.5)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ========== 조건 선택 영역 ========== */}
          <div style={{
            width: "100%", maxWidth: 620, marginBottom: 18,
            background: "rgba(0,0,0,0.25)", backdropFilter: "blur(12px)",
            borderRadius: 20, padding: "20px 24px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>

            {/* 누구와? */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>누구와 하나요?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WHO_OPTIONS.map(opt => (
                  <ChipButton key={opt.id} selected={selectedWho === opt.id} color={opt.color}
                    icon={opt.icon} label={opt.label} onClick={() => setSelectedWho(selectedWho === opt.id ? null : opt.id)} />
                ))}
              </div>
            </div>

            {/* 어떤 기분? */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>어떤 기분이에요?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MOOD_OPTIONS.map(opt => (
                  <ChipButton key={opt.id} selected={selectedMoods.includes(opt.id)} color={opt.color}
                    icon={opt.icon} label={opt.label} onClick={() => toggleMood(opt.id)} />
                ))}
              </div>
            </div>

            {/* 얼마나 할 건가요? */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>얼마나 할 건가요?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TIME_OPTIONS.map(opt => (
                  <ChipButton key={opt.id} selected={selectedTime === opt.id} color={opt.color}
                    icon={opt.icon} label={opt.label} onClick={() => setSelectedTime(selectedTime === opt.id ? null : opt.id)} />
                ))}
              </div>
            </div>

            {/* 중요한 조건 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>중요한 조건은?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CONDITION_OPTIONS.map(opt => (
                  <ChipButton key={opt.id} selected={selectedConditions.includes(opt.id)} color={opt.color}
                    icon={opt.icon} label={opt.label} onClick={() => toggleCondition(opt.id)} />
                ))}
              </div>
            </div>

            {/* CTA 버튼 */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleQuickSearch}
                disabled={!hasFilters}
                style={{
                  flex: 1, padding: "14px", borderRadius: 14,
                  background: hasFilters ? `linear-gradient(135deg, ${COLORS.primary}, #2B9FD0)` : "rgba(255,255,255,0.1)",
                  border: hasFilters ? "none" : "1px solid rgba(255,255,255,0.15)",
                  color: hasFilters ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: 15, fontWeight: 800, cursor: hasFilters ? "pointer" : "default",
                  boxShadow: hasFilters ? `0 4px 20px rgba(53,197,240,0.4)` : "none",
                  transition: "all 0.2s", letterSpacing: 0.5,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { if (hasFilters) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(53,197,240,0.5)"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = hasFilters ? "0 4px 20px rgba(53,197,240,0.4)" : "none"; }}>
                <Zap size={16} />
                바로 찾기
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ width: "100%", maxWidth: 620, borderTop: "1px solid rgba(255,255,255,0.1)", margin: "4px 0 16px" }} />

          {/* 직접 검색 */}
          <div style={{ width: "100%", maxWidth: 620, position: "relative" }} ref={suggestRef}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6, textAlign: "center" }}>
              또는 직접 검색하세요
            </div>
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
                placeholder={examples[curExample]}
                onFocus={() => { setSearchFocused(true); if (searchQuery.length >= 2) setShowSuggestions(true); }}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter") { rawgSearch(searchQuery); setShowSuggestions(false); } }}
                style={{
                  border: "none", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", backgroundColor: "transparent", fontWeight: 500,
                  color: searchFocused ? COLORS.textPrimary : "rgba(255,255,255,0.9)",
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
                position: "absolute", top: "calc(100% - 2px)", left: 0, right: 0, zIndex: 50,
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
