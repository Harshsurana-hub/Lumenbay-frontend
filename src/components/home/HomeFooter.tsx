import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Shop",
    links: [
      ["Discover", "/home"],
      ["Marketplace", "/marketplace"],
      ["Search", "/search"],
      ["Saved items", "/dashboard/wishlist"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My orders", "/dashboard/orders"],
      ["Sell on Lumenbay", "/dashboard/selling"],
      ["Wallet", "/dashboard/wallet"],
      ["Help", "/help"],
    ],
  },
  {
    title: "Lumenbay",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

/** Shop footer: link columns over an oversized wordmark that bleeds off the bottom edge. */
export default function HomeFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-line bg-surface sm:mt-28">
      <div className="mx-auto max-w-[1360px] px-4 pb-6 pt-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white shadow-[0_0_0_1px_var(--line)]">
                <Image src="/logo-icon.png" alt="" width={20} height={20} />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ink">Lumenbay</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              The peer-to-peer marketplace where every payment waits in a Stellar smart contract
              until the buyer confirms delivery.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Non-custodial escrow on Stellar
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">{title}</p>
                <ul className="mt-4 space-y-2.5">
                  {links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-ink-muted transition-colors hover:text-accent">
                        {label}
                      </Link>
                    </li>
                  ))}
                  {title === "Lumenbay" && (
                    <li>
                      <a
                        href="https://github.com/Lumenbay"
                        className="text-sm text-ink-muted transition-colors hover:text-accent"
                      >
                        GitHub
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Lumenbay</p>
          <p>Built on Stellar · Prices in XLM are converted from the seller&apos;s USD price</p>
        </div>
      </div>

      <p
        aria-hidden
        className="font-display pointer-events-none -mb-[0.24em] select-none text-center text-[11vw] font-extrabold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_var(--line-strong)]"
      >
        Lumenbay
      </p>
    </footer>
  );
}
