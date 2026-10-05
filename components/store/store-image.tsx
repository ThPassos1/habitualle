import { cn } from "@/lib/utils";

type StoreImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function StoreImage({ src, alt, className, priority = false }: StoreImageProps) {
  return (
    // Remote photos stay outside the Image Optimizer on purpose.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
