import { formatUsd } from "@/lib/money";
import { splitAmount } from "@/lib/shopDisplay";
import { cn } from "@/lib/utils";

/**
 * The price, set as type rather than printed as a string.
 *
 * XLM is the hero because it is what actually leaves the buyer's wallet and
 * locks in escrow. The dollar figure the seller priced in sits underneath as
 * the reference, with the old price struck through when there is one.
 */

const SIZES = {
  sm: { amount: "text-[19px]", fraction: "text-[13px]", unit: "text-[9px]", usd: "text-[11.5px]" },
  md: { amount: "text-[24px]", fraction: "text-[15px]", unit: "text-[10px]", usd: "text-xs" },
  lg: { amount: "text-[34px] sm:text-[40px]", fraction: "text-[20px] sm:text-[24px]", unit: "text-[11px]", usd: "text-sm" },
  xl: { amount: "text-[44px] sm:text-[56px]", fraction: "text-[24px] sm:text-[30px]", unit: "text-xs", usd: "text-[15px]" },
} as const;

export type PriceTagSize = keyof typeof SIZES;

export function XlmAmount({
  amount,
  size = "md",
  tone = "ink",
  className,
}: {
  amount: number;
  size?: PriceTagSize;
  /** `light` for use on the fixed-dark vault surfaces. */
  tone?: "ink" | "light";
  className?: string;
}) {
  const { whole, fraction } = splitAmount(amount);
  const s = SIZES[size];

  return (
    <span className={cn("flex w-fit items-baseline gap-1.5 whitespace-nowrap leading-none", className)}>
      <span
        className={cn(
          "tnum font-display font-bold leading-none tracking-[-0.03em]",
          s.amount,
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        {whole}
        {fraction && (
          <span className={cn(s.fraction, tone === "light" ? "text-white/55" : "text-ink-faint")}>
            {fraction}
          </span>
        )}
      </span>
      <span
        className={cn(
          "font-bold uppercase tracking-[0.16em]",
          s.unit,
          tone === "light" ? "text-[#FFB4A2]" : "text-accent",
        )}
      >
        XLM
      </span>
    </span>
  );
}

export default function PriceTag({
  xlm,
  usd,
  originalUsd,
  size = "md",
  tone = "ink",
  className,
}: {
  xlm: number;
  usd: number;
  originalUsd?: number;
  size?: PriceTagSize;
  tone?: "ink" | "light";
  className?: string;
}) {
  const s = SIZES[size];
  const discounted = originalUsd !== undefined && originalUsd > usd;

  return (
    <div className={cn("min-w-0", className)}>
      <XlmAmount amount={xlm} size={size} tone={tone} />
      <p
        className={cn(
          "tnum mt-1.5 flex flex-wrap items-baseline gap-x-1.5 font-medium",
          s.usd,
          tone === "light" ? "text-white/60" : "text-ink-muted",
        )}
      >
        <span>≈ {formatUsd(usd)}</span>
        {discounted && (
          <s className={tone === "light" ? "text-white/35" : "text-ink-faint"}>
            <span className="sr-only">was </span>
            {formatUsd(originalUsd)}
          </s>
        )}
      </p>
    </div>
  );
}
