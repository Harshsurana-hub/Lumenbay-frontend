import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Droplets,
  Gavel,
  Globe,
  KeyRound,
  Lock,
  PackageCheck,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small, simplified drawings of the screens the testnet guide talks about.
 * They are illustrations, not working UI, so their insides are hidden from
 * assistive tech and the caption says what the picture shows.
 */

function Figure({ caption, children, className }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div aria-hidden className="pointer-events-none select-none">
        {children}
      </div>
      <figcaption className="text-center text-[11px] font-medium text-ink-faint">{caption}</figcaption>
    </figure>
  );
}

const btnAccent =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-red-500/25";

// ---------------------------------------------------------------------------
// Freighter (a browser extension, drawn in its own dark style in both themes)
// ---------------------------------------------------------------------------

function FreighterShell({ children, network = "Testnet" }: { children: ReactNode; network?: string }) {
  return (
    <div className="mx-auto w-full max-w-[270px] overflow-hidden rounded-2xl border border-white/10 bg-[#141317] text-white shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-linear-to-br from-[#8B7CF6] to-[#5B4BD6] text-[10px] font-black">V</span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-bold">Varial</span>
            <span className="block truncate font-mono text-[9px] text-white/45">GCX4…7QPA</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          {network}
        </span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function FreighterPhraseMock() {
  return (
    <Figure caption="Freighter shows your secret recovery phrase once. Write it on paper.">
      <FreighterShell>
        <p className="flex items-center gap-1.5 text-[11px] font-bold"><KeyRound className="h-3.5 w-3.5 text-[#B7AEFF]" /> Your recovery phrase</p>
        <ol className="mt-2.5 grid grid-cols-3 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => (
            <li key={i} className="flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-1.5">
              <span className="tnum text-[8px] text-white/35">{i + 1}</span>
              <span className="h-1.5 flex-1 rounded-full bg-white/25 blur-[1px]" />
            </li>
          ))}
        </ol>
        <p className="mt-2.5 rounded-md bg-amber-300/10 px-2 py-1.5 text-[9px] leading-snug text-amber-100/90">
          Anyone with these words can take everything in the wallet.
        </p>
      </FreighterShell>
    </Figure>
  );
}

export function FreighterNetworkMock() {
  const rows = [
    { name: "Mainnet", active: false },
    { name: "Testnet", active: true },
    { name: "Futurenet", active: false },
  ];
  return (
    <Figure caption="Settings → Network → Testnet. The badge at the top changes to Testnet.">
      <FreighterShell>
        <p className="flex items-center gap-1.5 text-[11px] font-bold"><Settings className="h-3.5 w-3.5 text-white/60" /> Settings <ChevronRight className="h-3 w-3 text-white/40" /> Network</p>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {rows.map((r) => (
            <li
              key={r.name}
              className={cn(
                "flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px] font-semibold",
                r.active ? "border-[#8B7CF6] bg-[#8B7CF6]/15 text-white" : "border-white/10 text-white/55",
              )}
            >
              <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> {r.name}</span>
              {r.active && <Check className="h-3.5 w-3.5 text-[#B7AEFF]" />}
            </li>
          ))}
        </ul>
      </FreighterShell>
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Lumenbay screens
// ---------------------------------------------------------------------------

function AppCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_44px_-30px_rgba(20,21,28,0.45)]", className)}>
      {children}
    </div>
  );
}

export function SignInMock() {
  return (
    <Figure caption="Sign up with email, or continue with Google or GitHub.">
      <AppCard className="p-4">
        <p className="font-display text-sm font-bold text-ink">Welcome back</p>
        <div className="mt-3 flex flex-col gap-2">
          <span className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[11px] text-ink-faint">you@example.com</span>
          <span className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[11px] tracking-[0.3em] text-ink-faint">••••••••</span>
          <span className={btnAccent}>Sign in</span>
        </div>
        <p className="my-3 text-center text-[9px] font-semibold uppercase tracking-widest text-ink-faint">or continue with</p>
        <div className="grid grid-cols-2 gap-2">
          <span className="rounded-lg border border-line py-1.5 text-center text-[11px] font-semibold text-ink">Google</span>
          <span className="rounded-lg border border-line py-1.5 text-center text-[11px] font-semibold text-ink">GitHub</span>
        </div>
      </AppCard>
    </Figure>
  );
}

