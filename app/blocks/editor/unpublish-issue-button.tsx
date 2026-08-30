import { useState } from "react";
import classnames from "classnames";
import { IconCheck, IconX } from "@tabler/icons-react";
import style from "./publish-issue-button.module.css";

export interface UnpublishIssueButtonProps {
  className?: string;
  password?: string;
  issueNumber: number;
  onUnpublished: () => void;
}

export function UnpublishIssueButton({ className, password = "", issueNumber, onUnpublished }: UnpublishIssueButtonProps) {
  const [unpublishing, setUnpublishing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUnpublish = async () => {
    setUnpublishing(true);
    setStatus("idle");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/unpublish-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, issueNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "שגיאה בביטול הפרסום");
      }
      setStatus("success");
      onUnpublished();
    } catch (error: unknown) {
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "שגיאה בביטול הפרסום");
    } finally {
      setUnpublishing(false);
    }
  };

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>ביטול פרסום</h3>
      <p className={style.hint}>הגיליון הנבחר יחזור למצב טיוטה ולא יוצג לקוראים.</p>
      <button
        type="button"
        className={classnames(style.btn, style.unpublishBtn, unpublishing && style.btnPublishing)}
        onClick={handleUnpublish}
        disabled={unpublishing}
      >
        {unpublishing ? "מבטל…" : "בטל פרסום"}
      </button>
      {status === "success" && <p className={style.success}><IconCheck size={16} style={{ marginLeft: 4 }} />הפרסום בוטל בהצלחה.</p>}
      {status === "error" && errorMsg && <p className={style.error}><IconX size={16} style={{ marginLeft: 4 }} />{errorMsg}</p>}
    </div>
  );
}