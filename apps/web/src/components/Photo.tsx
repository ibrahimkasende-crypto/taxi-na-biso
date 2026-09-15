import Image from 'next/image';

export function Photo({
  src,
  alt,
  sizes,
  priority = false,
  className = 'object-cover',
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
