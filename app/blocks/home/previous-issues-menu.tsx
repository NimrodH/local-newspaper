import { useEffect, useRef } from "react";
import classnames from "classnames";
import style from "./previous-issues-menu.module.css";
import type { Issue } from "~/lib/supabase";

export interface PreviousIssuesMenuProps {
  className?: string;
  isOpen: boolean;
  issues: Issue[];
  currentIssue: Issue | null;
  onSelectIssue: (issue: Issue) => void;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function PreviousIssuesMenu({
  className,
  isOpen,
  issues,
  currentIssue,
  onSelectIssue,
  onClose,
}: PreviousIssuesMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={classnames(style.overlay)}>
      <div ref={ref} className={classnames(style.panel, className)}>
        <div className={style.header}>
          <h3 className={style.title}>גיליונות קודמים</h3>
          <button className={style.closeBtn} onClick={onClose} aria-label="סגור">
            &times;
          </button>
        </div>
        {issues.length === 0 ? (
          <p className={style.empty}>אין גיליונות קודמים.</p>
        ) : (
          <ul className={style.list}>
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  className={classnames(style.issueBtn, currentIssue?.id === issue.id && style.active)}
                  onClick={() => {
                    onSelectIssue(issue);
                    onClose();
                  }}
                >
                  <span className={style.issueNum}>גיליון {issue.issue_number}</span>
                  <span className={style.issueDate}>{formatDate(issue.issue_date)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
