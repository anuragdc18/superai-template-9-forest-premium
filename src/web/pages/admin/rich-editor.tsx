import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { uploadImage } from "../../queries/content";

/** Simple word-processor style editor for blog posts. Saves clean HTML. */
export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Start writing your post… Use the buttons above for headings, lists, links and images." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: { attributes: { class: "blog-prose min-h-[420px] px-5 py-4 outline-none" } },
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            undo: e.can().undo(),
            redo: e.can().redo(),
          }
        : null,
  });

  if (!editor || !s) return <div className="grid h-[480px] place-items-center rounded-md border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;

  const c = () => editor.chain().focus();
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = prompt("Link address (https://… or /services/…)", prev ?? "https://");
    if (url === null) return;
    if (!url.trim() || url === "https://") return c().extendMarkRange("link").unsetLink().run();
    c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };
  const addImage = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await uploadImage(file, 1400);
      const alt = prompt("Short description of the image (for Google and blind readers):", "") ?? "";
      c().setImage({ src, alt }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const B = ({ on, label, onClick, children, disabled }: { on?: boolean; label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-md transition disabled:opacity-30 ${on ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
  const sep = <span className="mx-1 h-6 w-px bg-slate-200" />;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
      <div className="sticky top-16 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-white/95 p-1.5 backdrop-blur">
        <B label="Heading" on={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-[18px] w-[18px]" />
        </B>
        <B label="Small heading" on={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-[18px] w-[18px]" />
        </B>
        {sep}
        <B label="Bold" on={s.bold} onClick={() => c().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </B>
        <B label="Italic" on={s.italic} onClick={() => c().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </B>
        <B label="Underline" on={s.underline} onClick={() => c().toggleUnderline().run()}>
          <Underline className="h-4 w-4" />
        </B>
        {sep}
        <B label="Bullet list" on={s.ul} onClick={() => c().toggleBulletList().run()}>
          <List className="h-[18px] w-[18px]" />
        </B>
        <B label="Numbered list" on={s.ol} onClick={() => c().toggleOrderedList().run()}>
          <ListOrdered className="h-[18px] w-[18px]" />
        </B>
        <B label="Quote" on={s.quote} onClick={() => c().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </B>
        <B label="Divider line" onClick={() => c().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </B>
        {sep}
        <B label="Add / edit link" on={s.link} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </B>
        {s.link && (
          <B label="Remove link" onClick={() => c().unsetLink().run()}>
            <Unlink className="h-4 w-4" />
          </B>
        )}
        <B label="Add image" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </B>
        <span className="ml-auto flex">
          <B label="Undo" onClick={() => c().undo().run()} disabled={!s.undo}>
            <Undo2 className="h-4 w-4" />
          </B>
          <B label="Redo" onClick={() => c().redo().run()} disabled={!s.redo}>
            <Redo2 className="h-4 w-4" />
          </B>
        </span>
      </div>
      <EditorContent editor={editor} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => addImage(e.target.files?.[0])} />
    </div>
  );
}
