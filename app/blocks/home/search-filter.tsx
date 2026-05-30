import { useRef } from "react";
import classnames from "classnames";
import { IconSearch } from "@tabler/icons-react";
import style from "./search-filter.module.css";

export interface SearchFilterProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchFilter({ className, value, onChange }: SearchFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={classnames(style.root, className)}>
      <div className={style.inner}>
        <h2 className={style.heading}>חיפוש כתבות</h2>
        <div className={style.inputWrapper}>
          <IconSearch size={20} className={style.icon} />
          <input
            ref={inputRef}
            type="text"
            className={style.input}
            placeholder="הקלידו מילת חיפוש..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir="rtl"
          />
          {value && (
            <button className={style.clearBtn} onClick={() => onChange("")} aria-label="נקה חיפוש">
              &times;
            </button>
          )}
        </div>
        {value && (
          <p className={style.hint}>מחפש לפי מילת מפתח: &ldquo;{value}&rdquo;</p>
        )}
      </div>
    </section>
  );
}
