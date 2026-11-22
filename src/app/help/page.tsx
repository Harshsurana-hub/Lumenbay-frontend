"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  FlaskConical,
  Search,
  HelpCircle,
  Shield,
  Wallet,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "What is Lumenbay?",
    answer:
      "Lumenbay is a decentralized peer-to-peer marketplace built on the Stellar Network. It uses Soroban Smart Contracts to provide secure escrow services, ensuring safe transactions between buyers and sellers without intermediaries.",
  },
  {
    id: "2",
    category: "Getting Started",
    question: "How do I connect my wallet?",
    answer:
      "Install the Freighter wallet browser extension, switch it to Testnet, then click the 'Connect wallet' button in the top bar (or on your Wallet page). Approve the request in Freighter. The Testnet guide at /help/testnet walks through every step.",
  },
  {
    id: "3",
    category: "Escrow",
    question: "How does the escrow system work?",
    answer:
      "When a buyer purchases an item, funds are locked in a Soroban smart contract. The seller ships the item and marks it shipped, optionally with a tracking note. Once the buyer confirms it arrived, the contract pays the seller. If there's a dispute, the escrow remains frozen pending resolution.",
  },
  {
    id: "4",
    category: "Escrow",
    question: "What happens if I don't confirm receipt?",
    answer:
      "Your payment stays locked in escrow until you confirm. Nothing is released automatically, so confirm as soon as the item arrives: the seller only gets paid when you do. If something is wrong, open a dispute instead and a Lumenbay admin will review it.",
  },
  {
    id: "5",
    category: "Escrow",
    question: "Can I open a dispute?",
    answer:
      "Yes, if you haven't received your item or there's an issue with the delivery, you can open a dispute before the deadline. This freezes the escrow and initiates an arbitration process.",
  },
  {
    id: "6",
    category: "Payments",
    question: "What cryptocurrencies are supported?",
    answer:
      "Currently, Lumenbay supports XLM (Stellar Lumens) as the primary payment method. We're working on adding support for other Stellar-based assets in the future.",
  },
  {
    id: "7",
    category: "Payments",
    question: "Are there any fees?",
    answer:
      "Lumenbay charges a 1% platform fee on completed orders, paid by the seller when the payment is released. Buyers pay exactly the listed price, plus Stellar network fees of under 0.01 XLM per step.",
  },
  {
    id: "8",
    category: "Selling",
    question: "How do I list an item for sale?",
    answer:
      "Navigate to the Dashboard, click 'Start Selling', and follow the multi-step form to add item details, pricing, and media. Once submitted, your listing will be visible to buyers on the marketplace.",
  },
  {
    id: "9",
    category: "Selling",
    question: "What types of items can I sell?",
    answer:
      "You can sell digital goods (software, licenses, NFTs), physical items (electronics, collectibles), and services (consulting, development work). All transactions are protected by our escrow system.",
  },
  {
    id: "10",
    category: "Security",
    question: "Is my wallet secure?",
    answer:
      "Your wallet keys never leave your device. Lumenbay uses Freighter Wallet, which stores your private keys locally. We never have access to your funds - all transactions are executed through smart contracts.",
  },
  {
    id: "11",
    category: "Security",
    question: "What if I lose access to my wallet?",
    answer:
      "Always backup your wallet's secret key or recovery phrase. If you lose access, Lumenbay cannot recover your funds. Store your backup securely offline.",
  },
];

const categories = [
  "All",
  "Getting Started",
  "Escrow",
  "Payments",
  "Selling",
  "Security",
];

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "Getting Started": HelpCircle,
  Escrow: Shield,
  Payments: Wallet,
  Selling: Package,
  Security: Shield,
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-surface-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-ink mb-3">
            Help & FAQ
          </h1>
          <p className="text-ink-faint text-base">
            Find answers to common questions about Lumenbay
          </p>
        </div>

        {/* Testnet guide */}
        <Link
          href="/help/testnet"
          className="lb-vault lb-grain group relative mb-8 flex flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white">
              <FlaskConical className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFB4A2]">New here? Start with this</p>
              <p className="font-display mt-1 text-xl font-bold text-white">Getting started on testnet</p>
              <p className="mt-1 text-sm text-white/65">
                Set up Freighter, get free test XLM, then buy and sell with escrow. Step by step, in plain English.
              </p>
            </div>
          </div>
          <span className="relative inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-white/20 sm:self-auto">
            Read the guide <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-line rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent text-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                selectedCategory === category
                  ? "bg-accent text-on-accent"
                  : "bg-surface-2 text-ink-faint hover:bg-surface-3 hover:text-ink",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="p-12 bg-surface border border-line rounded-2xl text-center">
              <p className="text-ink-faint">No FAQs match your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const Icon = categoryIcons[faq.category] || HelpCircle;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-line rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFAQ(openFAQ === faq.id ? null : faq.id)
                    }
                    className="w-full p-5 flex items-start gap-4 text-left hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                            {faq.category}
                          </span>
                          <h3 className="text-sm font-bold text-ink mt-0.5">
                            {faq.question}
                          </h3>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-ink-faint transition-transform shrink-0",
                            openFAQ === faq.id && "rotate-180",
                          )}
                        />
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pl-13">
                          <p className="text-sm text-ink-muted leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-10 p-8 bg-accent-soft border border-accent-line rounded-2xl text-center">
          <h2 className="text-xl font-black text-ink mb-2">Still need help?</h2>
          <p className="text-ink-faint text-sm mb-5">
            Can&apos;t find what you&apos;re looking for? Reach out to our
            support team.
          </p>
          <a
            href="mailto:support@marketx.com"
            className="inline-block px-5 py-2.5 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-sm font-bold transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
