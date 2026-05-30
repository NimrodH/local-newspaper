import { useState, useRef, useCallback } from "react";
import classnames from "classnames";
import { IconUpload, IconClipboard, IconX } from "@tabler/icons-react";
import style from "./image-upload.module.css";
import { supabase } from "~/lib/supabase";

export interface ImageUploadProps {
  className?: string;
  onUploaded: (path: string) => void;
}

export function ImageUpload({ className, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setSuccess(null);
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `uploads/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("images").upload(path, file, { upsert: true });
      if (uploadError) {
        setError("העלאה נכשלה: " + uploadError.message);
      } else {
        setSuccess("תמונה הועלתה בהצלחה!");
        onUploaded(path);
      }
      setUploading(false);
    },
    [onUploaded]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            await uploadFile(new File([file], `paste-${Date.now()}.png`, { type: file.type }));
            return;
          }
        }
      }
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>העלאת תמונות</h3>
      <div
        className={style.dropZone}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        tabIndex={0}
      >
        <IconUpload size={36} stroke={1.5} className={style.uploadIcon} />
        <p className={style.dropText}>גררו תמונה לכאן או הדביקו מלוח העתקה</p>
        <p className={style.dropSub}>או</p>
        <button type="button" className={style.fileBtn} onClick={() => fileInputRef.current?.click()}>
          <IconClipboard size={16} style={{ marginLeft: 6 }} />
          בחר קובץ
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className={style.fileInput} onChange={handleFileChange} />
      </div>
      {uploading && <p className={style.statusLoading}>מעלה…</p>}
      {error && (
        <p className={style.statusError}>
          <IconX size={14} style={{ marginLeft: 4 }} />
          {error}
        </p>
      )}
      {success && <p className={style.statusSuccess}>{success}</p>}
    </div>
  );
}
