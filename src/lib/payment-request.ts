/** Helpers shared by the membership and event Cashfree checkouts. */

/** Indian mobile number as 10 digits, accepting +91 / 0 prefixes and spaces. */
export function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Public base URL for Cashfree redirects and webhooks. SITE_URL overrides the request host. */
export function getSiteUrl(request: Request): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

/** Shared Cashfree webhook endpoint for every order type. Cashfree only calls https URLs. */
export function getCashfreeNotifyUrl(siteUrl: string): string | null {
  return siteUrl.startsWith("https://") ? `${siteUrl}/api/payments/cashfree-webhook` : null;
}
