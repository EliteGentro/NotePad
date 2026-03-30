import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Heading3,
    Highlighter, Palette, Quote
} from 'lucide-react';
import { ToolbarButton, ToolbarDivider } from '../common/ToolbarButton';

export function TextToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-(--navbar-bg) backdrop-blur-sm border-b border-(--border-color) sticky top-0 z-10 transition-colors duration-200">
            <ToolbarButton icon={Bold} action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)" />
            <ToolbarButton icon={UnderlineIcon} action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)" />
            <ToolbarButton icon={Strikethrough} action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough" />

            <ToolbarDivider />

            <ToolbarButton icon={Heading1} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1" />
            <ToolbarButton icon={Heading2} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2" />
            <ToolbarButton icon={Heading3} action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3" />

            <ToolbarDivider />

            <ToolbarButton icon={AlignLeft} action={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left" />
            <ToolbarButton icon={AlignCenter} action={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center" />
            <ToolbarButton icon={AlignRight} action={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right" />
            <ToolbarButton icon={AlignJustify} action={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify" />

            <ToolbarDivider />

            <ToolbarButton icon={List} action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List" />
            <ToolbarButton icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List" />
            <ToolbarButton icon={Quote} action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote" />

            <ToolbarDivider />

            <ToolbarButton icon={Highlighter} action={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight" />

            <div className="relative flex items-center p-1.5 cursor-pointer rounded-md hover:bg-(--toolbar-bg) transition-colors duration-150" title="Text Color">
                <Palette size={18} className="text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color)" />
                <input
                    type="color"
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    aria-label="Text color"
                />
            </div>
        </div>
    );
}
