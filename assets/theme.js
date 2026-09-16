import { THEME } from "./config.js";
import { $ } from "./dom.js";

let currentTheme = localStorage.getItem("theme") || THEME.light;
let onThemeChanged = null;

/** Aplica o tema e atualiza o texto do botão principal. */
export function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  $("#themeBtn").textContent =
    currentTheme === THEME.dark ? "Tema claro" : "Tema escuro";

  if (typeof onThemeChanged === "function") {
    onThemeChanged(currentTheme);
  }
}

/** Alterna entre os temas claro e escuro. */
export function toggleTheme() {
  currentTheme =
    currentTheme === THEME.dark ? THEME.light : THEME.dark;

  localStorage.setItem("theme", currentTheme);
  applyTheme();
}

/** Permite ao visualizador redesenhar o PDF ao mudar o tema. */
export function registerThemeChangeHandler(handler) {
  onThemeChanged = handler;
}

export function isDarkTheme() {
  return currentTheme === THEME.dark;
}
