import { Suspense } from "react";
import DisputesWorkspace from "@/components/admin/DisputesWorkspace";

/** The disputes queue. Access is checked by the admin layout on the server. */
export default function AdminDisputesPage() {
  return (
    <Suspense>
      <DisputesWorkspace />
    </Suspense>
  );
}
