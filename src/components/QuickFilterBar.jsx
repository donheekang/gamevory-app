import { COLORS } from "../styles/theme";
import { INITIAL_FILTERS } from "../data/games";

export const QuickFilterBar = ({ activeFilters, onToggleFilter, onClear }) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
        {INITIAL_FILTERS.map(filter => (
          <button key={filter.key}
            onClick={() => onToggleFilter(filter.key)}
            style={{
              padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: `1px solid ${activeFilters[filter.key] ? COLORS.primary : COLORS.borderLight}`,
              backgroundColor: activeFilters[filter.key] ? COLORS.primaryLight : "#fff",
              color: activeFilters[filter.key] ? COLORS.primary : COLORS.textSecondary,
              cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0
            }}
            onMouseEnter={e => { if (!activeFilters[filter.key]) e.currentTarget.style.borderColor = COLORS.primary; }}
            onMouseLeave={e => { if (!activeFilters[filter.key]) e.currentTarget.style.borderColor = COLORS.borderLight; }}>
            {filter.label}
          </button>
        ))}
      </div>
      {Object.values(activeFilters).some(v => v) && (
        <button onClick={onClear}
          style={{
            fontSize: 12, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", marginTop: 8, fontWeight: 600
          }}>
          필터 초기화
        </button>
      )}
    </div>
  );
};
