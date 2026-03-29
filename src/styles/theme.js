// ============================================================
// GameVory Theme & Styles
// ============================================================

export const COLORS = {
  primary: "#35C5F0",
  primaryDark: "#2BB5DE",
  primaryLight: "#E8F8FD",
  accent: "#FF6F61",
  bg: "#FFFFFF",
  bgGray: "#F7F8FA",
  bgCard: "#FFFFFF",
  textPrimary: "#292929",
  textSecondary: "#828C94",
  textMuted: "#B2B9C0",
  border: "#EAECEF",
  borderLight: "#F2F3F5",
  tagBg: "#F2F3F5",
  success: "#00C073",
  warning: "#FF9F1C",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  shadowCard: "0 2px 8px rgba(0,0,0,0.06)",
};

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export const MEDIA_QUERIES = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

export const GRID_LAYOUTS = {
  mobile: { columns: 1, gap: 12 },
  tablet: { columns: 2, gap: 14 },
  desktop: { columns: 3, gap: 16 },
};

export const getGridColumns = (width) => {
  if (width < BREAKPOINTS.mobile) return GRID_LAYOUTS.mobile.columns;
  if (width < BREAKPOINTS.tablet) return GRID_LAYOUTS.tablet.columns;
  return GRID_LAYOUTS.desktop.columns;
};

export const getGridGap = (width) => {
  if (width < BREAKPOINTS.mobile) return GRID_LAYOUTS.mobile.gap;
  if (width < BREAKPOINTS.tablet) return GRID_LAYOUTS.tablet.gap;
  return GRID_LAYOUTS.desktop.gap;
};

export const COMMON_STYLES = {
  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flexBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexStart: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
  },
  containerMobile: {
    maxWidth: "100%",
    margin: "0 auto",
    padding: "0 16px",
  },
};
