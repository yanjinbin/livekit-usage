import { useMemo, useState } from "react";
import { CheatCard } from "./components/CheatCard";
import { FilterTabs } from "./components/FilterTabs";
import { SearchBar } from "./components/SearchBar";
import { type Category, data } from "./data/cheatsheet";

type FilterCat = Category | "all";

export default function App() {
  const [activeCat, setActiveCat] = useState<FilterCat>("all");
  const [search, setSearch] = useState("");

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
            e.cmd.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q)),
        )
      );
    });
  }, [activeCat, search]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[#e8eaf0] px-6 pt-8 pb-16">
      {/* header */}
      <header className="flex items-baseline gap-4 mb-10 flex-wrap">
        <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-[800] tracking-[-0.03em] text-white font-sans">
          LiveKit Debug
        </h1>
        <span className="font-mono text-[11px] text-[#6b7280] tracking-[.08em] uppercase">
          Cheatsheet
        </span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[rgba(0,212,170,.12)] text-[var(--lk)] border border-[rgba(0,212,170,.25)]">
          v2026.04
        </span>
      </header>

      <FilterTabs active={activeCat} onChange={setActiveCat} />
      <SearchBar value={search} onChange={setSearch} />

      {filtered.length === 0 ? (
        <p className="text-center py-12 font-mono text-[13px] text-[#6b7280]">
          没有匹配的命令
        </p>
      ) : (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {filtered.map((card) => (
            <CheatCard key={`${card.cat}-${card.tool}`} card={card} />
          ))}
        </div>
      )}
    </main>
  );
}
