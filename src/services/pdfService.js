
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_REGULAR = path.resolve(
  __dirname,
  "../assets/font/NotoSansTamil-Bold.ttf"
);

const FONT_BOLD = path.resolve(
  __dirname,
  "../assets/font/NotoSansTamil-Bold.ttf"
);

const COLORS = {
  navy: "#24364B",
  orange: "#F47B35",
  text: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  light: "#F5F7FA",
  white: "#FFFFFF",
};

const money = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateFormat = (date) =>
  new Date(date || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export async function generateEstimatePdf(estimate, client) {
  const dir = path.resolve("uploads/estimates");

  await fs.mkdir(dir, { recursive: true });

  // Check font files before creating the PDF.
  await fs.access(FONT_REGULAR);
  await fs.access(FONT_BOLD);

  const filePath = path.join(
    dir,
    `${estimate.estimateNumber}.pdf`
  );

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 42,
        bottom: 55,
        left: 48,
        right: 48,
      },
      bufferPages: true,
      info: {
        Title: `Estimate ${estimate.estimateNumber}`,
        Author: "MS Painting Works",
        Subject: "Painting Works Quotation",
      },
    });

    const stream = doc.pipe(createWriteStream(filePath));

    let finished = false;

    const fail = (error) => {
      if (finished) return;
      finished = true;
      reject(error);
    };

    stream.on("finish", () => {
      if (finished) return;
      finished = true;
      resolve();
    });

    stream.on("error", fail);
    doc.on("error", fail);

    // Register embedded Unicode fonts.
    doc.registerFont("Tamil", FONT_REGULAR);
    doc.registerFont("TamilBold", FONT_BOLD);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = 48;
    const right = pageWidth - 48;
    const contentWidth = right - left;
    const bottomLimit = pageHeight - 66;

    // Consistent text helpers.
    const text = (value, x, y, options = {}) => {
      doc
        .font(options.bold ? "TamilBold" : "Tamil")
        .fontSize(options.size || 9)
        .fillColor(options.color || COLORS.text)
        .text(String(value ?? ""), x, y, {
          width: options.width,
          align: options.align || "left",
          lineGap: options.lineGap ?? 2,
          ...options.extra,
        });
    };

    const sectionTitle = (title, y) => {
      doc
        .roundedRect(left, y, 4, 15, 2)
        .fill(COLORS.orange);

      text(title, left + 12, y - 1, {
        bold: true,
        size: 10,
        color: COLORS.navy,
      });

      return y + 24;
    };

    // Premium first-page header.
    doc.rect(0, 0, pageWidth, 118).fill(COLORS.navy);

    doc
      .roundedRect(left, 27, 48, 48, 10)
      .fill(COLORS.orange);

    doc
      .font("Helvetica-Bold")
      .fontSize(21)
      .fillColor(COLORS.white)
      .text("MS", left, 40, {
        width: 48,
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(19)
      .fillColor(COLORS.white)
      .text("Painting Works", 108, 30);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#DCE5EF")
      .text("PROFESSIONAL PAINTING SERVICES", 109, 56);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#DCE5EF")
      .text("QUALITY WORK  |  TRUSTED SERVICE", 109, 72);

    // Estimate title and metadata.
    doc
      .font("Helvetica-Bold")
      .fontSize(23)
      .fillColor(COLORS.navy)
      .text("QUOTATION", left, 140);

    doc
      .roundedRect(395, 137, 152, 48, 7)
      .fill(COLORS.light);

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text("QUOTATION NO.", 405, 145);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.navy)
      .text(estimate.estimateNumber || "-", 405, 158, {
        width: 132,
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(`Date: ${dateFormat(estimate.createdAt)}`, left, 174);

    doc
      .moveTo(left, 198)
      .lineTo(right, 198)
      .lineWidth(0.8)
      .strokeColor(COLORS.border)
      .stroke();

    // Client information.
    let y = 215;

    y = sectionTitle("PREPARED FOR / வாடிக்கையாளர் விவரம்", y);

    text(client?.name || "-", left, y, {
      bold: true,
      size: 12,
      color: COLORS.navy,
    });

    y += 21;

    const contactParts = [
      client?.phone,
      client?.email,
      client?.address,
    ].filter(Boolean);

    for (const value of contactParts) {
      const height = doc.heightOfString(String(value), {
        width: contentWidth,
        font: "Tamil",
        fontSize: 9,
        lineGap: 2,
      });

      text(value, left, y, {
        size: 9,
        color: COLORS.muted,
        width: contentWidth,
      });

      y += height + 5;
    }

    y += 14;

    // Items table.
    const drawTableHeader = () => {
      doc
        .roundedRect(left, y, contentWidth, 30, 5)
        .fill(COLORS.navy);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.white);

      doc.text("DESCRIPTION", left + 10, y + 10, {
        width: 220,
      });

      doc.text("AREA (SQ FT)", 295, y + 10, {
        width: 75,
        align: "right",
      });

      doc.text("RATE", 380, y + 10, {
        width: 60,
        align: "right",
      });

      doc.text("AMOUNT", 445, y + 10, {
        width: 92,
        align: "right",
      });

      y += 30;
    };

    drawTableHeader();

    for (let i = 0; i < (estimate.items || []).length; i++) {
      const item = estimate.items[i];

      const description = String(item.description || "-");

      const descriptionHeight = doc.heightOfString(description, {
        width: 215,
        font: "Tamil",
        fontSize: 9,
        lineGap: 2,
      });

      const rowHeight = Math.max(34, descriptionHeight + 16);

      if (y + rowHeight > bottomLimit) {
        doc.addPage();
        y = 48;
        drawTableHeader();
      }

      if (i % 2 === 0) {
        doc
          .rect(left, y, contentWidth, rowHeight)
          .fill(COLORS.light);
      }

      text(description, left + 10, y + 9, {
        size: 9,
        width: 215,
      });

      text(
        Number(item.area || 0).toLocaleString("en-IN"),
        295,
        y + 10,
        {
          size: 8,
          width: 75,
          align: "right",
        }
      );

      text(money(item.rate), 380, y + 10, {
        size: 8,
        width: 60,
        align: "right",
      });

      text(money(item.amount), 445, y + 10, {
        bold: true,
        size: 8,
        width: 92,
        align: "right",
      });

      y += rowHeight;
    }

    y += 18;

    // Totals panel.
    const ensureSpace = (needed) => {
      if (y + needed > bottomLimit) {
        doc.addPage();
        y = 48;
      }
    };

    const totalLine = (label, value, bold = false) => {
      ensureSpace(bold ? 36 : 24);

      text(label, 315, y, {
        bold,
        size: bold ? 11 : 9,
        color: bold ? COLORS.navy : COLORS.muted,
        width: 120,
      });

      text(value, 435, y, {
        bold: true,
        size: bold ? 12 : 9,
        color: COLORS.navy,
        width: 102,
        align: "right",
      });

      y += bold ? 31 : 22;
    };

    totalLine("Subtotal", money(estimate.subtotal));

    if (Number(estimate.discountAmount) > 0) {
      totalLine(
        `Discount (${estimate.discountPercent || 0}%)`,
        `- ${money(estimate.discountAmount)}`
      );
    }

    if (Number(estimate.tax) > 0) {
      totalLine(
        `GST (${estimate.gstRate || 0}%)`,
        money(estimate.tax)
      );
    }

    ensureSpace(45);

    doc
      .roundedRect(305, y, 242, 43, 7)
      .fill(COLORS.navy);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.white)
      .text("TOTAL AMOUNT", 317, y + 15);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.orange)
      .text(money(estimate.total), 410, y + 14, {
        width: 126,
        align: "right",
      });

    y += 61;

    // Notes and terms.
    const renderLongSection = (heading, content) => {
      if (!content) return;

      y = sectionTitle(heading, y);

      const paragraphs = String(content).split(/\r?\n/);

      for (const paragraph of paragraphs) {
        const value = paragraph.trim();

        if (!value) {
          y += 5;
          continue;
        }

        const height = doc.heightOfString(value, {
          width: contentWidth - 4,
          font: "Tamil",
          fontSize: 9,
          lineGap: 3,
        });

        if (y + height + 8 > bottomLimit) {
          doc.addPage();
          y = 48;
          y = sectionTitle(heading + " (CONTINUED)", y);
        }

        text(value, left + 2, y, {
          size: 9,
          width: contentWidth - 4,
          color: COLORS.text,
          lineGap: 3,
        });

        y += height + 8;
      }

      y += 12;
    };

    renderLongSection(
      "NOTES / குறிப்புகள்",
      estimate.notes
    );

    renderLongSection(
      "TERMS & CONDITIONS / விதிமுறைகள்",
      estimate.terms
    );

    // Add a footer to every page.
    const range = doc.bufferedPageRange();

    for (
      let pageIndex = range.start;
      pageIndex < range.start + range.count;
      pageIndex++
    ) {
      doc.switchToPage(pageIndex);

      const footerY = pageHeight - 43;

      doc
        .moveTo(left, footerY - 8)
        .lineTo(right, footerY - 8)
        .lineWidth(0.6)
        .strokeColor(COLORS.border)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          "Thank you for choosing MS Painting Works!",
          left,
          footerY,
          {
            width: contentWidth,
            align: "center",
          }
        );

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text(
          `Page ${pageIndex + 1 - range.start} of ${range.count}`,
          right - 65,
          footerY + 13,
          {
            width: 65,
            align: "right",
          }
        );
    }

    doc.end();
  });

  return {
    filePath,
    publicUrl: `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/uploads/estimates/${estimate.estimateNumber}.pdf`,
  };
}
