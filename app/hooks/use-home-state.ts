import { useState, useCallback } from "react";
import type { Issue } from "~/lib/supabase";

export type HomeView = "articles" | "titles" | "search";

export function useHomeState() {
  const [view, setView] = useState<HomeView>("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviousIssuesOpen, setIsPreviousIssuesOpen] = useState(false);

  const handleLatestIssue = useCallback(() => {
    setView("articles");
    setIsPreviousIssuesOpen(false);
    setSearchQuery("");
  }, []);

  const handlePreviousIssues = useCallback(() => {
    setIsPreviousIssuesOpen((prev) => !prev);
  }, []);

  const handleTitles = useCallback(() => {
    setView("titles");
    setIsPreviousIssuesOpen(false);
  }, []);

  const handleSearch = useCallback(() => {
    setView("search");
    setIsPreviousIssuesOpen(false);
  }, []);

  return {
    view,
    searchQuery,
    setSearchQuery,
    isPreviousIssuesOpen,
    setIsPreviousIssuesOpen,
    handleLatestIssue,
    handlePreviousIssues,
    handleTitles,
    handleSearch,
  };
}
