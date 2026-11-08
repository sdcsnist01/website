import { randomBytes } from "crypto";

/**
 * Sends email through the Gmail API with the club account's OAuth refresh token
 * (the same Google sign-in the certificate mailer uses). Server only.
 *
 * Env: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN (from the mailer's
 * credentials.json / token.json), EMAIL_ADDRESS (the sending account) and
 * EMAIL_FROM_NAME. If any are missing, sending is skipped with a log line.
 */

type GmailConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  fromAddress: string;
  fromName: string;
};

function getGmailConfig(): GmailConfig | null {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromAddress = process.env.EMAIL_ADDRESS;
  if (!clientId || !clientSecret || !refreshToken || !fromAddress) return null;
  return {
    clientId,
    clientSecret,
    refreshToken,
    fromAddress,
    fromName: process.env.EMAIL_FROM_NAME || "Student Developers Community (SDC)",
  };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(config: GmailConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const data = (await res.json().catch(() => null)) as { access_token?: string; expires_in?: number; error?: string } | null;
  if (!res.ok || !data?.access_token) {
    // e.g. "invalid_grant" when the refresh token was revoked or expired.
    throw new Error(`Gmail token refresh failed (${res.status}): ${data?.error ?? "no token"}`);
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

/** Removes CR/LF so values can't add extra headers (e.g. a hidden Bcc). */
export function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** RFC 2047 encoded-word, so names and subjects can contain ₹ and non-ASCII text. */
function encodeHeaderWord(value: string): string {
  return `=?UTF-8?B?${Buffer.from(headerSafe(value), "utf8").toString("base64")}?=`;
}

function base64Lines(value: string): string {
  return Buffer.from(value, "utf8").toString("base64").replace(/.{1,76}/g, "$&\r\n").trimEnd();
}

export type EmailMessage = { to: string; subject: string; text: string; html: string };

/** Builds a multipart/alternative MIME message (plain text + HTML), all parts base64. */
export function buildMimeMessage(message: EmailMessage, from: { name: string; address: string }): string {
  const boundary = `sdc_${randomBytes(12).toString("hex")}`;
  return [
    `From: ${encodeHeaderWord(from.name)} <${headerSafe(from.address)}>`,
    `To: <${headerSafe(message.to)}>`,
    `Subject: ${encodeHeaderWord(message.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Lines(message.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Lines(message.html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

const SIMPLE_EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/**
 * Sends one email. Returns false (and logs) instead of throwing, so a mail
 * problem never breaks the payment flow that triggered it.
 */
export async function sendEmail(message: EmailMessage, context: string): Promise<boolean> {
  const config = getGmailConfig();
  if (!config) {
    console.warn(`email skipped (${context}): Gmail sending is not configured`);
    return false;
  }
  if (!SIMPLE_EMAIL.test(message.to)) {
    console.warn(`email skipped (${context}): invalid recipient address`);
    return false;
  }

  try {
    const accessToken = await getAccessToken(config);
    const raw = Buffer.from(buildMimeMessage(message, { name: config.fromName, address: config.fromAddress }), "utf8")
      .toString("base64url");
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      console.error(`email failed (${context}): Gmail ${res.status} ${body?.error?.message ?? ""}`.trim());
      return false;
    }
    return true;
  } catch (error) {
    console.error(`email failed (${context}):`, error instanceof Error ? error.message : error);
    return false;
  }
}
