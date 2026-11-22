import { Suspense } from "react";
import DisputesWorkspace from "@/components/admin/DisputesWorkspace";

/**
 * Deep link to one dispute: the queue with that dispute's drawer open. The
 * workspace reads the id from the path, so closing the drawer just swaps the
 * URL back to the list without a navigation.
 */
export default function AdminDisputeDeepLink() {
  return (
    <Suspense>
      <DisputesWorkspace />
    </Suspense>
  );
}
