import type { ReactNode } from "react";

type SectionHeaderProps = {
  /** Mono eyebrow above the title, e.g. "ON CAMPUS". */
  eyebrow?: string;
  /** Grotesk heading. Pass a ReactNode to colour a word red. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional trailing link or action, aligned to the title row on wider screens. */
  action?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
};

/** Shared section heading: red rule + mono eyebrow, grotesk title, optional subtitle and action. */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  as: Heading = "h2",
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={[
        "mb-10 flex flex-wrap gap-5 md:mb-12",
        centered ? "flex-col items-center text-center" : "items-end justify-between",
        className,
      ].join(" ")}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className={["mb-3.5 flex items-center gap-3", centered ? "justify-center" : ""].join(" ")}>
            <span className="h-0.5 w-7 bg-primary" aria-hidden />
            <span className="font-mono-ui text-xs tracking-[3px] text-primary">{eyebrow}</span>
          </div>
        ) : null}
        <Heading className="font-grotesk text-balance text-[clamp(34px,5vw,64px)] leading-[1] text-on-surface">
          {title}
        </Heading>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-on-surface-variant sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
