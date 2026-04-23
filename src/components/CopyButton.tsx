import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        "flex-shrink-0 w-7 h-7 flex items-center justify-center rounded",
        "border transition-all duration-150 cursor-pointer mt-0.5",
        copied
          ? "bg-[rgba(0,212,170,.15)] border-[rgba(0,212,170,.4)]"
          : "bg-[var(--bg3)] border-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,.08)] hover:border-[rgba(255,255,255,0.15)]",
      ].join(" ")}
    >
      {copied ? (
        <Check size={13} className="text-[var(--lk)]" strokeWidth={2} />
      ) : (
        <Copy size={13} className="text-[#6b7280]" strokeWidth={1.5} />
      )}
    </button>
  );
}
