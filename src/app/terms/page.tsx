import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for buying and selling on Lumenbay.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="21 November 2026">
      <section>
        <p>
          By using Lumenbay you agree to these terms. If you do not agree, please do not use the
          service.
        </p>
      </section>

      <section>
        <h2>Early access</h2>
        <p>
          Lumenbay is in early access and runs on the Stellar testnet. Testnet assets have no real
          value. Features may change, break or be reset while we build, and the service is provided
          &ldquo;as is&rdquo; without warranties.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>Give accurate information and keep your sign-in details secure.</li>
          <li>You are responsible for activity on your account and for your connected wallet.</li>
          <li>We may suspend accounts that break these terms or put other users at risk.</li>
        </ul>
      </section>

      <section>
        <h2>Buying and selling</h2>
        <ul>
          <li>Sellers must own what they list, describe it honestly, and ship what was ordered.</li>
          <li>
            Buyer payments are held in a Stellar escrow contract and released to the seller when the
            buyer confirms delivery, or as decided in a dispute.
          </li>
          <li>
            Lumenbay never holds your funds. Blockchain transactions are final once confirmed and cannot
            be reversed by us.
          </li>
          <li>Illegal, stolen, counterfeit or dangerous items are not allowed.</li>
        </ul>
      </section>

      <section>
        <h2>Fees</h2>
        <p>
          Any platform fee is shown before you pay. Stellar network fees are set by the network, not by
          us.
        </p>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          To the extent the law allows, Lumenbay is not liable for losses arising from transactions
          between users, wallet or network issues, or smart contract behaviour.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms and will change the date above when we do. Questions can be raised
          at{" "}
          <a className="text-accent hover:text-accent-hover" href="https://github.com/Lumenbay">
            github.com/Lumenbay
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
