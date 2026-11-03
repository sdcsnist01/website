import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";

interface EventGalleryProps {
  images: string[];
  title: string;
}

export default function EventGallery({ images, title }: EventGalleryProps) {
  if (!images.length) return null;

  return (
    <section aria-labelledby="gallery-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8">
      <SectionHeader eyebrow="PHOTOS" title={<span id="gallery-heading">Event gallery</span>} />
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-3.5 sm:gap-4">
        {images.map((src, index) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#e4ddd6] bg-[#efeae4]">
            <Image
              src={src}
              alt={`${title} photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none"
              sizes="(max-width: 359px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
