/** Atalho para querySelector. */
export const $ = (selector) => document.querySelector(selector);

/** Atalho para querySelectorAll convertido em Array. */
export const $$ = (selector) => [
  ...document.querySelectorAll(selector),
];

/**
 * Escapa caracteres especiais antes de inserir dados no HTML.
 */
export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>\"]/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[character],
  );
}
