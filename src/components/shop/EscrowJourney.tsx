import { BadgeCheck, Lock, PackageCheck, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The four steps every Lumenbay purchase goes through, drawn as a journey
 * along a rail whose dashes flow from buyer to seller.
 *
 * `band` is the wide, fixed-dark version for the home page. `panel` is the
 * stacked, theme-aware version that sits beside the buy button on a listing,
 * where the first step quotes the actual amount.
 */

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

function stepsFor(amount?: string): Step[] {
  return [
    {
      icon: Wallet,
      title: amount ? `You pay ${amount}` : "You pay",
      body: "The XLM leaves your wallet and locks in a Soroban smart contract.",
    },
    {
      icon: Lock,
      title: "Funds stay locked",
      body: "Neither the seller nor Lumenbay can move them while the order is open.",
    },
    {
      icon: PackageCheck,
      title: "Seller ships",
      body: "They post the item knowing the money is already committed.",
    },
    {
      icon: BadgeCheck,
      title: "You confirm, it releases",
      body: "One tap pays the seller. Something wrong? Open a dispute and it stays locked.",
    },
  ];
}

export default function EscrowJourney({
  variant,
  amount,
  className,
}: {
  variant: "band" | "panel";
  amount?: string;
  className?: string;
}) {
  const steps = stepsFor(amount);

  if (variant === "panel") {
    return (
      <ol className={cn("relative", className)}>
        <span
          aria-hidden
          className="lb-flow-line-y absolute bottom-5 left-[15px] top-5 w-px text-accent-line"
        />
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="relative flex gap-3.5 pb-4 last:pb-0">
            <span
              className={cn(
                "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                i === 0
                  ? "border-transparent bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white shadow-[0_6px_16px_-6px_rgba(224,72,59,0.8)]"
                  : "border-line-strong bg-surface text-ink-muted",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn("relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4", className)}>
      <span
        aria-hidden
        className="lb-flow-line absolute left-[12%] right-[12%] top-[42px] hidden h-px text-[#FFB4A2]/50 lg:block"
      />
      {steps.map(({ icon: Icon, title, body }, i) => (
        <li
          key={title}
          className="relative rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-[#FFB4A2]/35 hover:bg-white/[0.07]"
        >
          <div className="flex items-center justify-between">
            <span className="relative z-10 grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white shadow-[0_10px_30px_-10px_rgba(255,122,89,0.9)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display tnum text-3xl font-bold text-white/10">0{i + 1}</span>
          </div>
          <p className="mt-5 font-semibold text-white">{title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">{body}</p>
        </li>
      ))}
    </ol>
  );
}
