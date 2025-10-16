// ------------------------------
// Mobile menu (existing behavior)
// ------------------------------
const burger = document.querySelector(".hamburguer-menu");
if (burger) {
  burger.addEventListener("click", () => {
    document.querySelector(".body")?.classList.toggle("change");
  });
}

// ------------------------------
// i18n loader & switcher
// ------------------------------
(function () {
  const I18N_PATH = "assets/i18n/translations.json";
  const LS_KEY = "qm_lang";
  const DEFAULT_LANG = "es";

  // Resolve nested value by path "a.b.c"
  const byPath = (obj, path) =>
    path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);

  // Set active state on [data-lang] buttons if present
  const markActive = (lang) => {
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active-lang");
        btn.setAttribute("aria-current", "true");
      } else {
        btn.classList.remove("active-lang");
        btn.removeAttribute("aria-current");
      }
    });
  };

  // Apply translations to all elements with [data-i18n]
  const applyTranslations = (dict, lang) => {
    const langDict = dict[lang] || dict[DEFAULT_LANG] || {};
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = byPath(langDict, key);
      if (typeof val === "string") {
        // Prefer textContent to avoid breaking existing markup
        el.textContent = val;
      } else if (val != null) {
        el.textContent = String(val);
      } else {
        // Silent fallback: leave existing text if key not found
        // console.warn(`[i18n] Missing key for "${key}" in "${lang}"`);
      }
    });
    markActive(lang);
  };

  // Keep translations in memory
  let translations = null;

  // Load JSON once
  const loadTranslations = () =>
    translations
      ? Promise.resolve(translations)
      : fetch(I18N_PATH, { cache: "no-store" })
          .then((r) => {
            if (!r.ok) throw new Error(`i18n file not found (${r.status})`);
            return r.json();
          })
          .then((json) => (translations = json))
          .catch((err) => {
            console.error("[i18n] Load error:", err);
            translations = {};
            return translations;
          });

  // Switch language and persist
  const setLang = (lang) => {
    const target = lang || DEFAULT_LANG;
    localStorage.setItem(LS_KEY, target);
    return loadTranslations().then((dict) => applyTranslations(dict, target));
  };

  // Wire up click handlers when buttons exist
  const bindButtons = () => {
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lang = btn.getAttribute("data-lang");
        if (lang) {
          e.preventDefault();
          setLang(lang);
        }
      });
    });
  };

  // Public API for manual switching (useful in console/tests)
  window.qmI18n = { setLang, get current() { return localStorage.getItem(LS_KEY) || DEFAULT_LANG; } };

  // Init on DOM ready
  const init = () => {
    bindButtons();
    const startLang = localStorage.getItem(LS_KEY) || DEFAULT_LANG;
    setLang(startLang);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();