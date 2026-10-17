
const LOGO_URL =
  "https://res.cloudinary.com/oeyzokge/image/upload/v1792249396/Colorful_MS_Paints_Logo_with_House_Motif.png";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getSafeEstimateUrl = (value = "") => {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return "";

    return escapeHtml(url.href);
  } catch {
    return "";
  }
};

export function buildEstimateEmailHtml({
  clientName = "Valued Customer",
  estimateNumber = "",
  estimateDate = new Date(),
  totalAmount = 0,
  estimateUrl = "",
}) {
  const safeClientName = escapeHtml(clientName);
  const safeEstimateNumber = escapeHtml(estimateNumber);
  const safeDate = escapeHtml(formatDate(estimateDate));
  const safeTotalAmount = formatMoney(totalAmount);
  const safeEstimateUrl = getSafeEstimateUrl(estimateUrl);
  const currentYear = new Date().getFullYear();

  const estimateButton = safeEstimateUrl
    ? `
      <tr>
        <td align="center" style="padding:0 28px 26px;">
          <a
            href="${safeEstimateUrl}"
            target="_blank"
            style="display:inline-block;background:#f58220;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:15px 26px;border-radius:8px;"
          >
            View Estimate Online &rarr;
          </a>
        </td>
      </tr>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Your Painting Estimate | MS Painting Works</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#202124;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background:#f3f4f6;padding:28px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
          style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Brand Header -->
          <tr>
            <td align="center" style="background:#171717;padding:28px 20px;">

              <img
                src="${LOGO_URL}"
                alt="MS Painting Works"
                width="150"
                style="display:block;width:150px;max-width:100%;height:auto;border:0;margin:0 auto 14px;"
              >

              <p style="margin:0;color:#ff9b38;font-size:11px;font-weight:bold;letter-spacing:3px;">
                QUALITY &bull; COLOUR &bull; TRUST
              </p>

            </td>
          </tr>

          <!-- Accent Strip -->
          <tr>
            <td style="height:5px;background:#f58220;font-size:0;line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- Introduction -->
          <tr>
            <td style="padding:32px 28px 16px;">

              <p style="margin:0 0 10px;color:#f58220;font-size:12px;font-weight:bold;letter-spacing:1.5px;">
                YOUR ESTIMATE IS READY
              </p>

              <h1 style="margin:0 0 16px;color:#171717;font-size:27px;line-height:1.3;">
                Let's bring your<br>vision to life.
              </h1>

              <p style="margin:0 0 12px;color:#4b5563;font-size:15px;line-height:1.8;">
                Hello <strong style="color:#171717;">${safeClientName}</strong>,
              </p>

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
                Thank you for choosing MS Painting Works. Your painting estimate
                is ready for review. Please find the estimate PDF attached to
                this email for your convenience.
              </p>

            </td>
          </tr>

          <!-- Estimate Summary -->
          <tr>
            <td style="padding:12px 28px 24px;">

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

                <tr>
                  <td colspan="2" style="background:#fff7ed;padding:15px 18px;border-bottom:1px solid #fed7aa;">
                    <span style="color:#9a3412;font-size:11px;font-weight:bold;letter-spacing:1.2px;">
                      ESTIMATE SUMMARY
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 18px 8px;color:#6b7280;font-size:13px;">
                    Estimate number
                  </td>

                  <td align="right" style="padding:16px 18px 8px;color:#171717;font-size:13px;font-weight:bold;">
                    ${safeEstimateNumber || "As mentioned in the attached PDF"}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 18px 16px;color:#6b7280;font-size:13px;">
                    Estimate date
                  </td>

                  <td align="right" style="padding:8px 18px 16px;color:#171717;font-size:13px;">
                    ${safeDate}
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding:0 18px;">
                    <div style="height:1px;background:#e5e7eb;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px;color:#374151;font-size:14px;font-weight:bold;">
                    Estimated total
                  </td>

                  <td align="right" style="padding:18px;color:#ea580c;font-size:22px;font-weight:bold;">
                    ${safeTotalAmount}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Optional Estimate Link -->
          ${estimateButton}

          <!-- PDF Information -->
          <tr>
            <td style="padding:0 28px 28px;">

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background:#f9fafb;border-radius:10px;">

                <tr>
                  <td width="42" valign="top" style="padding:16px 0 16px 16px;">

                    <div style="background:#ffedd5;border-radius:8px;width:32px;height:32px;text-align:center;line-height:32px;color:#c2410c;font-weight:bold;font-size:12px;">
                      PDF
                    </div>

                  </td>

                  <td style="padding:16px 16px 16px 10px;">

                    <p style="margin:0 0 5px;color:#171717;font-size:13px;font-weight:bold;">
                      Your estimate document
                    </p>

                    <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.7;">
                      Please find your estimate PDF attached. Review the scope,
                      pricing and other details in the document.
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#171717;padding:25px 24px;text-align:center;">

              <p style="margin:0 0 8px;color:#ffffff;font-size:15px;font-weight:bold;">
                MS <span style="color:#f58220;">Painting Works</span>
              </p>

              <p style="margin:0 0 15px;color:#d1d5db;font-size:12px;line-height:1.8;">
                Professional painting. Beautiful spaces.
              </p>

              <div style="height:1px;background:#383838;margin:0 0 15px;"></div>

              <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.8;">
                This email was sent regarding your painting estimate.<br>
                If you have any questions, please contact us.
              </p>

              <p style="margin:14px 0 0;color:#6b7280;font-size:10px;">
                &copy; ${currentYear} MS Painting Works. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
