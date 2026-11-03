"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import CheckedIcon from "@/components/ui/checked-icon";
import RefreshIcon from "@/components/ui/refresh-icon";
import SendIcon from "@/components/ui/send-icon";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;

// Mirrors the rules in /api/contact, which stays the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Record<Field, string | null> {
  const trimmedMessage = message.trim();
  return {
    name: name.trim().length < 2 ? "Enter your name (at least 2 characters)." : null,
    email: EMAIL_PATTERN.test(email.trim()) ? null : "Enter a valid email address.",
    message:
      trimmedMessage.length < 10
        ? "Message should be at least 10 characters."
        : trimmedMessage.length > 5000
          ? "Message is too long (5000 characters max)."
          : null,
  };
}

const inputClass =
  "w-full rounded-xl border border-[#d8d2cf] bg-white px-4 py-3.5 text-[15px] text-on-surface outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-on-surface-variant/60 hover:border-[#b9afa5] focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#b01f1f] aria-[invalid=true]:bg-[#fffafa] aria-[invalid=true]:focus:ring-[#b01f1f]/15 disabled:bg-surface-container-low disabled:opacity-70";

const labelClass = "font-mono-ui mb-2 block text-[11px] uppercase tracking-[1.5px] text-on-surface-variant";

export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, message: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = validate(values);
  const fieldError = (field: Field) => ((submitted || touched[field]) ? errors[field] : null);

  function updateField(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field: Field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (Object.values(errors).some(Boolean)) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error || "Could not send your message.");
        return;
      }

      setSent(true);
      setValues({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
      setSubmitted(false);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const nameError = fieldError("name");
  const emailError = fieldError("email");
  const messageError = fieldError("message");

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-8 rounded-2xl border border-emerald-600/25 bg-emerald-50 p-6 sm:p-8"
          >
            <div className="flex items-start gap-3">
              <CheckedIcon size={24} strokeWidth={2} color="#059669" className="mt-0.5 shrink-0 !cursor-default" />
              <div>
                <p className="font-grotesk text-xl font-bold text-on-surface">Message sent</p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Thanks for reaching out. The SDC SNIST team will get back to you soon.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="pressable font-mono-ui min-h-11 rounded-full bg-primary px-5 text-xs uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                  >
                    Send another
                  </button>
                  <Link
                    href="/join"
                    className="pressable font-mono-ui inline-flex min-h-11 items-center rounded-full border border-[#d8d2cf] bg-white px-5 text-xs uppercase tracking-[1.5px] text-on-surface transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                  >
                    Become a member
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            noValidate
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="block">
              <label htmlFor="contact-name" className={labelClass}>
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                value={values.name}
                onChange={(e) => updateField("name", e.target.value)}
                onBlur={() => markTouched("name")}
                className={inputClass}
                placeholder="Your name"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "contact-name-error" : undefined}
                disabled={loading}
              />
              {nameError ? (
                <p id="contact-name-error" className="mt-2 text-sm text-[#b01f1f]">
                  {nameError}
                </p>
              ) : null}
            </div>
            <div className="block">
              <label htmlFor="contact-email" className={labelClass}>
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={values.email}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => markTouched("email")}
                className={inputClass}
                placeholder="you@college.edu"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "contact-email-error" : undefined}
                disabled={loading}
              />
              {emailError ? (
                <p id="contact-email-error" className="mt-2 text-sm text-[#b01f1f]">
                  {emailError}
                </p>
              ) : null}
            </div>
            <div className="block md:col-span-2">
              <label htmlFor="contact-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={values.message}
                onChange={(e) => updateField("message", e.target.value)}
                onBlur={() => markTouched("message")}
                className={`min-h-40 resize-y ${inputClass}`}
                placeholder="Tell us about your question, collab idea, or speaker proposal…"
                required
                aria-required="true"
                aria-invalid={messageError ? true : undefined}
                aria-describedby={messageError ? "contact-message-error" : undefined}
                disabled={loading}
              />
              {messageError ? (
                <p id="contact-message-error" className="mt-2 text-sm text-[#b01f1f]">
                  {messageError}
                </p>
              ) : null}
            </div>

            {error ? (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220] md:col-span-2"
              >
                {error}
              </motion.p>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="group pressable relative inline-flex min-h-13 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-[1.5px] text-white shadow-[0_10px_24px_rgba(217,39,46,0.22)] transition-[background-color,box-shadow] duration-300 hover:bg-primary-dim hover:shadow-[0_14px_30px_rgba(217,39,46,0.32)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-fit"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100 motion-reduce:hidden"
                />
                {loading ? (
                  <>
                    <RefreshIcon size={16} strokeWidth={2} className="!cursor-default animate-spin motion-reduce:animate-none" />
                    Sending…
                  </>
                ) : (
                  <>
                    <span className="inline-flex transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none">
                      <SendIcon size={16} strokeWidth={2} className="!cursor-pointer" />
                    </span>
                    Send message
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
