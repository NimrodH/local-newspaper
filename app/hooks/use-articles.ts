import { useState, useEffect, useCallback } from "react";
import { supabase, type Article, type Issue } from "~/lib/supabase";

/**
 * Fetches published issues and their articles from Supabase.
 * @param enabled - Set to false to skip fetching (e.g. when preview loader data is used instead).
 */
export function useArticles(enabled = true) {
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
      console.error("[Supabase] fetchIssues error:", error.message);
      setError(`שגיאה בטעינת גיליונות: ${error.message}`);
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
      console.error("[Supabase] fetchArticles error:", error.message);
      setError(`שגיאה בטעינת כתבות: ${error.message}`);
      setArticles([]);
    } else {
      setArticles((data as Article[]) ?? []);
    }
    setLoading(false);
  }, []);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    if (enabled) loadLatest();
    else setLoading(false);
  }, [loadLatest, enabled]);

  const selectIssue = useCallback(
    async (issue: Issue) => {
      setCurrentIssue(issue);
      await fetchArticles(issue.issue_number);
    },
    [fetchArticles]
  );

  return { articles, issues, currentIssue, loading, error, selectIssue, loadLatest };
}
