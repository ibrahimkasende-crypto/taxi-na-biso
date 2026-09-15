import { Photo } from '@/components/Photo';

export function PageHero({
  title,
  intro,
  src,
  alt,
}: {
  title: string;
  intro: string;
  src: string;
  alt: string;
}) {
  return (
    <section className="relative isolate min-h-[42svh] overflow-hidden bg-ink text-white">
      <Photo src={src} alt={alt} sizes="100vw" priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/25" />
      <div className="relative mx-auto flex min-h-[42svh] max-w-6xl items-end px-4 pb-12 pt-28">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-white/85">{intro}</p>
        </div>
      </div>
    </section>
  );
}
