"use client";

import { useMemo, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  getRecruitmentRole,
  RECRUITMENT_ROLES,
  type RecruitmentRole,
  type RecruitmentRoleId,
} from "@/data/recruitment";
import type { AnimatedIconProps } from "@/components/ui/types";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";
import CheckedIcon from "@/components/ui/checked-icon";
import LockIcon from "@/components/ui/lock-icon";
import SparklesIcon from "@/components/ui/sparkles-icon";
import PlugConnectedIcon from "@/components/ui/plug-connected-icon";
import FileDescriptionIcon from "@/components/ui/file-description-icon";
import PaintIcon from "@/components/ui/paint-icon";
import TerminalIcon from "@/components/ui/terminal-icon";
import PartyPopperIcon from "@/components/ui/party-popper-icon";
import RadioIcon from "@/components/ui/radio-icon";

const ROLE_ICONS: Record<RecruitmentRoleId, ComponentType<AnimatedIconProps>> = {
  documentation: FileDescriptionIcon,
  designing: PaintIcon,
  tech: TerminalIcon,
  organizing: PartyPopperIcon,
  publicity: RadioIcon,
};

type Step = "roles" | "apply" | "challenge" | "done";

type Applicant = {
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  yearBranch: string;
  motivation: string;
};

const emptyApplicant: Applicant = {
  fullName: "",
  rollNumber: "",
  email: "",
  phone: "",
  yearBranch: "",
  motivation: "",
};

const inputClass =
  "w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";

