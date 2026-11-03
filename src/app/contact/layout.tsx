import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | SDC SNIST",
  description: "Reach the SDC SNIST team with questions, collaboration ideas, or speaker proposals.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
