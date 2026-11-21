import type { Metadata } from "next";
import SellerHub from "@/components/selling/SellerHub";

export const metadata: Metadata = {
  title: "Seller hub",
  description: "Orders to ship, sales, earnings and listings on Lumenbay.",
};

export default function SellingDashboard() {
  return <SellerHub />;
}
