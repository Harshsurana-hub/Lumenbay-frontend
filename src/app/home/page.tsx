import HomeView from "@/components/home/HomeView";
import CategoryView from "@/components/home/CategoryView";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/products";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();
  const products = await getProducts(supabase);

  // The shop navigation links categories here by name.
  const selected = typeof category === "string" ? category.trim() : "";
  if (selected) return <CategoryView products={products} category={selected} />;

  return <HomeView products={products} />;
}
