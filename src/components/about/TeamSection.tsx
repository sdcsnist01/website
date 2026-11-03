"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import FloatWords from "@/components/ui/FloatWords";

type CarouselMember = { name: string; role: string; photo: string };

/** Team carousel from the Claude Design reference (#board). Photos live in public/team. */
const MEMBERS: CarouselMember[] = [
  { name: "Kesani Srikanth Reddy", role: "President", photo: "/team/srikanth-reddy-kesani.jpg" },
  { name: "Architha Reddy", role: "Vice President", photo: "/team/architha-reddy.jpg" },
  { name: "Vignesh Kandem", role: "Organizing Lead", photo: "/team/vignesh-kandem.jpg" },
  { name: "Suchitha Srinadharaju", role: "Organizing Lead - SDC Board", photo: "/team/suchitha-srinadharaju.jpg" },
  { name: "N. Sai Vivekananda", role: "Publicity Lead", photo: "/team/sai-vivekananda.jpg" },
  { name: "Rasala Akhila", role: "Publicity Lead - SDC Task Force", photo: "/team/akhila-rasala.jpg" },
  { name: "Gogikar Jai Gopal", role: "Designing Lead", photo: "/team/jai-gopal-gogikar.jpg" },
  { name: "Ganoju Hasini", role: "Designing Lead", photo: "/team/hasini-ganoju.jpg" },
  { name: "Tejashwini R", role: "Marketing Lead", photo: "/team/tejashwini-r.jpg" },
  { name: "Jeevana Jyothi Palreddy", role: "Documentation Lead", photo: "/team/jeevana-jyothi-palreddy.jpg" },
  { name: "Varalaxmi Reddy", role: "Documentation Lead - Task Force", photo: "/team/varalaxmi-reddy.jpg" },
  { name: "Nagateja Rayapati", role: "Tech Member - Task Force", photo: "/team/nagateja-rayapati.jpg" },
  { name: "Mahitha Rapelli", role: "Tech Member", photo: "/team/mahitha-rapelli.jpg" },
];

/**
 * Layout by distance from the active card (0 = active, 1 = beside it, 2 = outer pair), taken from the
 * template's `cfg` (desktop). `tx` is a percentage of the card's own width.
 */
const RING = [
  { tx: 0, scale: 1, opacity: 1, blur: 0, dim: 0, halo: 1 },
  { tx: 78, scale: 0.76, opacity: 1, blur: 1.5, dim: 0.22, halo: 0.5 },
  { tx: 128, scale: 0.54, opacity: 0.85, blur: 2.5, dim: 0.34, halo: 0.25 },
];

const PARTICLES: Array<[number, number, number, string, number, number]> = [
  [46, 14, 3, "#E7B5A4", 0, 6], [54, 10, 2, "#D9B99A", 2.2, 7], [40, 28, 2, "#B84735", 4.1, 8],
  [60, 32, 3, "#F0D9C0", 1.3, 6.5], [35, 52, 2, "#E7B5A4", 3.4, 7.5], [64, 58, 2, "#D9B99A", 5.2, 6],
  [42, 78, 3, "#B84735", 2.8, 8], [58, 84, 2, "#F0D9C0", 0.7, 7], [33.5, 36, 2, "#F0D9C0", 6.1, 6],
  [66.5, 44, 3, "#E7B5A4", 3.9, 7], [49, 92, 2, "#D9B99A", 4.6, 6.5], [71, 22, 2, "#B84735", 1.9, 8],
  [28, 66, 2, "#E7B5A4", 5.6, 7], [50, 4, 2, "#F0D9C0", 3.1, 6],
];

/** Time each member stays on screen before the carousel moves on. */
const AUTOPLAY_MS = 4000;

