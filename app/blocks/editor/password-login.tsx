import { useState } from "react";
import classnames from "classnames";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import style from "./password-login.module.css";
import { supabase } from "~/lib/supabase";

export interface PasswordLoginProps {
  className?: string;
  onAuthenticated: () => void;
}

export function PasswordLogin({ className, onAuthenticated }: PasswordLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "editor_password")
        .single();
      if (dbError) throw dbError;
      if (data?.value === password) {
        onAuthenticated();
      } else {
        setError("סיסמא שגויה. אנא נסה שנית.");
      }
    } catch {
      setError("שגיאה בבדיקת הסיסמא. אנא בדוק את חיבור Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classnames(style.root, className)}>
      <div className={style.card}>
        <div className={style.iconWrapper}>
          <IconLock size={32} stroke={1.5} />
        </div>
        <h2 className={style.title}>עמוד עריכת עיתון</h2>
        <p className={style.subtitle}>הכנסו סיסמא כדי להתחבר</p>
        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="סיסמא"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={style.input}
              dir="rtl"
              required
            />
            <button
              type="button"
              className={style.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "הסתר סיסמא" : "הצג סיסמא"}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error && <p className={style.error}>{error}</p>}
          <button type="submit" className={style.submitBtn} disabled={loading}>
            {loading ? "בודק…" : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}
