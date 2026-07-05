import { Suspense } from "react";
import { Dashboard } from "@/components/Dashboard";

// useSearchParams (inside Dashboard) requires a Suspense boundary,
// otherwise the production build fails on this statically prerendered page.
export default function Home() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-500">Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}
