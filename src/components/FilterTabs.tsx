import { CATEGORY_LABELS, type Category } from "../data/cheatsheet";

type FilterCat = Category | "all";

const CATS: FilterCat[] = ["all", "lk", "sip", "rtp", "net", "obs", "media"];

const ACTIVE_BG: Record<FilterCat, string> = {
  all: "#e8eaf0",
  lk: "var(--lk)",
  sip: "var(--sip)",
  rtp: "var(--rtp)",
  net: "var(--net)",
  obs: "var(--obs)",
  media: "var(--media)",
};

export function FilterTabs({
  active,
  onChange,
}: {
  active: FilterCat;
  onChange: (cat: FilterCat) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap mb-8">
      {CATS.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className="font-mono text-[11px] px-3 py-[5px] rounded border tracking-[.04em] cursor-pointer transition-all duration-150"
            style={
              isActive
                ? {
                    background: ACTIVE_BG[cat],
                    color: "#000",
                    fontWeight: 700,
                    borderColor: "transparent",
                  }
                : {
                    background: "var(--bg2)",
                    color: "#6b7280",
                    borderColor: "rgba(255,255,255,0.07)",
                  }
            }
          >
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
