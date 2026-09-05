"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  tenantSlug: string;
  showLabel?: boolean;
}

export function ShareButton({ tenantSlug, showLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/${tenantSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Bagikan Link Toko"
      className="flex items-center justify-center gap-2 p-2 px-3 rounded-[0.8rem] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shrink-0"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {showLabel && <span className="text-xs font-bold">{copied ? "Disalin!" : "Bagikan Link"}</span>}
    </button>
  );
}
