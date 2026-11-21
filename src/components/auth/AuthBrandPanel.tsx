import Image from "next/image";
import { Lock, PackageCheck, ShieldCheck, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import StarField from "./StarField";

const STEPS = [
  { icon: Wallet, title: "You pay", body: "Funds lock in a Stellar smart contract." },
  { icon: PackageCheck, title: "Seller ships", body: "Neither side can touch the money meanwhile." },
  { icon: ShieldCheck, title: "You confirm", body: "Payment releases to the seller." },
];

/**
 * Brand side of the auth screens. Its colours are fixed rather than theme
 * tokens: the panel is the brand surface, and token-driven backgrounds turned
 * light under the dark theme while the white text stayed white.
 */
export default function AuthBrandPanel({ headline, body }: { headline: ReactNode; body: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden text-white bg-[linear-gradient(135deg,#1A0907_0%,#8C2A20_45%,#FF7A59_100%)] lg:relative lg:inset-auto lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-10">
      <div aria-hidden className="lb-drift-a pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#FF4D4D] opacity-40 blur-3xl" />
      <div aria-hidden className="lb-drift-b pointer-events-none absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-[#FF9B7A] opacity-30 blur-3xl" />
      <StarField />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="relative hidden items-center gap-2 lg:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-lg">
          <Image src="/logo-icon.png" alt="" width={24} height={24} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">Lumenbay</span>
      </div>

      <div className="relative hidden lg:block">
        <p className="font-display mb-4 text-4xl font-extrabold leading-[1.05] tracking-tight">{headline}</p>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-orange-100/85">{body}</p>

        <div className="lb-float max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-200">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            How escrow works
          </div>
          <ol className="flex flex-col gap-3">
            {STEPS.map(({ icon: Icon, title, body: stepBody }, i) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#FFB4A2] to-[#FF9B7A] text-[#1A0907]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold">
                    <span className="mr-1.5 text-orange-200">{i + 1}.</span>
                    {title}
                  </p>
                  <p className="text-xs text-orange-100/75">{stepBody}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="relative hidden items-center justify-between text-xs text-orange-100/70 lg:flex">
        <span>&copy; 2026 Lumenbay</span>
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-white">
          Built on Stellar
        </span>
      </div>
    </div>
  );
}
