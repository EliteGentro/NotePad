import { useEditorState, type Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Heading3,
    Highlighter, Palette, Quote, RemoveFormatting, Search,
} from 'lucide-react';
import { ToolbarButton, ToolbarDivider } from '../common/ToolbarButton';
import { useTheme } from '../common/theme';

/** Default text color per theme, matching --text-color in index.css. */
const DEFAULT_TEXT_COLOR = { light: '#0f172a', dark: '#f8fafc' } as const;

interface TextToolbarProps {
    editor: Editor | null;
    onOpenFind: () => void;
}

export function TextToolbar({ editor, onOpenFind }: TextToolbarProps) {
    const { theme } = useTheme();

    // Tiptap v3 doesn't re-render on selection changes by default; subscribe to just what the toolbar shows.
    const active = useEditorState({
        editor,
        selector: ({ editor: e }) => {
            if (!e) return null;
            return {
                bold: e.isActive('bold'),
                italic: e.isActive('italic'),
                underline: e.isActive('underline'),
                strike: e.isActive('strike'),
                h1: e.isActive('heading', { level: 1 }),
                h2: e.isActive('heading', { level: 2 }),
                h3: e.isActive('heading', { level: 3 }),
                alignLeft: e.isActive({ textAlign: 'left' }),
                alignCenter: e.isActive({ textAlign: 'center' }),
                alignRight: e.isActive({ textAlign: 'right' }),
                alignJustify: e.isActive({ textAlign: 'justify' }),
                bulletList: e.isActive('bulletList'),
                orderedList: e.isActive('orderedList'),
                blockquote: e.isActive('blockquote'),
                highlight: e.isActive('highlight'),
                color: (e.getAttributes('textStyle').color as string | undefined) ?? null,
            };
        },
    });

    if (!editor || !active) return null;

    const chain = () => editor.chain().focus();

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-(--navbar-bg) backdrop-blur-sm border-b border-(--border-color) sticky top-0 z-10 transition-colors duration-200">
            <ToolbarButton icon={Bold} action={() => chain().toggleBold().run()} active={active.bold} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={Italic} action={() => chain().toggleItalic().run()} active={active.italic} title="Italic (Ctrl+I)" />
            <ToolbarButton icon={UnderlineIcon} action={() => chain().toggleUnderline().run()} active={active.underline} title="Underline (Ctrl+U)" />
            <ToolbarButton icon={Strikethrough} action={() => chain().toggleStrike().run()} active={active.strike} title="Strikethrough" />

            <ToolbarDivider />

            <ToolbarButton icon={Heading1} action={() => chain().toggleHeading({ level: 1 }).run()} active={active.h1} title="Heading 1" />
            <ToolbarButton icon={Heading2} action={() => chain().toggleHeading({ level: 2 }).run()} active={active.h2} title="Heading 2" />
            <ToolbarButton icon={Heading3} action={() => chain().toggleHeading({ level: 3 }).run()} active={active.h3} title="Heading 3" />

            <ToolbarDivider />

            <ToolbarButton icon={AlignLeft} action={() => chain().setTextAlign('left').run()} active={active.alignLeft} title="Align Left" />
            <ToolbarButton icon={AlignCenter} action={() => chain().setTextAlign('center').run()} active={active.alignCenter} title="Align Center" />
            <ToolbarButton icon={AlignRight} action={() => chain().setTextAlign('right').run()} active={active.alignRight} title="Align Right" />
            <ToolbarButton icon={AlignJustify} action={() => chain().setTextAlign('justify').run()} active={active.alignJustify} title="Justify" />

            <ToolbarDivider />

            <ToolbarButton icon={List} action={() => chain().toggleBulletList().run()} active={active.bulletList} title="Bullet List" />
            <ToolbarButton icon={ListOrdered} action={() => chain().toggleOrderedList().run()} active={active.orderedList} title="Numbered List" />
            <ToolbarButton icon={Quote} action={() => chain().toggleBlockquote().run()} active={active.blockquote} title="Blockquote" />

            <ToolbarDivider />

            <ToolbarButton icon={Highlighter} action={() => chain().toggleHighlight().run()} active={active.highlight} title="Highlight" />

            <div className="relative flex items-center p-1.5 cursor-pointer rounded-md hover:bg-(--toolbar-bg) transition-colors duration-150" title="Text Color">
                <Palette
                    size={18}
                    style={active.color ? { color: active.color } : undefined}
                    className={active.color ? '' : 'text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color)'}
                />
                <input
                    type="color"
                    onChange={(e) => chain().setColor(e.target.value).run()}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    // <input type="color"> only accepts #rrggbb (pasted content may carry rgb()/named colors)
                    value={active.color && /^#[0-9a-f]{6}$/i.test(active.color) ? active.color : DEFAULT_TEXT_COLOR[theme]}
                    aria-label="Text color"
                />
            </div>
            <ToolbarButton
                icon={RemoveFormatting}
                action={() => chain().unsetColor().unsetHighlight().run()}
                title="Reset text color & highlight"
            />

            <ToolbarDivider />

            <ToolbarButton icon={Search} action={onOpenFind} title="Find & replace (Ctrl+F)" />
        </div>
    );
}
