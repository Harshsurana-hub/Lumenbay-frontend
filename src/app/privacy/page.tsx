import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Lumenbay collects, why, and how you stay in control of it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="21 November 2026">
      <section>
        <p>
          Lumenbay is a peer-to-peer marketplace where payments are held in a Stellar smart contract
          until the buyer confirms delivery. This page explains what we collect, why, and the choices
          you have.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your email address, the name you give us, and whether you
            signed up as a buyer or seller. If you sign in with Google or GitHub, we receive your name,
            email address and profile picture from that provider — nothing else.
          </li>
          <li>
            <strong>Listings and orders:</strong> the items you list, the orders you place, and the
            messages and reviews attached to them.
          </li>
          <li>
            <strong>Wallet address:</strong> the public Stellar address you connect. We never see or
            store your private keys; they stay in your wallet.
          </li>
          <li>
            <strong>Basic technical data:</strong> standard server logs and preferences stored in your
            browser, such as your theme and wishlist.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To run your account and sign you in.</li>
          <li>To show your listings and process orders, escrow, refunds and disputes.</li>
          <li>To send emails you need, such as sign-up confirmation, password resets and order updates.</li>
          <li>To keep the marketplace safe and investigate misuse.</li>
        </ul>
        <p className="mt-2">We do not sell your personal data or use it for advertising.</p>
      </section>

      <section>
        <h2>Blockchain transactions</h2>
        <p>
          Escrow payments happen on the public Stellar network. Transaction details recorded on-chain,
          including wallet addresses and amounts, are public by design and cannot be deleted by us or
          anyone else.
        </p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          We use trusted providers to run the service: Supabase for accounts and data storage, Vercel
          for hosting, and Google or GitHub if you choose to sign in with them. They process data only
          to provide those services. Buyers and sellers in an order can see each other&apos;s display
          name and the details needed to complete it.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can update your profile at any time, and ask us to export or delete your account data by
          opening an issue at{" "}
          <a className="text-accent hover:text-accent-hover" href="https://github.com/Lumenbay">
            github.com/Lumenbay
          </a>
          . Deleting your account removes your off-chain data; on-chain records remain.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          Lumenbay is in early access on the Stellar testnet. We will update this policy as the product
          changes and note the date at the top of this page.
        </p>
      </section>
    </LegalPage>
  );
}
