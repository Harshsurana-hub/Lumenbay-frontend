import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Info, Lightbulb, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import SectionHeading from "@/components/shop/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * Building blocks for the long-form help guides: sections that anchor the
 * table of contents, numbered steps, callouts and a native FAQ accordion.
 * Everything here renders on the server; only the table of contents needs JS.
 */

export function GuideSection({
  id,
  index,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-line pt-12 first:border-t-0 first:pt-0 sm:pt-16">
      <div id={`${id}-title`}>
        <SectionHeading index={index} eyebrow={eyebrow} title={title} description={description} />
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** One numbered instruction, with an optional illustration beside it. */
export function GuideStep({
  id,
  n,
  icon: Icon,
  title,
  children,
  visual,
}: {
  id?: string;
  n: number | string;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <article
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_1px_0_0_var(--line)]"
    >
      <div className={cn("grid gap-6 p-5 sm:p-6", visual && "md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:items-start")}>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white shadow-[0_10px_24px_-10px_rgba(224,72,59,0.9)]">
              <Icon className="h-5 w-5" aria-hidden />
              <span className="tnum absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-surface bg-ink px-1 text-[10px] font-black text-bg">
                {n}
              </span>
            </span>
            <h3 className="font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ink sm:text-xl">{title}</h3>
          </div>
          <div className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink">
            {children}
          </div>
        </div>
        {visual && <div className="min-w-0">{visual}</div>}
      </div>
    </article>
  );
}

/** A short ordered list of actions inside a step. */
export function Actions({ items }: { items: ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="tnum mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-black text-accent">
            {i + 1}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ol>
  );
}

const CALLOUT: Record<
  "tip" | "warn" | "info" | "safe",
  { icon: LucideIcon; label: string; box: string; tone: string }
> = {
  tip: { icon: Lightbulb, label: "Tip", box: "border-accent-line bg-accent-soft", tone: "text-accent" },
  warn: { icon: AlertTriangle, label: "Careful", box: "border-warn-line bg-warn-bg", tone: "text-warn" },
  info: { icon: Info, label: "Good to know", box: "border-line bg-surface-2", tone: "text-ink" },
  safe: { icon: ShieldCheck, label: "You're safe", box: "border-ok-line bg-ok-bg", tone: "text-ok" },
};

export function Callout({
  kind,
  title,
  children,
}: {
  kind: keyof typeof CALLOUT;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, label, box, tone } = CALLOUT[kind];
  return (
    <aside className={cn("flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed", box)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} aria-hidden />
      <div className="min-w-0 text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink">
        <p className={cn("text-[11px] font-bold uppercase tracking-[0.16em]", tone)}>{title ?? label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </aside>
  );
}

/** Text the app shows, quoted exactly so people can match it on screen. */
export function Quote({ children }: { children: ReactNode }) {
  return (
    <span className="font-medium text-ink">
      &ldquo;{children}&rdquo;
    </span>
  );
}

/** Name of a button or menu item, styled like a small key. */
export function Ui({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md border border-line-strong bg-surface px-1.5 py-0.5 text-[13px] font-semibold text-ink shadow-[0_1px_0_0_var(--line-strong)]">
      {children}
    </span>
  );
}

export function Faq({
  question,
  children,
  icon: Icon = Info,
}: {
  question: string;
  children: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <details className="group rounded-2xl border border-line bg-surface transition-colors open:border-accent-line open:shadow-[0_18px_40px_-28px_rgba(224,72,59,0.55)]">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-muted transition-colors group-open:bg-accent-soft group-open:text-accent">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 pt-1 text-[15px] font-semibold leading-snug text-ink">{question}</span>
        <span
          aria-hidden
          className="relative mt-2 h-3 w-3 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-3 before:-translate-y-1/2 before:rounded-full before:bg-ink-faint after:absolute after:left-1/2 after:top-0 after:h-3 after:w-0.5 after:-translate-x-1/2 after:rounded-full after:bg-ink-faint after:transition-transform group-open:after:scale-y-0"
        />
      </summary>
      <div className="flex flex-col gap-3 px-4 pb-5 text-sm leading-relaxed text-ink-muted sm:pl-[68px] sm:pr-6 [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </details>
  );
}
