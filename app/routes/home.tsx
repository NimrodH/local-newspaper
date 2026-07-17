import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { NavigationPanel } from "../blocks/__global/navigation-panel";
import styles from "./home.module.css";
import { createAdminClient, type Article, type Issue } from "~/lib/supabase";
import { useHomeState } from "~/hooks/use-home-state";
import { ArticlesList } from "../blocks/home/articles-list";
import { PreviousIssuesMenu } from "../blocks/home/previous-issues-menu";
import { TitlesAccordion } from "../blocks/home/titles-accordion";
import { SearchFilter } from "../blocks/home/search-filter";

/**
 * Server-side loader. Fetches issues and articles using the admin client (which bypasses RLS).
 * If preview=true, loads both draft and approved issues.
 * If preview=false, loads only approved issues.
 * If there are no approved issues but draft issues exist, passes hasDrafts=true so we can display a helpful message.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPreview = url.searchParams.get("preview") === "true";
  const admin = createAdminClient();

  // Query issues
  const { data: issuesData, error: issuesErr } = await admin
    .from("issues")
    .select("*")
    .order("issue_number", { ascending: false });

  if (issuesErr) {
    console.error("Loader fetchIssues error:", issuesErr.message);
  }

  const allIssues = (issuesData as Issue[]) ?? [];
  const approvedIssues = allIssues.filter((i) => i.approved_for_display);
  const draftIssues = allIssues.filter((i) => !i.approved_for_display);
  const hasDrafts = draftIssues.length > 0;

  // Filter issues based on preview mode
  const activeIssues = isPreview ? allIssues : approvedIssues;

  // Support switching issues via ?issue=<number>
  const issueParam = url.searchParams.get("issue");
  const targetNumber = issueParam ? parseInt(issueParam, 10) : null;
  const currentIssue = targetNumber
    ? (activeIssues.find((i) => i.issue_number === targetNumber) ?? activeIssues[0] ?? null)
    : (activeIssues[0] ?? null);

  let articles: Article[] = [];
  let errorMsg: string | null = null;

  if (currentIssue) {
    const { data: articlesData, error: articlesErr } = await admin
      .from("articles")
      .select("*")
      .eq("issue_number", currentIssue.issue_number)
      .order("order_in_issue", { ascending: true });

    if (articlesErr) {
      console.error("Loader fetchArticles error:", articlesErr.message);
      errorMsg = `שגיאה בטעינת כתבות: ${articlesErr.message}`;
    } else {
      articles = (articlesData as Article[]) ?? [];
    }
  }

  return {
    preview: isPreview,
    issues: activeIssues,
    articles,
    currentIssue,
    hasDrafts,
    error: errorMsg,
  };
}

export default function Reader({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const isPreview = loaderData.preview;

  const articles = loaderData.articles;
  const issues = loaderData.issues;
  const currentIssue = loaderData.currentIssue;
  const loading = false;
  const error = loaderData.error;
  const hasDrafts = loaderData.hasDrafts;

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
      navigate(`/?issue=${issue.issue_number}`);
    }
  };

  const handleLoadLatest = () => {
    if (isPreview) {
      navigate("/?preview=true");
    } else {
      navigate("/");
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
      <NavigationPanel
        onPreviousIssues={handlePreviousIssues}
        onLatestIssue={handleLatestIssueFull}
        onTitles={handleTitles}
        onSearch={handleSearch}
        onPdfExport={handlePdfExport}
      />

      {isPreview && (
        <div className={styles.previewBanner}>
          <span className={styles.previewBannerText}>👁 מצב תצוגה מקדימה — גיליון טיוטה (לא פורסם)</span>
          <Link to="/editor" className={styles.previewBannerLink}>חזרה לעריכה</Link>
        </div>
      )}

      {currentIssue && (
        <div className={styles.issueLabel}>
          <span className={styles.issueLabelText}>גיליון {currentIssue.issue_number} &bull; {new Date(currentIssue.issue_date).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      )}

      <PreviousIssuesMenu
        isOpen={isPreviousIssuesOpen}
        issues={issues}
        currentIssue={currentIssue}
        onSelectIssue={handleSelectIssue}
        onClose={() => setIsPreviousIssuesOpen(false)}
      />

      {!currentIssue ? (
        <div className={styles.emptyContainer}>
          {hasDrafts ? (
            <div className={styles.draftNotice}>
              <h2 className={styles.noticeTitle}>ברוכים הבאים לגיליון "מתחת לסלע"!</h2>
              <p className={styles.noticeText}>
                כרגע אין עדיין גיליונות מפורסמים באתר, אך קיים <strong>גיליון טיוטה</strong> הממתין לאישור ופרסום.
              </p>
              <div className={styles.noticeActions}>
                <Link to="/?preview=true" className={styles.noticeBtn}>
                  👁 צפייה בגיליון הטיוטה בתצוגה מקדימה
                </Link>
                <Link to="/editor" className={styles.noticeBtnSecondary}>
                  ✍ כניסה לממשק העריכה לפרסום הגיליון
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.emptyNotice}>
              <h2 className={styles.noticeTitle}>ברוכים הבאים לגיליון "מתחת לסלע"!</h2>
              <p className={styles.noticeText}>
                עדיין לא נוספו גיליונות או כתבות לאתר.
              </p>
              <div className={styles.noticeActions}>
                <Link to="/editor" className={styles.noticeBtn}>
                  ✍ מעבר לממשק העריכה ליצירת כתבה ראשונה
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
