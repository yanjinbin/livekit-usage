/**
 * FilterTabs.tsx — 分类过滤 Tab 栏
 *
 * 每个 Tab 对应一个命令分类（或"全部"）。
 * 激活状态时用该分类的主题色作为背景，文字变黑，增强对比度。
 * 非激活状态保持暗色卡片背景 + 灰色文字。
 */
import { CATEGORY_LABELS, type Category } from "../data/cheatsheet";

/** 过滤维度：具体分类 或 "全部" */
type FilterCat = Category | "all";

/** Tab 渲染顺序 */
const CATS: FilterCat[] = ["all", "lk", "sip", "rtp", "net", "obs", "media"];

/**
 * 激活态背景色映射。
 * "all" 用浅灰（接近白），其余用各分类主题色。
 * 文字统一用 #000 保证对比度（WCAG AA）。
 */
const ACTIVE_BG: Record<FilterCat, string> = {
  all:   "#e8eaf0",
  lk:    "var(--lk)",
  sip:   "var(--sip)",
  rtp:   "var(--rtp)",
  net:   "var(--net)",
  obs:   "var(--obs)",
  media: "var(--media)",
};

interface FilterTabsProps {
  active:   FilterCat;
  onChange: (cat: FilterCat) => void;
}

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-8">
      {CATS.map((cat) => {
        const isActive = cat === active;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={[
              // 基础样式：等宽字体、圆角、边框、过渡动画
              "font-mono text-[13px] px-4 py-1.5 rounded-[5px] border",
              "tracking-[.04em] cursor-pointer transition-all duration-150",
              // 非激活态额外 hover 效果（激活态不需要，颜色已经足够）
              !isActive && "hover:text-[#e8eaf0] hover:border-[rgba(255,255,255,0.15)]",
            ].filter(Boolean).join(" ")}
            style={
              isActive
                ? {
                    background:   ACTIVE_BG[cat],
                    color:        "#000",
                    fontWeight:   700,
                    borderColor:  "transparent",
                  }
                : {
                    background:  "var(--bg2)",
                    color:       "#6b7280",
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
