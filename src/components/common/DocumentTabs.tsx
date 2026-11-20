import { FileText, Plus, X } from 'lucide-react';
import type { DocMeta } from '../../utils/storage';

interface DocumentTabsProps {
    docs: DocMeta[];
    activeId: string;
    onSelect: (id: string) => void;
    onCreate: () => void;
    onClose: (id: string) => void;
}

export function DocumentTabs({ docs, activeId, onSelect, onCreate, onClose }: DocumentTabsProps) {
    return (
        <div className="document-tabs flex items-center gap-1 mb-2 min-w-0">
            <div className="flex items-center gap-1 overflow-x-auto min-w-0" role="tablist" aria-label="Documents">
                {docs.map(doc => {
                    const active = doc.id === activeId;
                    return (
                        <div
                            key={doc.id}
                            className={`group flex items-center shrink-0 max-w-[14rem] rounded-lg border text-sm transition-colors duration-150 ${
                                active
                                    ? 'bg-(--bg-color) border-(--border-color) text-(--text-color) shadow-sm'
                                    : 'border-transparent text-[color-mix(in_srgb,var(--text-color)_55%,transparent)] hover:text-(--text-color) hover:bg-(--toolbar-bg)'
                            }`}
                        >
                            <button
                                role="tab"
                                aria-selected={active}
                                onClick={() => onSelect(doc.id)}
                                className="flex items-center gap-1.5 min-w-0 pl-2.5 pr-1 py-1 cursor-pointer rounded-l-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                                title={doc.title}
                            >
                                <FileText size={13} className="shrink-0 opacity-60" />
                                <span className="truncate">{doc.title}</span>
                            </button>
                            <button
                                onClick={() => onClose(doc.id)}
                                className={`p-1 mr-1 rounded cursor-pointer hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                    active ? 'opacity-60' : 'opacity-0 group-hover:opacity-60 focus-visible:opacity-100'
                                }`}
                                aria-label={`Close ${doc.title}`}
                                title="Close document"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <button
                onClick={onCreate}
                className="shrink-0 p-1.5 rounded-lg cursor-pointer text-[color-mix(in_srgb,var(--text-color)_55%,transparent)] hover:text-(--text-color) hover:bg-(--toolbar-bg) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                aria-label="New document"
                title="New document"
            >
                <Plus size={16} />
            </button>
        </div>
    );
}
