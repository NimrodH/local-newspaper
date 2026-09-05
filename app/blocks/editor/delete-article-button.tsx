import { useState } from "react";
import classnames from "classnames";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import style from "./publish-issue-button.module.css";

export interface DeleteArticleButtonProps {
  className?: string;
  password?: string;
  articleId: number;
  onDeleted: () => void;
}

export function DeleteArticleButton({ className, password = "", articleId, onDeleted }: DeleteArticleButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm("אזהרה: מחיקת הכתבה היא פעולה בלתי הפיכה. האם להמשיך?");
    if (!confirmed) return;

    setDeleting(true);
    setStatus("idle");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/delete-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, articleId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "שגיאה במחיקת הכתבה");
      }
      setStatus("success");
      onDeleted();
    } catch (error: unknown) {
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "שגיאה במחיקת הכתבה");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={classnames(style.root, className)}>
      <button
        type="button"
        className={classnames(style.btn, style.deleteBtn, deleting && style.btnPublishing)}
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "מוחק…" : <><IconTrash size={18} style={{ marginLeft: 8 }} />מחק כתבה</>}
      </button>
      {status === "success" && <p className={style.success}><IconCheck size={16} style={{ marginLeft: 4 }} />הכתבה נמחקה בהצלחה.</p>}
      {status === "error" && errorMsg && <p className={style.error}><IconX size={16} style={{ marginLeft: 4 }} />{errorMsg}</p>}
    </div>
  );
}
