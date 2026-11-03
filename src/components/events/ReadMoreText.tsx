"use client";

import { useState } from "react";

/** Clamps long text to three lines on phones, with a "Read more" toggle. Desktop always shows the full text. */
export default function ReadMoreText({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 160;

  return (
    <>
      <p className={`${className} ${long && !open ? "line-clamp-3" : ""} md:line-clamp-none`}>{text}</p>
      {long ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mt-1 min-h-11 text-sm font-semibold text-[#f06a6a] md:hidden"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </>
  );
}
