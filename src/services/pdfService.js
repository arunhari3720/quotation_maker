import fs from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
const money = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export async function generateEstimatePdf(estimate, client) {
  const dir = path.resolve("uploads/estimates");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${estimate.estimateNumber}.pdf`);
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const stream = doc.pipe(awaitImportFs().createWriteStream(filePath));
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
    doc.rect(0, 0, doc.page.width, 115).fill("#24364B");
    doc
      .fillColor("#F47B35")
      .fontSize(23)
      .font("Helvetica-Bold")
      .text("MS", 48, 34, { continued: true });
    doc.fillColor("#FFFFFF").fontSize(19).text(" Painting Works");
    doc
      .fillColor("#DCE5EF")
      .fontSize(9)
      .font("Helvetica")
      .text("PROFESSIONAL PAINTING SERVICES", 50, 69);
    doc
      .fillColor("#24364B")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("ESTIMATE", 48, 140);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748B")
      .text(`Estimate No: ${estimate.estimateNumber}`, 350, 145, {
        width: 195,
        align: "right",
      });
    doc.text(
      `Date: ${new Date(estimate.createdAt || Date.now()).toLocaleDateString("en-IN")}`,
      350,
      160,
      { width: 195, align: "right" },
    );
    doc.moveTo(48, 185).lineTo(547, 185).strokeColor("#E5EAF0").stroke();
    doc
      .fillColor("#F47B35")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("PREPARED FOR", 48, 203);
    doc.fillColor("#24364B").fontSize(12).text(client.name, 48, 220);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748B")
      .text(client.phone, 48, 239);
    if (client.email) doc.text(client.email, 48, 253);
    if (client.address) doc.text(client.address, { width: 260 });
    let y = 292;
    doc.fillColor("#24364B").rect(48, y, 499, 28).fill();
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
    doc.text("DESCRIPTION", 58, y + 10);
    doc.text("AREA (SQ FT)", 300, y + 10, { width: 75, align: "right" });
    doc.text("RATE", 385, y + 10, { width: 55, align: "right" });
    doc.text("AMOUNT", 455, y + 10, { width: 82, align: "right" });
    y += 28;
    estimate.items.forEach((item, i) => {
      if (i % 2 === 0) doc.fillColor("#F7F9FC").rect(48, y, 499, 32).fill();
      doc
        .fillColor("#334155")
        .font("Helvetica")
        .fontSize(9)
        .text(item.description, 58, y + 11, { width: 225 });
      doc.text(Number(item.area).toLocaleString("en-IN"), 300, y + 11, {
        width: 75,
        align: "right",
      });
      doc.text(money(item.rate), 385, y + 11, { width: 55, align: "right" });
      doc.text(money(item.amount), 455, y + 11, { width: 82, align: "right" });
      y += 32;
    });
    y += 20;
    const line = (label, value, bold = false) => {
      doc
        .fillColor(bold ? "#24364B" : "#64748B")
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 12 : 9)
        .text(label, 330, y, { width: 105 });
      doc
        .fillColor("#24364B")
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 12 : 9)
        .text(value, 435, y, { width: 102, align: "right" });
      y += bold ? 28 : 19;
    };
    line("Subtotal", money(estimate.subtotal));
    if (estimate.discountAmount)
      line(
        `Discount (${estimate.discountPercent}%)`,
        `- ${money(estimate.discountAmount)}`,
      );
    if (estimate.tax) line(`GST (${estimate.gstRate}%)`, money(estimate.tax));
    doc
      .moveTo(325, y - 5)
      .lineTo(547, y - 5)
      .strokeColor("#E5EAF0")
      .stroke();
    line("TOTAL AMOUNT", money(estimate.total), true);
    y += 8;
    if (estimate.notes) {
      doc
        .fillColor("#F47B35")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("NOTES", 48, y);
      y += 15;
      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(9)
        .text(estimate.notes, 48, y, { width: 490 });
      y += doc.heightOfString(estimate.notes, { width: 490 }) + 12;
    }
    if (estimate.terms) {
      doc
        .fillColor("#F47B35")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("TERMS & CONDITIONS", 48, y);
      y += 15;
      doc
        .fillColor("#64748B")
        .font("Helvetica")
        .fontSize(8)
        .text(estimate.terms, 48, y, { width: 490 });
    }
    doc
      .fillColor("#94A3B8")
      .fontSize(8)
      .text(
        "Thank you for considering MS Painting Works.",
        48,
        doc.page.height - 54,
        { width: 499, align: "center" },
      );
    doc.end();
  });
  return {
    filePath,
    publicUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/estimates/${estimate.estimateNumber}.pdf`,
  };
}
function awaitImportFs() {
  return fsSync;
}
import * as fsSync from "node:fs";
