import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "so";

/**
 * English / Somali strings, carried over and extended from the original
 * language.js on the Rahma site.
 */
const dictionary = {
  // shell / nav
  home: { en: "Home", so: "Bogga hore" },
  about: { en: "About", so: "Naga" },
  academics: { en: "Academics", so: "Waxbarasho" },
  admissions: { en: "Admissions", so: "Qoraalka" },
  gallery: { en: "Gallery", so: "Sawirro" },
  news: { en: "News", so: "Wararka" },
  contact: { en: "Contact", so: "Nala soo xiriir" },
  login: { en: "Login", so: "Gal" },
  logout: { en: "Sign out", so: "Ka bax" },
  apply: { en: "Apply Now", so: "Codso hadda" },
  portal: { en: "Portal", so: "Portal" },

  // marketing
  topWelcome: {
    en: "Welcome to Rahma Junior Education Center",
    so: "Ku soo dhawow Rahma Junior Education Center",
  },
  heroEyebrow: { en: "Foundation for knowledge", so: "Aasaaska aqoonta" },
  heroTitle: {
    en: "Providing the best foundation of education for young children.",
    so: "Bixinta aasaaska ugu fiican waxbarashada carruurta yaryar.",
  },
  heroLead: {
    en: "Dedication, Efficiency, Integrity and Team Work.",
    so: "Go'aan, Hufnaan, Daacadnimo iyo Shaqo Wadajir.",
  },
  discover: { en: "Discover our school", so: "Baro dugsigeenna" },

  // portal shell
  dashboard: { en: "Dashboard", so: "Shaxda guud" },
  students: { en: "Students", so: "Ardayda" },
  classes: { en: "Classes", so: "Fasallada" },
  people: { en: "Staff & Parents", so: "Shaqaalaha & Waalidiinta" },
  attendance: { en: "Attendance", so: "Xaadirinta" },
  timetable: { en: "Timetable", so: "Jadwalka" },
  finance: { en: "Finance", so: "Maaliyadda" },
  fees: { en: "Fees", so: "Lacagta dugsiga" },
  inventory: { en: "Inventory", so: "Alaabta" },
  uniform: { en: "Uniform", so: "Dharka dugsiga" },
  messages: { en: "Messages", so: "Farriimaha" },
  announcements: { en: "Announcements", so: "Ogeysiisyada" },
  profile: { en: "My profile", so: "Xogtayda" },
  children: { en: "My children", so: "Carruurtayda" },
  results: { en: "Results", so: "Natiijada" },
  assignments: { en: "Assignments", so: "Hawlaha" },
  notes: { en: "Notes", so: "Qoraallada" },
  exams: { en: "Exams", so: "Imtixaannada" },
  save: { en: "Save", so: "Kaydi" },
  cancel: { en: "Cancel", so: "Jooji" },
  search: { en: "Search", so: "Raadi" },
  noRecords: { en: "No records found.", so: "Ma jiro diiwaan." },
  loading: { en: "Loading…", so: "Waa la soo dejinayaa…" },

  // auth
  signInTitle: { en: "Sign in to your account", so: "Gal akoonkaaga" },
  signInIntro: {
    en: "Welcome back. Please enter your details.",
    so: "Ku soo dhawow. Fadlan geli xogtaada.",
  },
  email: { en: "Email address", so: "Cinwaanka emailka" },
  password: { en: "Password", so: "Furaha sirta" },
  signIn: { en: "Sign in", so: "Gal" },
  signUp: { en: "Create account", so: "Samee akoon" },
  firstName: { en: "First name", so: "Magaca hore" },
  lastName: { en: "Last name", so: "Magaca dambe" },
  phone: { en: "Phone", so: "Telefoon" },
} as const;

export type TranslationKey = keyof typeof dictionary;

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "rahma-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Read the stored preference after hydration so SSR and first client render match.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "so") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === "en" ? "so" : "en"),
      t: (key) => dictionary[key]?.[lang] ?? dictionary[key]?.en ?? String(key),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
