"use client";

import { Check, Coins, Lock, Package, ShieldCheck, Store, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const STEPS = [
  { caption: "Buyer pays", detail: "Payment leaves the buyer's wallet", ms: 1600 },
  { caption: "Funds lock in the contract", detail: "Neither side can touch them now", ms: 2200 },
  { caption: "Seller ships the item", detail: "The money stays locked in transit", ms: 2400 },
  { caption: "Buyer confirms delivery", detail: "One tap in the app", ms: 1600 },
  { caption: "Contract pays the seller", detail: "Released automatically, on-chain", ms: 2600 },
] as const;

/** Horizontal positions (% of width) of the three actors. */
const X = { buyer: 12, vault: 50, seller: 88 };

export default function EscrowOrbit() {
  const [step, setStep] = useState(0);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      current = (current + 1) % STEPS.length;
      if (current === 0) {
        // Snap pieces home without animating them backwards across the stage.
        setResetting(true);
        setStep(0);
        requestAnimationFrame(() => requestAnimationFrame(() => setResetting(false)));
      } else {
        setStep(current);
      }
      timer = setTimeout(advance, STEPS[current].ms);
    };

    timer = setTimeout(advance, STEPS[0].ms);
    return () => clearTimeout(timer);
  }, []);

  // The coin travels buyer → vault (where it is swallowed while locked) → seller.
  const coinX = step === 0 ? X.buyer : step === 4 ? X.seller : X.vault;
  const coinShown = step === 0 || step === 4;
  const parcelX = step >= 2 ? X.buyer : X.seller;
  const locked = step >= 1 && step <= 3;
  const move = resetting
    ? "none"
    : "left 1.1s cubic-bezier(.65,0,.35,1), opacity 1.1s ease-in, transform 1.1s cubic-bezier(.65,0,.35,1)";

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="relative h-56 sm:h-64">
        {/* Rails */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            {/* userSpaceOnUse: a bounding-box gradient on a zero-height line renders nothing */}
            <linearGradient id="lb-rail" gradientUnits="userSpaceOnUse" x1="12" y1="0" x2="88" y2="0">
              <stop offset="0%" stopColor="#FFB4A2" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#FFC4B0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFB4A2" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <line x1="12" y1="42" x2="88" y2="42" stroke="url(#lb-rail)" strokeWidth="2" strokeDasharray="6 8" vectorEffect="non-scaling-stroke" className="lb-rail-flow" />
          <path d="M 88 80 L 12 80" fill="none" stroke="#FFB4A2" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 8" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Buyer */}
        <Actor x={X.buyer} label="Buyer" icon={<User className="h-6 w-6" />} active={step === 0 || step === 3}>
          <span
            className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[#052e1c] shadow-lg shadow-emerald-400/50 transition-all duration-500 ${
              step === 3 || step === 4 ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        </Actor>

        {/* Vault */}
        <div className="absolute top-[42%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${X.vault}%` }}>
          <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <span className="lb-orbit-ring absolute inset-0 rounded-full border border-orange-300/30" />
            <span className="lb-orbit-ring-rev absolute -inset-3 rounded-full border border-dashed border-rose-300/25" />
            <span
              className={`absolute inset-2 rounded-full bg-linear-to-br from-[#FF6B5B] to-[#FF9B7A] blur-xl transition-opacity duration-700 ${
                locked ? "opacity-80" : "opacity-25"
              }`}
            />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-2xl backdrop-blur-md sm:h-20 sm:w-20">
              {locked ? <Lock className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </span>
          </div>
          <p className="mt-2 whitespace-nowrap text-center text-xs font-semibold text-orange-100/80">Escrow contract</p>
        </div>

        {/* Seller */}
        <Actor x={X.seller} label="Seller" icon={<Store className="h-6 w-6" />} active={step === 2 || step === 4}>
          <span
            className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300 transition-all duration-500 ${
              step === 4 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            Paid ✓
          </span>
        </Actor>

        {/* Coin: rides just above the rail so it never sits on an actor's icon */}
        <div
          className="absolute top-[14%] z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${coinX}%`,
            transition: move,
            opacity: coinShown ? 1 : 0,
            transform: `translate(-50%, -50%) scale(${coinShown ? 1 : 0.4})`,
          }}
          aria-hidden
        >
          <span className="flex items-center gap-1 rounded-full bg-linear-to-r from-amber-300 to-yellow-200 px-2.5 py-1 text-xs font-black text-amber-950 shadow-lg shadow-amber-300/50">
            <Coins className="h-3.5 w-3.5" /> XLM
          </span>
        </div>

        {/* Parcel */}
        <div
          className="absolute top-[80%] z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${parcelX}%`, transition: resetting ? "none" : "left 1.8s cubic-bezier(.45,0,.25,1), opacity .4s", opacity: step >= 2 && step <= 3 ? 1 : 0 }}
          aria-hidden
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-orange-200 backdrop-blur">
            <Package className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-6 flex flex-col items-center" aria-live="polite">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s.caption}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-orange-300" : i < step ? "w-3 bg-orange-300/70" : "w-3 bg-white/15"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-base font-bold text-white sm:text-lg">
          <span className="mr-2 text-orange-300">{step + 1}.</span>
          {STEPS[step].caption}
        </p>
        <p className="text-sm text-orange-100/60">{STEPS[step].detail}</p>
      </div>
    </div>
  );
}

function Actor({
  x,
  label,
  icon,
  active,
  children,
}: {
  x: number;
  label: string;
  icon: ReactNode;
  active: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="absolute top-[42%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%` }}>
      <div
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border text-white transition-all duration-500 sm:h-16 sm:w-16 ${
          active ? "border-orange-300/70 bg-orange-300/15 shadow-[0_0_30px_rgba(255, 180, 150,0.45)]" : "border-white/20 bg-white/5"
        }`}
      >
        {icon}
        {children}
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-orange-100/80">{label}</p>
    </div>
  );
}
