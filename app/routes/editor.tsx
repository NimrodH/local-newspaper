import { useEffect, useState } from "react";
import { Link, useNavigate, useRevalidator } from "react-router";
import type { Route } from "./+types/editor";
import styles from "./editor.module.css";
import { NavigationPanel } from "../blocks/__global/navigation-panel";
import { PasswordLogin } from "../blocks/editor/password-login";
import { ArticleForm, type ArticleFormData } from "../blocks/editor/article-form";
import { ImageUpload } from "../blocks/editor/image-upload";
import { ImageSelection } from "../blocks/editor/image-selection";
import { SaveButton } from "../blocks/editor/save-button";
import { PublishIssueButton } from "../blocks/editor/publish-issue-button";
import { UnpublishIssueButton } from "../blocks/editor/unpublish-issue-button";
import { DeleteIssueButton } from "../blocks/editor/delete-issue-button";
import { createAdminClient, type Article, type Issue } from "~/lib/supabase";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const requestedIssue = Number(url.searchParams.get("issue"));
  const admin = createAdminClient();
  const { data: issuesData, error: issuesError } = await admin
    .from("issues")
    .select("*")
    .order("order_number", { ascending: false })
    .order("issue_date", { ascending: false });

  const issues = (issuesData as Issue[]) ?? [];
  const selectedIssue =
    issues.find((issue) => issue.issue_number === requestedIssue) ?? issues[0] ?? null;
  let articles: Article[] = [];
  let error: string | null = issuesError?.message ?? null;

  if (selectedIssue) {
    const { data: articlesData, error: articlesError } = await admin
      .from("articles")
      .select("*")
      .eq("issue_number", selectedIssue.issue_number)
      .order("order_in_issue", { ascending: true });
    articles = (articlesData as Article[]) ?? [];
    error = articlesError?.message ?? error;
  }

  return { issues, selectedIssue, articles, error };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const correctPassword = process.env.EDITOR_PASSWORD;

  if (!correctPassword) {
    return { error: "סיסמא לא הוגדרה בשרת." };
  }

  if (password === correctPassword) {
    return { authenticated: true };
  }

  return { error: "סיסמא שגויה. אנא נסה שנית." };
}

const EMPTY_FORM: ArticleFormData = {
  title: "",
  content: "",
  keywords: "",
  orderInIssue: 1,
};

