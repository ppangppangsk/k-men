import { useRef, useCallback, type ChangeEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImagePlus,
  Link,
  Unlink,
  Undo2,
  Redo2,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = '내용을 입력하세요...',
}: RichTextEditorProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExt.configure({
        HTMLAttributes: { style: 'max-width:100%;border-radius:0.5rem;margin:1rem 0' },
      }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-kmen-orange underline' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[200px] p-4 outline-none prose-headings:font-bold prose-a:text-kmen-orange prose-img:rounded-lg prose-img:mx-auto',
      },
    },
  });

  const handleImageUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload || !editor) return;

      setImageUploading(true);
      try {
        const url = await onImageUpload(file);
        editor.chain().focus('end').setImage({ src: url }).run();
      } catch (err) {
        alert(err instanceof Error ? err.message : '이미지 업로드 실패');
      } finally {
        setImageUploading(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
      }
    },
    [editor, onImageUpload],
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = prompt('링크 URL을 입력하세요:', 'https://');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({
    active,
    onClick,
    children,
    title,
    disabled,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-orange-100 text-kmen-orange'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-slate-200 mx-0.5" />;

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-kmen-orange">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <ToolBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="취소선"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="제목 (큰)"
        >
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="제목 (작은)"
        >
          <Heading3 className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="목록"
        >
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="번호 목록"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="인용"
        >
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          active={editor.isActive('link')}
          onClick={addLink}
          title="링크 추가"
        >
          <Link className="w-4 h-4" />
        </ToolBtn>
        {editor.isActive('link') && (
          <ToolBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="링크 제거"
          >
            <Unlink className="w-4 h-4" />
          </ToolBtn>
        )}

        {onImageUpload && (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <ToolBtn
              onClick={() => imageInputRef.current?.click()}
              disabled={imageUploading}
              title="이미지 삽입"
            >
              {imageUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
            </ToolBtn>
          </>
        )}

        <Divider />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행취소"
        >
          <Undo2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시실행"
        >
          <Redo2 className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .tiptap:focus { outline: none; }
        .tiptap img { max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; }
        .tiptap h2 { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; }
        .tiptap h3 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; }
        .tiptap blockquote {
          border-left: 3px solid #E8882F;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #64748b;
        }
        .tiptap ul, .tiptap ol { padding-left: 1.5rem; margin: 0.75rem 0; }
        .tiptap ul { list-style-type: disc; }
        .tiptap ol { list-style-type: decimal; }
        .tiptap hr { border-color: #e2e8f0; margin: 1.5rem 0; }
        .tiptap a { color: #E8882F; text-decoration: underline; }
        .tiptap p { margin: 0.5rem 0; }
      `}</style>
    </div>
  );
}
