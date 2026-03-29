import { useState, useCallback } from "react";
import { X, Star, Clock, Users, Globe, Play, Trophy, Monitor, ShoppingCart, TrendingUp, ChevronDown, ChevronUp, Target, Sparkles, Bookmark, ExternalLink } from "lucide-react";
import { COLORS } from "../styles/theme";
import { useRawgGameDetail } from "../hooks/useRawgGameDetail";
import { generateKoreanDescription, generateRecommendFor, generateHighlights, generateKoreanTags, getPlaytimeComment, getScoreComment } from "../utils/gameDescriptionKo";
import { getGameDescriptionKo } from "../data/gameDescriptionsKo";
import { getKoreanSupport } from "../data/koreanSupportDb";
import { getGamePrice, formatKrw } from "../data/gamePriceDb";

const handleImgError = (e) => {
  e.currentTarget.style.backgroundColor = COLORS.bgGray;
  e.currentTarget.style.minHeight = "40px";
};

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const getRatingColor = (score) => {
  if (score >= 85) return "#00C073";
  if (score >= 70) return "#7DC800";
  if (score >= 50) return "#FFB800";
  return "#FF6B6B";
};

const getRatingLabel = (score) => {
  if (score >= 90) return "명작";
  if (score >= 80) return "매우 좋음";
  if (score >= 70) return "좋음";
  if (score >= 60) return "보통";
  if (score >= 50) return "아쉬움";
  return "별로";
};

const STORE_INFO = {
  1: { name: "Steam", color: "#1B2838", icon: "🎮" },
  2: { name: "Xbox Store", color: "#107C10", icon: "🟢" },
  3: { name: "PlayStation Store", color: "#003087", icon: "🔵" },
  4: { name: "App Store", color: "#0D7AFF", icon: "🍎" },
  5: { name: "GOG", color: "#86328A", icon: "🟣" },
  6: { name: "Nintendo Store", color: "#E60012", icon: "🔴" },
  7: { name: "Xbox 360", color: "#5DC21E", icon: "🟢" },
  8: { name: "Google Play", color: "#01875F", icon: "📱" },
  9: { name: "itch.io", color: "#FA5C5C", icon: "🎯" },
  11: { name: "Epic Games", color: "#2A2A2A", icon: "⚡" },
};

const RECOMMEND_EMOJIS = ["🎯", "🔥", "💡", "🌟"];

// 섹션 헤더 컴포넌트
const SectionHeader = ({ icon, title, sub, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <div style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: color || COLORS.primary }} />
    {icon}
    <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>{title}</span>
    {sub && <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.textMuted }}>{sub}</span>}
  </div>
);

