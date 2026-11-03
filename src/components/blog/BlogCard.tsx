"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { BlogPost } from "@/types/blog";

/** Story card from the Claude Design reference (#blog grid). */
export default function BlogCard({ post, onOpen }: { post: BlogPost; onOpen: (id: string) => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-[#ebddd3] sm:rounded-[22px] bg-[#fffbf7] shadow-[0_10px_26px_rgba(23,23,25,0.05)] transition-[border-color,box-shadow] duration-[350ms] hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(217,39,46,0.12)]"
    >
      <button type="button" onClick={() => onOpen(post.id)} className="relative block aspect-[12/5] w-full overflow-hidden bg-[#efeae4] text-left sm:aspect-[16/10]">
        <Image
          src={post.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
          sizes="(max-width: 359px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        <span className="font-mono-ui absolute left-2 top-2 rounded-full bg-[#fffbf7]/95 px-1.5 py-0.5 text-[8.5px] font-medium tracking-[0.8px] text-[#a91f29] sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10.5px] sm:tracking-[1.5px]">
          {post.category.toUpperCase()}
        </span>
      </button>

      <div className="flex flex-1 flex-col px-2.5 pb-3 pt-3 sm:px-6 sm:pb-[22px] sm:pt-[22px]">
        <div className="font-mono-ui text-[9px] leading-snug tracking-[0.2px] text-[#77736c] sm:text-[11px] sm:tracking-[1.2px]">
          {post.date} · <span className="whitespace-nowrap">{post.readTime}</span>
        </div>
        <h3 className="font-grotesk mt-2 text-[17px] font-bold leading-[1.15] tracking-[-0.025em] text-[#151518] text-balance sm:mt-3 sm:text-[23px] sm:leading-[1.12] sm:tracking-[-0.03em]">
          <button type="button" onClick={() => onOpen(post.id)} className="text-left after:absolute after:inset-0 hover:text-primary">
            {post.title}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.45] text-[#4a4a52] sm:mt-3 sm:line-clamp-3 sm:text-[14.5px] sm:leading-[1.6]">{post.excerpt}</p>

        <div className="mt-auto pt-2 sm:pt-[18px]">
          <div className="flex items-center justify-between gap-2.5 border-t border-[#ebddd3] pt-2.5 sm:pt-4">
            <span className="text-[12.5px] font-semibold sm:text-[14.5px] text-[#151518] transition-transform duration-200 group-hover:translate-x-1">
              Read Article →
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
