import { redirect } from "next/navigation";

/** Old address. Purchases moved to the Buying dashboard; sales live in the Seller hub. */
export default function OrdersRedirect() {
  redirect("/dashboard/buying");
}
