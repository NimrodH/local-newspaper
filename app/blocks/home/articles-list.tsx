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
}

function getImageUrl(path: string): string {
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className={style.article}>
      <h2 className={style.articleTitle}>{article.title}</h2>
      <div className={style.articleContent}>
        {article.content.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className={style.paragraph}>
              {para}
            </p>
          ) : null
        )}
      </div>
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

export function ArticlesList({ className, articles, loading, error, searchQuery }: ArticlesListProps) {
  const filtered = searchQuery
    ? articles.filter((a) => {
        const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        return words.some((w) => (a.keywords ?? "").toLowerCase().includes(w));
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
      {!loading && filtered.map((article) => <ArticleCard key={article.id} article={article} />)}
    </section>
  );
}
