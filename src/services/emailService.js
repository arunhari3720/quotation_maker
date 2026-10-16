import nodemailer from "nodemailer";
function transporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  )
    throw new Error(
      "SMTP is not configured. Add SMTP settings to backend .env.",
    );
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}
export async function sendEstimateEmail({
  to,
  clientName,
  estimateNumber,
  total,
  pdfPath,
  pdfUrl,
}) {
  if (!to) throw new Error("This client has no email address saved.");
  const transport = transporter();
  return transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Painting Estimate ${estimateNumber} | MS Painting Works`,
    text: `Hi ${clientName},

Please find your painting estimate ${estimateNumber} attached.
Estimate total: Rs. ${Number(total).toLocaleString("en-IN")}

${
  pdfUrl
    ? `You can also view it here: ${pdfUrl}
`
    : ""
}Thank you,
MS Painting Works`,
    html: `<div style="font-family:Arial,sans-serif;color:#26364b;max-width:600px;margin:auto"><div style="background:#24364b;padding:22px;color:#fff"><b style="color:#ff8a45;font-size:24px">MS</b> <b>Painting Works</b></div><div style="padding:24px"><h2 style="font-size:20px">Your painting estimate is ready</h2><p>Hi ${escapeHtml(clientName)},</p><p>Please find attached your painting estimate <b>${escapeHtml(estimateNumber)}</b>.</p><div style="background:#fff3e9;padding:18px;border-radius:10px"><small>ESTIMATE TOTAL</small><h2 style="margin:8px 0;color:#d9682c">Rs. ${Number(total).toLocaleString("en-IN")}</h2></div>${pdfUrl ? `<p><a href="${pdfUrl}">Open estimate PDF</a></p>` : ""}<p>Thank you for considering MS Painting Works.</p></div></div>`,
    attachments: [
      {
        filename: `${estimateNumber}.pdf`,
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  });
}
function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
