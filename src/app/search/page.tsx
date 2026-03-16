import type { Metadata } from "next";
import PublicLayout from "@/components/layout/PublicLayout";
import SearchView from "@/components/public/SearchView";

export const metadata: Metadata = {
  title: "Search",
  description: "Search projects, skills, achievements, and certificates.",
};

export default function SearchPage() {
  return <PublicLayout active="search"><SearchView /></PublicLayout>;
}
