import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-habitualle.png"
      alt=""
      width={541}
      height={429}
      priority={priority}
      className={cn("h-24 w-auto", className)}
    />
  );
}
