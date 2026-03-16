import type { Metadata } from "next";
import { Suspense } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import SearchView from "@/components/public/SearchView";

export const metadata: Metadata = {
  title: "Search",
  description: "Search projects, skills, achievements, and certificates.",
};

function SearchFallback() {
  return (
    <div className="flex justify-center items-center py-20 text-gray-400">
      Loading search...
    </div>
  );
}

export default function SearchPage() {
  return (
    <PublicLayout active="search">
      <Suspense fallback={<SearchFallback />}>
        <SearchView />
      </Suspense>
    </PublicLayout>
  );
}