export function NavbarMock() {
  return (
    <Figure caption="On a computer, the top bar has a Buying / Selling switch and a Connect wallet button.">
      <AppCard className="max-w-[320px]">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-bg/80 px-3 py-2.5">
          <span className="font-display text-[12px] font-extrabold tracking-tight text-ink">Lumenbay</span>
          <span className="relative flex items-center rounded-full border border-line bg-surface-2 p-0.5 text-[9px] font-bold">
            <span className="flex items-center gap-1 rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-2 py-1 text-white"><ShoppingBag className="h-2.5 w-2.5" />Buying</span>
            <span className="flex items-center gap-1 px-2 py-1 text-ink-muted"><Store className="h-2.5 w-2.5" />Selling</span>
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 px-3 py-3">
          <span className="relative flex items-center gap-1.5 rounded-md border border-accent px-2.5 py-1.5 text-[10px] font-semibold text-accent ring-4 ring-accent-soft">
            <Wallet className="h-3 w-3" /> Connect wallet
          </span>
          <span className="h-7 w-7 rounded-full bg-surface-3" />
        </div>
        <p className="border-t border-line bg-surface-2 px-3 py-2 text-[10px] text-ink-muted">
          After connecting: <span className="font-mono text-ink">GCX4…7QPA</span> <span className="font-semibold">10,000 XLM</span> <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-ok align-middle" />
        </p>
      </AppCard>
    </Figure>
  );
}

function VaultBalance({ amount, note }: { amount: string; note?: string }) {
  return (
    <div className="lb-vault lb-grain relative overflow-hidden p-4">
      <div className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
      <p className="relative flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-orange-100/75">
        <Wallet className="h-3 w-3" /> Stellar wallet · Testnet
      </p>
      <p className="font-display lb-ember-text relative mt-2 text-2xl font-extrabold tracking-tight">{amount}</p>
      {note && <p className="relative mt-0.5 text-[10px] text-orange-100/70">{note}</p>}
      <p className="relative mt-3 truncate rounded-lg bg-white/10 px-2 py-1.5 font-mono text-[9px] text-orange-50">GCX4QWERTYUIOPASDFGHJKLZXCVBNM7QPA</p>
    </div>
  );
}

export function FriendbotMock() {
  return (
    <Figure caption="Wallet page: tap “Get free test XLM” and your balance jumps to 10,000.">
      <AppCard>
        <VaultBalance amount="10,000 XLM" note="Test money. It has no real value." />
        <div className="grid grid-cols-3 gap-1.5 p-3">
          <span className="flex flex-col items-center gap-1 rounded-xl border border-accent bg-accent-soft py-2.5 text-center text-[9px] font-bold text-accent ring-4 ring-accent-soft">
            <Droplets className="h-4 w-4" /> Get free test XLM
          </span>
          <span className="flex flex-col items-center gap-1 rounded-xl border border-line py-2.5 text-center text-[9px] font-bold text-ink-muted">
            <Globe className="h-4 w-4" /> History
          </span>
          <span className="flex flex-col items-center gap-1 rounded-xl border border-line py-2.5 text-center text-[9px] font-bold text-ink-muted">
            <Wallet className="h-4 w-4" /> Disconnect
          </span>
        </div>
      </AppCard>
    </Figure>
  );
}

