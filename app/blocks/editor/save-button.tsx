import { useState } from "react";
import classnames from "classnames";
import { IconDeviceFloppy, IconCheck, IconX } from "@tabler/icons-react";
import style from "./save-button.module.css";
import { supabase } from "~/lib/supabase";
import type { ArticleFormData } from "./article-form";

export interface SaveButtonProps {
  className?: string;
  formData: ArticleFormData;
  selectedImages: string[];
  onSaved: () => void;
}

async function getOrCreateDraftIssue(): Promise<number> {
  // Find unapproved issue
  const { data: drafts } = await supabase
    .from("issues")
    .select("*")
    .eq("approved_for_display", false)
    .order("issue_number", { ascending: false })
    .limit(1);

  if (drafts && drafts.length > 0) {
    return drafts[0].issue_number as number;
  }

  // Create new issue: issue_number = last approved + 1
  const { data: approved } = await supabase
    .from("issues")
    .select("issue_number")
    .eq("approved_for_display", true)
    .order("issue_number", { ascending: false })
    .limit(1);

  const lastApproved = approved && approved.length > 0 ? (approved[0].issue_number as number) : 0;
  const newNumber = lastApproved + 1;

  const { error } = await supabase.from("issues").insert({
    issue_number: newNumber,
    issue_date: new Date().toISOString().slice(0, 10),
    approved_for_display: false,
  });

  if (error) throw new Error(error.message);
  return newNumber;
}

export function SaveButton({ className, formData, selectedImages, onSaved }: SaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setStatus("error");
      setErrorMsg("חובה להזין כותרת.");
      return;
    }
    setSaving(true);
    setStatus("idle");
    setErrorMsg(null);
    try {
      const issueNumber = await getOrCreateDraftIssue();
      const { error } = await supabase.from("articles").insert({
        title: formData.title,
        content: formData.content,
        issue_number: issueNumber,
        order_in_issue: formData.orderInIssue,
        keywords: formData.keywords,
        related_images: selectedImages,
      });
      if (error) throw new Error(error.message);
      setStatus("success");
      onSaved();
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={classnames(style.root, className)}>
      <button
        type="button"
        className={classnames(style.btn, saving && style.btnSaving)}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>שומר…</>
        ) : (
          <>
            <IconDeviceFloppy size={18} style={{ marginLeft: 8 }} />
            שמור כתבה
          </>
        )}
      </button>
      {status === "success" && (
        <p className={style.success}>
          <IconCheck size={16} style={{ marginLeft: 4 }} />
          הכתבה נשמרה בהצלחה!
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
