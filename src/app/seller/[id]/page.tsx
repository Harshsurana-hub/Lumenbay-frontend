import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSellerActiveListings,
  getSellerProfile,
  type SellerListing,
  type SellerProfile,
} from "@/lib/listings";
import type { Product } from "@/lib/products";
import { usdToXlm } from "@/lib/money";
import SellerStorefront from "@/components/seller/SellerStorefront";

/**
 * A seller's shopfront: everything one seller has for sale, in one place.
 *
 * A server component, so the page arrives with its listings and a seller who
 * does not exist 404s before anything is sent.
 *
 * Nothing here is gated. A buyer deciding whether to send money to a stranger
 * should be able to look at everything that stranger sells, and how they have
 * been rated, without having to sign up first.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const seller = await getSellerProfile(supabase, id);

  if (!seller) return { title: "Seller not found" };

  return {
    title: seller.displayName,
    description:
      seller.bio ?? `Items for sale from ${seller.displayName} on Lumenbay.`,
  };
}

/**
 * Shapes a storefront listing for the shared product card.
 *
 * The seller query does not select `xlm_price`, so it is derived with
 * `usdToXlm` — the same function that wrote the stored value when the listing
 * was created, so the two agree.
 */
function toCardProduct(listing: SellerListing, seller: SellerProfile): Product {
  return {
    id: listing.id,
    name: listing.name,
    usdPrice: listing.usdPrice,
    originalUsdPrice: listing.originalUsdPrice ?? listing.usdPrice,
    xlmPrice: usdToXlm(listing.usdPrice),
    discountPercent: listing.discountPercent,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    category: listing.categoryName ?? "Uncategorized",
    seller: seller.displayName,
    sellerId: seller.id,
    description: listing.description ?? undefined,
    images: listing.imageUrl ? [listing.imageUrl] : [],
    sellerRating: seller.sellerRating,
    sellerSales: seller.sellerSales,
  };
}

export default async function SellerStorefrontPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [seller, listings] = await Promise.all([
    getSellerProfile(supabase, id),
    getSellerActiveListings(supabase, id),
  ]);

  if (!seller) notFound();

  return (
    <SellerStorefront
      seller={seller}
      listings={listings.map((listing) => toCardProduct(listing, seller))}
    />
  );
}
