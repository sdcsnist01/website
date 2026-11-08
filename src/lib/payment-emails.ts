import type { EmailMessage } from "@/lib/email";

/** Confirmation emails sent once, right after a payment is verified with Cashfree. */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Detail rows as label/value pairs; empty values are left out. */
type Detail = [label: string, value: string | null | undefined];

function render(opts: { heading: string; intro: string; details: Detail[]; outro: string }): { text: string; html: string } {
  const details = opts.details.filter((d): d is [string, string] => Boolean(d[1]));
  const text = [
    opts.heading,
    "",
    opts.intro,
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    opts.outro,
    "",
    "— Student Developers Community (SDC SNIST)",
  ].join("\n");

  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b6460;font-size:13px;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#1c1b1f;font-size:14px;font-weight:600">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f6f3ef;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ef;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e4ddd6;border-radius:12px;padding:28px">
<tr><td>
<p style="margin:0;color:#d9272e;font-size:11px;letter-spacing:2px;font-weight:700">SDC SNIST</p>
<h1 style="margin:10px 0 0;color:#1c1b1f;font-size:22px">${escapeHtml(opts.heading)}</h1>
<p style="margin:14px 0 18px;color:#4a4542;font-size:15px;line-height:1.5">${escapeHtml(opts.intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:20px 0 0;color:#4a4542;font-size:14px;line-height:1.5">${escapeHtml(opts.outro)}</p>
<p style="margin:24px 0 0;color:#8a827d;font-size:12px">Student Developers Community (SDC SNIST)</p>
</td></tr></table>
</td></tr></table></body></html>`;

  return { text, html };
}

export function membershipConfirmationEmail(input: {
  to: string;
  name: string;
  memberId: string;
  membershipYear: number;
  amountPaise: number;
  orderId: string;
  paymentId: string | null;
}): EmailMessage {
  const { text, html } = render({
    heading: "Welcome to SDC SNIST!",
    intro: `Hi ${input.name}, your payment was successful and your SDC membership is now active.`,
    details: [
      ["Member ID", input.memberId],
      ["Batch", `${input.membershipYear}`],
      ["Amount paid", rupees(input.amountPaise)],
      ["Order ID", input.orderId],
      ["Payment ID", input.paymentId],
    ],
    outro: "Save your member ID and keep this email for membership verification. See you at our next event!",
  });
  return { to: input.to, subject: `Welcome to SDC SNIST — Member ID ${input.memberId}`, text, html };
}

export function eventConfirmationEmail(input: {
  to: string;
  name: string;
  eventTitle: string;
  date: string | null;
  time: string | null;
  location: string | null;
  amountPaise: number;
  orderId: string;
  paymentId: string | null;
}): EmailMessage {
  const { text, html } = render({
    heading: "You're registered!",
    intro: `Hi ${input.name}, your payment was successful and your spot for ${input.eventTitle} is confirmed.`,
    details: [
      ["Event", input.eventTitle],
      ["Date", input.date],
      ["Time", input.time],
      ["Location", input.location],
      ["Amount paid", rupees(input.amountPaise)],
      ["Order ID", input.orderId],
      ["Payment ID", input.paymentId],
    ],
    outro: "Keep this email as your registration confirmation. See you there!",
  });
  return { to: input.to, subject: `Registration confirmed: ${input.eventTitle}`, text, html };
}
