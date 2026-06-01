import { Link, useSearchParams } from "react-router";
import styles from "./home.module.css";
import { useArticles } from "~/hooks/use-articles";
import { useHomeState } from "~/hooks/use-home-state";
import { ArticlesList } from "../blocks/home/articles-list";
import { PreviousIssuesMenu } from "../blocks/home/previous-issues-menu";
import { TitlesAccordion } from "../blocks/home/titles-accordion";
import { SearchFilter } from "../blocks/home/search-filter";

export default function Reader() {
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "true";
  const { articles, issues, currentIssue, loading, error, selectIssue, loadLatest } = useArticles(preview);
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

  const handleLatestIssueFull = () => {
    handleLatestIssue();
    loadLatest();
  };

  const handlePdfExport = () => {
    window.print();
  };

  return (
    <div className={styles.root}>
      {preview && (
        <div className={styles.previewBanner}>
          <span className={styles.previewBannerText}>👁 מצב תצוגה מקדימה — גיליון טיוטה (לא פורסם)</span>
          <span className={styles.previewBannerDiag}>
            {loading ? "טוען…" : `גיליונות: ${issues.length} | כתבות: ${articles.length}`}
          </span>
          <Link to="/editor" className={styles.previewBannerLink}>חזרה לעריכה</Link>
        </div>
      )}
      {/* Override nav panel callbacks from header – inject via event bus or prop drilling via layout.
          Since NavigationPanel is in root.tsx header, we use a global event pattern here.
          We duplicate nav callbacks via a page-level sticky nav row instead. */}
      <div className={styles.pageNavRow}>
        <button className={styles.pageNavBtn} onClick={handlePreviousIssues}>גיליונות קודמים</button>
        <button className={styles.pageNavBtn} onClick={handleLatestIssueFull}>גיליון אחרון</button>
        <button className={styles.pageNavBtn} onClick={handleTitles}>כותרות</button>
        <button className={styles.pageNavBtn} onClick={handleSearch}>חיפוש</button>
        <button className={styles.pageNavBtnSecondary} onClick={handlePdfExport}>ייצוא PDF</button>
      </div>

      {currentIssue && (
        <div className={styles.issueLabel}>
          <span className={styles.issueLabelText}>גיליון {currentIssue.issue_number} &bull; {new Date(currentIssue.issue_date).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      )}

      <PreviousIssuesMenu
        isOpen={isPreviousIssuesOpen}
        issues={issues}
        currentIssue={currentIssue}
        onSelectIssue={selectIssue}
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
