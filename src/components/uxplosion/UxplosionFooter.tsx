export default function UxplosionFooter() {
  return (
    <footer className="relative z-[2] border-t border-white/[0.055] px-4 py-[34px] sm:px-6 md:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5 text-[13px] text-[#8F898F]">
        <span className="flex items-center gap-2 font-semibold text-[#F4F0F2]">
          <span aria-hidden="true" className="text-[#FF2F7D]">✳</span> SDC — UXplosion 3.0
        </span>
        <span>© {new Date().getFullYear()} Student Developers Community, SNIST</span>
      </div>
    </footer>
  );
}
