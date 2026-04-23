import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative mb-8">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"
        strokeWidth={1.5}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索命令或场景..."
        autoComplete="off"
        className="w-full max-w-[420px] bg-[var(--bg2)] border border-[rgba(255,255,255,0.07)] rounded-[6px] pl-9 pr-3.5 py-2 font-mono text-[13px] text-[#e8eaf0] outline-none transition-colors duration-150 focus:border-[rgba(255,255,255,0.15)] placeholder:text-[#6b7280]"
      />
    </div>
  );
}
