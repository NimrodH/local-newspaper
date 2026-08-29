import { useState } from "react";
import classnames from "classnames";
import { IconSend, IconCheck, IconX } from "@tabler/icons-react";
import style from "./publish-issue-button.module.css";

export interface PublishIssueButtonProps {
  className?: string;
  password?: string;
  issueNumber: number;
  onPublished: () => void;
}

export function PublishIssueButton({ className, password = "", issueNumber, onPublished }: PublishIssueButtonProps) {
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "none">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishedNumber, setPublishedNumber] = useState<number | null>(null);

  const handlePublish = async () => {
    setPublishing(true);
    setStatus("idle");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/publish-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, issueNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "שגיאה בפרסום הגיליון");
      }

      setPublishedNumber(data.issueNumber);
      setStatus("success");
      onPublished();
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "שגיאה בפרסום");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>פרסום גיליון</h3>
      <p className={style.hint}>לאחר הוספת כל הכתבות, לחצו כאן כדי לפרסם את הגיליון הנוכחי באתר.</p>
      <button
        type="button"
        className={classnames(style.btn, publishing && style.btnPublishing)}
        onClick={handlePublish}
        disabled={publishing}
      >
        {publishing ? (
          <>מפרסם…</>
        ) : (
          <>
            <IconSend size={18} style={{ marginLeft: 8 }} />
            פרסם גיליון
          </>
        )}
      </button>
      {status === "success" && (
        <p className={style.success}>
          <IconCheck size={16} style={{ marginLeft: 4 }} />
          גיליון {publishedNumber} פורסם בהצלחה!
        </p>
      )}
      {status === "none" && (
        <p className={style.warning}>
          אין גיליון טיוטה לפרסום.
        </p>
      )}
      {status === "error" && errorMsg && (
        <p className={style.error}>
          <IconX size={16} style={{ marginLeft: 4 }} />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