export const GameDetail = ({ game, onClose, isSaved, onToggleSave }) => {
  const [activeImg, setActiveImg] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  const [expandReqs, setExpandReqs] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [translating, setTranslating] = useState(false);

  // 영문 설명 → 한국어 번역 (MyMemory 무료 API)
  const translateDesc = useCallback(async (text) => {
    if (!text || translating) return;
    setTranslating(true);
    try {
      // 텍스트를 500자 청크로 분할 (API 제한)
      const chunks = [];
      const maxLen = 480;
      let remaining = text.slice(0, 1500); // 최대 1500자까지
      while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
          chunks.push(remaining);
          break;
        }
        let cut = remaining.lastIndexOf(". ", maxLen);
        if (cut === -1 || cut < 100) cut = remaining.lastIndexOf(" ", maxLen);
        if (cut === -1 || cut < 100) cut = maxLen;
        chunks.push(remaining.slice(0, cut + 1));
        remaining = remaining.slice(cut + 1);
      }
      const results = [];
      for (const chunk of chunks) {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|ko`);
        if (res.ok) {
          const data = await res.json();
          results.push(data?.responseData?.translatedText || chunk);
        } else {
          results.push(chunk);
        }
      }
      setTranslatedDesc(results.join(" "));
    } catch {
      setTranslatedDesc(null);
    } finally {
      setTranslating(false);
    }
  }, [translating]);

  const isRawg = game?.isRawg || game?.rawgId;
  const rawgId = isRawg ? (game.rawgId || game.id) : null;
  const searchName = !isRawg ? (game.title || game.titleKo) : null;
  const { details, screenshots: rawgScreenshots, trailers, series, achievements, steamKo, steamAppId: hookSteamId, loading } = useRawgGameDetail(rawgId, true, searchName);

  if (!game) return null;

  const allScreenshots = rawgScreenshots.length > 0 ? rawgScreenshots : (game.screenshots || []);
  const allImages = [game.image, ...allScreenshots];
  const mainImg = activeImg || game.image;

  // 한국어 데이터
  const titleKo = game.titleKo !== game.title ? game.titleKo : (details?.titleKo || game.titleKo);
  const developers = details?.developers?.map(d => d.name) || game.dev || [];
  const publishers = details?.publishers?.map(p => p.name) || [];
  const priceDisplay = steamKo?.priceKo || (game.free ? "무료" : game.price);
  const discountDisplay = steamKo?.discountPct > 0 ? steamKo.discountPct : game.discountPct;

  // RAWG 데이터
  const metacritic = details?.metacritic || game.score;
  const ratings = details?.ratings || [];
  const ratingsCount = details?.ratings_count || game.ratingsCount || 0;
  const addedCount = details?.added || 0;
  const playtime = details?.playtime || (game.playtime ? parseInt(game.playtime) : 0);
  const stores = details?.stores || [];
  const pcRequirements = details?.platforms?.find(p => p.platform?.id === 4)?.requirements;
  const esrbRating = details?.esrb_rating;
  const website = details?.website;
  const redditUrl = details?.reddit_url;
  const redditCount = details?.reddit_count || 0;

  // 한국어 지원 정보: Steam API > DB > 기존 game.kr 순으로 신뢰
  const slug = details?.slug || game?.slug;
  const krFromSteam = steamKo?.koreanSupport;
  const krFromDb = getKoreanSupport({
    slug,
    steamAppId: game.steamAppId || (game.id && !game.isRawg ? game.id : null),
    tags: details?.tags || [],
  });
  const krSupport = krFromSteam || krFromDb || game.kr || { ui: false, sub: false, audio: false };

  // 한국어 데이터 생성
  const highlights = details ? generateHighlights(details) : [];
  const koTags = details ? generateKoreanTags(details) : (game.tags || []);
  // Steam 한국어 설명 — 상세 설명 우선, 없으면 짧은 설명
  const steamDescDetailed = steamKo?.detailedDescKo ? stripHtml(steamKo.detailedDescKo) : null;
  const steamDescShort = steamKo?.descriptionKo ? stripHtml(steamKo.descriptionKo) : null;
  const steamDesc = steamDescDetailed || steamDescShort;
  const enDesc = details?.description_raw;
  const autoKoDesc = details ? generateKoreanDescription(game, details) : null;

  // 큐레이션 한국어 설명 (DB)
  const curatedDesc = getGameDescriptionKo(slug);
  const hasCurated = !!curatedDesc;

  // 최종 설명: 큐레이션 DB > Steam 한국어(상세) > 자동 생성 한국어 > 영어
  const description = hasCurated ? curatedDesc.summary : (steamDesc || autoKoDesc || enDesc);
  const descLabel = hasCurated ? "에디터 한국어" : steamDesc ? "Steam 공식 한국어" : autoKoDesc ? "한국어 요약" : enDesc ? "영문 원본" : null;
  const descColor = hasCurated ? "#FF6F61" : steamDesc ? "#00C073" : autoKoDesc ? COLORS.primary : "#999";

  const recommendFor = details ? generateRecommendFor(details) : [];
  const scoreComment = getScoreComment(metacritic);
  const playtimeComment = getPlaytimeComment(playtime);
  const genreKo = details?.genresKo || game.genre;

  // 평점 분포
  const ratingMap = {
    exceptional: { label: "명작", emoji: "🏆", color: "#00C073" },
    recommended: { label: "추천", emoji: "👍", color: "#7DC800" },
    meh: { label: "보통", emoji: "😐", color: "#FFB800" },
    skip: { label: "비추", emoji: "👎", color: "#FF6B6B" },
  };
  const totalRatings = ratings.reduce((sum, r) => sum + r.count, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "16px",
      backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: COLORS.bg, borderRadius: 20, maxWidth: 760, width: "100%", maxHeight: "92vh", overflow: "auto", position: "relative",
        scrollbarWidth: "thin",
      }}>
        {/* 닫기 */}
        <button onClick={onClose} style={{
          position: "sticky", top: 12, float: "right", marginRight: 12, zIndex: 10, width: 36, height: 36,
          borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", border: "none", color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={18} />
        </button>

        {/* ====== 히어로 이미지 ====== */}
        <div style={{ position: "relative" }}>
          {showTrailer && trailers.length > 0 ? (
            <video controls autoPlay
              style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: "20px 20px 0 0", backgroundColor: "#000" }}
              src={trailers[0].data?.max || trailers[0].data?.["480"]}
              poster={trailers[0].preview} />
          ) : (
            <img onError={handleImgError} src={mainImg} alt={game.title}
              style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: "20px 20px 0 0" }} />
          )}

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 160,
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }} />

          {/* 트레일러 */}
          {trailers.length > 0 && !showTrailer && (
            <div onClick={() => setShowTrailer(true)}
              style={{
                position: "absolute", bottom: 70, left: 24, display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 12, backgroundColor: "rgba(255,111,97,0.9)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                backdropFilter: "blur(8px)", boxShadow: "0 4px 12px rgba(255,111,97,0.4)",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <Play size={16} fill="#fff" />
              트레일러 보기
            </div>
          )}
          {showTrailer && (
            <div onClick={() => setShowTrailer(false)} style={{
              position: "absolute", top: 16, left: 16, padding: "6px 12px", borderRadius: 8,
              backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              이미지로 돌아가기
            </div>
          )}

          {/* 히어로 위 제목 오버레이 */}
          <div style={{ position: "absolute", bottom: 16, left: 24, right: 80 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500, marginBottom: 4 }}>{genreKo}</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{titleKo}</h2>
            {titleKo !== game.title && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{game.title}</div>}
          </div>

          {/* 메타크리틱 뱃지 */}
          {metacritic && (
            <div style={{
              position: "absolute", bottom: 16, right: 24,
              width: 56, height: 56, borderRadius: 14,
              backgroundColor: getRatingColor(metacritic),
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{metacritic}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: 1 }}>{getRatingLabel(metacritic)}</div>
            </div>
          )}
        </div>

        {/* 스크린샷 썸네일 */}
        {allImages.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "12px 24px 0", overflowX: "auto", scrollbarWidth: "thin" }}>
            {allImages.slice(0, 10).map((s, i) => (
              <img key={i} src={s} alt="" onClick={() => { setActiveImg(s); setShowTrailer(false); }}
                onError={handleImgError}
                style={{
                  width: 80, height: 45, objectFit: "cover", borderRadius: 8, flexShrink: 0, cursor: "pointer",
                  border: mainImg === s ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                  opacity: mainImg === s ? 1 : 0.6, transition: "all 0.15s"
                }} />
            ))}
          </div>
        )}

        <div style={{ padding: "20px 24px 28px" }}>

          {/* ====== 개발사 ====== */}
          {developers.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>{developers.join(" · ")}</span>
            </div>
          )}

          {/* ====== 가격 차트 카드 ====== */}
          {(() => {
            const steamId = hookSteamId || game.steamAppId || (!game.isRawg ? game.id : null);
            const pSlug = details?.slug || game?.slug;

            // 정적 DB 우선 (즉시 표시) → Steam API 폴백 (DB에 없는 게임만)
            const staticPrice = getGamePrice(pSlug, steamId);
            const steamPriceDetail = steamKo?.priceDetail;
            const priceData = staticPrice
              ? staticPrice  // 정적 DB에 있으면 즉시 사용 (API 대기 불필요)
              : steamPriceDetail
                ? { full: steamPriceDetail.full, low: Math.round(steamPriceDetail.full * 0.7), curr: steamPriceDetail.curr, disc: steamPriceDetail.disc }
                : null;  // 둘 다 없으면 Steam 링크 카드 표시

            const isFree = priceData?.free || steamKo?.isFree || game.free || priceDisplay === "무료";
            const steamUrl = steamId ? `https://store.steampowered.com/app/${steamId}` : null;
            const itadUrl = steamId ? `https://isthereanydeal.com/steam/app/${steamId}/` : null;
            const steamDbUrl = steamId ? `https://steamdb.info/app/${steamId}/` : null;

            // 무료 게임
            if (isFree) return (
              <div style={{ marginBottom: 16, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #F0FFF8, #E8FAF0)", border: "1px solid #00C07320" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>🎉</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#00C073" }}>무료 게임</span>
                </div>
                {steamUrl && (
                  <a href={steamUrl} target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px 14px", borderRadius: 10, textDecoration: "none",
                    backgroundColor: "#1B2838", color: "#fff", fontSize: 13, fontWeight: 700,
                  }}>🎮 Steam에서 바로 받기</a>
                )}
              </div>
            );

            // 가격 데이터 있을 때 — 프리미엄 가격 차트
            if (priceData) {
              const { full, low, curr, disc } = priceData;
              const saving = full - curr;
              const isOnSale = disc > 0;
              const savePct = full > 0 ? Math.round(((full - curr) / full) * 100) : 0;
              const isSamePrice = curr === full;
              // 가격 위치 계산 (게이지 바 퍼센트)
              const range = full - low || 1;
              const currPctInRange = Math.max(0, Math.min(100, ((curr - low) / range) * 100));

              return (
                <div style={{ marginBottom: 16, borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>

                  {/* 상단 히어로: 현재가 */}
                  <div style={{
                    padding: "22px 22px 18px",
                    background: isOnSale
                      ? "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)"
                      : "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
                    position: "relative", overflow: "hidden",
                  }}>
                    {/* 배경 장식 원 */}
                    <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                    <div style={{ position: "absolute", bottom: -40, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                            {isOnSale ? "Sale" : "Steam Price"}
                          </span>
                        </div>
                        {isOnSale && (
                          <span style={{
                            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                            color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 800,
                            border: "1px solid rgba(255,255,255,0.3)",
                          }}>-{disc}%</span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -1.5 }}>{formatKrw(curr)}</span>
                        {isOnSale && (
                          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textDecoration: "line-through", fontWeight: 600 }}>{formatKrw(full)}</span>
                        )}
                      </div>

                      {isOnSale && saving > 0 && (
                        <div style={{
                          marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
                          background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px",
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                            {formatKrw(saving)} 절약
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 가격 레인지 게이지 */}
                  <div style={{ padding: "20px 22px 10px" }}>

                    {/* 3단 가격 카드 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
                      {/* 역대 최저 */}
                      <div style={{
                        padding: "12px 10px", borderRadius: 12, textAlign: "center",
                        background: "linear-gradient(180deg, #F0FFF8 0%, #E8FFF3 100%)",
                        border: "1px solid #00C07320",
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#00C073", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, opacity: 0.8 }}>최저가</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#00A363" }}>{formatKrw(low)}</div>
                      </div>
                      {/* 현재가 */}
                      <div style={{
                        padding: "12px 10px", borderRadius: 12, textAlign: "center",
                        background: isOnSale
                          ? "linear-gradient(180deg, #FFF5F5 0%, #FFE8E8 100%)"
                          : "linear-gradient(180deg, #F0F4FF 0%, #E8EEFF 100%)",
                        border: `1px solid ${isOnSale ? "#FF6B6B25" : "#4361EE20"}`,
                        transform: "scale(1.04)", boxShadow: `0 4px 15px ${isOnSale ? "rgba(255,107,107,0.15)" : "rgba(67,97,238,0.12)"}`,
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: isOnSale ? "#FF6B6B" : "#4361EE", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, opacity: 0.8 }}>현재가</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: isOnSale ? "#E55656" : "#3450D0" }}>{formatKrw(curr)}</div>
                      </div>
                      {/* 정가 */}
                      <div style={{
                        padding: "12px 10px", borderRadius: 12, textAlign: "center",
                        background: "linear-gradient(180deg, #F8F9FA 0%, #F0F1F3 100%)",
                        border: "1px solid #E0E3E8",
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, opacity: 0.8 }}>정가</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#666" }}>{formatKrw(full)}</div>
                      </div>
                    </div>

                    {/* 게이지 바 */}
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 0.3 }}>가격 위치</span>
                        <span style={{
                          fontSize: 11, fontWeight: 800,
                          color: isSamePrice ? "#888" : isOnSale ? "#FF6B6B" : currPctInRange < 30 ? "#00C073" : "#4361EE",
                        }}>
                          {isSamePrice ? "정가 유지 중" : isOnSale ? `정가 대비 ${savePct}% 할인` : currPctInRange < 30 ? "최저가 근접" : "중간 가격대"}
                        </span>
                      </div>
                      {/* 게이지 트랙 */}
                      <div style={{
                        position: "relative", height: 8, borderRadius: 10,
                        background: "linear-gradient(90deg, #00C073 0%, #FFD43B 50%, #FF6B6B 100%)",
                        opacity: 0.2,
                      }} />
                      {/* 게이지 채움 */}
                      <div style={{
                        position: "relative", height: 8, borderRadius: 10, marginTop: -8,
                        background: isSamePrice
                          ? "linear-gradient(90deg, #00C073, #FFD43B, #999)"
                          : `linear-gradient(90deg, #00C073, ${currPctInRange > 60 ? "#FF6B6B" : "#FFD43B"})`,
                        width: `${isSamePrice ? 100 : Math.max(currPctInRange, 6)}%`,
                        transition: "width 0.6s ease",
                        boxShadow: isSamePrice ? "none" : `2px 0 10px ${currPctInRange > 60 ? "rgba(255,107,107,0.3)" : "rgba(0,192,115,0.3)"}`,
                      }} />
                      {/* 현재가 마커 */}
                      {!isSamePrice && (
                        <div style={{
                          position: "absolute", left: `${Math.max(currPctInRange, 3)}%`,
                          top: -3, marginTop: 0, marginLeft: -7,
                          width: 14, height: 14, borderRadius: "50%",
                          background: isOnSale ? "#FF6B6B" : currPctInRange < 30 ? "#00C073" : "#4361EE",
                          border: "3px solid #fff",
                          boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                          transform: "translateY(-3px)",
                        }} />
                      )}
                      {/* 최저 ~ 정가 레이블 */}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#aaa" }}>최저 {formatKrw(low)}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#aaa" }}>정가 {formatKrw(full)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 하단 코멘트 */}
                  <div style={{ padding: "0 22px 18px" }}>
                    <div style={{
                      padding: "12px 16px", borderRadius: 14,
                      background: isOnSale
                        ? "linear-gradient(135deg, #FFF5F5, #FFEDED)"
                        : curr <= low * 1.2 ? "linear-gradient(135deg, #F0FFF8, #E8FFF3)" : "linear-gradient(135deg, #F8F9FB, #F2F3F5)",
                      border: `1px solid ${isOnSale ? "#FF6B6B12" : curr <= low * 1.2 ? "#00C07312" : "#E8ECF0"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>
                          {isOnSale ? (curr <= low ? "🔥" : "💰") : (curr <= low * 1.2 ? "✅" : "⏳")}
                        </span>
                        <div>
                          <div style={{
                            fontSize: 13, fontWeight: 800,
                            color: isOnSale ? "#E55656" : curr <= low * 1.2 ? "#00A363" : "#666",
                          }}>
                            {isOnSale
                              ? curr <= low ? "역대 최저가! 지금이 최적의 타이밍" : "할인 중! 역대 최저가에 근접"
                              : curr <= low * 1.2 ? "괜찮은 가격대에요" : "할인을 기다려보세요"
                            }
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 500, color: "#999", marginTop: 2 }}>
                            {isOnSale
                              ? `최저가 대비 ${formatKrw(curr - low)} 차이`
                              : `역대 최저가보다 ${formatKrw(curr - low)} 높아요`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // 가격 데이터 없을 때 — Steam 스토어 링크 카드
            const searchUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title || "")}`;
            return (
              <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: "1px solid #E8ECF0" }}>
                <a href={steamUrl || searchUrl} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 18px", textDecoration: "none",
                  background: "linear-gradient(135deg, #1B2838, #2A475E)", color: "#fff",
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, marginBottom: 4 }}>Steam 스토어</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>가격 확인하기</div>
                  </div>
                  <ExternalLink size={20} style={{ opacity: 0.6 }} />
                </a>
              </div>
            );
          })()}

          {/* 한줄 평가 배너 */}
          {scoreComment && (
            <div style={{
              padding: "12px 16px", borderRadius: 14, marginBottom: 16,
              background: `linear-gradient(135deg, ${getRatingColor(metacritic)}12, ${getRatingColor(metacritic)}06)`,
              border: `1px solid ${getRatingColor(metacritic)}25`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Sparkles size={18} color={getRatingColor(metacritic)} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: getRatingColor(metacritic) }}>{scoreComment}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>메타크리틱 {metacritic}점 · {ratingsCount.toLocaleString()}명 평가</div>
              </div>
            </div>
          )}

          {/* ====== 핵심 특징 배지 ====== */}
          {highlights.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {highlights.map((h, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 10,
                  backgroundColor: i === 0 ? `${COLORS.primary}12` : COLORS.bgGray,
                  border: i === 0 ? `1px solid ${COLORS.primary}30` : `1px solid ${COLORS.borderLight}`,
                }}>
                  <span style={{ fontSize: 14 }}>{h.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? COLORS.primary : COLORS.textSecondary }}>{h.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* ====== 스탯 그리드 ====== */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
            marginBottom: 16,
          }}>
            {[
              { icon: <Star size={18} color="#FFB800" fill="#FFB800" />, label: "평점", value: metacritic ? `${metacritic}점` : (game.rating ? `${game.rating}/5` : "-"), sub: metacritic ? getRatingLabel(metacritic) : "", bg: "#FFFBF0" },
              { icon: <Clock size={18} color="#6C5CE7" />, label: "플레이타임", value: playtime ? `${playtime}시간` : game.playtime || "-", sub: playtime > 40 ? "시간 녹는 갓겜" : playtime > 15 ? "적당한 볼륨" : playtime > 0 ? "가볍게 즐기기" : "", bg: "#F5F0FF" },
              { icon: <Globe size={18} color={krSupport.ui ? "#00C073" : "#FF9F1C"} />, label: "한국어", value: krSupport.ui ? "지원" : "미지원", sub: krSupport.audio ? "음성 포함" : krSupport.sub ? "자막 포함" : "", bg: krSupport.ui ? "#F0FFF8" : "#FFF8F0" },
              { icon: <Users size={18} color={COLORS.primary} />, label: "인기도", value: addedCount > 1000 ? `${(addedCount / 1000).toFixed(0)}K명` : addedCount > 0 ? `${addedCount}명` : ratingsCount > 0 ? `${ratingsCount}명` : "-", sub: "관심 등록", bg: "#F0F8FF" },
            ].map((info, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "14px 6px", borderRadius: 14,
                backgroundColor: info.bg, border: `1px solid ${COLORS.borderLight}`,
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{info.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.textPrimary, marginBottom: 2 }}>{info.value}</div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 500 }}>{info.label}</div>
                {info.sub && <div style={{ fontSize: 9, color: COLORS.primary, fontWeight: 600, marginTop: 2 }}>{info.sub}</div>}
              </div>
            ))}
          </div>

          {/* ====== 이런 분에게 추천해요 ====== */}
          {recommendFor.length > 0 && (
            <div style={{
              marginBottom: 16, padding: "18px", borderRadius: 16,
              background: "linear-gradient(135deg, #F0F8FF, #F5F0FF)",
              border: `1px solid ${COLORS.primaryLight}`,
            }}>
              <SectionHeader icon={<Target size={16} color={COLORS.primary} />} title="이런 분에게 추천해요" color={COLORS.primary} />
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(recommendFor.length, 2)}, 1fr)`, gap: 8 }}>
                {recommendFor.map((rec, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 14px", borderRadius: 12,
                    backgroundColor: "#fff", border: `1px solid ${COLORS.borderLight}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <span style={{ fontSize: 20 }}>{RECOMMEND_EMOJIS[i] || "✨"}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.3 }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== 게임 소개 ====== */}
          {(description || enDesc) && (
            <div style={{ marginBottom: 16 }}>
              {/* 한국어 소개 (큐레이션 DB / Steam / 자동생성) */}
              {description && (
                <div style={{ padding: "18px", backgroundColor: hasCurated ? "#FFF9F8" : COLORS.bgGray, borderRadius: enDesc && !hasCurated && description !== enDesc ? "16px 16px 0 0" : 16, border: hasCurated ? "1px solid #FFE8E4" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>게임 소개</div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: descColor, backgroundColor: `${descColor}15`, padding: "2px 8px", borderRadius: 4 }}>{descLabel}</span>
                  </div>
                  <p style={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                    {description}
                  </p>
                </div>
              )}

              {/* 영어 원문 상세 설명 + 번역 버튼 */}
              {enDesc && description !== enDesc && !steamDesc && (
                <div style={{
                  padding: "14px 18px", backgroundColor: "#F8F9FA",
                  borderRadius: description ? "0 0 16px 16px" : 16,
                  borderTop: description ? `1px dashed ${COLORS.borderLight}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Globe size={12} color={translatedDesc ? "#00C073" : COLORS.textMuted} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: translatedDesc ? "#00C073" : COLORS.textMuted }}>
                        {translatedDesc ? "한국어 번역" : "상세 설명 (영문)"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {!translatedDesc && (
                        <button onClick={() => translateDesc(enDesc)} disabled={translating}
                          style={{
                            background: translating ? COLORS.bgGray : "linear-gradient(135deg, #35C5F0, #00C073)",
                            border: "none", color: translating ? COLORS.textMuted : "#fff",
                            fontSize: 11, fontWeight: 700, cursor: translating ? "default" : "pointer",
                            padding: "4px 12px", borderRadius: 8,
                            display: "flex", alignItems: "center", gap: 4,
                            boxShadow: translating ? "none" : "0 2px 6px rgba(53,197,240,0.3)",
                          }}>
                          {translating ? (
                            <><span className="spin" style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #ccc", borderTop: "2px solid #999", borderRadius: "50%" }} /> 번역 중...</>
                          ) : (
                            <>🌐 한국어로 번역</>
                          )}
                        </button>
                      )}
                      {translatedDesc && (
                        <button onClick={() => setTranslatedDesc(null)} style={{
                          background: "none", border: "none", color: COLORS.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0,
                        }}>
                          영문 원본
                        </button>
                      )}
                      <button onClick={() => setExpandDesc(!expandDesc)} style={{
                        background: "none", border: "none", color: COLORS.primary, fontSize: 11, fontWeight: 600,
                        cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3,
                      }}>
                        {expandDesc ? <><ChevronUp size={12} /> 접기</> : <><ChevronDown size={12} /> 펼치기</>}
                      </button>
                    </div>
                  </div>

                  {/* 번역된 텍스트 or 영어 원문 */}
                  {translatedDesc ? (
                    <p style={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                      {expandDesc ? translatedDesc : translatedDesc.slice(0, 400)}
                      {!expandDesc && translatedDesc.length > 400 && "..."}
                    </p>
                  ) : (
                    <>
                      {expandDesc ? (
                        <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                          {enDesc.slice(0, 1200)}{enDesc.length > 1200 && "..."}
                        </p>
                      ) : (
                        <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.7, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                          {enDesc.slice(0, 250)}...
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====== 뭐가 재밌나요? (큐레이션 DB 게임) ====== */}
          {hasCurated && curatedDesc.whyPlay && (
            <div style={{
              marginBottom: 16, padding: "18px", borderRadius: 16,
              background: "linear-gradient(135deg, #F8FCFE, #FFF8F5)",
              border: `1px solid ${COLORS.primaryLight}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: "#FF6F61" }} />
                <span style={{ fontSize: 16 }}>🎮</span>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textPrimary }}>이 게임, 뭐가 재밌나요?</div>
              </div>
              <p style={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.85, margin: 0 }}>
                {curatedDesc.whyPlay}
              </p>
              {curatedDesc.keywords && curatedDesc.keywords.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {curatedDesc.keywords.map((kw, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 8,
                      backgroundColor: i === 0 ? "#FF6F6118" : "#F5F5F5",
                      color: i === 0 ? "#FF6F61" : COLORS.textSecondary,
                      fontWeight: 600,
                      border: i === 0 ? "1px solid #FF6F6130" : "none",
                    }}>#{kw}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ====== 유저 평점 분포 ====== */}
          {ratings.length > 0 && totalRatings > 0 && (
            <div style={{ marginBottom: 16, padding: "18px", backgroundColor: COLORS.bgGray, borderRadius: 16 }}>
              <SectionHeader icon={<TrendingUp size={16} color={COLORS.primary} />} title="유저 평점" sub={`${totalRatings.toLocaleString()}명 참여`} color={COLORS.primary} />
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 32, marginBottom: 12 }}>
                {ratings.sort((a, b) => {
                  const order = { exceptional: 0, recommended: 1, meh: 2, skip: 3 };
                  return (order[a.title] ?? 4) - (order[b.title] ?? 4);
                }).map((r, i) => {
                  const info = ratingMap[r.title] || { label: r.title, emoji: "⭐", color: "#999" };
                  return r.percent > 0 ? (
                    <div key={i} style={{
                      width: `${r.percent}%`, backgroundColor: info.color, display: "flex",
                      alignItems: "center", justifyContent: "center", minWidth: r.percent > 8 ? 40 : 0,
                    }}>
                      {r.percent > 12 && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{Math.round(r.percent)}%</span>}
                    </div>
                  ) : null;
                })}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {ratings.sort((a, b) => {
                  const order = { exceptional: 0, recommended: 1, meh: 2, skip: 3 };
                  return (order[a.title] ?? 4) - (order[b.title] ?? 4);
                }).map((r, i) => {
                  const info = ratingMap[r.title] || { label: r.title, emoji: "⭐", color: "#999" };
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: info.color }} />
                      <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{info.emoji} {info.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>{r.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====== 플레이타임 + 태그 ====== */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {/* 플레이타임 카드 */}
            {playtimeComment && (
              <div style={{
                flex: "1 1 280px", padding: "14px 16px", borderRadius: 14,
                background: "linear-gradient(135deg, #F0F8FF, #F8F0FF)",
                border: "1px solid #E8E0F8",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#6C5CE712", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={20} color="#6C5CE7" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#6C5CE7" }}>평균 {playtime}시간</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{playtimeComment}</div>
                </div>
              </div>
            )}

            {/* Steam 가격은 상단 가격 카드로 이동 */}
          </div>

          {/* ====== 태그 ====== */}
          {koTags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {koTags.slice(0, 8).map((tag, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: "5px 12px", borderRadius: 20,
                  backgroundColor: i === 0 ? `${COLORS.primary}12` : COLORS.bgGray,
                  color: i === 0 ? COLORS.primary : COLORS.textSecondary,
                  fontWeight: i === 0 ? 700 : 500,
                  border: i === 0 ? `1px solid ${COLORS.primary}30` : "none",
                }}>{tag}</span>
              ))}
              {esrbRating && (
                <span style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, backgroundColor: "#FFF0F0", color: "#CC3333", fontWeight: 600 }}>
                  {esrbRating.name}
                </span>
              )}
            </div>
          )}

          {/* 업적 섹션 제거됨 */}

          {/* ====== 구매처 ====== */}
          {stores.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <SectionHeader icon={<ShoppingCart size={16} color={COLORS.primary} />} title="구매 가능한 스토어" color={COLORS.primary} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {stores.map((s, i) => {
                  const info = STORE_INFO[s.store?.id] || { name: s.store?.name, color: "#666", icon: "🎮" };
                  const url = s.url || (s.store?.slug === "steam" ? "https://store.steampowered.com" : `https://${s.store?.domain}`);
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12,
                        backgroundColor: COLORS.bgGray, textDecoration: "none", color: COLORS.textPrimary,
                        fontSize: 13, fontWeight: 600, transition: "all 0.15s", border: `1px solid ${COLORS.borderLight}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = info.color; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = COLORS.bgGray; e.currentTarget.style.color = COLORS.textPrimary; }}>
                      <span style={{ fontSize: 14 }}>{info.icon}</span>
                      {info.name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====== PC 시스템 요구사양 ====== */}
          {pcRequirements && (pcRequirements.minimum || pcRequirements.recommended) && (
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setExpandReqs(!expandReqs)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 14, backgroundColor: COLORS.bgGray,
                border: `1px solid ${COLORS.borderLight}`, cursor: "pointer", color: COLORS.textPrimary,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Monitor size={16} color={COLORS.primary} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>PC 시스템 요구사양</span>
                </div>
                {expandReqs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandReqs && (
                <div style={{ padding: "14px 16px", backgroundColor: COLORS.bgGray, borderRadius: "0 0 14px 14px", marginTop: -4 }}>
                  {pcRequirements.minimum && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 4 }}>최소 사양</div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {stripHtml(pcRequirements.minimum)}
                      </div>
                    </div>
                  )}
                  {pcRequirements.recommended && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#00C073", marginBottom: 4 }}>권장 사양</div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {stripHtml(pcRequirements.recommended)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====== 추천 이유 (하드코딩 게임) ====== */}
          {game.matchReasons && game.matchReasons.length > 0 && (
            <div style={{ marginBottom: 16, padding: "18px", backgroundColor: "#F8FCFE", borderRadius: 16, border: `1px solid ${COLORS.primaryLight}` }}>
              <SectionHeader icon={<Sparkles size={16} color={COLORS.primary} />} title="이 게임을 추천하는 이유" color={COLORS.primary} />
              {game.matchReasons.map((reason, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.4 }}>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* 주의사항 */}
          {game.warnings && game.warnings.length > 0 && (
            <div style={{ marginBottom: 16, padding: "14px 16px", backgroundColor: "#FFF8F0", borderRadius: 14, border: "1px solid #FFE8D0" }}>
              {game.warnings.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: i > 0 ? 6 : 0 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontSize: 13, color: "#B36B00", fontWeight: 500 }}>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* ====== 같은 시리즈 ====== */}
          {series.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <SectionHeader icon={<Bookmark size={16} color={COLORS.primary} />} title="같은 시리즈" color={COLORS.primary} />
              <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "thin" }}>
                {series.map(s => (
                  <div key={s.id} style={{ flex: "0 0 auto", width: 140, textAlign: "center" }}>
                    <img src={s.background_image} alt={s.name}
                      style={{ width: 140, height: 78, objectFit: "cover", borderRadius: 12, marginBottom: 6 }}
                      onError={handleImgError} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    {s.metacritic && <div style={{ fontSize: 10, color: getRatingColor(s.metacritic), fontWeight: 700, marginTop: 2 }}>⭐ {s.metacritic}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== 링크 ====== */}
          {(website || redditUrl) && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {website && (
                <a href={website} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12,
                  backgroundColor: COLORS.bgGray, textDecoration: "none", color: COLORS.textSecondary,
                  fontSize: 13, fontWeight: 600, border: `1px solid ${COLORS.borderLight}`,
                }}>
                  <Globe size={14} /> 공식 웹사이트
                </a>
              )}
              {redditUrl && (
                <a href={redditUrl} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12,
                  backgroundColor: "#FFF4F0", textDecoration: "none", color: "#FF4500",
                  fontSize: 13, fontWeight: 600, border: "1px solid #FFE0D0",
                }}>
                  Reddit 커뮤니티 {redditCount > 0 ? `(${redditCount.toLocaleString()}명)` : ""}
                </a>
              )}
            </div>
          )}

          {/* 하단 */}
          <div style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "center", paddingTop: 14, borderTop: `1px solid ${COLORS.borderLight}` }}>
            {game.date && `출시일: ${game.date}`}
            {game.date && details?.updated && " · "}
            {details?.updated && `최종 업데이트: ${details.updated.slice(0, 10)}`}
          </div>
        </div>
      </div>
    </div>
  );
};
