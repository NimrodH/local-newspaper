import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import styles from "./home.module.css";
import { createAdminClient, type Article, type Issue } from "~/lib/supabase";
import { useArticles } from "~/hooks/use-articles";
import { useHomeState } from "~/hooks/use-home-state";
import { ArticlesList } from "../blocks/home/articles-list";
import { PreviousIssuesMenu } from "../blocks/home/previous-issues-menu";
import { TitlesAccordion } from "../blocks/home/titles-accordion";
import { SearchFilter } from "../blocks/home/search-filter";

/**
 * Server-side loader. When ?preview=true, uses the service-role Supabase client
 * to bypass RLS and return draft issues + articles. The key never leaves the server.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPreview = url.searchParams.get("preview") === "true";

  if (!isPreview) {
    return { preview: false as const, issues: [] as Issue[], articles: [] as Article[], currentIssue: null as Issue | null };
  }

  const admin = createAdminClient();

  const { data: issuesData } = await admin
    .from("issues")
    .select("*")
    .order("issue_number", { ascending: false });

  const allIssues = (issuesData as Issue[]) ?? [];

  // Support switching issues in preview via ?issue=<number>
  const issueParam = url.searchParams.get("issue");
  const targetNumber = issueParam ? parseInt(issueParam, 10) : null;
  const currentIssue = targetNumber
    ? (allIssues.find((i) => i.issue_number === targetNumber) ?? allIssues[0] ?? null)
    : (allIssues[0] ?? null);

  let articles: Article[] = [];
  if (currentIssue) {
    const { data: articlesData } = await admin
      .from("articles")
      .select("*")
      .eq("issue_number", currentIssue.issue_number)
      .order("order_in_issue", { ascending: true });
    articles = (articlesData as Article[]) ?? [];
  }

  return {
    preview: true as const,
    issues: allIssues,
    articles,
    currentIssue,
  };
}

export default function Reader({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const isPreview = loaderData.preview;

  // Client-side hook — disabled in preview mode (server loader handles data instead)
  const hookData = useArticles(!isPreview);

  const articles = isPreview ? loaderData.articles : hookData.articles;
  const issues = isPreview ? loaderData.issues : hookData.issues;
  const currentIssue = isPreview ? loaderData.currentIssue : hookData.currentIssue;
  const loading = isPreview ? false : hookData.loading;
  const error = isPreview ? null : hookData.error;

  const {
    view,
    searchQuery,
    setSearchQuery,
    isPreviousIssuesOpen,
    setIsPreviousIssuesOpen,
    handleLatestIssue,
    handlePreviousIssues,
    handleTitles,
    handleSearch,
  } = useHomeState();

  const handleSelectIssue = (issue: Issue) => {
    if (isPreview) {
      navigate(`/?preview=true&issue=${issue.issue_number}`);
    } else {
      hookData.selectIssue(issue);
    }
  };

  const handleLoadLatest = () => {
    if (isPreview) {
      navigate("/?preview=true");
    } else {
      hookData.loadLatest();
    }
  };

  const handleLatestIssueFull = () => {
    handleLatestIssue();
    handleLoadLatest();
  };

  const handlePdfExport = () => {
    window.print();
  };

  return (
    <div className={styles.root}>
      {isPreview && (
        <div className={styles.previewBanner}>
          <span className={styles.previewBannerText}>&#128065;&#65039; &#1502;&#1510;&#1489; &#1514;&#1510;&#1493;&#1490;&#1492; &#1502;&#1511;&#1491;&#1497;&#1502;&#1488;&#1492; &#8212; &#1490;&#1497;&#1500;&#1497;&#1493;&#1503; &#1496;&#1497;&#1493;&#1496;&#1488;&#1492; (&#1500;&#1488; &#1508;&#1493;&#1512;&#1505;&#1501;)</span>
          <Link to="/editor" className={styles.previewBannerLink}>&#1495;&#1494;&#1512;&#1492; &#1500;&#1506;&#1512;&#1497;&#1499;&#1492;</Link>
        </div>
      )}

      <div className={styles.pageNavRow}>
        <button className={styles.pageNavBtn} onClick={handlePreviousIssues}>&#1490;&#1497;&#1500;&#1497;&#1493;&#1504;&#1493;&#1514; &#1511;&#1493;&#1491;&#1502;&#1497;&#1497;&#1501;</button>
        <button className={styles.pageNavBtn} onClick={handleLatestIssueFull}>&#1490;&#1497;&#1500;&#1497;&#1493;&#1503; &#1488;&#1495;&#1512;&#1493;&#1503;</button>
        <button className={styles.pageNavBtn} onClick={handleTitles}>&#1499;&#1493;&#1514;&#1512;&#1493;&#1514;</button>
        <button className={styles.pageNavBtn} onClick={handleSearch}>&#1495;&#1497;&#1508;&#1493;&#1513;</button>
        <button className={styles.pageNavBtnSecondary} onClick={handlePdfExport}>&#1497;&#1497;&#1510;&#1493;&#1488; PDF</button>
      </div>

      {currentIssue && (
        <div className={styles.issueLabel}>
          <span className={styles.issueLabelText}>&#1490;&#1497;&#1500;&#1497;&#1493;&#1503; {currentIssue.issue_number} &bull; {new Date(currentIssue.issue_date).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      )}

      <PreviousIssuesMenu
        isOpen={isPreviousIssuesOpen}
        issues={issues}
        currentIssue={currentIssue}
        onSelectIssue={handleSelectIssue}
        onClose={() => setIsPreviousIssuesOpen(false)}
      />

      {view === "articles" && (
        <ArticlesList articles={articles} loading={loading} error={error} />
      )}

      {view === "titles" && (
        <TitlesAccordion articles={articles} loading={loading} />
      )}

      {view === "search" && (
        <>
          <SearchFilter value={searchQuery} onChange={setSearchQuery} />
          <ArticlesList articles={articles} loading={loading} error={error} searchQuery={searchQuery} />
        </>
      )}
    </div>
  );
}