export function PayoutMock() {
  return (
    <Figure caption="Wallet page: one tap makes the connected wallet your payout wallet.">
      <AppCard className="p-3">
        <div className="rounded-xl border border-accent-line bg-accent-soft p-3">
          <p className="text-[11px] font-bold text-ink">Set your payout wallet</p>
          <p className="mt-1 text-[10px] leading-snug text-ink-muted">If you sell on Lumenbay, buyers&apos; payments are released to this wallet.</p>
          <span className={cn(btnAccent, "mt-2.5 rounded-lg")}>Use GCX4…7QPA for payouts</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-ok-line bg-ok-bg px-3 py-2 text-[10px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" /> Your sales are paid to this wallet.
        </div>
      </AppCard>
    </Figure>
  );
}

export function ListingMock() {
  return (
    <Figure caption="List an item: a name, a category, a description, a photo and a price.">
      <AppCard className="p-3">
        <div className="flex flex-col gap-2">
          {[
            ["Item name", "Vintage film camera"],
            ["Category", "Electronics"],
            ["Asking price (USD)", "$ 40.00"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] font-semibold text-ink-muted">{label}</p>
              <p className="mt-0.5 rounded-md border border-line bg-surface-2 px-2 py-1.5 text-[10px] text-ink">{value}</p>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-1.5">
            <span className="lb-dots aspect-square rounded-md bg-accent-soft text-accent-line" />
            <span className="aspect-square rounded-md border border-dashed border-line-strong" />
            <span className="aspect-square rounded-md border border-dashed border-line-strong" />
          </div>
          <span className={cn(btnAccent, "mt-1")}>Publish listing</span>
        </div>
      </AppCard>
    </Figure>
  );
}

export function SellerHubMock() {
  return (
    <Figure caption="Seller hub: new orders land in “Needs you” with a “Ship it” button.">
      <AppCard>
        <div className="lb-vault relative p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFB4A2]">Selling</p>
          <p className="font-display text-sm font-bold text-white">Seller hub</p>
        </div>
        <div className="p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">Needs you · 1</p>
          <div className="mt-2 rounded-xl border border-line p-2.5">
            <div className="flex items-center gap-2">
              <span className="lb-dots h-9 w-9 shrink-0 rounded-lg bg-accent-soft text-accent-line" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-ink">Vintage film camera</p>
                <span className="mt-0.5 inline-block rounded-full bg-warn-bg px-1.5 py-0.5 text-[9px] font-bold text-warn">Ready to ship</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="tnum text-[11px] font-black text-ink">125 XLM</span>
              <span className="rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-2 py-1 text-[9px] font-bold text-white">Ship it</span>
            </div>
          </div>
        </div>
      </AppCard>
    </Figure>
  );
}

export function ShipMock() {
  return (
    <Figure caption="Order page: add a tracking note, then “Mark as shipped”. No wallet prompt.">
      <AppCard className="p-3">
        <div className="flex flex-col gap-2 rounded-xl border border-accent-line bg-accent-soft p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-black text-ink"><Truck className="h-3.5 w-3.5 text-accent" /> Ready to ship</p>
          <p className="text-[10px] leading-snug text-ink-muted">The buyer&apos;s 125 XLM is locked. Send the item, then mark it shipped.</p>
          <p className="rounded-md border border-line bg-surface px-2 py-1.5 text-[10px] text-ink">DHL · tracking 1Z 999 AA1 0123</p>
          <span className={btnAccent}><Truck className="h-3 w-3" /> Mark as shipped</span>
        </div>
      </AppCard>
    </Figure>
  );
}

const TRACK = ["Created", "Funds locked", "Shipped", "Released"];

function Track({ reached }: { reached: number }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {TRACK.map((s, i) => (
        <div key={s} className="flex flex-col gap-1">
          <span className={cn("h-1 rounded-full", i <= reached ? "bg-accent" : "bg-surface-3")} />
          <span className={cn("truncate text-[8px] font-semibold", i <= reached ? "text-ink" : "text-ink-faint")}>{s}</span>
        </div>
      ))}
    </div>
  );
}

export function CheckoutMock() {
  const steps = [
    { title: "Create the escrow", body: "No money moves yet.", state: "done" },
    { title: "Lock your payment", body: "Approve in your wallet…", state: "active" },
    { title: "Save your order", body: "Automatic. No signature.", state: "idle" },
  ];
  return (
    <Figure caption="The checkout window walks you through three steps. You approve the first two.">
      <AppCard>
        <div className="bg-[linear-gradient(135deg,#1A0907_0%,#8C2A20_55%,#FF7A59_100%)] px-3 pb-3 pt-3 text-white">
          <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-orange-100/80"><ShieldCheck className="h-3 w-3" /> Escrow checkout · Testnet</p>
          <p className="font-display mt-1 text-[12px] font-extrabold">Vintage film camera</p>
          <p className="tnum mt-1 text-lg font-black">125 XLM</p>
        </div>
        <ol className="flex flex-col gap-1.5 p-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2",
                s.state === "done" ? "border-ok-line bg-ok-bg" : s.state === "active" ? "border-accent-line" : "border-line",
              )}
            >
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-surface-3 text-[8px] font-black text-ink">
                {s.state === "done" ? <Check className="h-2.5 w-2.5 text-ok" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold text-ink">{s.title}</span>
                <span className={cn("block text-[9px]", s.state === "active" ? "text-accent" : "text-ink-muted")}>{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </AppCard>
    </Figure>
  );
}

export function PurchasesMock() {
  return (
    <Figure caption="My purchases: the money you have in escrow, and what needs you.">
      <AppCard>
        <div className="lb-vault relative p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFB4A2]">Buying</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50">Held safely in escrow</p>
          <p className="font-display lb-ember-text text-xl font-extrabold">125 XLM</p>
        </div>
        <div className="flex items-center gap-2 p-3">
          <span className="lb-dots h-9 w-9 shrink-0 rounded-lg bg-accent-soft text-accent-line" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-ink">Vintage film camera</p>
            <span className="mt-0.5 inline-block max-w-full truncate rounded-full bg-warn-bg px-1.5 py-0.5 text-[9px] font-bold text-warn">On its way · confirm on arrival</span>
          </div>
        </div>
      </AppCard>
    </Figure>
  );
}

export function ConfirmMock() {
  return (
    <Figure caption="Order page: release the payment, or open a dispute if something is wrong.">
      <AppCard className="p-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-extrabold text-ink">125 XLM</p>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-bold text-accent">Funds locked</span>
        </div>
        <div className="mt-3"><Track reached={2} /></div>
        <div className="mt-3 flex flex-col gap-1.5">
          <span className={btnAccent}><PackageCheck className="h-3 w-3" /> I received it: release payment</span>
          <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-bad-line py-2 text-[11px] font-bold text-bad">
            <Gavel className="h-3 w-3" /> There&apos;s a problem: open a dispute
          </span>
        </div>
      </AppCard>
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Diagrams
// ---------------------------------------------------------------------------

export function TwoAccountsDiagram() {
  const sides = [
    { role: "Buyer", icon: ShoppingBag, login: "Lumenbay login B", wallet: "Freighter account 2", tint: "from-[#8B7CF6] to-[#5B4BD6]" },
    { role: "Seller", icon: Store, login: "Lumenbay login A", wallet: "Freighter account 1", tint: "from-[#E0483B] to-[#FF7A59]" },
  ];
  return (
    <Figure caption="Each side needs its own Lumenbay login and its own Freighter account.">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-3xl border border-line bg-surface-2 p-3 sm:gap-4 sm:p-5">
        {sides.map(({ role, icon: Icon, login, wallet, tint }, i) => (
          <div key={role} className={cn("min-w-0", i === 1 && "col-start-3")}>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <span className={cn("grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br text-white", tint)}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="font-display mt-2 text-sm font-bold text-ink">{role}</p>
              <p className="mt-2 truncate rounded-md bg-surface-2 px-2 py-1 text-[10px] font-semibold text-ink-muted">{login}</p>
              <p className="mt-1 truncate rounded-md bg-surface-2 px-2 py-1 text-[10px] font-semibold text-ink-muted">{wallet}</p>
            </div>
          </div>
        ))}
        <span className="col-start-2 row-start-1 grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-accent">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Figure>
  );
}

export function DisputeFlow() {
  const steps = [
    { icon: Gavel, title: "Buyer opens a dispute", body: "Picks a reason and writes what went wrong." },
    { icon: Lock, title: "Money stays locked", body: "Nobody can move it. Not the buyer, not the seller." },
    { icon: ShieldCheck, title: "An admin reviews it", body: "A Lumenbay admin looks at both sides." },
  ];
  return (
    <div className="lb-vault lb-grain relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
      <ol className="relative grid gap-3 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="font-display tnum text-2xl font-bold text-white/10">0{i + 1}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/60">{body}</p>
          </li>
        ))}
      </ol>
      <div className="relative mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB4A2]" aria-hidden />
          <p className="text-[13px] leading-relaxed text-white/70"><span className="font-semibold text-white">Refund:</span> the buyer gets the money back. The order shows as Refunded.</p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB4A2]" aria-hidden />
          <p className="text-[13px] leading-relaxed text-white/70"><span className="font-semibold text-white">Release:</span> the seller is paid, minus the 1% fee. The order shows as Completed.</p>
        </div>
      </div>
    </div>
  );
}

