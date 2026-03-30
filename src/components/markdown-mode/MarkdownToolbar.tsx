import {
    Heading, Bold, Italic, Code, List, Link as LinkIcon, Quote, ListOrdered, Minus, Image
} from 'lucide-react';
import { ToolbarButton, ToolbarDivider } from '../common/ToolbarButton';

export function MarkdownToolbar({
    insertText
}: {
    insertText: (before: string, after: string, defaultText: string) => void
}) {
    return (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-(--navbar-bg) backdrop-blur-sm border-b border-(--border-color) sticky top-0 z-10 transition-colors duration-200">
            <ToolbarButton icon={Heading} action={() => insertText('### ', '', 'Heading')} title="Heading" />
            <ToolbarButton icon={Bold} action={() => insertText('**', '**', 'bold text')} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={Italic} action={() => insertText('*', '*', 'italic text')} title="Italic (Ctrl+I)" />

            <ToolbarDivider />

            <ToolbarButton icon={Code} action={() => insertText('`', '`', 'code')} title="Inline Code" />
            <ToolbarButton icon={Code} action={() => insertText('\n```\n', '\n```\n', 'code block')} title="Code Block" />

            <ToolbarDivider />

            <ToolbarButton icon={List} action={() => insertText('- ', '', 'list item')} title="Bullet List" />
            <ToolbarButton icon={ListOrdered} action={() => insertText('1. ', '', 'list item')} title="Numbered List" />
            <ToolbarButton icon={Quote} action={() => insertText('> ', '', 'quote')} title="Blockquote" />

            <ToolbarDivider />

            <ToolbarButton icon={LinkIcon} action={() => insertText('[', '](url)', 'link text')} title="Link" />
            <ToolbarButton icon={Image} action={() => insertText('![', '](url)', 'alt text')} title="Image" />
            <ToolbarButton icon={Minus} action={() => insertText('\n---\n', '', '')} title="Horizontal Rule" />
        </div>
    );
}
