import { useState, useEffect } from "react";
import classnames from "classnames";
import { IconCheck } from "@tabler/icons-react";
import style from "./image-selection.module.css";
import { supabase } from "~/lib/supabase";

export interface ImageSelectionProps {
  className?: string;
  password?: string;
  selectedImages: string[];
  onToggleImage: (path: string) => void;
}

export function ImageSelection({ className, password = "", selectedImages, onToggleImage }: ImageSelectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showAll || !password) return;
    async function loadImages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/list-images?password=${encodeURIComponent(password)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "שגיאה בטעינת תמונות");
        }
        setImages(data.images ?? []);
      } catch (err: any) {
        setError(err.message || err);
      } finally {
        setLoading(false);
      }
    }
    loadImages();
  }, [showAll, password, selectedImages.length]);

  function getUrl(path: string) {
    return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
  }

  const shown = showAll ? images : selectedImages;

  return (
    <div className={classnames(style.root, className)}>
      <div className={style.header}>
        <h3 className={style.heading}>{showAll ? "כל התמונות" : "תמונות הכתבה"}</h3>
        <button
          type="button"
          className={style.toggleBtn}
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
        >
          {showAll ? "רק תמונות הכתבה" : "כל התמונות"}
        </button>
      </div>
      {showAll && loading && <p className={style.state}>טוען…</p>}
      {showAll && !loading && error && <p className={style.error}>שגיאה: {error}</p>}
      {!(showAll && (loading || error)) && shown.length === 0 && (
        <p className={style.state}>{showAll ? "אין תמונות זמינות." : "לא נבחרו תמונות לכתבה."}</p>
      )}
      {!(showAll && loading) && (
        <div className={style.grid}>
          {shown.map((path) => {
            const isSelected = selectedImages.includes(path);
            return (
              <button
                key={path}
                type="button"
                className={classnames(style.imgBtn, isSelected && style.imgBtnSelected)}
                onClick={() => onToggleImage(path)}
                aria-pressed={isSelected}
                title={path}
              >
                <img src={getUrl(path)} alt="" className={style.img} />
                {isSelected && (
                  <span className={style.checkmark}>
                    <IconCheck size={16} stroke={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
