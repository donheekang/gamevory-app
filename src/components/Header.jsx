import { Search, X, Gamepad2, Home, Sparkles, Tag, Trophy, User, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { COLORS } from "../styles/theme";

const NAV_ITEMS = [
  { label: "홈", path: "/", icon: Home },
  { label: "큐레이션", path: "/curation", icon: Sparkles },
  { label: "세일", path: "/sale", icon: Tag },
  { label: "랭킹", path: "/ranking", icon: Trophy },
  { label: "마이", path: "/my", icon: User },
];

export const Header = ({ searchQuery, setSearchQuery }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 60, gap: 24, justifyContent: "space-between" }}>
          {/* 로고 */}
          <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
            <Gamepad2 size={26} color={COLORS.primary} strokeWidth={2.5} />
            <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-0.5px" }}>GameVory</span>
          </div>

          {/* 검색바 (데스크톱) */}
          <div style={{ flex: 1, maxWidth: 420, position: "relative" }} className="desktop-search">
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              backgroundColor: COLORS.bgGray, borderRadius: 10, padding: "8px 14px",
              border: `1px solid ${COLORS.borderLight}`, transition: "border 0.2s",
            }}>
              <Search size={16} color={COLORS.textMuted} />
              <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); navigate("/"); }}
                placeholder="게임 이름, 장르, 태그 검색..."
                style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: 13, color: COLORS.textPrimary, width: "100%", fontFamily: "inherit" }} />
              {searchQuery && <X size={14} color={COLORS.textMuted} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setSearchQuery("")} />}
            </div>
          </div>

          {/* 네비게이션 (데스크톱) */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === "/" && currentPath === "");
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                    backgroundColor: isActive ? COLORS.primaryLight : "transparent",
                    color: isActive ? COLORS.primary : COLORS.textSecondary,
                    fontWeight: isActive ? 700 : 500, fontSize: 14,
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = COLORS.bgGray; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                  className="desktop-nav"
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </div>
              );
            })}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <Menu size={24} color={COLORS.textSecondary}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: "none", cursor: "pointer" }}
            className="mobile-menu-btn" />
        </div>

        {/* 모바일 드롭다운 */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: COLORS.bg, borderTop: `1px solid ${COLORS.border}`, padding: "8px 16px" }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <div key={item.path} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 8px",
                    color: isActive ? COLORS.primary : COLORS.textPrimary,
                    fontWeight: isActive ? 700 : 500, fontSize: 15, cursor: "pointer",
                    borderBottom: `1px solid ${COLORS.borderLight}`,
                  }}>
                  <Icon size={18} />
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 모바일 하단 탭바 */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: COLORS.bg, borderTop: `1px solid ${COLORS.border}`,
        display: "none", paddingBottom: "env(safe-area-inset-bottom)",
      }} className="mobile-tab-bar">
        <div style={{ display: "flex", justifyContent: "space-around", padding: "6px 0" }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === "/" && currentPath === "");
            return (
              <div key={item.path} onClick={() => navigate(item.path)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  padding: "4px 12px", cursor: "pointer",
                  color: isActive ? COLORS.primary : COLORS.textMuted,
                  transition: "color 0.15s",
                }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
