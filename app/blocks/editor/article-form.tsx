import classnames from "classnames";
import style from "./article-form.module.css";

export interface ArticleFormData {
  title: string;
  content: string;
  keywords: string;
  orderInIssue: number;
}

export interface ArticleFormProps {
  className?: string;
  data: ArticleFormData;
  onChange: (data: ArticleFormData) => void;
}

export function ArticleForm({ className, data, onChange }: ArticleFormProps) {
  const update = (field: keyof ArticleFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...data, [field]: field === "orderInIssue" ? Number(e.target.value) : e.target.value });
  };

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>פרטי הכתבה</h3>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-title">כותרת</label>
        <input
          id="article-title"
          type="text"
          className={style.input}
          value={data.title}
          onChange={update("title")}
          placeholder="כותרת הכתבה"
          dir="rtl"
        />
      </div>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-content">תוכן</label>
        <textarea
          id="article-content"
          className={classnames(style.input, style.textarea)}
          value={data.content}
          onChange={update("content")}
          placeholder="תוכן הכתבה..."
          rows={10}
          dir="rtl"
        />
      </div>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-keywords">מילות מפתח</label>
        <input
          id="article-keywords"
          type="text"
          className={style.input}
          value={data.keywords}
          onChange={update("keywords")}
          placeholder="מילות מפתח מופרדות ברווח"
          dir="rtl"
        />
      </div>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-order">מספר סדר</label>
        <input
          id="article-order"
          type="number"
          className={classnames(style.input, style.numberInput)}
          value={data.orderInIssue}
          onChange={update("orderInIssue")}
          min={1}
          dir="rtl"
        />
      </div>
    </div>
  );
}