export default function TeamSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = MEMBERS.length;

  const go = (step: number) => {
    if (count === 0) return;
    setActive((i) => (i + step + count) % count);
  };

  // Advances every AUTOPLAY_MS. Pauses while hovered or focused, and restarts the timer after any manual move.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, active]);

  // Pointer drag: a horizontal swipe of at least 40px moves one card, as in the reference.
  const drag = useRef<{ x: number; id: number } | null>(null);
  function onDown(e: PointerEvent<HTMLDivElement>) {
    drag.current = { x: e.clientX, id: e.pointerId };
  }
  function onUp(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) >= 40) go(dx < 0 ? 1 : -1);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  }

  const thumbPct = count > 1 ? active / (count - 1) : 0;

  return (
    <section
      id="board"
      aria-labelledby="team-heading"
      className="relative scroll-mt-16 overflow-hidden bg-[#f0eee8] py-20 text-[#171717] sm:py-28"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <FloatWords preset="board" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 58%, rgba(184,71,53,0.13) 0%, rgba(184,71,53,0) 55%), radial-gradient(ellipse at 50% 0%, rgba(231,181,164,0.35) 0%, rgba(231,181,164,0) 50%)",
        }}
      />
      {/* Ambient light behind the stage, drifting slowly as in the reference. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[min(900px,90vw)] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 40% 45%, rgba(231,181,164,0.5) 0%, rgba(231,181,164,0) 60%), radial-gradient(ellipse at 65% 65%, rgba(184,71,53,0.22) 0%, rgba(184,71,53,0) 55%)",
          animation: "ambientShift 16s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,23,25,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,25,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 55%, #000 0%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="font-grotesk pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(140px,26vw,400px)] font-bold leading-[0.8] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_rgba(184,71,53,0.16)]"
      >
        BUILD
      </div>
      {/* Three small glowing dots, as in the reference. */}
      <span aria-hidden className="pointer-events-none absolute left-[14%] top-[38%] h-[5px] w-[5px] rounded-full bg-[#D9272E] shadow-[0_0_12px_2px_rgba(217,39,46,0.55)]" />
      <span aria-hidden className="pointer-events-none absolute right-[12%] top-[62%] h-1 w-1 rounded-full bg-[#D9272E] shadow-[0_0_10px_2px_rgba(217,39,46,0.5)]" />
      <span aria-hidden className="pointer-events-none absolute left-[30%] top-[80%] h-[3px] w-[3px] rounded-full bg-[#B84735] shadow-[0_0_8px_2px_rgba(184,71,53,0.5)]" />

      <div className="relative">
        <div className="mx-auto mb-9 max-w-[1100px] px-5 text-center sm:px-8 md:mb-14">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <span className="h-0.5 w-7 bg-[#b84735]" aria-hidden />
            <span className="font-mono-ui text-xs tracking-[3px] text-[#b84735]">THE PEOPLE • SDC</span>
          </div>
          <h2 id="team-heading" className="font-grotesk text-[clamp(36px,5.4vw,72px)] font-bold leading-none tracking-[-0.035em]">
            Meet the people behind <span className="text-[#b84735]">SDC.</span>
          </h2>
          {count === 0 ? (
            <p className="mx-auto mt-6 max-w-[52ch] text-pretty text-base leading-[1.65] text-[#5c5c66]">
              Team profiles are being confirmed. Members will appear here once their details are verified.
            </p>
          ) : null}
        </div>

        {count > 0 ? (
          <>
            <div
              role="group"
              aria-roledescription="carousel"
              aria-label="Team members"
              tabIndex={0}
              onKeyDown={onKey}
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={() => (drag.current = null)}
              className="relative mx-auto h-[490px] max-w-[1400px] cursor-grab select-none touch-pan-y outline-offset-[6px] [--card-h:420px] md:h-[calc(min(560px,54vw)+90px)] md:[--card-h:min(560px,54vw)]"
            >
              {MEMBERS.map((member, i) => {
                const offset = i - active;
                const wrapped = Math.abs(offset) > count / 2 ? offset - Math.sign(offset) * count : offset;
                const ring = Math.abs(wrapped);
                const hidden = ring >= RING.length;
                const cfg = RING[ring] ?? RING[RING.length - 1];
                const isActive = wrapped === 0;
                const sign = Math.sign(wrapped);

                return (
                  <article
                    key={member.name}
                    aria-hidden={hidden || undefined}
                    aria-label={`${member.name}, ${member.role}`}
                    data-active={isActive}
                    onClick={() => setActive(i)}
                    className="absolute left-1/2 top-1/2 h-[var(--card-h)] w-[calc(var(--card-h)*0.64)] cursor-pointer motion-reduce:transition-none"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${sign * cfg.tx}%) scale(${cfg.scale})`,
                      opacity: hidden ? 0 : cfg.opacity,
                      zIndex: 5 - ring,
                      visibility: hidden ? "hidden" : "visible",
                      pointerEvents: hidden ? "none" : "auto",
                      transition: "transform .4s cubic-bezier(.22,1,.36,1), opacity .4s ease-out",
                      willChange: "transform",
                    }}
                  >
                    {/* Soft warm halo behind the card. */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-[26px] rounded-[44px]"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 55%, rgba(184,71,53,0.42) 0%, rgba(231,181,164,0.3) 45%, rgba(231,181,164,0) 72%)",
                        opacity: cfg.halo,
                        transition: "opacity 1.1s ease",
                      }}
                    />
                    <div
                      className="relative h-full w-full overflow-hidden rounded-[22px]"
                      style={{
                        background: isActive
                          ? "radial-gradient(ellipse at 50% 35%, #6B2D2F 0%, #2C1A1D 55%, #151518 100%)"
                          : "radial-gradient(ellipse at 50% 30%, #F6D9CF 0%, #E3C3B6 55%, #C9BBB0 100%)",
                        border: `1px solid ${isActive ? "#B84735" : "rgba(23,23,23,0.1)"}`,
                        boxShadow: isActive
                          ? "0 2px 4px rgba(23,23,23,0.14), 0 18px 40px rgba(23,23,23,0.28), 0 40px 90px rgba(122,28,36,0.32), 0 0 0 1px rgba(184,71,53,0.3)"
                          : "0 12px 30px rgba(23,23,23,0.2), 0 0 28px rgba(231,181,164,0.35)",
                        transition: "border-color 1s ease, box-shadow 1s ease",
                      }}
                    >
                      {/* Portrait, blurred and desaturated by ring distance like the reference. */}
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{ filter: `blur(${cfg.blur}px) saturate(${1 - ring * 0.08})`, transition: "filter 1s ease" }}
                      >
                        <Image
                          src={member.photo}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 70vw, 360px"
                          className="object-cover object-[50%_20%]"
                          priority={i === 0}
                        />
                      </div>

                      {/* Tint over the inactive cards; the active card has none. */}
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background: isActive
                            ? "transparent"
                            : "linear-gradient(180deg, rgba(231,181,164,0.55) 0%, rgba(70,38,38,0.6) 100%)",
                          opacity: cfg.dim,
                          transition: "opacity 1s ease",
                        }}
                      />

                      <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-[46%]"
                        style={{
                          background: "linear-gradient(180deg, rgba(23,23,23,0) 0%, rgba(23,23,23,0.88) 100%)",
                          opacity: isActive ? 1 : 0,
                          transition: "opacity .6s ease",
                        }}
                      />

                      {isActive ? (
                        <>
                          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(255,226,214,0) 38%, rgba(122,28,36,0.38) 100%)", mixBlendMode: "multiply" }} />
                            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,214,196,0.22) 0%, rgba(255,214,196,0) 60%)" }} />
                            <div className="absolute -right-[20%] -top-[20%] h-1/2 w-[70%]" style={{ background: "radial-gradient(circle, rgba(231,181,164,0.38) 0%, rgba(231,181,164,0) 70%)" }} />
                            <div className="absolute -bottom-[12%] -left-[10%] -right-[10%] h-[38%]" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(184,71,53,0.4) 0%, rgba(184,71,53,0) 70%)" }} />
                            <div
                              className="absolute -bottom-[10%] -top-[10%] left-0 w-[42%]"
                              style={{
                                background:
                                  "linear-gradient(100deg, rgba(231,181,164,0) 0%, rgba(255,226,214,0.45) 45%, rgba(184,71,53,0.22) 55%, rgba(231,181,164,0) 100%)",
                                animation: "sweep 7s ease-in-out .7s infinite",
                              }}
                            />
                            {/* Diagonal glass reflection. */}
                            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,235,226,0.32) 0%, rgba(255,235,226,0) 45%)" }} />
                          </div>
                          {/* Animated red-to-pink border. */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[22px] p-[1.5px]"
                            style={{
                              background: "linear-gradient(110deg, #B84735 0%, #E7B5A4 30%, #B84735 60%, #E7B5A4 90%)",
                              backgroundSize: "200% 100%",
                              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                              WebkitMaskComposite: "xor",
                              mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
                              animation: "borderFlow 6s linear infinite, breathe 4s ease-in-out infinite",
                            }}
                          />
                        </>
                      ) : null}

                      <div
                        className="absolute inset-x-0 bottom-0 p-[22px] md:p-7"
                        style={{
                          opacity: isActive ? 1 : 0,
                          visibility: isActive ? "visible" : "hidden",
                          transition: isActive
                            ? "opacity .5s ease .55s, visibility 0s linear 0s"
                            : "opacity .5s ease 0s, visibility 0s linear .5s",
                        }}
                      >
                        <div className="font-grotesk text-[26px] font-bold leading-[1.05] tracking-[-0.035em] text-white md:text-[32px]">
                          {member.name}
                        </div>
                        <div className="font-mono-ui mt-2 text-[11.5px] tracking-[1.5px] text-[#EDA08F]">
                          {member.role.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Drifting particles over the stage, as in the reference. */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[7] overflow-hidden">
                {PARTICLES.map(([x, y, s, color, delay, duration], i) => (
                  <span
                    key={i}
                    className="absolute rounded-full opacity-0"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: s,
                      height: s,
                      background: color,
                      boxShadow: `0 0 6px ${color}`,
                      animation: `glint ${duration}s ease-out ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-[22px] md:mt-7">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous team member"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#171717] bg-transparent text-lg transition-colors hover:border-[#b84735] hover:text-[#b84735]"
              >
                ←
              </button>
              <div className="relative h-0.5 w-[120px] rounded-full bg-[#171717]/16" aria-hidden>
                <div
                  className="absolute -top-px h-1 w-7 rounded-full bg-[#b84735] transition-[left] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                  style={{ left: `calc(${thumbPct * 100}% - ${thumbPct * 28}px)` }}
                />
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next team member"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#171717] bg-transparent text-lg transition-colors hover:border-[#b84735] hover:text-[#b84735]"
              >
                →
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
