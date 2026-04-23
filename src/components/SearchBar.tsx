/**
 * SearchBar.tsx — 实时搜索输入框
 *
 * 受控组件：value / onChange 由父层（App）管理。
 * 搜索图标用 SVG position:absolute 叠在输入框左侧，
 * 通过 pl-10 留出图标占位，避免文字重叠。
 */
import { Search } from "lucide-react";

interface SearchBarProps {
  value:    string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative mb-8">
      {/* 搜索图标：绝对定位居中，pointer-events-none 避免遮挡点击 */}
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"
        strokeWidth={1.5}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索命令或场景..."
        autoComplete="off"
        className={[
          // 宽度：移动端撑满，桌面端限 480px
          "w-full max-w-[480px]",
          // 外观
          "bg-[var(--bg2)] border border-[rgba(255,255,255,0.07)] rounded-[6px]",
          // 内边距：左边留给图标，右边正常
          "pl-10 pr-4 py-2.5",
          // 字体 & 颜色
          "font-mono text-[14px] text-[#e8eaf0]",
          // 去掉默认 outline，用 focus 边框替代
          "outline-none transition-colors duration-150",
          "focus:border-[rgba(255,255,255,0.2)]",
          "placeholder:text-[#6b7280]",
        ].join(" ")}
      />
    </div>
  );
}
