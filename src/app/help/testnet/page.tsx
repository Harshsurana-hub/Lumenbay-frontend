import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Droplets,
  ExternalLink,
  FlaskConical,
  Gavel,
  Globe,
  Hash,
  HelpCircle,
  KeyRound,
  Lock,
  LogIn,
  PackageCheck,
  PackagePlus,
  Plug,
  Puzzle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wallet,
  WifiOff,
  XCircle,
} from "lucide-react";
import HomeFooter from "@/components/home/HomeFooter";
import {
  CheckoutMock,
  ConfirmMock,
  DisputeFlow,
  FeeReceipt,
  FreighterNetworkMock,
  FreighterPhraseMock,
  FriendbotMock,
  ListingMock,
  NavbarMock,
  PayoutMock,
  PurchasesMock,
  SellerHubMock,
  ShipMock,
  SignInMock,
  TwoAccountsDiagram,
} from "@/components/guide/GuideMocks";
import { Actions, Callout, Faq, GuideSection, GuideStep, Quote, Ui } from "@/components/guide/GuideParts";
import { GuideTocCompact, GuideTocRail, type TocItem } from "@/components/guide/GuideToc";
import { STELLAR } from "@/lib/stellar/config";

export const metadata: Metadata = {
  title: "Getting started on testnet",
  description:
    "A plain-English, step-by-step guide to trying Lumenbay with free test money: set up Freighter, get test XLM, then buy and sell with escrow.",
};

const FEE = `${STELLAR.feeBps / 100}%`;
const EXPLORER = "https://stellar.expert/explorer/testnet";

const TOC: TocItem[] = [
  { id: "what-is-testnet", label: "What testnet is" },
  { id: "setup", label: "Set up in 5 steps" },
  { id: "selling", label: "Sell something" },
  { id: "buying", label: "Buy something" },
  { id: "both-sides", label: "Test both sides" },
  { id: "disputes", label: "If something goes wrong" },
  { id: "fees", label: "Fees" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "glossary", label: "Glossary" },
];

const ROUTE = [
  { icon: Puzzle, label: "Install Freighter", href: "#install-freighter" },
  { icon: Globe, label: "Switch it to Testnet", href: "#switch-testnet" },
  { icon: LogIn, label: "Sign in to Lumenbay", href: "#sign-in" },
  { icon: Plug, label: "Connect your wallet", href: "#connect-wallet" },
  { icon: Droplets, label: "Get free test XLM", href: "#get-test-xlm" },
];

const ext = { target: "_blank", rel: "noreferrer" } as const;
const link = "font-semibold text-accent underline decoration-accent-line underline-offset-2 hover:decoration-accent";

export default function TestnetGuidePage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-24 sm:px-6 sm:pt-28">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
          <Link href="/help" className="hover:text-accent">Help</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="text-ink-muted">Testnet guide</span>
        </nav>

        <Hero />

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <aside>
            <GuideTocRail items={TOC} />
            <GuideTocCompact items={TOC} />
          </aside>

          <div className="flex min-w-0 max-w-[860px] flex-col gap-12 sm:gap-16">
            <WhatIsTestnet />
            <Setup />
            <Selling />
            <Buying />
            <BothSides />
            <Disputes />
            <Fees />
            <Troubleshooting />
            <Glossary />
            <Outro />
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------

