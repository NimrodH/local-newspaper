import classnames from "classnames";
import style from "./footer.module.css";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className={classnames(style.root, className)}>
      <div className={style.inner}>
        <p className={style.title}>מתחת לסלע &ndash; רקפת משתפת</p>
        <p className={style.copy}>עיתון קהילתי מקומי &copy; {year}</p>
      </div>
    </footer>
  );
}
