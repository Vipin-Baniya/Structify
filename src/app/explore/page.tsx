import type { Metadata } from "next";
import PublicLayout from "@/components/layout/PublicLayout";
import ExploreView from "@/components/public/ExploreView";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse all projects, skills, achievements, certificates, and more.",
};

export default function ExplorePage() {
  return (
    <PublicLayout active="explore">
      <ExploreView />
    </PublicLayout>
  );
}
