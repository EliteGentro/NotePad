import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Heading3,
    Highlighter, Palette, Quote
} from 'lucide-react';

export function TextToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    const toggleBold = () => editor.chain().focus().toggleBold().run();
    const toggleItalic = () => editor.chain().focus().toggleItalic().run();
    const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
    const toggleStrike = () => editor.chain().focus().toggleStrike().run();

    // Alignment
    const setAlignLeft = () => editor.chain().focus().setTextAlign('left').run();
    const setAlignCenter = () => editor.chain().focus().setTextAlign('center').run();
    const setAlignRight = () => editor.chain().focus().setTextAlign('right').run();
    const setAlignJustify = () => editor.chain().focus().setTextAlign('justify').run();

    // Headings
    const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
    const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
    const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();

    // Lists
    const toggleBullet = () => editor.chain().focus().toggleBulletList().run();
    const toggleOrdered = () => editor.chain().focus().toggleOrderedList().run();

    // Blockquote
    const toggleQuote = () => editor.chain().focus().toggleBlockquote().run();

    // Colors & Highlight
    const setHighlight = () => editor.chain().focus().toggleHighlight().run();

    // Color picker can just be a native color input that sets the property
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        editor.chain().focus().setColor(e.target.value).run();
    };

    const Divider = () => <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>;

    const ToolbarBtn = ({ icon: Icon, action, active, title }: any) => (
        <button
            onClick={action}
            title={title}
            className={`p-1.5 rounded transition-colors ${active ? 'bg-[var(--accent-bg)] text-[var(--accent-color)]' : 'text-gray-500 hover:text-[var(--text-color)] hover:bg-[var(--toolbar-bg)]'}`}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--navbar-bg)] border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-200">

            <ToolbarBtn icon={Bold} action={toggleBold} active={editor.isActive('bold')} title="Bold" />
            <ToolbarBtn icon={Italic} action={toggleItalic} active={editor.isActive('italic')} title="Italic" />
            <ToolbarBtn icon={UnderlineIcon} action={toggleUnderline} active={editor.isActive('underline')} title="Underline" />
            <ToolbarBtn icon={Strikethrough} action={toggleStrike} active={editor.isActive('strike')} title="Strikethrough" />

            <Divider />

            <ToolbarBtn icon={Heading1} action={toggleH1} active={editor.isActive('heading', { level: 1 })} title="Heading 1" />
            <ToolbarBtn icon={Heading2} action={toggleH2} active={editor.isActive('heading', { level: 2 })} title="Heading 2" />
            <ToolbarBtn icon={Heading3} action={toggleH3} active={editor.isActive('heading', { level: 3 })} title="Heading 3" />

            <Divider />

            <ToolbarBtn icon={AlignLeft} action={setAlignLeft} active={editor.isActive({ textAlign: 'left' })} title="Align Left" />
            <ToolbarBtn icon={AlignCenter} action={setAlignCenter} active={editor.isActive({ textAlign: 'center' })} title="Align Center" />
            <ToolbarBtn icon={AlignRight} action={setAlignRight} active={editor.isActive({ textAlign: 'right' })} title="Align Right" />
            <ToolbarBtn icon={AlignJustify} action={setAlignJustify} active={editor.isActive({ textAlign: 'justify' })} title="Justify" />

            <Divider />

            <ToolbarBtn icon={List} action={toggleBullet} active={editor.isActive('bulletList')} title="Bullet List" />
            <ToolbarBtn icon={ListOrdered} action={toggleOrdered} active={editor.isActive('orderedList')} title="Numbered List" />
            <ToolbarBtn icon={Quote} action={toggleQuote} active={editor.isActive('blockquote')} title="Blockquote" />

            <Divider />

            <ToolbarBtn icon={Highlighter} action={setHighlight} active={editor.isActive('highlight')} title="Highlight" />

            <div className="relative flex items-center p-1 cursor-pointer rounded hover:bg-[var(--toolbar-bg)]" title="Text Color">
                <Palette size={18} className="text-gray-500 hover:text-[var(--text-color)]" />
                <input
                    type="color"
                    onChange={handleColorChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={editor.getAttributes('textStyle').color || '#000000'}
                />
            </div>

        </div>
    );
}
