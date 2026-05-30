import { useState } from "react";
import classnames from "classnames";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import style from "./titles-accordion.module.css";
import type { Article } from "~/lib/supabase";
import { supabase } from "~/lib/supabase";

export interface TitlesAccordionProps {
  className?: string;
  articles: Article[];
  loading: boolean;
}

function getImageUrl(path: string): string {
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

function AccordionItem({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={classnames(style.item, open && style.itemOpen)}>
      <button className={style.itemHeader} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={style.itemTitle}>{article.title}</span>
        <span className={style.chevron}>
          {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div className={style.itemBody}>
          <div className={style.content}>
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
        </div>
      )}
    </div>
  );
}

export function TitlesAccordion({ className, articles, loading }: TitlesAccordionProps) {
  return (
    <section className={classnames(style.root, className)}>
      <h2 className={style.heading}>כותרות כתבות</h2>
      {loading && <p className={style.state}>טוען…</p>}
      {!loading && articles.length === 0 && <p className={style.state}>אין כתבות להצגה.</p>}
      {!loading && articles.map((a) => <AccordionItem key={a.id} article={a} />)}
    </section>
  );
}
