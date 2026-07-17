import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

export type HomeView = "articles" | "titles" | "search";

export function useHomeState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const viewParam = searchParams.get("view");
  const initialView: HomeView =
    viewParam === "titles" || viewParam === "search" ? viewParam : "articles";

  const [view, setView] = useState<HomeView>(initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviousIssuesOpen, setIsPreviousIssuesOpen] = useState(
    viewParam === "previous"
  );

  // Sync state with search params changes (e.g. forward/back buttons or clicks)
  useEffect(() => {
    const currentView = searchParams.get("view");
    if (currentView === "titles" || currentView === "search") {
      setView(currentView);
      setIsPreviousIssuesOpen(false);
    } else if (currentView === "previous") {
      setView("articles");
      setIsPreviousIssuesOpen(true);
    } else {
      setView("articles");
      setIsPreviousIssuesOpen(false);
    }
  }, [searchParams]);

  const handleLatestIssue = useCallback(() => {
    setView("articles");
    setIsPreviousIssuesOpen(false);
    setSearchQuery("");
    setSearchParams((prev) => {
      prev.delete("view");
      return prev;
    });
  }, [setSearchParams]);

  const handlePreviousIssues = useCallback(() => {
    setIsPreviousIssuesOpen((prev) => {
      const next = !prev;
      setSearchParams((p) => {
        if (next) {
          p.set("view", "previous");
        } else {
          p.delete("view");
        }
        return p;
      });
      return next;
    });
  }, [setSearchParams]);

  const handleTitles = useCallback(() => {
    setView("titles");
    setIsPreviousIssuesOpen(false);
    setSearchParams((prev) => {
      prev.set("view", "titles");
      return prev;
    });
  }, [setSearchParams]);

  const handleSearch = useCallback(() => {
    setView("search");
    setIsPreviousIssuesOpen(false);
    setSearchParams((prev) => {
      prev.set("view", "search");
      return prev;
    });
  }, [setSearchParams]);

  const handleSetPreviousIssuesOpen = useCallback(
    (open: boolean) => {
      setIsPreviousIssuesOpen(open);
      setSearchParams((prev) => {
        if (open) {
          prev.set("view", "previous");
        } else {
          prev.delete("view");
        }
        return prev;
      });
    },
    [setSearchParams]
  );

  return {
    view,
    searchQuery,
    setSearchQuery,
    isPreviousIssuesOpen,
    setIsPreviousIssuesOpen: handleSetPreviousIssuesOpen,
    handleLatestIssue,
    handlePreviousIssues,
    handleTitles,
    handleSearch,
  };
}
