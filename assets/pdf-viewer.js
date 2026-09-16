import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

import { PDF_CONFIG } from "./config.js";
import { $ } from "./dom.js";
import { isDarkTheme } from "./theme.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

let pdfDocument = null;
let pageNumber = 1;
let zoom = 1;
let currentUrl = "";
let currentFileName = "";
let renderTask = null;

/**
 * Converte todas as cores técnicas do desenho para alto contraste.
 * Tema claro: fundo branco, linhas e textos pretos.
 * Tema escuro: fundo preto, linhas e textos brancos.
 */
function applyMonochromeContrast(canvas, context) {
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = image.data;
  const darkTheme = isDarkTheme();

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    const ink = 255 - Math.min(red, green, blue);
    const color = darkTheme ? ink : 255 - ink;

    pixels[index] = color;
    pixels[index + 1] = color;
    pixels[index + 2] = color;
    pixels[index + 3] = 255;
  }

  context.putImageData(image, 0, 0);
}

/** Renderiza novamente a página na resolução apropriada ao zoom. */
export async function renderCurrentPage() {
  if (!pdfDocument) {
    return;
  }

  const page = await pdfDocument.getPage(pageNumber);
  const canvas = $("#pdfCanvas");
  const context = canvas.getContext("2d", { alpha: false });
  const pixelRatio = Math.max(
    PDF_CONFIG.minimumPixelRatio,
    window.devicePixelRatio || 1,
  );
  const viewport = page.getViewport({ scale: zoom * pixelRatio });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${viewport.width / pixelRatio}px`;
  canvas.style.height = `${viewport.height / pixelRatio}px`;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (renderTask) {
    try {
      renderTask.cancel();
    } catch {
      // Uma tarefa já concluída não precisa ser cancelada.
    }
  }

  renderTask = page.render({ canvasContext: context, viewport });

  try {
    await renderTask.promise;
  } catch (error) {
    if (error.name !== "RenderingCancelledException") {
      throw error;
    }
  }

  applyMonochromeContrast(canvas, context);
  $("#pdfLoading").hidden = true;
  $("#pageInfo").textContent = `${pageNumber}/${pdfDocument.numPages}`;
  $("#zoomInfo").textContent = `${Math.round(zoom * 100)}%`;
  $("#prevPage").disabled = pageNumber <= 1;
  $("#nextPage").disabled = pageNumber >= pdfDocument.numPages;
}

/** Ajusta a página à largura disponível. */
export async function fitPdfToWidth() {
  if (!pdfDocument) {
    return;
  }

  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const availableWidth = $("#pdfStage").clientWidth - 24;

  zoom = Math.min(
    PDF_CONFIG.fitMaxZoom,
    availableWidth / viewport.width,
  );

  await renderCurrentPage();
}

/** Abre um PDF dentro do modal do portal. */
export async function openPdf(path, title) {
  currentUrl = path;
  currentFileName = path.split("/").pop();
  pageNumber = 1;
  zoom = 1;

  $("#viewerTitle").textContent = title;
  $("#viewerSub").textContent = currentFileName;
  $("#viewer").classList.add("open");
  $("#viewer").setAttribute("aria-hidden", "false");
  $("#pdfLoading").hidden = false;
  $("#pdfLoading").textContent = "Carregando PDF...";

  try {
    pdfDocument = await pdfjsLib.getDocument(encodeURI(path)).promise;
    await fitPdfToWidth();
  } catch (error) {
    console.error("Falha ao abrir o PDF:", error);
    $("#pdfLoading").textContent =
      "PDF não encontrado. Confira a pasta e o nome do arquivo.";
  }
}

/** Fecha o PDF e libera os recursos em memória. */
export function closePdf() {
  $("#viewer").classList.remove("open");
  $("#viewer").setAttribute("aria-hidden", "true");

  try {
    pdfDocument?.destroy();
  } catch {
    // O documento pode já ter sido liberado.
  }

  pdfDocument = null;
}

export function previousPage() {
  if (pageNumber > 1) {
    pageNumber -= 1;
    renderCurrentPage();
  }
}

export function nextPage() {
  if (pdfDocument && pageNumber < pdfDocument.numPages) {
    pageNumber += 1;
    renderCurrentPage();
  }
}

export function zoomIn() {
  zoom = Math.min(PDF_CONFIG.maxZoom, zoom * PDF_CONFIG.zoomFactor);
  renderCurrentPage();
}

export function zoomOut() {
  zoom = Math.max(PDF_CONFIG.minZoom, zoom / PDF_CONFIG.zoomFactor);
  renderCurrentPage();
}

/** Baixa o mesmo PDF que está aberto no visualizador. */
export async function exportCurrentPdf() {
  if (!currentUrl) {
    return;
  }

  const response = await fetch(encodeURI(currentUrl));
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = currentFileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function hasOpenPdf() {
  return Boolean(pdfDocument);
}
