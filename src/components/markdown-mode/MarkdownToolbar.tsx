import {
    Heading, Bold, Italic, Code, List, Link as LinkIcon, Quote
} from 'lucide-react';

export function MarkdownToolbar({
    insertText
}: {
    insertText: (before: string, after: string, defaultText: string) => void
}) {
    const ToolbarBtn = ({ icon: Icon, action, title }: any) => (
        <button
            onClick={action}
            title={title}
            className={`p-1.5 rounded transition-colors text-gray-500 hover:text-[var(--text-color)] hover:bg-[var(--toolbar-bg)]`}
        >
            <Icon size={18} />
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--navbar-bg)] border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-200">
            <ToolbarBtn icon={Heading} action={() => insertText('### ', '', 'Heading')} title="Heading" />
            <ToolbarBtn icon={Bold} action={() => insertText('**', '**', 'bold text')} title="Bold" />
            <ToolbarBtn icon={Italic} action={() => insertText('*', '*', 'italic text')} title="Italic" />

            <Divider />

            <ToolbarBtn icon={Code} action={() => insertText('`', '`', 'code')} title="Inline Code" />
            <ToolbarBtn icon={Code} action={() => insertText('\n```\n', '\n```\n', 'code block')} title="Code Block" />

            <Divider />

            <ToolbarBtn icon={List} action={() => insertText('- ', '', 'list item')} title="Bullet List" />
            <ToolbarBtn icon={Quote} action={() => insertText('> ', '', 'quote')} title="Blockquote" />
            <ToolbarBtn icon={LinkIcon} action={() => insertText('[', '](url)', 'link text')} title="Link" />
        </div>
    );
}
