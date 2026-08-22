const CACHE_KEY = "password-app-sites-cache";
const THEME_KEY = "password-app-theme";

function loadCachedSites() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function cacheSites(sites) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(sites));
  } catch (e) {
    // ignore
  }
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
