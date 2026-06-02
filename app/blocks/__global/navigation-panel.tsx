import classnames from "classnames";
import { Link } from "react-router";
import style from "./navigation-panel.module.css";

const PANEL_BANNER = "/panel.svg";

export interface NavigationPanelProps {
  className?: string;
  onPreviousIssues?: () => void;
  onLatestIssue?: () => void;
  onTitles?: () => void;
  onSearch?: () => void;
  onPdfExport?: () => void;
}

export function NavigationPanel(props: NavigationPanelProps) {
  const { className, onPreviousIssues, onLatestIssue, onTitles, onSearch, onPdfExport } = props;

  return (
    <nav className={classnames(style.root, className)}>
      <div className={style.banner}>
        <img src={PANEL_BANNER} alt="מתחת לסלע - רקפת משתפת" className={style.bannerImage} />
      </div>
      <div className={style.navBar}>
        <div className={style.navButtons}>
          <button className={style.navBtn} onClick={onPreviousIssues}>
            גיליונות קודמים
          </button>
          <button className={style.navBtn} onClick={onLatestIssue}>
            גיליון אחרון
          </button>
          <button className={style.navBtn} onClick={onTitles}>
            כותרות
          </button>
          <button className={style.navBtn} onClick={onSearch}>
            חיפוש
          </button>
          <button className={classnames(style.navBtn, style.navBtnPdf)} onClick={onPdfExport}>
            ייצוא PDF
          </button>
          <Link to="/editor" className={classnames(style.navBtn, style.navBtnEditor)}>
            עורך
          </Link>
        </div>
      </div>
    </nav>
  );
}
