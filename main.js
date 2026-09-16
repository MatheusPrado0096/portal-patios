import { $, $$ } from "./dom.js";
import {
  patios,
  items,
  renderEquipmentCards,
  renderPatioCards,
  renderPatioOptions,
  renderSearchResults,
} from "./catalog.js";
import {
  closePdf,
  exportCurrentPdf,
  fitPdfToWidth,
  hasOpenPdf,
  nextPage,
  openPdf,
  previousPage,
  renderCurrentPage,
  zoomIn,
  zoomOut,
} from "./pdf-viewer.js";
import {
  applyTheme,
  registerThemeChangeHandler,
  toggleTheme,
} from "./theme.js";

/** Exibe uma seção principal do portal. */
function activateTab(tabId) {
  $$(".tab, .panel").forEach((element) =>
    element.classList.remove("active"),
  );

  $(`.tab[data-tab="${tabId}"]`).classList.add("active");
  $(`#${tabId}`).classList.add("active");
}

/** Trata os botões criados dinamicamente nos cartões. */
function handleDynamicClick(event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const patio = patios.find(
    (item) => item.id === button.dataset.patio,
  );
  const item = items.find(
    (catalogItem) => catalogItem.codigo === button.dataset.code,
  );

  if (button.classList.contains("plant") && patio) {
    openPdf(patio.planta, `${patio.id} • Planta geral`);
  }

  if (button.classList.contains("list") && patio) {
    $("#equipYard").value = patio.id;
    renderEquipmentCards();
    activateTab("equipamentos");
  }

  if (button.classList.contains("item-pdf") && item) {
    openPdf(item.pdf, `${item.nome} • ${item.codigo}`);
  }

  if (button.classList.contains("item-link") && item?.link) {
    window.open(item.link, "_blank", "noopener,noreferrer");
  }
}

/** Conecta os elementos fixos da página às funções do portal. */
function registerEvents() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () =>
      activateTab(button.dataset.tab),
    );
  });

  document.addEventListener("click", handleDynamicClick);

  $("#equipYard").addEventListener("change", renderEquipmentCards);
  $("#searchYard").addEventListener("change", renderSearchResults);
  $("#search").addEventListener("input", renderSearchResults);

  $("#clearBtn").addEventListener("click", () => {
    $("#search").value = "";
    $("#searchYard").value = "";
    renderSearchResults();
  });

  $("#themeBtn").addEventListener("click", toggleTheme);
  $("#viewerTheme").addEventListener("click", toggleTheme);
  $("#closeViewer").addEventListener("click", closePdf);
  $("#prevPage").addEventListener("click", previousPage);
  $("#nextPage").addEventListener("click", nextPage);
  $("#zoomIn").addEventListener("click", zoomIn);
  $("#zoomOut").addEventListener("click", zoomOut);
  $("#fitWidth").addEventListener("click", fitPdfToWidth);
  $("#exportPdf").addEventListener("click", exportCurrentPdf);

  registerThemeChangeHandler(() => {
    if (hasOpenPdf()) {
      renderCurrentPage();
    }
  });
}

/** Inicialização única do portal. */
function initialize() {
  $("#stats").textContent =
    `${patios.length} pátios • ${items.length} itens`;

  renderPatioOptions();
  renderPatioCards();
  renderEquipmentCards();
  renderSearchResults();
  registerEvents();
  applyTheme();
}

initialize();
