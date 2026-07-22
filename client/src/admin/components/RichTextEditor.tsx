import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import clsx from 'clsx';

function ToolBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx(
        'rounded p-1.5 text-admin-mute hover:bg-admin-bg hover:text-admin-ink',
        active && 'bg-admin-bg text-admin-ink',
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Rédigez le contenu…',
}: {
  value: unknown;
  onChange: (json: unknown) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
    ],
    content:
      typeof value === 'object' && value !== null
        ? (value as object)
        : typeof value === 'string' && value
          ? value
          : { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[180px] px-3 py-2 focus:outline-none text-admin-ink',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value ?? {});
    if (current !== next && value != null) {
      editor.commands.setContent(value as object);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-admin-border bg-white">
      <div className="flex flex-wrap gap-0.5 border-b border-admin-border bg-admin-bg/60 px-1.5 py-1">
        <ToolBtn title="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn title="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn title="Titre" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn title="Liste" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolBtn>
        <ToolBtn
          title="Lien"
          active={editor.isActive('link')}
          onClick={() => {
            const prev = editor.getAttributes('link').href as string | undefined;
            const url = window.prompt('URL du lien', prev || 'https://');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          <LinkIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Annuler" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn title="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
