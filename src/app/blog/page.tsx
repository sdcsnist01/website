"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { blogPostsStub } from "@/data/blog";
import BlogCard from "@/components/blog/BlogCard";
import FloatWords from "@/components/ui/FloatWords";
import type { BlogCategory } from "@/types/blog";

/** Layout and copy from the Claude Design reference (Landing.dc.html #blog). */
const categoryOrder: Array<"all" | BlogCategory> = ["all", "community", "event", "growth", "digital", "article"];

export default function BlogPage() {
  const [filter, setFilter] = useState<"all" | BlogCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const featured = blogPostsStub[0];
  const cards = useMemo(() => {
    const list = blogPostsStub.slice(1);
    return filter === "all" ? list : list.filter((p) => p.category === filter);
  }, [filter]);

  const selected = selectedId ? blogPostsStub.find((p) => p.id === selectedId) : null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <main className="relative overflow-x-clip bg-background pb-16 pt-28 font-body text-on-surface sm:pt-32">
      <section aria-labelledby="blog-heading" className="relative overflow-hidden px-4 sm:px-6 md:px-8">
        <FloatWords preset="about" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(217,39,46,0.16)_1.2px,transparent_1.4px)] [background-size:28px_28px] [mask-image:linear-gradient(180deg,#000_0%,transparent_60%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-[12vw] -top-[10vw] h-[46vw] w-[46vw] min-h-[300px] min-w-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(244,201,190,0.55) 0%, rgba(253,240,240,0.3) 55%, rgba(255,255,255,0) 72%)" }} />

        <div className="relative mx-auto max-w-[1200px]">
          <div className="font-mono-ui mb-[18px] flex items-center gap-3 text-xs tracking-[3px] text-[#a91f29]">
            <span className="h-px w-7 bg-primary" aria-hidden />
            FROM THE SDC COMMUNITY
          </div>
          <h1 id="blog-heading" className="font-grotesk max-w-[16ch] text-balance text-[clamp(34px,5.2vw,68px)] font-bold leading-none tracking-[-0.045em] text-[#151518]">
            Stories, ideas &amp; everything we build.
          </h1>
          <p className="mt-[18px] max-w-[48ch] text-[clamp(16px,1.4vw,19px)] leading-[1.6] text-[#5c5c66]">
            Explore the people, projects, events, and ideas shaping the SDC community.
          </p>

          <article className="mt-14 grid items-center gap-14 md:grid-cols-[1.15fr_1fr]">
            <button
              type="button"
              onClick={() => setSelectedId(featured.id)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[26px] bg-[#efeae4] text-left shadow-[0_22px_50px_rgba(23,23,25,0.12)]"
            >
              <Image
                src={featured.coverImage}
                alt=""
                fill
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <span className="font-mono-ui absolute left-[18px] top-[18px] rounded-full bg-primary px-3.5 py-[7px] text-[11px] font-medium tracking-[1.6px] text-white">
                FEATURED
              </span>
            </button>
            <div className="flex flex-col gap-4">
              <div className="font-mono-ui text-[11.5px] tracking-[2px] text-primary">{featured.category.toUpperCase()}</div>
              <h2 className="font-grotesk text-balance text-[clamp(28px,3.4vw,46px)] font-bold leading-[1.02] tracking-[-0.04em] text-[#151518]">
                {featured.title}
              </h2>
              <p className="max-w-[46ch] text-pretty text-[16.5px] leading-[1.65] text-[#4a4a52]">{featured.excerpt}</p>
              <div className="font-mono-ui text-xs tracking-[1px] text-[#77736c]">
                {featured.date} · {featured.readTime}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedId(featured.id)}
                  className="pressable inline-flex min-h-[52px] items-center gap-3 rounded-full bg-primary px-7 text-[15px] font-semibold text-white shadow-[0_12px_26px_rgba(217,39,46,0.22)] transition-colors hover:bg-primary-dim"
                >
                  Read Story <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </article>

          <div role="group" aria-label="Story categories" className="scrollbar-hide mt-16 flex gap-2 overflow-x-auto px-0.5 py-1">
            {categoryOrder.map((cat) => {
              const on = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(cat)}
                  className={`shrink-0 min-h-11 cursor-pointer whitespace-nowrap rounded-full border px-5 text-sm font-medium capitalize transition-colors duration-200 ${
                    on ? "border-primary bg-primary text-white" : "border-[#e0d3c8] bg-[#fffbf7] text-[#4a4a52] hover:border-[#f0b8b8]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <ul aria-label="Articles" className="mt-7 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-3.5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {cards.map((post) => (
              <li key={post.id} className="flex">
                <BlogCard post={post} onOpen={setSelectedId} />
              </li>
            ))}
          </ul>

          {cards.length === 0 ? <p className="py-10 text-[15px] text-[#5c5c66]">No stories in this category yet.</p> : null}

          <p className="mt-9 text-[12.5px] text-[#77736c]">
            Sample content. Titles, descriptions, dates and reading times are placeholders until approved stories are published.
          </p>
        </div>
      </section>

      {selected ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 backdrop-blur-sm sm:items-start sm:overflow-y-auto"
          onClick={() => setSelectedId(null)}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-modal-title"
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-[22px] border border-[#ebddd3] bg-[#fffbf7] p-5 shadow-[0_24px_60px_rgba(23,23,25,0.18)] sm:mx-auto sm:mt-12 sm:mb-16 sm:max-h-[85vh] sm:w-[min(920px,92vw)] sm:rounded-[22px] sm:p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-6 aspect-[16/8] overflow-hidden rounded-2xl bg-[#efeae4]">
              <Image src={selected.coverImage} alt="" fill className="object-cover" sizes="(max-width: 920px) 92vw, 920px" />
              <button
                type="button"
                className="pressable absolute right-3 top-3 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-on-surface shadow-sm"
                onClick={() => setSelectedId(null)}
              >
                Close
              </button>
            </div>
            <p className="font-mono-ui mb-2 text-xs tracking-[2px] text-primary">{selected.category.toUpperCase()}</p>
            <h2 id="blog-modal-title" className="font-grotesk text-balance text-2xl font-bold text-on-surface sm:text-3xl">
              {selected.title}
            </h2>
            <p className="font-mono-ui mt-2 text-xs tracking-[1px] text-on-surface-variant">
              {selected.date} · {selected.readTime}
            </p>
            <div className="mt-6 space-y-5 text-[#4a4a52]">
              {selected.content.map((block, i) => (
                <section key={`${selected.id}-${i}`} className="space-y-3">
                  {block.title ? <h3 className="font-grotesk text-xl font-bold text-on-surface">{block.title}</h3> : null}
                  {block.paragraphs?.map((p) => (
                    <p key={p} className="leading-7">
                      {p}
                    </p>
                  ))}
                  {block.bullets ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {block.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                  {block.quote ? (
                    <blockquote className="rounded-r-lg border-l-4 border-primary bg-[#fdf0f0] px-4 py-3 italic text-on-surface">
                      {block.quote}
                    </blockquote>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
