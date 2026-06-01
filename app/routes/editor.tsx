import { useState } from "react";
import type { Route } from "./+types/editor";
import styles from "./editor.module.css";
import { PasswordLogin } from "../blocks/editor/password-login";
import { ArticleForm, type ArticleFormData } from "../blocks/editor/article-form";
import { ImageUpload } from "../blocks/editor/image-upload";
import { ImageSelection } from "../blocks/editor/image-selection";
import { SaveButton } from "../blocks/editor/save-button";
import { PublishIssueButton } from "../blocks/editor/publish-issue-button";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const correctPassword = process.env.EDITOR_PASSWORD;

  if (!correctPassword) {
    return { error: "סיסמא לא הוגדרה בשרת." };
  }

  if (password === correctPassword) {
    return { authenticated: true };
  }

  return { error: "סיסמא שגויה. אנא נסה שנית." };
}

const EMPTY_FORM: ArticleFormData = {
  title: "",
  content: "",
  keywords: "",
  orderInIssue: 1,
};

export default function Editor() {
  const [authenticated, setAuthenticated] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>(EMPTY_FORM);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleToggleImage = (path: string) => {
    setSelectedImages((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleImageUploaded = (path: string) => {
    setSelectedImages((prev) => [...prev, path]);
  };

  const handleSaved = () => {
    setFormData(EMPTY_FORM);
    setSelectedImages([]);
  };

  if (!authenticated) {
    return (
      <div className={styles.root}>
        <PasswordLogin onAuthenticated={() => setAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>עריכת כתבות</h1>
          <p className={styles.pageSubtitle}>הוסיפו כתבות חדשות לגיליון</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formCol}>
            <div className={styles.card}>
              <ArticleForm data={formData} onChange={setFormData} />
            </div>
            <div className={styles.card}>
              <SaveButton formData={formData} selectedImages={selectedImages} onSaved={handleSaved} />
            </div>
            <div className={styles.card}>
              <PublishIssueButton />
            </div>
          </div>
          <div className={styles.mediaCol}>
            <div className={styles.card}>
              <ImageUpload onUploaded={handleImageUploaded} />
            </div>
            <div className={styles.card}>
              <ImageSelection selectedImages={selectedImages} onToggleImage={handleToggleImage} />
            </div>
            {selectedImages.length > 0 && (
              <div className={styles.selectedSummary}>
                <h4 className={styles.selectedTitle}>תמונות שנבחרו:</h4>
                <ul className={styles.selectedList}>
                  {selectedImages.map((p) => (
                    <li key={p} className={styles.selectedItem}>
                      <span>{p.split("/").pop()}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleToggleImage(p)}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
