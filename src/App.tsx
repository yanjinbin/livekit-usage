import { useMemo, useState } from "react";
import { CheatCard } from "./components/CheatCard";
import { FilterTabs } from "./components/FilterTabs";
import { SearchBar } from "./components/SearchBar";
import { type Category, data } from "./data/cheatsheet";

type FilterCat = Category | "all";

export default function App() {
  const [activeCat, setActiveCat]     = useState<FilterCat>("all");
  const [search, setSearch]           = useState("");
  // 全局"字段解释"开关：true = 展示每条命令的输出字段说明
  const [showExplain, setShowExplain] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((card) => {
      if (activeCat !== "all" && card.cat !== activeCat) return false;
      if (!q) return true;
      return (
        card.tool.toLowerCase().includes(q) ||
        card.entries.some(
          (e) =>
            e.desc.toLowerCase().includes(q) ||
            e.cmd.toLowerCase().includes(q)  ||
            e.tags.some((t) => t.toLowerCase().includes(q)),
        )
      );
    });
  }, [activeCat, search]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[#e8eaf0] px-8 pt-10 pb-20">

      {/* ── 页头 ── */}
      <header className="flex items-center gap-4 mb-12 flex-wrap">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-[800] tracking-[-0.04em] text-white font-sans leading-none">
          LiveKit Debug
        </h1>
        <span className="font-mono text-[13px] text-[#6b7280] tracking-[.1em] uppercase">
          Cheatsheet
        </span>
        <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[rgba(0,212,170,.12)] text-[var(--lk)] border border-[rgba(0,212,170,.25)] leading-none">
          v2026.04
        </span>

        {/* 全局解释开关 — 推到最右侧 */}
        <div className="ml-auto flex items-center gap-2.5">
          <span className="font-mono text-[12px] text-[#6b7280]">字段解释</span>
          <button
            type="button"
            onClick={() => setShowExplain((v) => !v)}
            className={[
              "relative w-10 h-5 rounded-full border transition-all duration-200 cursor-pointer",
              showExplain
                ? "bg-[var(--lk)] border-[var(--lk)]"
                : "bg-[var(--bg3)] border-[rgba(255,255,255,0.1)]",
            ].join(" ")}
            aria-pressed={showExplain}
            title={showExplain ? "隐藏字段解释" : "显示字段解释"}
          >
            {/* 滑块 */}
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: showExplain ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        </div>
      </header>

      <FilterTabs active={activeCat} onChange={setActiveCat} />
      <SearchBar value={search} onChange={setSearch} />

      {filtered.length === 0 ? (
        <p className="text-center py-16 font-mono text-[15px] text-[#6b7280]">
          没有匹配的命令
        </p>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
          {filtered.map((card) => (
            <CheatCard
              key={`${card.cat}-${card.tool}`}
              card={card}
              showExplain={showExplain}
            />
          ))}
        </div>
      )}
    </main>
  );
}
