import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import bn from "./locales/bn/translation.json";
import gu from "./locales/gu/translation.json";
import kn from "./locales/kn/translation.json";
import ml from "./locales/ml/translation.json";
import mr from "./locales/mr/translation.json";
import pa from "./locales/pa/translation.json";
import ta from "./locales/ta/translation.json";
import te from "./locales/te/translation.json";
import or from "./locales/or/translation.json";
import ur from "./locales/ur/translation.json";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ur", label: "Urdu", native: "اردو" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const LANGUAGE_STORAGE_KEY = "sentinel_language";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      gu: { translation: gu },
      kn: { translation: kn },
      ml: { translation: ml },
      mr: { translation: mr },
      pa: { translation: pa },
      ta: { translation: ta },
      te: { translation: te },
      or: { translation: or },
      ur: { translation: ur },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
