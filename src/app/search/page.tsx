import SearchResults from "@/components/marketplace/SearchResults";
import { createClient } from "@/lib/supabase/server";
import { searchProducts } from "@/lib/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const rawQuery =
    typeof resolvedParams.q === "string"
      ? resolvedParams.q
      : Array.isArray(resolvedParams.q)
        ? resolvedParams.q[0]
        : "";
  const query = rawQuery.trim();

  // Filtering happens in the database rather than over a fetched array, so
  // search does not depend on having downloaded the whole catalogue first.
  const supabase = await createClient();
  const products = await searchProducts(supabase, query);

  return (
    <div className="min-h-screen bg-bg">
      <SearchResults query={query} products={products} />
    </div>
  );
}
