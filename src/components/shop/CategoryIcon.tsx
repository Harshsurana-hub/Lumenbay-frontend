import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { categoryIcon } from "@/lib/shopDisplay";

/** The icon for a category, looked up by name from the shop's category list. */
export default function CategoryIcon({ category, ...props }: { category: string } & LucideProps) {
  // The lookup returns one of a fixed set of module-level icon components, so
  // nothing is created during render; createElement just picks which to draw.
  return createElement(categoryIcon(category), props);
}