export default function Editor({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState<ArticleFormData>(EMPTY_FORM);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [createIssueError, setCreateIssueError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedArticleId(null);
    setFormData(EMPTY_FORM);
    setSelectedImages([]);
  }, [loaderData.selectedIssue?.id]);

  const handleSelectArticle = (articleId: string) => {
    const article = loaderData.articles.find((item) => item.id === Number(articleId));
    if (!article) {
      setSelectedArticleId(null);
      setFormData(EMPTY_FORM);
      setSelectedImages([]);
      return;
    }
    setSelectedArticleId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      keywords: article.keywords ?? "",
      orderInIssue: article.order_in_issue,
    });
    setSelectedImages(article.related_images ?? []);
  };

  const handleToggleImage = (path: string) => {
    setSelectedImages((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleImageUploaded = (path: string) => {
    setSelectedImages((prev) => [...prev, path]);
  };

  const handleSaved = (issueNumber?: number) => {
    if (issueNumber && issueNumber !== loaderData.selectedIssue?.issue_number) {
      navigate(`/editor?issue=${issueNumber}`);
      return;
    }
    setSelectedArticleId(null);
    setFormData(EMPTY_FORM);
    setSelectedImages([]);
    revalidate();
  };

  const handleCreateIssue = async () => {
    setCreatingIssue(true);
    setCreateIssueError(null);
    try {
      const response = await fetch("/api/create-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "שגיאה ביצירת הגיליון");
      }
      navigate(`/editor?issue=${data.issueNumber}`);
    } catch (error: unknown) {
      setCreateIssueError(error instanceof Error ? error.message : "שגיאה ביצירת הגיליון");
    } finally {
      setCreatingIssue(false);
    }
  };

  const navPanel = (
    <NavigationPanel
      activeTab="editor"
      onPreviousIssues={() => navigate("/?view=previous")}
      onLatestIssue={() => navigate("/")}
      onTitles={() => navigate("/?view=titles")}
      onSearch={() => navigate("/?view=search")}
    />
  );

  if (!password) {
    return (
      <div className={styles.root}>
        {navPanel}
        <div className={styles.container}>
          <PasswordLogin onAuthenticated={(pass) => setPassword(pass)} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {navPanel}
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTop}>
            <h1 className={styles.pageTitle}>עריכת כתבות</h1>
            <Link to="/?preview=true" className={styles.previewBtn}>
              👁 תצוגה מקדימה
            </Link>
          </div>
          <p className={styles.pageSubtitle}>הוסיפו כתבות חדשות לגיליון</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formCol}>
            <div className={styles.card}>
              <div className={styles.selectorHeader}>
                <div className={styles.selectorGroup}>
                  <label className={styles.selectorLabel} htmlFor="issue-select">גיליון</label>
                  <select
                    id="issue-select"
                    className={styles.selector}
                    value={loaderData.selectedIssue?.issue_number ?? ""}
                    onChange={(event) => navigate(`/editor?issue=${event.target.value}`)}
                    disabled={loaderData.issues.length === 0}
                  >
                    <option value="">בחרו גיליון</option>
                    {loaderData.issues.map((issue) => (
                      <option key={issue.id} value={issue.issue_number}>
                        גיליון {issue.order_number ?? issue.issue_number}{issue.approved_for_display ? "" : " (טיוטה)"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={styles.newIssueButton}
                  onClick={handleCreateIssue}
                  disabled={creatingIssue}
                >
                  {creatingIssue ? "יוצר…" : "גליון חדש"}
                </button>
              </div>
              {loaderData.selectedIssue && (
                <div className={styles.selectorGroup}>
                  <label className={styles.selectorLabel} htmlFor="article-select">כתבה לעריכה</label>
                  <select
                    id="article-select"
                    className={styles.selector}
                    value={selectedArticleId ?? ""}
                    onChange={(event) => handleSelectArticle(event.target.value)}
                  >
                    <option value="">כתבה חדשה בגיליון</option>
                    {loaderData.articles.map((article) => (
                      <option key={article.id} value={article.id}>
                        {article.order_in_issue}. {article.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {createIssueError && <p className={styles.selectorError}>{createIssueError}</p>}
              {loaderData.error && <p className={styles.selectorError}>שגיאה בטעינת הנתונים: {loaderData.error}</p>}
            </div>
            <div className={styles.card}>
              <ArticleForm data={formData} onChange={setFormData} />
            </div>
            <div className={styles.card}>
              <SaveButton
                password={password}
                articleId={selectedArticleId}
                formData={formData}
                selectedImages={selectedImages}
                onSaved={handleSaved}
              />
            </div>
            {loaderData.selectedIssue && !loaderData.selectedIssue.approved_for_display && (
              <>
                <div className={styles.card}>
                  <PublishIssueButton
                    password={password}
                    issueNumber={loaderData.selectedIssue.issue_number}
                    onPublished={revalidate}
                  />
                </div>
                <div className={styles.card}>
                  <DeleteIssueButton
                    password={password}
                    issueNumber={loaderData.selectedIssue.issue_number}
                    onDeleted={() => navigate("/editor")}
                  />
                </div>
              </>
            )}
            {loaderData.selectedIssue?.approved_for_display && (
              <div className={styles.card}>
                <UnpublishIssueButton
                  password={password}
                  issueNumber={loaderData.selectedIssue.issue_number}
                  onUnpublished={revalidate}
                />
              </div>
            )}
          </div>
          <div className={styles.mediaCol}>
            <div className={styles.card}>
              <ImageUpload password={password} onUploaded={handleImageUploaded} />
            </div>
            <div className={styles.card}>
              <ImageSelection password={password} selectedImages={selectedImages} onToggleImage={handleToggleImage} />
            </div>
            {selectedImages.length > 0 && (
              <div className={styles.selectedSummary}>
                <h4 className={styles.selectedTitle}>תמונות שנבחרו:</h4>
                <ul className={styles.selectedList}>
                  {selectedImages.map((p) => (
                    <li key={p} className={styles.selectedItem}>
                      <span>{p.split("/").pop()}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleToggleImage(p)}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