export function FeeReceipt({ price, feeBps }: { price: number; feeBps: number }) {
  const fee = (price * feeBps) / 10_000;
  const rows: { label: string; value: string; note?: string; strong?: boolean }[] = [
    { label: "Item price", value: `${price} XLM`, note: "What the buyer pays into escrow" },
    { label: "Network fees", value: "< 0.01 XLM", note: "Paid by whoever approves a step" },
    { label: `Lumenbay fee (${feeBps / 100}%)`, value: `− ${fee} XLM`, note: "Taken from the seller's payout" },
    { label: "Seller receives", value: `${price - fee} XLM`, strong: true },
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-line-strong px-5 py-4">
        <p className="font-display text-base font-bold text-ink">Example: a {price} XLM item</p>
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">Receipt</span>
      </div>
      <dl className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className={cn("flex items-start justify-between gap-4 px-5 py-3", r.strong && "bg-surface-2")}>
            <dt className="min-w-0">
              <span className={cn("block text-sm", r.strong ? "font-bold text-ink" : "text-ink")}>{r.label}</span>
              {r.note && <span className="block text-xs text-ink-faint">{r.note}</span>}
            </dt>
            <dd className={cn("tnum shrink-0 text-sm", r.strong ? "font-black text-ink" : "font-semibold text-ink-muted")}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-ink-muted">
        To buy this item, the buyer needs about <span className="font-semibold text-ink">{price + 2} XLM</span> in their wallet: the price plus about 2 XLM that stays behind for Stellar&apos;s account reserve and fees.
      </p>
    </div>
  );
}
