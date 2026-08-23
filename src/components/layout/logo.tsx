import { Headset } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Headset className="size-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight text-ink-strong">{SITE.name}</span>
    </Link>
  );
}
