import classnames from "classnames";
import style from "./articles-list.module.css";
import type { Article } from "~/lib/supabase";
import { supabase } from "~/lib/supabase";

export interface ArticlesListProps {
  className?: string;
  articles: Article[];
  loading: boolean;
  error: string | null;
  searchQuery?: string;
  /** Issue label per issue_number, shown on each card (used by search, which spans issues). */
  issueLabels?: Record<number, string>;
}

function getImageUrl(path: string): string {
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

// Older articles stored plain text; new ones store Tiptap-generated HTML.
const isHtmlContent = (content: string) => /<[a-z][\s\S]*>/i.test(content);

function ArticleContent({ content }: { content: string }) {
  if (isHtmlContent(content)) {
    return <div className={style.articleContent} dir="rtl" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return (
    <div className={style.articleContent}>
      {content.split("\n").map((para, i) =>
        para.trim() ? (
          <p key={i} className={style.paragraph}>
            {para}
          </p>
        ) : null
      )}
    </div>
  );
}

function ArticleCard({ article, issueLabel }: { article: Article; issueLabel?: string }) {
  return (
    <article className={classnames(style.article, article.is_comment && style.comment)}>
      {issueLabel && <p className={style.issueLabel}>{issueLabel}</p>}
      {/* Comment articles have no visible title. */}
      {!article.is_comment && <h2 className={style.articleTitle}>{article.title}</h2>}
      <ArticleContent content={article.content} />
      {article.related_images && article.related_images.length > 0 && (
        <div className={style.images}>
          {article.related_images.map((img, i) => (
            <img key={i} src={getImageUrl(img)} alt={`תמונה ${i + 1}`} className={style.image} />
          ))}
        </div>
      )}
    </article>
  );
}

export function ArticlesList({ className, articles, loading, error, searchQuery, issueLabels }: ArticlesListProps) {
  const filtered = searchQuery
    ? articles.filter((a) => {
        const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        const haystack = `${a.keywords ?? ""} ${a.title ?? ""}`.toLowerCase();
        return words.some((w) => haystack.includes(w));
      })
    : articles;

  return (
    <section className={classnames(style.root, className)}>
      {loading && (
        <div className={style.state}>
          <span className={style.loadingText}>טוען…</span>
        </div>
      )}
      {!loading && error && (
        <div className={style.state}>
          <p className={style.errorText}>{error}</p>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className={style.state}>
          <p className={style.emptyText}>אין כתבות להצגה.</p>
        </div>
      )}
      {!loading && filtered.map((article) => <ArticleCard key={article.id} article={article} issueLabel={issueLabels?.[article.issue_number]} />)}
    </section>
  );
}
