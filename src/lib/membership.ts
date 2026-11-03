/** Active membership cohort helpers. Prefer joining/batch year for member IDs. */
export function getMembershipYear(): number {
  return new Date().getFullYear();
}

export type SdcMemberRow = {
  id: string;
  member_id: string;
  roll_number: string;
  email: string;
  phone: string;
  full_name: string;
  membership_year: number;
  amount_paise: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: "pending" | "active" | "failed";
  created_at: string;
  updated_at: string;
};
