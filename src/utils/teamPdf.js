import regularFontUrl from "../assets/fonts/NotoSans-Regular.ttf?url";
import boldFontUrl from "../assets/fonts/NotoSans-Bold.ttf?url";
import { buildTeamReport, reportDate } from "./teamReport.js";

let fontAssets;
async function loadFontAssets() {
  if (!fontAssets)
    fontAssets = Promise.all(
      [regularFontUrl, boldFontUrl].map(async (url) => {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(
            "Não foi possível carregar as fontes do PDF. Atualize a página e tente novamente.",
          );
        return new Uint8Array(await response.arrayBuffer());
      }),
    ).catch((error) => {
      fontAssets = null;
      throw error;
    });
  return fontAssets;
}

export async function createTeamPdf(options) {
  const model = buildTeamReport(options);
  const onProgress = options.onProgress || (() => {});
  const [{ PDFDocument, PageSizes, rgb }, { default: fontkit }, fontBytes] =
    await Promise.all([
      import("pdf-lib"),
      import("@pdf-lib/fontkit"),
      loadFontAssets(),
    ]);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(fontBytes[0], { subset: true });
  const bold = await pdf.embedFont(fontBytes[1], { subset: true });
  pdf.setTitle(`New Gears · Relatório da equipe · ${model.scopeName}`);
  pdf.setAuthor("New Gears");
  pdf.setSubject("Relatório dos dados registrados pela equipe FLL");
  pdf.setLanguage("pt-BR");
  const navy = rgb(0.07, 0.12, 0.21),
    teal = rgb(0.02, 0.4, 0.46),
    ink = rgb(0.15, 0.19, 0.25),
    muted = rgb(0.36, 0.41, 0.47),
    lineColor = rgb(0.86, 0.89, 0.92);
  const [pageWidth, pageHeight] = PageSizes.A4;
  const margin = 45,
    contentWidth = pageWidth - margin * 2,
    bottom = 64;
  const characters = new Set(regular.getCharacterSet());
  const normalize = (value) =>
    [
      ...String(value ?? "")
        .normalize("NFC")
        .replace(/\r\n?/g, "\n")
        .replace(/\t/g, "    "),
    ]
      .filter(
        (character) =>
          character === "\n" ||
          (character.codePointAt(0) >= 32 && character.codePointAt(0) !== 127),
      )
      .map((character) =>
        character === "\n" || characters.has(character.codePointAt(0))
          ? character
          : "?",
      )
      .join("");
  let page, cursor;
  const newPage = () => {
    if (pdf.getPageCount() >= 1000)
      throw new Error(
        "O relatório ultrapassou 1.000 páginas. Exporte uma temporada por vez.",
      );
    page = pdf.addPage(PageSizes.A4);
    cursor = pageHeight - 78;
    page.drawText("NEW GEARS  /  RELATÓRIO DA EQUIPE", {
      x: margin,
      y: pageHeight - 35,
      size: 9,
      font: bold,
      color: teal,
    });
    page.drawLine({
      start: { x: margin, y: pageHeight - 46 },
      end: { x: pageWidth - margin, y: pageHeight - 46 },
      thickness: 0.8,
      color: lineColor,
    });
  };
  const ensure = (height) => {
    if (!page || cursor - height < bottom) newPage();
  };
  function wrap(value, font, size, width = contentWidth) {
    const lines = [];
    for (const paragraph of normalize(value).split("\n")) {
      if (!paragraph.trim()) {
        lines.push("");
        continue;
      }
      let line = "";
      for (const word of paragraph.trim().split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= width) {
          line = candidate;
          continue;
        }
        if (line) {
          lines.push(line);
          line = "";
        }
        if (font.widthOfTextAtSize(word, size) <= width) {
          line = word;
          continue;
        }
        let chunk = "";
        for (const character of word) {
          if (
            chunk &&
            font.widthOfTextAtSize(chunk + character, size) > width
          ) {
            lines.push(chunk);
            chunk = "";
          }
          chunk += character;
        }
        line = chunk;
      }
      if (line) lines.push(line);
    }
    return lines;
  }
  function paragraph(
    value,
    { font = regular, size = 10, color = ink, indent = 0, spacing = 5 } = {},
  ) {
    for (const line of wrap(value, font, size, contentWidth - indent)) {
      ensure(size * 1.48);
      if (line)
        page.drawText(line, {
          x: margin + indent,
          y: cursor,
          size,
          font,
          color,
        });
      cursor -= size * 1.48;
    }
    cursor -= spacing;
  }
  newPage();
  page.drawRectangle({
    x: 0,
    y: pageHeight - 220,
    width: pageWidth,
    height: 156,
    color: navy,
  });
  cursor = pageHeight - 103;
  paragraph("Relatório da equipe", {
    font: bold,
    size: 25,
    color: rgb(1, 1, 1),
    spacing: 10,
  });
  paragraph(model.scopeName, { size: 13, color: rgb(0.7, 0.89, 0.91) });
  cursor = pageHeight - 247;
  paragraph(`Gerado em ${reportDate(model.startedAt)}`, { color: muted });
  paragraph(
    `${model.rosterCount} integrante(s) · ${model.recordCount} registro(s) consultado(s) · ${model.sections.length} seção(ões) com conteúdo`,
    { font: bold },
  );
  paragraph(
    "Este documento apresenta os dados textuais registrados no sistema. O acervo compartilhado é identificado nas seções correspondentes. Fotografias, arquivos originais e o conteúdo interno de PDFs ou documentos Word não são incorporados neste relatório.",
    { color: muted },
  );
  if (model.omissions.length) {
    paragraph("Disponibilidade dos dados", {
      font: bold,
      size: 12,
      color: teal,
    });
    model.omissions.forEach((omission) =>
      paragraph(omission, { color: muted }),
    );
  }
  paragraph("Conteúdo", { font: bold, size: 14, color: navy, spacing: 8 });
  model.sections.forEach((section, index) =>
    paragraph(`${index + 1}. ${section.title} (${section.items.length})`, {
      size: 9,
      color: muted,
      spacing: 1,
    }),
  );
  for (let index = 0; index < model.sections.length; index += 1) {
    const section = model.sections[index];
    onProgress(
      `Gerando PDF: ${section.title} (${index + 1}/${model.sections.length})…`,
    );
    newPage();
    paragraph(`${index + 1}. ${section.title}`, {
      font: bold,
      size: 18,
      color: navy,
      spacing: 9,
    });
    if (section.description)
      paragraph(section.description, { color: muted, spacing: 12 });
    for (let itemIndex = 0; itemIndex < section.items.length; itemIndex += 1) {
      const item = section.items[itemIndex];
      ensure(65);
      paragraph(item.title, { font: bold, size: 11, color: teal });
      if (item.fields.length)
        for (const [label, value] of item.fields)
          paragraph(`${label}: ${value}`, { indent: 7 });
      else
        paragraph("Registro sem descrição adicional.", {
          color: muted,
          indent: 7,
        });
      ensure(14);
      page.drawLine({
        start: { x: margin, y: cursor },
        end: { x: pageWidth - margin, y: cursor },
        thickness: 0.5,
        color: lineColor,
      });
      cursor -= 17;
      if (itemIndex % 30 === 0)
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  const pages = pdf.getPages();
  for (let index = 0; index < pages.length; index += 1) {
    const current = pages[index];
    current.drawLine({
      start: { x: margin, y: 45 },
      end: { x: pageWidth - margin, y: 45 },
      thickness: 0.5,
      color: lineColor,
    });
    current.drawText("New Gears · Registro da equipe", {
      x: margin,
      y: 29,
      size: 8,
      font: regular,
      color: muted,
    });
    const counter = `${index + 1} / ${pages.length}`;
    current.drawText(counter, {
      x: pageWidth - margin - regular.widthOfTextAtSize(counter, 8),
      y: 29,
      size: 8,
      font: regular,
      color: muted,
    });
  }
  onProgress("Finalizando o arquivo PDF…");
  return new Blob([await pdf.save()], { type: "application/pdf" });
}
