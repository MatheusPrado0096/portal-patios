import { $, escapeHtml } from "./dom.js";

export const patios = Array.isArray(window.PATIOS) ? window.PATIOS : [];

export const items = patios.flatMap((patio) =>
  (patio.itens || []).map((item) => ({
    ...item,
    patioId: patio.id,
    patioNome: patio.nome,
    patioLabel: patio.label,
    planta: patio.planta,
  })),
);

/**
 * Mantém a categoria específica do catálogo.
 * FGA exibe PN 05 / FGA-PN01 e PN 10 / FGA-PN02.
 * FCE continua exibindo o tipo definido no data.js.
 */
function getDisplayType(item) {
  if (item.patioId === "FGA" || item.patioId === "FCE") {
    return item.tipo;
  }

  return "Abrigo";
}

export function createItemCard(item) {
  const displayType = getDisplayType(item);
  const locationDisabled = item.link ? "" : "disabled";

  return `
    <article class="card">
      <span class="tag">${escapeHtml(displayType)}</span>

      <h3>
        ${escapeHtml(item.nome)}
        <span aria-hidden="true">•</span>
        ${escapeHtml(item.codigo)}
      </h3>

      <p>${escapeHtml(item.patioNome)}</p>

      <div class="actions">
        <button
          class="primary item-pdf"
          data-code="${escapeHtml(item.codigo)}"
          type="button"
        >
          Abrir PDF
        </button>

        <button
          class="location item-link"
          data-code="${escapeHtml(item.codigo)}"
          type="button"
          ${locationDisabled}
        >
          📍 Localização
        </button>
      </div>
    </article>
  `;
}

export function renderPatioOptions() {
  const options = patios
    .map(
      (patio) => `
        <option value="${escapeHtml(patio.id)}">
          ${escapeHtml(patio.id)} • ${escapeHtml(patio.nome)}
        </option>
      `,
    )
    .join("");

  const content = `
    <option value="">Todos os pátios</option>
    ${options}
  `;

  $("#equipYard").innerHTML = content;
  $("#searchYard").innerHTML = content;
}

export function renderPatioCards() {
  $("#yardCards").innerHTML = patios
    .map(
      (patio) => `
        <article class="card">
          <span class="tag">${escapeHtml(patio.label)}</span>
          <h3>${escapeHtml(patio.id)} • ${escapeHtml(patio.nome)}</h3>
          <p>${patio.itens.length} item(ns)</p>

          <div class="actions">
            <button
              class="primary plant"
              data-patio="${escapeHtml(patio.id)}"
              type="button"
            >
              Abrir planta
            </button>

            <button
              class="list"
              data-patio="${escapeHtml(patio.id)}"
              type="button"
            >
              Ver ${escapeHtml(patio.label)}
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

export function renderEquipmentCards() {
  const selectedPatio = $("#equipYard").value;
  const patio = patios.find((item) => item.id === selectedPatio);
  const filteredItems = items.filter(
    (item) => !selectedPatio || item.patioId === selectedPatio,
  );

  $("#equipTitle").textContent = patio
    ? patio.label
    : "Abrigos, PN e CX";

  $("#equipCards").innerHTML = filteredItems
    .map(createItemCard)
    .join("");
}

export function renderSearchResults() {
  const query = $("#search").value.trim().toLowerCase();
  const selectedPatio = $("#searchYard").value;

  const filteredItems = items.filter((item) => {
    const searchableText = [
      item.tipo,
      item.nome,
      item.codigo,
      item.patioNome,
      item.patioId,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchableText.includes(query)) &&
      (!selectedPatio || item.patioId === selectedPatio)
    );
  });

  $("#resultCount").textContent = `${filteredItems.length} resultados`;
  $("#results").innerHTML = filteredItems.map(createItemCard).join("");
}
