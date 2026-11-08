// Minimal types for the Cashfree JS SDK v3 (https://sdk.cashfree.com/js/v3/cashfree.js).

interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  /** "_self" redirects this tab to Cashfree and back to the order's return_url. */
  redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
}

interface CashfreeCheckoutResult {
  error?: { message?: string };
  redirect?: boolean;
}

interface CashfreeInstance {
  checkout(options: CashfreeCheckoutOptions): Promise<CashfreeCheckoutResult>;
}

interface Window {
  Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeInstance;
}
