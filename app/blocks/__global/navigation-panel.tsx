import classnames from "classnames";
import { Link } from "react-router";
import style from "./navigation-panel.module.css";

const PANEL_BANNER = "/panel.svg";
const SIDE_LOGO = "/greenLogo.jpg";

export interface NavigationPanelProps {
  className?: string;
  onPreviousIssues?: () => void;
  onLatestIssue?: () => void;
  onTitles?: () => void;
  onSearch?: () => void;
  activeTab?: "previous" | "latest" | "titles" | "search" | "editor";
  editorHref?: string;
}

export function NavigationPanel(props: NavigationPanelProps) {
  const { className, onPreviousIssues, onLatestIssue, onTitles, onSearch, activeTab, editorHref = "/editor" } = props;

  return (
    <nav className={classnames(style.root, className)}>
      <div className={style.banner}>
        <div className={style.bannerInner}>
          <img src={PANEL_BANNER} alt="מתחת לסלע - רקפת משתפת" className={style.bannerImage} />
          <img src={SIDE_LOGO} alt="רקפת משתפת" className={classnames(style.sideLogo, style.sideLogoLeft)} />
          <img src={SIDE_LOGO} alt="רקפת משתפת" className={classnames(style.sideLogo, style.sideLogoRight)} />
        </div>
      </div>
      <div className={style.navBar}>
        <div className={style.navButtons}>
          <button 
            className={classnames(style.navBtn, { [style.navBtnActive]: activeTab === "previous" })} 
            onClick={onPreviousIssues}
          >
            גיליונות קודמים
          </button>
          <button 
            className={classnames(style.navBtn, { [style.navBtnActive]: activeTab === "latest" })} 
            onClick={onLatestIssue}
          >
            גיליון אחרון
          </button>
          <button 
            className={classnames(style.navBtn, { [style.navBtnActive]: activeTab === "titles" })} 
            onClick={onTitles}
          >
            כותרות
          </button>
          <button 
            className={classnames(style.navBtn, { [style.navBtnActive]: activeTab === "search" })} 
            onClick={onSearch}
          >
            חיפוש
          </button>
          <Link 
            to={editorHref} 
            className={classnames(style.navBtn, style.navBtnEditor, { [style.navBtnActive]: activeTab === "editor" })}
          >
            עורך
          </Link>
        </div>
      </div>
    </nav>
  );
}
