import { useState, useEffect } from "react";
import classnames from "classnames";
import { IconCheck } from "@tabler/icons-react";
import style from "./image-selection.module.css";
import { supabase } from "~/lib/supabase";

export interface ImageSelectionProps {
  className?: string;
  selectedImages: string[];
  onToggleImage: (path: string) => void;
}

export function ImageSelection({ className, selectedImages, onToggleImage }: ImageSelectionProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      const { data, error: listError } = await supabase.storage.from("images").list("uploads", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (listError) {
        setError(listError.message);
      } else {
        setImages((data ?? []).map((f) => `uploads/${f.name}`));
      }
      setLoading(false);
    }
    loadImages();
  }, []);

  function getUrl(path: string) {
    return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>בחר תמונות קיימות</h3>
      {loading && <p className={style.state}>טוען…</p>}
      {!loading && error && <p className={style.error}>שגיאה: {error}</p>}
      {!loading && !error && images.length === 0 && <p className={style.state}>אין תמונות זמינות.</p>}
      {!loading && (
        <div className={style.grid}>
          {images.map((path) => {
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
