import { Globe } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <label className="inline-flex items-center gap-1.5" title="Language">
      <Globe className="h-4 w-4 shrink-0 opacity-90" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => void setLanguage(e.target.value as LanguageCode)}
        className="cursor-pointer rounded-md border border-current/25 bg-transparent px-1.5 py-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-current/40"
        aria-label="Select language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-foreground">
            {compact ? l.native : `${l.native} · ${l.label}`}
          </option>
        ))}
      </select>
      <span className="sr-only">{current.label}</span>
    </label>
  );
}
