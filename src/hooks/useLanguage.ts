import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY, LANGUAGES, type LanguageCode } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

const CODES = LANGUAGES.map((l) => l.code) as readonly string[];
const RTL = new Set(["ur"]);

export function isSupportedLanguage(code: string | null | undefined): code is LanguageCode {
  return !!code && CODES.includes(code);
}

/**
 * Language state. Persisted in localStorage for guests and mirrored into
 * user_preferences.preferred_language when signed in.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>(
    () => (i18n.language as LanguageCode) ?? "en",
  );

  // Hydrate from storage / saved preference after mount (avoids SSR mismatch).
  useEffect(() => {
    let active = true;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored) && stored !== i18n.language) {
      void i18n.changeLanguage(stored);
      setLanguageState(stored);
    }

    void supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id;
      if (!userId || !active) return;
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("preferred_language")
        .eq("id", userId)
        .maybeSingle();
      const saved = prefs?.preferred_language;
      if (active && isSupportedLanguage(saved)) {
        void i18n.changeLanguage(saved);
        setLanguageState(saved);
      }
    });

    return () => {
      active = false;
    };
  }, [i18n]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    document.documentElement.dir = RTL.has(language) ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback(
    async (code: LanguageCode) => {
      setLanguageState(code);
      await i18n.changeLanguage(code);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (userId) {
        await supabase
          .from("user_preferences")
          .upsert({ id: userId, preferred_language: code, updated_at: new Date().toISOString() });
      }
    },
    [i18n],
  );

  return { language, setLanguage };
}
