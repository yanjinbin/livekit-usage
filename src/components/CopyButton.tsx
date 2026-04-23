/**
 * CopyButton.tsx — 一键复制按钮
 *
 * 点击后调用 Clipboard API 复制文本，
 * 图标短暂切换为勾选状态（1.5s）后自动还原。
 * 不依赖任何第三方 toast 库，靠图标变化给出视觉反馈。
 */
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  /** 要复制到剪贴板的命令文本 */
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  // copied: true → 显示勾选图标 + 绿色高亮；超时后还原
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      // 1.5s 后自动还原，给用户足够时间看到反馈
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="复制命令"
      className={[
        // 固定尺寸正方形
        "flex-shrink-0 w-8 h-8",
        "flex items-center justify-center rounded-[4px]",
        "border transition-all duration-150 cursor-pointer mt-0.5",
        // 已复制：绿色调；未复制：暗色 + hover 浅色
        copied
          ? "bg-[rgba(0,212,170,.15)] border-[rgba(0,212,170,.4)]"
          : "bg-[var(--bg3)] border-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,.08)] hover:border-[rgba(255,255,255,0.15)]",
      ].join(" ")}
    >
      {copied ? (
        /* 勾选图标：绿色，stroke 稍粗增强可见性 */
        <Check size={14} className="text-[var(--lk)]" strokeWidth={2.5} />
      ) : (
        /* 复制图标：灰色，细线 */
        <Copy size={14} className="text-[#6b7280]" strokeWidth={1.5} />
      )}
    </button>
  );
}
