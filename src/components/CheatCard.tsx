import { CATEGORY_COLORS, CATEGORY_TAG_STYLES, type Card } from "../data/cheatsheet";
import { CopyButton } from "./CopyButton";

export function CheatCard({ card }: { card: Card }) {
  const color = CATEGORY_COLORS[card.cat];
  const tagStyle = CATEGORY_TAG_STYLES[card.cat];

  return (
    <div className="bg-[var(--bg2)] border border-[rgba(255,255,255,0.07)] rounded-[10px] overflow-hidden transition-all duration-150 hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-px">
      {/* header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[rgba(255,255,255,0.07)]">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span
          className="font-mono text-[12px] font-bold tracking-[.04em] flex-1"
          style={{ color }}
        >
          {card.tool}
        </span>
        <span className="font-mono text-[11px] text-[#6b7280]">
          {card.entries.length} 条
        </span>
      </div>

      {/* entries */}
      {card.entries.map((entry, i) => (
        <div
          key={i}
          className="px-3.5 py-2.5 border-b border-[rgba(255,255,255,0.07)] last:border-b-0 transition-colors duration-100 hover:bg-[var(--bg3)]"
        >
          <p className="font-mono text-[12px] text-[#6b7280] mb-1.5 leading-[1.5]">
            {entry.desc}
          </p>
          <div className="flex items-start gap-2">
            <pre className="font-mono text-[11.5px] text-[#b0bec5] bg-[var(--bg)] border border-[rgba(255,255,255,0.06)] rounded-[5px] px-2.5 py-1.5 flex-1 leading-[1.6] whitespace-pre overflow-x-auto scrollbar-none">
              {entry.cmd}
            </pre>
            <CopyButton text={entry.cmd} />
          </div>
          <div className="flex gap-1 flex-wrap mt-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] px-1.5 py-0.5 rounded-[3px] tracking-[.06em] uppercase opacity-75"
                style={Object.fromEntries(
                  tagStyle.split(";").filter(Boolean).map((s) => {
                    const [k, v] = s.split(":").map((x) => x.trim());
                    return [k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v];
                  }),
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