export default function RecruitmentFlow() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("roles");
  const [roleId, setRoleId] = useState<RecruitmentRoleId | null>(null);
  const [applicant, setApplicant] = useState<Applicant>(emptyApplicant);
  const [formError, setFormError] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const role = useMemo(() => (roleId ? getRecruitmentRole(roleId) : undefined), [roleId]);

  function updateApplicant(key: keyof Applicant, value: string) {
    setApplicant((prev) => ({ ...prev, [key]: value }));
  }

  function startApply(nextRole: RecruitmentRole) {
    setRoleId(nextRole.id);
    setFormError(null);
    setChoice(null);
    setChallengeAnswer("");
    setChallengeError(null);
    setStep("apply");
  }

  function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (
      !applicant.fullName.trim() ||
      !applicant.rollNumber.trim() ||
      !applicant.email.trim() ||
      !applicant.phone.trim() ||
      !applicant.yearBranch.trim() ||
      !applicant.motivation.trim()
    ) {
      setFormError("Fill in every field to unlock your recruitment challenge.");
      return;
    }

    if (applicant.motivation.trim().length < 40) {
      setFormError("Tell us a bit more — motivation should be at least a few sentences.");
      return;
    }

    setStep("challenge");
  }

  function submitChallenge(e: React.FormEvent) {
    e.preventDefault();
    setChallengeError(null);

    if (!role) return;

    if (role.challenge.kind === "choice" && !choice) {
      setChallengeError("Pick an option to continue.");
      return;
    }

    const needsWriting =
      role.challenge.kind === "writing" ||
      (role.challenge.kind === "choice" && role.challenge.placeholder);

    if (needsWriting && challengeAnswer.trim().length < 20) {
      setChallengeError("Add a short written response (at least a couple of lines).");
      return;
    }

    setStep("done");
  }

  function resetFlow() {
    setStep("roles");
    setRoleId(null);
    setApplicant(emptyApplicant);
    setFormError(null);
    setChoice(null);
    setChallengeAnswer("");
    setChallengeError(null);
  }

  const panelMotion = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant sm:text-xs">
          {(["roles", "apply", "challenge", "done"] as Step[]).map((id, index) => {
            const labels = ["Role", "Apply", "Challenge", "Done"] as const;
            const order: Step[] = ["roles", "apply", "challenge", "done"];
            const current = order.indexOf(step);
            const active = index <= current;
            return (
              <div key={id} className="flex flex-1 items-center gap-2">
                <div className="flex min-w-0 flex-col items-center gap-1.5">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-black/15 bg-transparent text-on-surface-variant/50"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`truncate ${active ? "text-primary" : "text-on-surface-variant/50"}`}>
                    {labels[index]}
                  </span>
                </div>
                {index < 3 ? (
                  <div
                    className={`mb-5 hidden h-px flex-1 sm:block ${
                      index < current ? "bg-primary/70" : "bg-[#e4ddd6]"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "roles" ? (
          <motion.div key="roles" {...panelMotion}>
            <div className="mb-10 text-center">
              <p className="type-kicker text-primary">Recruitment</p>
              <h1 className="type-heading mt-3 text-3xl font-extrabold text-on-surface sm:text-4xl md:text-5xl">
                Pick your <span className="text-primary">lane</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-on-surface-variant sm:text-lg">
                Apply to a team, share your details, and unlock a short role challenge — built to see how you
                think, not how perfect you are.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {RECRUITMENT_ROLES.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  className="group flex flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-low/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-surface-container"
                  style={{ boxShadow: `0 0 0 0 ${item.accent}00` }}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border transition-colors"
                    style={{
                      borderColor: `${item.accent}40`,
                      backgroundColor: `${item.accent}14`,
                      color: item.accent,
                    }}
                  >
                    {(() => {
                      const RoleIcon = ROLE_ICONS[item.id];
                      return (
                        <RoleIcon
                          size={24}
                          strokeWidth={2}
                          color={item.accent}
                          className="!cursor-default"
                          loop="mobile"
                        />
                      );
                    })()}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: item.accent }}>
                    {item.tagline}
                  </p>
                  <h2 className="type-heading mt-2 text-2xl text-on-surface">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
                  <ul className="mt-5 space-y-2 text-sm text-on-surface-variant">
                    {item.responsibilities.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.accent }} />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => startApply(item)}
                    className="pressable mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold uppercase tracking-[1.5px] text-white transition-all hover:-translate-y-0.5"
                    style={{ background: item.accent }}
                  >
                    Apply
                    <SparklesIcon size={16} strokeWidth={2} className="!cursor-pointer" loop="mobile" />
                  </button>
                </motion.article>
              ))}
            </div>
          </motion.div>
        ) : null}

        {step === "apply" && role ? (
          <motion.div key="apply" {...panelMotion} className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setStep("roles")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
            >
              <ArrowNarrowLeftIcon size={16} strokeWidth={2} className="!cursor-pointer" />
              All roles
            </button>

            <div className="mb-8">
              <p className="type-kicker" style={{ color: role.accent }}>
                Applying · {role.title}
              </p>
              <h2 className="type-heading mt-3 text-3xl font-extrabold text-on-surface md:text-4xl">
                Tell us about you
              </h2>
              <p className="mt-3 flex items-center gap-2 text-on-surface-variant">
                <LockIcon size={16} strokeWidth={2} color="#d9272e" className="!cursor-default" />
                Finish this form and your recruitment challenge unlocks automatically.
              </p>
            </div>

            <form onSubmit={submitApplication} className="glass-card space-y-5 rounded-xl p-6 md:p-8">
              {formError ? (
                <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
                  {formError}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Full name *
                  </span>
                  <input
                    required
                    className={inputClass}
                    value={applicant.fullName}
                    onChange={(e) => updateApplicant("fullName", e.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Roll number *
                  </span>
                  <input
                    required
                    className={inputClass}
                    value={applicant.rollNumber}
                    onChange={(e) => updateApplicant("rollNumber", e.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Year & branch *
                  </span>
                  <input
                    required
                    placeholder="e.g. 2nd year CSE"
                    className={inputClass}
                    value={applicant.yearBranch}
                    onChange={(e) => updateApplicant("yearBranch", e.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Email *
                  </span>
                  <input
                    required
                    type="email"
                    className={inputClass}
                    value={applicant.email}
                    onChange={(e) => updateApplicant("email", e.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Phone *
                  </span>
                  <input
                    required
                    type="tel"
                    className={inputClass}
                    value={applicant.phone}
                    onChange={(e) => updateApplicant("phone", e.target.value)}
                  />
                </label>
                <label className="block space-y-2 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Why this role? *
                  </span>
                  <textarea
                    required
                    rows={4}
                    className={`${inputClass} resize-y`}
                    placeholder="What draws you to this team, and what would you ship in your first month?"
                    value={applicant.motivation}
                    onChange={(e) => updateApplicant("motivation", e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold uppercase tracking-[1.5px] text-white transition hover:-translate-y-0.5"
                style={{ background: role.accent }}
              >
                Unlock challenge
                <PlugConnectedIcon size={16} strokeWidth={2} className="!cursor-pointer" />
              </button>
            </form>
          </motion.div>
        ) : null}

        {step === "challenge" && role ? (
          <motion.div key="challenge" {...panelMotion} className="mx-auto max-w-2xl">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                <PlugConnectedIcon size={14} strokeWidth={2} color="#6ee7b7" className="!cursor-default" />
                Challenge unlocked
              </div>
              <p className="type-kicker" style={{ color: role.accent }}>
                {role.title} challenge
              </p>
              <h2 className="type-heading mt-3 text-3xl font-extrabold text-on-surface md:text-4xl">
                {role.challenge.title}
              </h2>
              <p className="mt-3 text-on-surface-variant">{role.challenge.prompt}</p>
              {role.challenge.hint ? (
                <p className="mt-2 text-sm text-primary/90">{role.challenge.hint}</p>
              ) : null}
            </div>

            <form onSubmit={submitChallenge} className="glass-card space-y-5 rounded-xl p-6 md:p-8">
              {challengeError ? (
                <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
                  {challengeError}
                </p>
              ) : null}

              {role.challenge.options ? (
                <div className="space-y-3">
                  {role.challenge.options.map((option) => {
                    const active = choice === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setChoice(option)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                          active
                            ? "border-primary bg-primary/15 text-on-surface"
                            : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-black/20 hover:text-on-surface"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {role.challenge.kind === "writing" || role.challenge.placeholder ? (
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Your response *
                  </span>
                  <textarea
                    rows={6}
                    className={`${inputClass} resize-y font-mono text-sm`}
                    placeholder={role.challenge.placeholder}
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                  />
                </label>
              ) : null}

              <button
                type="submit"
                className="hero-gradient-fill w-full rounded-full py-4 text-sm font-semibold uppercase tracking-[1.5px] text-on-primary-fixed transition hover:-translate-y-0.5"
              >
                Submit challenge
              </button>
            </form>
          </motion.div>
        ) : null}

        {step === "done" && role ? (
          <motion.div key="done" {...panelMotion} className="mx-auto max-w-xl text-center">
            <div className="glass-card rounded-xl p-8 md:p-12">
              <CheckedIcon size={48} strokeWidth={2} color="#34d399" className="mx-auto !cursor-default" />
              <p className="type-kicker mt-6 text-emerald-700">Application received</p>
              <h2 className="type-heading mt-3 text-3xl font-extrabold text-on-surface">
                You’re in the {role.title} pipeline
              </h2>
              <p className="mt-4 text-on-surface-variant">
                Thanks, {applicant.fullName.split(" ")[0] || "applicant"}. We saved your{" "}
                <span className="text-on-surface">{role.title}</span> application and challenge response. The SDC
                team will review and reach out on email.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={resetFlow}
                  className="rounded-full border border-[#d8d2cf] bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[1.5px] text-on-surface transition hover:bg-black/5"
                >
                  Explore other roles
                </button>
                <a
                  href="#membership"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[1.5px] text-white transition hover:opacity-90"
                >
                  Become a paid member
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
