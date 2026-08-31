import { useEffect } from "react";
import classnames from "classnames";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconH2,
  IconLink,
  IconLinkOff,
} from "@tabler/icons-react";
import style from "./article-form.module.css";

export interface ArticleFormData {
  title: string;
  content: string;
  keywords: string;
  orderInIssue: number;
}

export interface ArticleFormProps {
  className?: string;
  data: ArticleFormData;
  onChange: (data: ArticleFormData) => void;
}

export function ArticleForm({ className, data, onChange }: ArticleFormProps) {
  const update = (field: keyof ArticleFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [field]: field === "orderInIssue" ? Number(e.target.value) : e.target.value });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
    ],
    content: data.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange({ ...data, content: editor.getHTML() });
    },
    editorProps: {
      attributes: { dir: "rtl", class: style.editorArea },
    },
  });

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    // window.prompt is a native dialog and can reset the editor's DOM selection while it's open.
    const { from, to } = editor.state.selection;
    const url = window.prompt("כתובת הקישור (URL)", previousUrl ?? "https://");
    if (url === null) return;
    const chain = editor.chain().focus().setTextSelection({ from, to });
    if (url.trim() === "") {
      chain.extendMarkRange("link").unsetLink().run();
      return;
    }
    if (from === to) {
      // No text selected: insert the URL itself as the link's visible text.
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent({
          type: "text",
          text: url.trim(),
          marks: [{ type: "link", attrs: { href: url.trim() } }],
        })
        .run();
      return;
    }
    chain.extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  // Reflect switching to a different article (external content change) into the editor.
  useEffect(() => {
    if (editor && editor.getHTML() !== data.content) {
      editor.commands.setContent(data.content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.content, editor]);

  return (
    <div className={classnames(style.root, className)}>
      <h3 className={style.heading}>פרטי הכתבה</h3>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-title">כותרת</label>
        <input
          id="article-title"
          type="text"
          className={style.input}
          value={data.title}
          onChange={update("title")}
          placeholder="כותרת הכתבה"
          dir="rtl"
        />
      </div>
      <div className={style.field}>
        <label className={style.label}>תוכן</label>
        <div className={style.toolbar} onMouseDown={(e) => e.preventDefault()}>
          <button
            type="button"
            className={classnames(style.toolbarBtn, editor?.isActive("bold") && style.toolbarBtnActive)}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            aria-label="מודגש"
          >
            <IconBold size={16} />
          </button>
          <button
            type="button"
            className={classnames(style.toolbarBtn, editor?.isActive("italic") && style.toolbarBtnActive)}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            aria-label="נטוי"
          >
            <IconItalic size={16} />
          </button>
          <button
            type="button"
            className={classnames(style.toolbarBtn, editor?.isActive("heading", { level: 2 }) && style.toolbarBtnActive)}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="כותרת משנה"
          >
            <IconH2 size={16} />
          </button>
          <button
            type="button"
            className={classnames(style.toolbarBtn, editor?.isActive("bulletList") && style.toolbarBtnActive)}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            aria-label="רשימת תבליטים"
          >
            <IconList size={16} />
          </button>
          <button
            type="button"
            className={classnames(style.toolbarBtn, editor?.isActive("orderedList") && style.toolbarBtnActive)}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            aria-label="רשימה ממוספרת"
          >
            <IconListNumbers size={16} />
          </button>
          <button
            type="button"
            className={classnames(style.toolbarBtn, editor?.isActive("link") && style.toolbarBtnActive)}
            onClick={setLink}
            aria-label="הוספת קישור"
          >
            <IconLink size={16} />
          </button>
          {editor?.isActive("link") && (
            <button
              type="button"
              className={style.toolbarBtn}
              onClick={() => editor?.chain().focus().unsetLink().run()}
              aria-label="הסרת קישור"
            >
              <IconLinkOff size={16} />
            </button>
          )}
        </div>
        <EditorContent editor={editor} className={classnames(style.input, style.textarea)} />
      </div>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-keywords">מילות מפתח</label>
        <input
          id="article-keywords"
          type="text"
          className={style.input}
          value={data.keywords}
          onChange={update("keywords")}
          placeholder="מילות מפתח מופרדות ברווח"
          dir="rtl"
        />
      </div>
      <div className={style.field}>
        <label className={style.label} htmlFor="article-order">מספר סדר</label>
        <input
          id="article-order"
          type="number"
          className={classnames(style.input, style.numberInput)}
          value={data.orderInIssue}
          onChange={update("orderInIssue")}
          min={1}
          dir="rtl"
        />
      </div>
    </div>
  );
}
