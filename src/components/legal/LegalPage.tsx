import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-accent hover:text-accent-hover">
        &larr; Back to Lumenbay
      </Link>
      <h1 className="font-display mt-6 text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-faint">Last updated {updated}</p>
      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-ink-muted [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </main>
  );
}
