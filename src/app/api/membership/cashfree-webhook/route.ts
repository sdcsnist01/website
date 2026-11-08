// Older webhook URL, kept so Cashfree dashboards and orders that still point here
// keep working. All handling lives in the shared /api/payments/cashfree-webhook.
export { POST } from "@/app/api/payments/cashfree-webhook/route";
