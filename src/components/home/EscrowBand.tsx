import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import EscrowJourney from "@/components/shop/EscrowJourney";

/** The home page's account of how money moves, set on the same dark vault as the hero. */
export default function EscrowBand() {
  return (
    <section
      id="escrow"
      className="lb-vault lb-grain relative isolate scroll-mt-28 overflow-hidden rounded-[28px] px-5 py-10 sm:rounded-[36px] sm:px-10 sm:py-14 lg:px-14"
    >
      <div aria-hidden className="lb-edge-glow absolute inset-x-16 top-0 h-px" />
      <div
        aria-hidden
        className="lb-drift-b pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#FF7A59] opacity-20 blur-[100px]"
      />

      <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-14">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB4A2]">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Escrow, on every order
          </p>
          <h2 className="font-display mt-4 text-[32px] font-bold leading-[1.02] tracking-[-0.025em] text-white sm:text-[44px]">
            Your money waits in a contract, <span className="lb-ember-text">not a pocket.</span>
          </h2>
        </div>
        <div className="lg:pb-1.5">
          <p className="max-w-xl text-[15px] leading-relaxed text-white/65">
            There is no buyer-protection department to email. The rules are code on Stellar: the
            payment is locked before anything ships, and only your confirmation releases it.
          </p>
          <Link
            href="/help"
            className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            <span className="border-b border-white/30 pb-0.5 transition-colors group-hover:border-white">
              Read the full guide
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>

      <EscrowJourney variant="band" className="relative mt-10" />
    </section>
  );
}
