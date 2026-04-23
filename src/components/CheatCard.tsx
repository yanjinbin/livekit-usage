/**
 * CheatCard — 两级手风琴卡片
 *
 * Level 1（默认可见）：命令行模板 + 中文简洁描述 + chevron
 * Level 2（点击展开）：示例输入 + 示例输出 + 字段解释（全局开关控制）
 */
import { ChevronDown, Terminal } from "lucide-react";
import { useState } from "react";
import { CATEGORY_COLORS, CATEGORY_TAG_STYLES, type Card } from "../data/cheatsheet";
import { CopyButton } from "./CopyButton";

interface CheatCardProps {
  card: Card;
  showExplain: boolean;
}

export function CheatCard({ card, showExplain }: CheatCardProps) {
  const color      = CATEGORY_COLORS[card.cat];
  const tagStyle   = CATEGORY_TAG_STYLES[card.cat];
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const tagStyleObj = Object.fromEntries(
    tagStyle.split(";").filter(Boolean).map((s) => {
      const [k, v] = s.split(":").map((x) => x.trim());
      return [k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v];
    }),
  );

  return (
    <div className="bg-[var(--bg2)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden transition-all duration-150 hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.4)]">

      {/* 卡头 */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.07)]">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="font-mono text-[14px] font-bold tracking-[.04em] flex-1 leading-none" style={{ color }}>
          {card.tool}
        </span>
        <span className="font-mono text-[12px] text-[#6b7280] leading-none">
          {card.entries.length} 条
        </span>
      </div>

      {card.entries.map((entry, i) => {
        const isOpen  = openSet.has(i);
        const hasEx   = !!entry.example;

        // Level 1 命令预览：取第一行，超长截断
        const cmdPreview = entry.cmd.split("\n")[0].replace(/\s*\\$/, "").trim();

        return (
          <div key={i} className="border-b border-[rgba(255,255,255,0.07)] last:border-b-0">

            {/* ── Level 1：点击触发行 ── */}
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer select-none transition-colors duration-100 hover:bg-[var(--bg3)] group"
            >
              {/* 左列：命令预览 + 描述 */}
              <div className="flex-1 min-w-0">
                {/* 命令行（Level 1 核心） */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Terminal size={11} className="flex-shrink-0 opacity-40" style={{ color }} />
                  <code
                    className="font-mono text-[12px] truncate"
                    style={{ color }}
                  >
                    {cmdPreview}
                  </code>
                </div>
                {/* 中文简洁描述 */}
                <p className="font-mono text-[13px] text-[#8b9ab0] leading-[1.5]">
                  {entry.desc}
                </p>
              </div>

              {/* 右列：chevron + 有无示例指示 */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                {hasEx && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.08)] text-[#6b7280] leading-none">
                    示例
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className="text-[#6b7280] transition-transform duration-200 flex-shrink-0"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </div>
            </button>

            {/* ── Level 2：展开内容（CSS grid 高度动画） ── */}
            <div
              className="grid transition-[grid-template-rows] duration-250 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 space-y-3">

                  {/* 完整命令模板 */}
                  <Section label="命令">
                    <div className="flex items-start gap-2">
                      <pre className="font-mono text-[12.5px] text-[#c9d1d9] bg-[var(--bg)] border border-[rgba(255,255,255,0.06)] rounded-[6px] px-3 py-2 flex-1 leading-[1.7] whitespace-pre overflow-x-auto scrollbar-none">
                        {entry.cmd}
                      </pre>
                      <CopyButton text={entry.cmd} />
                    </div>
                  </Section>

                  {/* 示例输入输出 */}
                  {hasEx && (
                    <>
                      <Section label="示例输入">
                        <div className="flex items-start gap-2">
                          <pre className="font-mono text-[12px] text-[#a8c8a0] bg-[rgba(129,199,132,0.04)] border border-[rgba(129,199,132,0.12)] rounded-[6px] px-3 py-2 flex-1 leading-[1.7] whitespace-pre overflow-x-auto scrollbar-none">
                            {entry.example!.input}
                          </pre>
                          <CopyButton text={entry.example!.input} />
                        </div>
                      </Section>

                      <Section label="示例输出">
                        <pre className="font-mono text-[12px] text-[#90a4b8] bg-[rgba(79,195,247,0.03)] border border-[rgba(79,195,247,0.1)] rounded-[6px] px-3 py-2 w-full leading-[1.7] whitespace-pre overflow-x-auto scrollbar-none">
                          {entry.example!.output}
                        </pre>
                      </Section>

                      {/* 字段解释：全局开关控制 */}
                      <div
                        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                        style={{ gridTemplateRows: showExplain ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <Section label="字段说明">
                            <pre className="font-mono text-[11.5px] text-[#b0a0d0] bg-[rgba(206,147,216,0.04)] border border-[rgba(206,147,216,0.12)] rounded-[6px] px-3 py-2 w-full leading-[1.9] whitespace-pre overflow-x-auto scrollbar-none">
                              {entry.example!.explain}
                            </pre>
                          </Section>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-[3px] tracking-[.06em] uppercase opacity-80 leading-none"
                        style={tagStyleObj}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 带标签的内容区块 */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-[.08em] mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
