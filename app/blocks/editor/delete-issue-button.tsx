import { useState } from "react";
import classnames from "classnames";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import style from "./publish-issue-button.module.css";

export interface DeleteIssueButtonProps {
  className?: string;
  password?: string;
  issueNumber: number;
  onDeleted: () => void;
}

export function DeleteIssueButton({ className, password = "", issueNumber, onDeleted }: DeleteIssueButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `אזהרה: מחיקת גיליון ${issueNumber} תמחק לצמיתות את הגיליון ואת כל הכתבות שבו. האם להמשיך?`
    );
    if (!confirmed) return;

    setDeleting(true);
    setStatus("idle");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/delete-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, issueNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "שגיאה במחיקת הגיליון");
      }
      setStatus("success");
      onDeleted();
    } catch (error: unknown) {
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "שגיאה במחיקת הגיליון");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>מחיקת גיליון</h3>
      <p className={style.hint}>פעולה בלתי הפיכה: הגיליון וכל הכתבות שבו יימחקו.</p>
      <button
        type="button"
        className={classnames(style.btn, style.deleteBtn, deleting && style.btnPublishing)}
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "מוחק…" : <><IconTrash size={18} style={{ marginLeft: 8 }} />מחק גיליון</>}
      </button>
      {status === "success" && <p className={style.success}><IconCheck size={16} style={{ marginLeft: 4 }} />הגיליון נמחק בהצלחה.</p>}
      {status === "error" && errorMsg && <p className={style.error}><IconX size={16} style={{ marginLeft: 4 }} />{errorMsg}</p>}
    </div>
  );
}