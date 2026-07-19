import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const ThemeContext = createContext(null);
const VALID_THEMES = ["sage", "midnight", "amber"];
const STORAGE_KEY = "rg-theme";

function applyTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : "sage";
  });

  // Apply immediately on mount and whenever it changes, so there's no
  // flash of the wrong theme.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = async (id, { persist = true } = {}) => {
    if (!VALID_THEMES.includes(id)) return;
    setThemeState(id);
    localStorage.setItem(STORAGE_KEY, id);
    if (persist) {
      try {
        await api.put("/auth/preferences", { theme: id });
      } catch {
        // If saving fails (e.g. logged out), the theme still applies
        // locally — it just won't persist across devices/sessions.
      }
    }
  };

  // Called by AuthContext once we know the logged-in user's saved theme,
  // without re-triggering a save-to-backend call.
  const syncFromUser = (id) => {
    if (VALID_THEMES.includes(id) && id !== theme) {
      setThemeState(id);
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, syncFromUser, THEMES: VALID_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
