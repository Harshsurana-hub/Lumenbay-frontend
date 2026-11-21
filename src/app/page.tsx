import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Gauge,
  Gavel,
  KeyRound,
  Lock,
  PackageCheck,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import StarField from "@/components/auth/StarField";
import LandingNav from "@/components/landing/LandingNav";
import EscrowOrbit from "@/components/landing/EscrowOrbit";
import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";
import ContractSnippet from "@/components/landing/ContractSnippet";

export const metadata: Metadata = {
  title: { absolute: "Lumenbay | Trade anything. Risk nothing." },
  description:
    "A peer-to-peer marketplace where every payment is held in a Stellar smart contract until the buyer confirms delivery. Now in early access on testnet.",
};

const MARQUEE = [
  "Non-custodial escrow",
  "Built on Stellar",
  "Soroban smart contracts",
  "Settles in ~5 seconds",
  "Network fees under a cent",
  "On-chain dispute resolution",
  "Freighter wallet",
  "Open source",
];

const STEPS = [
  {
    icon: Wallet,
    title: "Pay into escrow",
    body: "Connect Freighter and pay. Your money goes into a Soroban smart contract, not to the seller and not to us.",
  },
  {
    icon: Lock,
    title: "Funds stay locked",
    body: "The contract holds the payment. No one can move it, so the seller knows you're good for it and you know it's safe.",
  },
  {
    icon: PackageCheck,
    title: "Seller ships",
    body: "The seller sends the item, knowing the money is already committed and waiting.",
  },
  {
    icon: BadgeCheck,
    title: "Confirm & release",
    body: "When it arrives, confirm in one tap and the contract pays the seller. Something wrong? Open a dispute instead.",
  },
];

const FAQ = [
  {
    q: "Is Lumenbay live?",
    a: "Lumenbay is in early access on the Stellar testnet. Everything works end to end, but payments use test XLM, which has no real value. Mainnet comes after testing and review.",
  },
  {
    q: "Does Lumenbay ever hold my money?",
    a: "No. Payments sit in a Soroban smart contract on Stellar. The contract's rules decide when funds move, not us and not the seller.",
  },
  {
    q: "What do I need to get started?",
    a: "An account and the free Freighter wallet browser extension. On testnet you can fund your wallet with free test XLM from Stellar's Friendbot.",
  },
  {
    q: "What happens if my item never arrives?",
    a: "Don't confirm delivery. Open a dispute, and the funds stay locked until it's resolved, either refunded to you or released to the seller.",
  },
  {
    q: "What does it cost?",
    a: "Stellar network fees are a tiny fraction of a cent per transaction. Any platform fee is shown to you before you pay.",
  },
];

