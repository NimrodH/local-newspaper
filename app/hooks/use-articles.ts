import { useState, useEffect, useCallback } from "react";
import { supabase, type Article, type Issue } from "~/lib/supabase";

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("approved_for_display", true)
      .order("issue_number", { ascending: false });
    if (error) {
      setError(error.message);
      return [];
    }
    return (data as Issue[]) ?? [];
  }, []);

  const fetchArticles = useCallback(async (issueNumber: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("issue_number", issueNumber)
      .order("order_in_issue", { ascending: true });
    if (error) {
      setError(error.message);
      setArticles([]);
    } else {
      setArticles((data as Article[]) ?? []);
    }
    setLoading(false);
  }, []);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    const issuesList = await fetchIssues();
    setIssues(issuesList);
    if (issuesList.length > 0) {
      const latest = issuesList[0];
      setCurrentIssue(latest);
      await fetchArticles(latest.issue_number);
    } else {
      setLoading(false);
    }
  }, [fetchIssues, fetchArticles]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const selectIssue = useCallback(
    async (issue: Issue) => {
      setCurrentIssue(issue);
      await fetchArticles(issue.issue_number);
    },
    [fetchArticles]
  );

  return { articles, issues, currentIssue, loading, error, selectIssue, loadLatest };
}