function Hero() {
  return (
    <header className="lb-vault lb-grain relative overflow-hidden rounded-[28px] p-6 sm:p-10">
      <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
      <div aria-hidden className="lb-dots absolute inset-0 text-white/[0.05]" />
      <div aria-hidden className="lb-breathe pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF7A59] opacity-40 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#FFB4A2]/30 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFB4A2]">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Testnet guide
          </p>
          <h1 className="font-display mt-5 text-[34px] font-extrabold min-[420px]:text-[40px] leading-[0.98] tracking-[-0.035em] text-white sm:text-6xl">
            Try Lumenbay with <span className="lb-ember-text">play money</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Lumenbay runs on Stellar&apos;s test network for now. The money is free and pretend, so you can buy, sell and
            make mistakes without losing a thing. This guide walks you through it, one small step at a time.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
            {["About 10 minutes", "Costs nothing", "No crypto experience needed"].map((t) => (
              <li key={t} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-[#FFB4A2]" aria-hidden /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#setup"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:brightness-110"
            >
              Start setting up <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/10"
            >
              <Wallet className="h-4 w-4" aria-hidden /> Open your wallet
            </Link>
          </div>
        </div>

        <ol className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-5">
          <li className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">Your route</li>
          {ROUTE.map(({ icon: Icon, label, href }, i) => (
            <li key={href}>
              <a href={href} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.06]">
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-[#FFB4A2] transition-colors group-hover:bg-linear-to-br group-hover:from-[#E0483B] group-hover:to-[#FF7A59] group-hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-white">{label}</span>
                <span className="font-display tnum text-sm font-bold text-white/25">0{i + 1}</span>
              </a>
            </li>
          ))}
          <li className="mt-2 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/55">
            Then you&apos;re ready to <a href="#selling" className="font-semibold text-[#FFB4A2] hover:text-white">sell</a> or{" "}
            <a href="#buying" className="font-semibold text-[#FFB4A2] hover:text-white">buy</a>.
          </li>
        </ol>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------

function WhatIsTestnet() {
  const cards = [
    {
      icon: Coins,
      title: "It's play money",
      body: "Test XLM looks like the real thing but is worth nothing. You can't cash it out, and nobody can take real money from you here.",
    },
    {
      icon: FlaskConical,
      title: "It's a practice copy",
      body: "Testnet is a copy of the Stellar network made for trying things out. It works exactly like the real one, just without real value.",
    },
    {
      icon: ShieldCheck,
      title: "It's safe to experiment",
      body: "Press every button. Open a dispute for fun. If you run low, you can get more free test XLM in one tap.",
    },
  ];
  return (
    <GuideSection
      id="what-is-testnet"
      index="01"
      eyebrow="The basics"
      title="What testnet is"
      description="Think of it like a flight simulator for money. Everything behaves for real, but nothing is at stake."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-3xl border border-line bg-surface p-5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="font-display mt-4 text-base font-bold text-ink">{title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-line bg-surface-2 p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">How Lumenbay works, in one breath</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { icon: Wallet, t: "Buyer pays", d: "The money goes into a locked box on Stellar, called escrow." },
            { icon: Lock, t: "It stays locked", d: "Not the seller, not Lumenbay: nobody can touch it." },
            { icon: Truck, t: "Seller ships", d: "They send the item, knowing the money is there." },
            { icon: PackageCheck, t: "Buyer confirms", d: `The seller is paid, minus a ${FEE} fee.` },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="relative flex gap-3 sm:flex-col">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-ink-muted">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink"><span className="tnum mr-1 text-ink-faint">{i + 1}.</span>{t}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <Callout kind="warn" title="Two simple rules">
        <strong>Never send real XLM to a testnet address</strong>, it won&apos;t arrive. And now and then Stellar wipes the
        whole test network clean, so test balances and test orders may one day disappear. That&apos;s normal.
      </Callout>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function Setup() {
  return (
    <GuideSection
      id="setup"
      index="02"
      eyebrow="One-time setup"
      title="Set up in 5 steps"
      description="You only do this once. You'll need a computer with Chrome, Brave, Edge or Firefox."
    >
      <GuideStep
        id="install-freighter"
        n={1}
        icon={Puzzle}
        title="Install the Freighter wallet"
        visual={<FreighterPhraseMock />}
      >
        <p>
          A <strong>wallet</strong> is an app that holds your money and lets you approve payments. Lumenbay uses one
          called <strong>Freighter</strong>. It sits in your browser, like an ad-blocker does.
        </p>
        <Actions
          items={[
            <>Go to <a href="https://www.freighter.app/" {...ext} className={link}>freighter.app</a> and add the extension to your browser.</>,
            <>Click the Freighter icon in your browser&apos;s toolbar (it may hide under the puzzle-piece icon) and choose <Ui>Create new wallet</Ui>.</>,
            <>Pick a password. This unlocks Freighter on this computer.</>,
            <>Freighter shows you a <strong>recovery phrase</strong>: 12 words in order. Write them on paper and keep it somewhere safe.</>,
          ]}
        />
        <Callout kind="warn" title="Your recovery phrase is the master key">
          Anyone who has those 12 words can take everything in the wallet. <strong>Never type them into a website</strong>,
          and never share them with anyone, even someone saying they&apos;re from Lumenbay. We will never ask.
        </Callout>
        <Callout kind="info" title="A funny name at the top?">
          Freighter gives your account a name, for example <strong>&ldquo;Varial&rdquo;</strong> or &ldquo;Account 1&rdquo;. That&apos;s
          just a label on your computer. It doesn&apos;t need to match your name or your Lumenbay account.
        </Callout>
      </GuideStep>

      <GuideStep id="switch-testnet" n={2} icon={Globe} title="Switch Freighter to Testnet" visual={<FreighterNetworkMock />}>
        <p>
          Freighter starts on the real network, called <strong>Mainnet</strong>. Lumenbay&apos;s play money lives on{" "}
          <strong>Testnet</strong>, so tell Freighter to look there.
        </p>
        <Actions
          items={[
            <>Open Freighter and go to <Ui>Settings</Ui> (the gear or menu icon).</>,
            <>Choose <Ui>Network</Ui>.</>,
            <>Pick <Ui>Testnet</Ui> (some versions write it &ldquo;Test Net&rdquo;).</>,
          ]}
        />
        <p>The label at the top of Freighter now says Testnet. You can switch back any time.</p>
        <Callout kind="tip">
          If Lumenbay ever says <Quote>Your wallet is on the wrong network</Quote>, this is the setting to check.
        </Callout>
      </GuideStep>

      <GuideStep id="sign-in" n={3} icon={LogIn} title="Create a Lumenbay account" visual={<SignInMock />}>
        <p>Your Lumenbay account keeps your orders and listings together. Your wallet is separate, and you connect it next.</p>
        <Actions
          items={[
            <>Go to <Link href="/auth/register" className={link}>Sign up</Link> and fill in your name, email and a password. If we email you a link to confirm, open it.</>,
            <>Or go to <Link href="/auth/login" className={link}>Sign in</Link> and choose <Ui>Google</Ui> or <Ui>GitHub</Ui> to skip the password.</>,
          ]}
        />
        <p>
          The sign-up form asks if you&apos;re a buyer or a seller. Don&apos;t worry about it: every account can do both.
        </p>
      </GuideStep>

      <GuideStep id="connect-wallet" n={4} icon={Plug} title="Connect your wallet to Lumenbay" visual={<NavbarMock />}>
        <p>Connecting lets Lumenbay see your wallet&apos;s address and balance. It can&apos;t move money without asking you first.</p>
        <Actions
          items={[
            <>On a computer, click <Ui>Connect wallet</Ui> in the top bar. On a small screen, open your profile menu, go to <Ui>Wallet</Ui>, and tap <Ui>Connect wallet</Ui> there.</>,
            <>Freighter pops up and asks if Lumenbay may see your address. Click to approve.</>,
            <>The top bar now shows your short address and balance, with a small green dot.</>,
          ]}
        />
        <Callout kind="tip" title="Green dot, amber dot">
          Green means all good. Amber means Freighter is on the wrong network, or this isn&apos;t the wallet you get paid
          to. Click it to open your Wallet page and see which.
        </Callout>
      </GuideStep>

      <GuideStep id="get-test-xlm" n={5} icon={Droplets} title="Get free test XLM" visual={<FriendbotMock />}>
        <p>
          A brand-new wallet is empty. Lumenbay will say <Quote>This account isn&apos;t on the network yet. Fund it to start.</Quote>{" "}
          That&apos;s expected.
        </p>
        <Actions
          items={[
            <>Open your <Link href="/dashboard/wallet" className={link}>Wallet page</Link>.</>,
            <>Tap <Ui>Get free test XLM</Ui>.</>,
            <>Wait a few seconds. Your balance becomes <strong>10,000 XLM</strong>. Tap the refresh arrow if it doesn&apos;t update.</>,
          ]}
        />
        <p>
          The free money comes from <strong>Friendbot</strong>, a helper run by Stellar that hands out test XLM. It
          usually fills each new wallet account once, and 10,000 is plenty for lots of test orders.
        </p>
        <Callout kind="safe">
          That&apos;s the setup done. From here, everything is free and nothing is real.
        </Callout>
      </GuideStep>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function Selling() {
  return (
    <GuideSection
      id="selling"
      index="03"
      eyebrow="For sellers"
      title="Sell something"
      description="List an item, wait for an order, ship it, get paid. The money arrives in your wallet automatically."
    >
      <GuideStep id="payout-wallet" n="S1" icon={Wallet} title="Set your payout wallet" visual={<PayoutMock />}>
        <p>
          Your <strong>payout wallet</strong> is where your sales money lands. When a buyer confirms delivery, the escrow
          sends the money straight there. Lumenbay never holds it in between, so it has to know where to send it.
        </p>
        <Actions
          items={[
            <>Connect the wallet you want to be paid in (see <a href="#connect-wallet" className={link}>step 4</a>).</>,
            <>On the <Link href="/dashboard/wallet" className={link}>Wallet page</Link>, find <Quote>Set your payout wallet</Quote>.</>,
            <>Tap <Ui>Use G… for payouts</Ui>. You&apos;ll see <Quote>Your sales are paid to this wallet.</Quote></>,
          ]}
        />
        <Callout kind="warn" title="Why it matters">
          Without a payout wallet, <strong>you can&apos;t publish a listing</strong>, and buyers see{" "}
          <Quote>This seller hasn&apos;t connected a payout wallet yet</Quote> and can&apos;t pay you. Each wallet can be the
          payout wallet of only one Lumenbay account.
        </Callout>
      </GuideStep>

      <GuideStep id="list-item" n="S2" icon={PackagePlus} title="List an item" visual={<ListingMock />}>
        <Actions
          items={[
            <>Open the <Link href="/dashboard/selling" className={link}>Seller hub</Link> and tap <Ui>List an item</Ui>, or use the <Ui>Sell an item</Ui> button in the top bar (the <Ui>+</Ui> button on a phone).</>,
            <>Give it a name, pick a category and write a short description (at least 30 characters: condition, age, what&apos;s included).</>,
            <>Add at least one photo.</>,
            <>Set a price in US dollars. Lumenbay shows buyers the matching amount in XLM.</>,
            <>Tap <Ui>Publish listing</Ui>. You land on your item&apos;s page, live in the marketplace.</>,
          ]}
        />
        <Callout kind="tip">On testnet it&apos;s fine to list something pretend, like &ldquo;Test mug&rdquo;. Keep the price small so test orders are quick.</Callout>
      </GuideStep>

      <GuideStep id="seller-hub" n="S3" icon={Store} title="Watch for orders in the Seller hub" visual={<SellerHubMock />}>
        <p>
          When someone buys, the order appears in your <Link href="/dashboard/selling" className={link}>Seller hub</Link>.
          To get there, use the <Ui>Buying</Ui> / <Ui>Selling</Ui> switch in the top bar (on a large screen), or open your
          profile menu and pick <Ui>Seller Hub</Ui>.
        </p>
        <p>
          New orders show under <strong>Needs you</strong> marked <Quote>Ready to ship</Quote>. The buyer&apos;s money is
          already locked by then, so it&apos;s safe to send the item.
        </p>
        <Callout kind="info">
          Only ship once an order says <strong>Ready to ship</strong> or <strong>Funds locked</strong>. If it says
          &ldquo;Awaiting payment&rdquo;, the buyer hasn&apos;t locked the money yet.
        </Callout>
      </GuideStep>

      <GuideStep id="mark-shipped" n="S4" icon={Truck} title="Mark it as shipped" visual={<ShipMock />}>
        <Actions
          items={[
            <>Open the order (tap <Ui>Ship it</Ui>).</>,
            <>In the <Quote>Ready to ship</Quote> box, add a note if you like: the courier and tracking number, or how you&apos;re delivering it.</>,
            <>Tap <Ui>Mark as shipped</Ui>. No wallet prompt: this just tells the buyer it&apos;s on its way.</>,
          ]}
        />
        <p>The buyer now sees <Quote>On its way · confirm on arrival</Quote>, along with your note.</p>
      </GuideStep>

      <GuideStep id="get-paid" n="S5" icon={CircleDollarSign} title="Get paid when the buyer confirms">
        <p>
          When the buyer taps <Ui>I received it</Ui>, the escrow pays you right away: the price minus the {FEE} fee, straight
          into your payout wallet. The order moves to <strong>Paid out</strong>, and your Wallet page balance goes up.
        </p>
        <p>
          You can&apos;t release the money yourself. That&apos;s the point of escrow: the buyer decides when the item has
          really arrived. If they open a dispute instead, see <a href="#disputes" className={link}>what happens in a dispute</a>.
        </p>
      </GuideStep>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function Buying() {
  return (
    <GuideSection
      id="buying"
      index="04"
      eyebrow="For buyers"
      title="Buy something"
      description="Your money waits in escrow until you say the item arrived. Two quick approvals in Freighter and you're done."
    >
      <GuideStep id="buy-with-escrow" n="B1" icon={Search} title="Find an item and choose “Buy with escrow”">
        <p>
          Browse the <Link href="/marketplace" className={link}>marketplace</Link> or search for something. On the item&apos;s
          page, tap <Ui>Buy with escrow</Ui>. A checkout window opens.
        </p>
        <p>
          The window checks a few things first. If something&apos;s missing, it tells you what and how to fix it: install
          Freighter, connect your wallet, switch to Testnet, or top up your balance.
        </p>
        <Callout kind="info" title="How much you need">
          About <strong>the price plus 2 XLM</strong>. The extra stays in your wallet to cover Stellar&apos;s small account
          reserve and fees. <a href="#fees" className={link}>More on fees</a>.
        </Callout>
      </GuideStep>

      <GuideStep id="approve-prompts" n="B2" icon={KeyRound} title="Approve 2 wallet prompts" visual={<CheckoutMock />}>
        <p>Check the summary, then tap <Ui>Pay … XLM into escrow</Ui>. Freighter asks you twice:</p>
        <Actions
          items={[
            <><strong>Create the escrow.</strong> This writes down the deal on Stellar. No money moves yet.</>,
            <><strong>Lock your payment.</strong> This moves your XLM into the escrow, where it stays until you confirm delivery.</>,
          ]}
        />
        <p>Each time, Freighter shows the details. Click <Ui>Approve</Ui> (or <Ui>Confirm</Ui>, depending on your version).</p>
        <Callout kind="warn" title="Keep the window open">
          While a step says <Quote>Approve in your wallet…</Quote>, don&apos;t close the checkout. If the Freighter window
          doesn&apos;t appear, click the Freighter icon in your toolbar.
        </Callout>
      </GuideStep>

      <GuideStep id="order-saved" n="B3" icon={ShieldCheck} title="Your order is saved automatically">
        <p>
          After the second approval, Lumenbay checks the payment on Stellar and saves the order to your account. It tells the
          seller too. You don&apos;t need to sign anything for this step.
        </p>
        <p>The button changes to <Quote>Order placed · View order</Quote>. Tap it to see your order.</p>
        <Callout kind="safe" title="If saving fails">
          You&apos;ll see <Quote>Your payment is locked and safe, but we couldn&apos;t save the order yet</Quote>. Your money is
          fine. Tap <Ui>Try saving again</Ui>. More in <a href="#faq-not-saved" className={link}>troubleshooting</a>.
        </Callout>
      </GuideStep>

      <GuideStep id="track-order" n="B4" icon={ShoppingBag} title="Track it in My purchases" visual={<PurchasesMock />}>
        <p>
          Open <Link href="/dashboard/buying" className={link}>My purchases</Link> (the <Ui>Buying</Ui> side of the switch, or
          <Ui>My Purchases</Ui> in your profile menu). Each order shows where it is:
        </p>
        <ul className="flex flex-col gap-1.5 pl-1">
          {[
            ["Paid · awaiting shipment", "your money is locked; the seller is getting it ready."],
            ["On its way · confirm on arrival", "the seller marked it shipped."],
            ["Completed", "you confirmed, and the seller was paid."],
          ].map(([chip, text]) => (
            <li key={chip} className="flex flex-wrap items-baseline gap-x-2">
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-ink">{chip}</span>
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </GuideStep>

      <GuideStep id="confirm-or-dispute" n="B5" icon={PackageCheck} title="Confirm delivery, or open a dispute" visual={<ConfirmMock />}>
        <p>Open the order once the item arrives (or you&apos;re done testing). You have two choices:</p>
        <Actions
          items={[
            <><Ui>I received it: release payment to seller</Ui>. Approve in Freighter, and the seller is paid. This can&apos;t be undone, so only tap it once you&apos;re happy.</>,
            <><Ui>There&apos;s a problem: open a dispute</Ui>. Pick a reason, write what went wrong, tap <Ui>Submit dispute</Ui> and approve in Freighter.</>,
          ]}
        />
        <Callout kind="info">
          Use the same Freighter account you paid with. Only that wallet can release the payment or open a dispute.
        </Callout>
      </GuideStep>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function BothSides() {
  return (
    <GuideSection
      id="both-sides"
      index="05"
      eyebrow="Testing on your own"
      title="Test both sides"
      description="Want to play buyer and seller yourself? You'll need two of everything, because you can't buy your own listing."
    >
      <TwoAccountsDiagram />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-display text-base font-bold text-ink"><Users className="h-4 w-4 text-accent" aria-hidden /> Two Lumenbay logins</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            For example, one with your email and one with Google or GitHub. Or use a second email address.
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-display text-base font-bold text-ink"><Wallet className="h-4 w-4 text-accent" aria-hidden /> Two Freighter accounts</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Freighter can hold several accounts. Click the account name at the top of Freighter and add a new one. Get free
            test XLM for each.
          </p>
        </div>
      </div>
      <GuideStep n="✓" icon={Users} title="A simple way to do it">
        <Actions
          items={[
            <>Sign in as <strong>login A</strong>, connect <strong>Freighter account 1</strong>, set it as your payout wallet, and list an item.</>,
            <>Sign out. In Freighter, switch to <strong>account 2</strong>.</>,
            <>Sign in as <strong>login B</strong>, connect wallet (approve account 2), get test XLM, and buy login A&apos;s item.</>,
            <>Switch back to login A and account 1 to mark it shipped. Then back to B and account 2 to confirm delivery.</>,
          ]}
        />
        <Callout kind="tip" title="Even easier">
          Use two browser profiles (or two different browsers), each with its own Freighter. Then you can keep the buyer and
          seller open side by side.
        </Callout>
        <Callout kind="info" title="If you mix them up">
          Lumenbay says <Quote>This is your own listing. Switch to a different wallet account to test buying it.</Quote> or{" "}
          <Quote>You can&apos;t buy your own listing.</Quote> Switch both the Lumenbay login and the Freighter account.
        </Callout>
      </GuideStep>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function Disputes() {
  return (
    <GuideSection
      id="disputes"
      index="06"
      eyebrow="Disputes"
      title="If something goes wrong"
      description="Item never came? Arrived broken? Wrong thing in the box? The buyer opens a dispute, and the money waits."
    >
      <DisputeFlow />
      <div className="grid gap-3 sm:grid-cols-2">
        <Callout kind="safe" title="For buyers">
          Opening a dispute freezes the money. The seller can&apos;t get it while it&apos;s being looked at. Only a short
          fingerprint of your note is stored on Stellar, not the words themselves.
        </Callout>
        <Callout kind="info" title="For sellers">
          You&apos;ll see the order under <strong>Needs you</strong> marked <Quote>In dispute</Quote>. The payment stays locked
          until it&apos;s resolved. Keep your shipping details handy.
        </Callout>
      </div>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function Fees() {
  return (
    <GuideSection
      id="fees"
      index="07"
      eyebrow="Money"
      title="Fees, in plain numbers"
      description="Buyers pay exactly the price. Sellers pay a small fee when they're paid. Stellar's own fees are tiny."
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <FeeReceipt price={100} feeBps={STELLAR.feeBps} />
        <div className="flex flex-col gap-3">
          {[
            { icon: Store, t: `${FEE} Lumenbay fee, paid by the seller`, d: "It's taken out when the payment is released. The buyer never pays it." },
            { icon: Hash, t: "Network fees under 0.01 XLM", d: "Stellar charges a tiny amount for each step you approve. Usually a tiny fraction of a cent's worth." },
            { icon: Lock, t: "Why you need about 2 XLM extra", d: "Every Stellar account must keep a small minimum balance, called the reserve. It can't be spent, so Lumenbay asks for a little extra on top of the price." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{t}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

function Troubleshooting() {
  return (
    <GuideSection
      id="troubleshooting"
      index="08"
      eyebrow="Troubleshooting"
      title="Something not working?"
      description="These are the messages you might see, word for word, and what to do about each."
    >
      <div className="flex flex-col gap-3">
        <Faq icon={Globe} question="“Your wallet is on the wrong network”">
          <p>Freighter is looking at Mainnet (real money) instead of Testnet.</p>
          <Actions
            items={[
              <>Open Freighter → <Ui>Settings</Ui> → <Ui>Network</Ui> → <Ui>Testnet</Ui>.</>,
              <>Back in Lumenbay, tap <Ui>I&apos;ve switched</Ui> in the checkout, or refresh the Wallet page.</>,
            ]}
          />
        </Faq>

        <Faq icon={XCircle} question="“You declined the request in Freighter”">
          <p>You clicked Reject (or closed the Freighter window). Nothing happened and no money moved for that step.</p>
          <p>
            Just try again. If the first approval worked but you declined the second, the button now says{" "}
            <Ui>Retry locking payment</Ui>. If you closed the checkout, open the order and tap{" "}
            <Ui>Finish payment: lock … XLM</Ui>. Your Wallet page also reminds you: <Quote>You have 1 unfinished payment</Quote>.
          </p>
        </Faq>

        <Faq icon={Coins} question="“You need about … XLM” or “Your wallet doesn't have enough XLM”">
          <p>
            You need the price plus about 2 XLM for Stellar&apos;s reserve and fees. In the checkout, tap{" "}
            <Ui>Get 10,000 free test XLM</Ui>, or use <Ui>Get free test XLM</Ui> on the{" "}
            <Link href="/dashboard/wallet" className={link}>Wallet page</Link>.
          </p>
          <p>
            If Friendbot says <Quote>Friendbot couldn&apos;t fund this account. Try again in a minute.</Quote>, wait a little.
            If an account was already filled once, make a new Freighter account and fund that instead.
          </p>
        </Faq>

        <Faq icon={Store} question="“This seller hasn't connected a payout wallet yet”">
          <p>The seller hasn&apos;t told Lumenbay where to send their money, so nobody can pay them yet. There&apos;s nothing to fix on your side.</p>
          <p>
            If <strong>you</strong> are the seller, open the <Link href="/dashboard/wallet" className={link}>Wallet page</Link>,
            connect your wallet and tap <Ui>Use G… for payouts</Ui>. See <a href="#payout-wallet" className={link}>setting your payout wallet</a>.
          </p>
        </Faq>

        <Faq icon={Users} question="“This is your own listing” or “You can't buy your own listing”">
          <p>The connected wallet, or the Lumenbay login, belongs to the seller. You can&apos;t buy from yourself.</p>
          <p>To test buying, use a second Lumenbay login and a second Freighter account. <a href="#both-sides" className={link}>Here&apos;s how</a>.</p>
        </Faq>

        <div id="faq-not-saved" className="scroll-mt-28">
          <Faq icon={ShieldCheck} question="“Your payment is locked and safe, but we couldn't save the order yet”">
            <p>
              Your money made it into escrow. Only the last step, saving the order to your account, didn&apos;t finish (often a
              blip in the connection).
            </p>
            <Actions
              items={[
                <>Tap <Ui>Try saving again</Ui> in the checkout.</>,
                <>Closed it already? Go to <Link href="/dashboard/buying" className={link}>My purchases</Link>. A yellow box says a payment isn&apos;t saved yet. Open it and tap <Ui>Save this order to my account</Ui>.</>,
              ]}
            />
            <p>Until it&apos;s saved, the seller can&apos;t see the order, but your money is still locked and safe.</p>
          </Faq>
        </div>

        <Faq icon={Wallet} question="“You paid for this order from the wallet ending …”">
          <p>
            You&apos;re connected with a different Freighter account from the one that paid. Only the paying wallet can release
            the money or open a dispute.
          </p>
          <p>
            In Freighter, switch to the account whose address ends with those characters, then reconnect in Lumenbay. If the
            page says <Quote>The connected wallet isn&apos;t the buyer or the seller in this order</Quote>, it&apos;s the same fix.
          </p>
        </Faq>

        <Faq icon={Wallet} question="“This isn't your payout wallet” or “already the payout wallet of another Lumenbay account”">
          <p>
            The first means you&apos;re connected with a different Freighter account than the one you get paid to. Either switch
            accounts in Freighter, or tap <Ui>Make … my payout wallet instead</Ui> if you really want to change it.
          </p>
          <p>The second means another Lumenbay login already uses that wallet for payouts. Give each login its own Freighter account.</p>
        </Faq>

        <Faq icon={Puzzle} question="“You need the Freighter wallet extension” but I installed it">
          <p>
            Refresh the page after installing, then tap <Ui>I&apos;ve installed it</Ui>. Make sure Freighter is unlocked (open it
            and type your password), and that you&apos;re on a computer: the browser extension doesn&apos;t run in phone browsers.
          </p>
        </Faq>

        <Faq icon={WifiOff} question="Other messages from the escrow">
          <ul className="flex flex-col gap-2">
            {[
              ["Escrow payments are paused right now. Try again later.", "Lumenbay paused payments for a moment. Try again a bit later."],
              ["An identical escrow already exists. Refresh and try again.", "Refresh the page and start checkout again."],
              ["This escrow is already funded.", "The money is already locked. Open the order from My purchases."],
              ["The escrow isn't in the right state for that action.", "Someone already acted on it. Tap “Refresh from chain” on the order."],
              ["Couldn't reach the Stellar network. Try again in a moment.", "Stellar's test network is busy or down. Wait a minute."],
            ].map(([msg, fix]) => (
              <li key={msg} className="rounded-xl border border-line bg-surface-2 p-3">
                <p className="font-medium text-ink">&ldquo;{msg}&rdquo;</p>
                <p className="mt-0.5">{fix}</p>
              </li>
            ))}
          </ul>
        </Faq>

        <Faq icon={ExternalLink} question="How do I see a transaction on stellar.expert?">
          <p>
            <strong>stellar.expert</strong> is a public website that shows everything that happens on Stellar. It&apos;s a good
            way to double-check where your money is.
          </p>
          <Actions
            items={[
              <>In the checkout, each finished step shows a short code like <span className="font-mono text-ink">3f9a1c2b4d…b27e01</span>. Tap it.</>,
              <>On an order page, the codes under <strong>Payment activity</strong> work the same way. The buyer, seller and contract addresses are links too.</>,
              <>On the Wallet page, <Ui>Full history on explorer</Ui> shows everything your wallet has done.</>,
            ]}
          />
          <p>
            You can also paste a code into the search box on{" "}
            <a href={EXPLORER} {...ext} className={link}>stellar.expert/explorer/testnet</a>. Check the page says{" "}
            <strong>Testnet</strong> at the top, not Public.
          </p>
        </Faq>
      </div>
    </GuideSection>
  );
}

// ---------------------------------------------------------------------------

const GLOSSARY: { term: string; icon: typeof Lock; def: string }[] = [
  { term: "Escrow", icon: Lock, def: "A locked box for money. The buyer puts the payment in; it only comes out when the buyer confirms delivery, or when an admin settles a dispute." },
  { term: "Smart contract", icon: BookOpen, def: "A small program that lives on Stellar and follows its rules exactly. Lumenbay's escrow is one. Nobody, including Lumenbay, can bend its rules." },
  { term: "Wallet", icon: Wallet, def: "The app that holds your money and asks before anything is paid. On Lumenbay that's Freighter." },
  { term: "Wallet address", icon: Hash, def: "Your account's public number on Stellar, 56 characters starting with G. Safe to share: people need it to pay you." },
  { term: "Recovery phrase", icon: KeyRound, def: "The 12 secret words that can restore your wallet. Never share them. Whoever has them owns the wallet." },
  { term: "Payout wallet", icon: CircleDollarSign, def: "The wallet your sales money is sent to. You choose it on the Wallet page." },
  { term: "XLM", icon: Coins, def: "Stellar's own currency, also called lumens. On testnet it's free and has no value." },
  { term: "Stroops", icon: Coins, def: "The tiniest slice of XLM, like cents to a dollar but much smaller. 1 XLM is 10,000,000 stroops." },
  { term: "Testnet", icon: FlaskConical, def: "Stellar's practice network with pretend money. Mainnet is the real one." },
  { term: "Friendbot", icon: Droplets, def: "A helper run by Stellar that gives out free test XLM, so you can try things." },
  { term: "Transaction hash", icon: Hash, def: "A long code that acts like a receipt number for one action on Stellar. Paste it into stellar.expert to see exactly what happened." },
  { term: "Account reserve", icon: Lock, def: "A small amount every Stellar account must keep and can't spend. It's why you need a little more than the price." },
  { term: "Dispute", icon: Gavel, def: "The buyer's way of saying “something's wrong”. The money stays locked until a Lumenbay admin decides." },
];

function Glossary() {
  return (
    <GuideSection
      id="glossary"
      index="09"
      eyebrow="Words"
      title="Glossary, in plain words"
      description="Every unusual word in this guide, explained without jargon."
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {GLOSSARY.map(({ term, icon: Icon, def }) => (
          <div key={term} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="font-display text-[15px] font-bold text-ink">{term}</dt>
              <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{def}</dd>
            </div>
          </div>
        ))}
      </dl>
    </GuideSection>
  );
}

function Outro() {
  return (
    <section className="lb-vault lb-grain relative overflow-hidden rounded-[28px] p-6 sm:p-10">
      <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
      <div aria-hidden className="lb-dots absolute inset-0 text-white/[0.05]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB4A2]">You&apos;re ready</p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
            Go make your first <span className="lb-ember-text">test trade</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
            Still stuck? The <Link href="/help" className="font-semibold text-[#FFB4A2] hover:text-white">Help page</Link> has
            more answers.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 hover:brightness-110"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden /> Browse items
          </Link>
          <Link
            href="/dashboard/selling/new"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/90 hover:bg-white/10"
          >
            <PackagePlus className="h-4 w-4" aria-hidden /> List an item <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
      <p className="relative mt-6 flex items-center gap-2 text-xs text-white/45">
        <HelpCircle className="h-3.5 w-3.5" aria-hidden /> Lumenbay never asks for your recovery phrase, and never holds your money.
      </p>
    </section>
  );
}