export default function LandingPage() {
  return (
    <div className="lb-landing relative min-h-screen overflow-x-clip bg-[#050505] text-white [color-scheme:dark]">
      <LandingNav />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <Spotlight className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#3D1712_0%,#0B0807_55%,#050505_100%)]" />
        <div aria-hidden className="lb-drift-a pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[#E63946] opacity-30 blur-[120px]" />
        <div aria-hidden className="lb-drift-b pointer-events-none absolute -right-24 top-40 h-[30rem] w-[30rem] rounded-full bg-[#FF8A65] opacity-25 blur-[120px]" />
        <StarField />
        <div aria-hidden className="lb-grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-64" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-32 text-center sm:px-6 sm:pt-40">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-300/10 px-4 py-1.5 text-xs font-semibold text-orange-100 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-300" />
              </span>
              Early access · Live on Stellar testnet
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Trade anything.
              <br />
              <span className="lb-shimmer-text bg-[linear-gradient(110deg,#FFD8CC_0%,#FFC4B0_35%,#FF6B5B_55%,#FFD8CC_80%)] bg-[length:200%_100%] bg-clip-text text-transparent">
                Risk nothing.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-orange-100/75 sm:text-xl">
              Lumenbay is a peer-to-peer marketplace where every payment waits in a Stellar smart
              contract until you confirm the item arrived. Not held by us. Not held by the seller.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#1A0907] shadow-[0_0_40px_rgba(255, 122, 89,0.55)] transition hover:shadow-[0_0_60px_rgba(255, 180, 150,0.6)]"
              >
                <span className="lb-sheen absolute inset-0" aria-hidden />
                Join the testnet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              >
                See how escrow works
              </a>
            </div>
          </Reveal>

          <Reveal delay={450} className="mt-16 w-full">
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_120px_-20px_rgba(224, 72, 59,0.55)] backdrop-blur-xl sm:p-10">
              <div aria-hidden className="pointer-events-none absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-orange-300/60 to-transparent" />
              <EscrowOrbit />
            </div>
          </Reveal>
        </div>
      </Spotlight>

      {/* ───────────────────────── Marquee ───────────────────────── */}
      <div className="relative border-y border-white/10 bg-white/[0.03] py-5">
        <div className="lb-marquee-mask overflow-hidden">
          <div className="lb-marquee flex w-max gap-10">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap text-sm font-semibold text-orange-100/60">
                {item}
                <Sparkles className="h-3.5 w-3.5 text-orange-300/60" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────────────── How it works ───────────────────────── */}
      <section id="how" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-28 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">How it works</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Four steps. <span className="text-orange-200/60">Zero blind trust.</span>
          </h2>
          <p className="mt-4 text-orange-100/65">
            Strangers can trade safely because the contract enforces the deal, not a promise.
          </p>
        </Reveal>

        <Reveal className="lb-steps relative mt-16">
          <div aria-hidden className="lb-steps-line absolute left-[12.5%] right-[12.5%] top-8 hidden h-px md:block" />
          <ol className="grid gap-6 md:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="lb-step group relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-orange-300/40 hover:bg-white/[0.06]"
                style={{ animationDelay: `${150 + i * 160}ms` }}
              >
                <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF6B5B] to-[#FF8A65] shadow-lg shadow-orange-500/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-7 w-7" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-[#1A0907]">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-orange-100/60">{body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* ───────────────────────── Old way vs Lumenbay ───────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-28 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-rose-400/15 bg-rose-500/[0.04] p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-bold">The usual way</h3>
              </div>
              <ul className="mt-6 flex flex-col gap-4">
                {[
                  "Pay first and hope the item ships",
                  "Or ship first and hope you get paid",
                  "A platform sits on your money for days",
                  "Disputes vanish into a support inbox",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-orange-100/70">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400/80" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-orange-300/25 bg-linear-to-br from-orange-500/15 via-rose-500/10 to-orange-400/10 p-8 shadow-[0_0_80px_-20px_rgba(255, 107, 91,0.35)]">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-300/15 text-orange-200">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-bold">The Lumenbay way</h3>
              </div>
              <ul className="relative mt-6 flex flex-col gap-4">
                {[
                  "Payment is locked before anything ships",
                  "The seller is guaranteed payment on delivery",
                  "No one, including us, can take the funds",
                  "Disputes are settled by the contract's rules",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-white/90">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Features bento ───────────────────────── */}
      <section id="features" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 pb-28 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Why Lumenbay</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Trust, written in code.</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="min-w-0 lg:col-span-2 lg:row-span-2">
            <div className="flex h-full min-w-0 flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-400/15 text-rose-200">
                <KeyRound className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-2xl font-bold">Non-custodial by design</h3>
              <p className="mt-2 max-w-xl text-orange-100/65">
                Funds move only when the contract&apos;s rules say so. Release requires the buyer&apos;s own
                signature, so no admin, no server and no seller can move your money early.
              </p>
              <div className="mt-6 flex-1">
                <ContractSnippet />
              </div>
            </div>
          </Reveal>

          {[
            { icon: Zap, title: "Settles in seconds", body: "Stellar closes a ledger roughly every five seconds, so releases land almost instantly.", tint: "text-amber-200 bg-amber-300/15" },
            { icon: Gauge, title: "Fees under a cent", body: "Network fees are a tiny fraction of a cent. Any platform fee is shown before you pay.", tint: "text-emerald-200 bg-emerald-300/15" },
            { icon: Gavel, title: "Disputes with teeth", body: "Raise a dispute and funds stay locked until it's resolved: refund or release, never limbo.", tint: "text-rose-200 bg-rose-300/15" },
            { icon: Wallet, title: "Your keys, your wallet", body: "Sign with Freighter. Your private keys never leave your device.", tint: "text-orange-200 bg-orange-300/15" },
            { icon: Store, title: "Built for sellers too", body: "The buyer's money is committed before you ship, so you never post an item on a promise.", tint: "text-rose-200 bg-rose-300/15" },
          ].map(({ icon: Icon, title, body, tint }, i) => (
            <Reveal key={title} delay={i * 100} className="min-w-0">
              <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-orange-100/60">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Testnet ───────────────────────── */}
      <section id="testnet" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 pb-28 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,#1A0907_0%,#8C2A20_50%,#B23A2E_100%)] p-8 sm:p-12">
            <StarField />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-100">
                  <Rocket className="h-3.5 w-3.5" /> Early access
                </span>
                <h2 className="mt-5 text-4xl font-black tracking-tight">Try it on testnet, for free.</h2>
                <p className="mt-4 text-orange-100/80">
                  Lumenbay runs on the Stellar testnet while we build. Buy and sell with test XLM,
                  which has no real value, and help shape the marketplace before mainnet.
                </p>
                <Link
                  href="/auth/register"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1A0907] shadow-xl transition hover:brightness-95"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <ol className="flex flex-col gap-3">
                {[
                  ["Create a Lumenbay account", "Email, Google or GitHub. Takes a minute."],
                  ["Install Freighter", "Stellar's browser wallet. Switch its network to Testnet."],
                  ["Grab free test XLM", "Fund your wallet from Stellar's Friendbot faucet."],
                  ["Make your first escrow trade", "Buy, ship, confirm, and watch the contract do its job."],
                ].map(([title, body], i) => (
                  <li key={title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black text-[#1A0907]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="text-sm text-orange-100/70">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-20 px-4 pb-28 sm:px-6">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">FAQ</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Questions, answered.</h2>
        </Reveal>
        <div className="mt-10 flex flex-col gap-3">
          {FAQ.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 60}>
              <details className="group rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 transition-colors open:border-orange-300/30 open:bg-white/[0.06]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-orange-200/70 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed text-orange-100/65">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#E0483B_0%,#0B0807_60%)]" />
        <StarField />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-28 text-center sm:px-6">
          <Reveal>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_0_60px_rgba(255, 122, 89,0.7)]">
              <Image src="/logo-icon.png" alt="" width={44} height={44} />
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-8 text-4xl font-black tracking-tight sm:text-6xl">
              The safest way to trade
              <br />
              <span className="bg-linear-to-r from-[#FFD8CC] to-[#FFC4B0] bg-clip-text text-transparent">with strangers.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#1A0907] shadow-[0_0_50px_rgba(255, 122, 89,0.6)] transition hover:shadow-[0_0_70px_rgba(255, 180, 150,0.65)]"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/auth/login" className="px-6 py-4 text-sm font-semibold text-orange-100/80 hover:text-white">
                I already have an account
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer className="border-t border-white/10 bg-[#030303]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-orange-100/50 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="" width={20} height={20} />
            <span className="font-display font-bold text-white/80">Lumenbay</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <a href="https://github.com/Lumenbay" className="hover:text-white">GitHub</a>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">Built on Stellar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
