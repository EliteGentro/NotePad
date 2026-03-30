import type { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  action: () => void;
  active?: boolean;
  title: string;
}

export function ToolbarButton({ icon: Icon, action, active = false, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={action}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-md cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color) ${
        active
          ? 'bg-(--accent-color)/12 text-(--accent-color)'
          : 'text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color) hover:bg-(--toolbar-bg)'
      }`}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}

export function ToolbarDivider() {
  return <div className="w-px h-5 bg-(--border-color) mx-0.5 shrink-0" />;
}
