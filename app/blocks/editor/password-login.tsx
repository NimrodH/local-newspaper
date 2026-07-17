import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import classnames from "classnames";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import style from "./password-login.module.css";

export interface PasswordLoginProps {
  className?: string;
  onAuthenticated: (password: string) => void;
}

type ActionData = { authenticated?: boolean; error?: string };

export function PasswordLogin({ className, onAuthenticated }: PasswordLoginProps) {
  const fetcher = useFetcher<ActionData>();
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = fetcher.state !== "idle";
  const error = fetcher.data?.error;

  useEffect(() => {
    if (fetcher.data?.authenticated) {
      const pass = fetcher.formData?.get("password") as string;
      onAuthenticated(pass || "");
    }
  }, [fetcher.data, fetcher.formData, onAuthenticated]);

  return (
    <div className={classnames(style.root, className)}>
      <div className={style.card}>
        <div className={style.iconWrapper}>
          <IconLock size={32} stroke={1.5} />
        </div>
        <h2 className={style.title}>עמוד עריכת עיתון</h2>
        <p className={style.subtitle}>הכנסו סיסמא כדי להתחבר</p>
        <fetcher.Form method="post" className={style.form}>
          <div className={style.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="סיסמא"
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
          <button type="submit" className={style.submitBtn} disabled={isLoading}>
            {isLoading ? "בודק…" : "כניסה"}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
