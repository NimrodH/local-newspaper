import { useState } from "react";
import classnames from "classnames";
import { IconDeviceFloppy, IconCheck, IconX } from "@tabler/icons-react";
import style from "./save-button.module.css";
import type { ArticleFormData } from "./article-form";

export interface SaveButtonProps {
  className?: string;
  password?: string;
  formData: ArticleFormData;
  selectedImages: string[];
  onSaved: () => void;
}

export function SaveButton({ className, password = "", formData, selectedImages, onSaved }: SaveButtonProps) {
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
      const res = await fetch("/api/save-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          formData,
          selectedImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "שגיאה בשמירת הכתבה");
      }

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
