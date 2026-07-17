
import React from 'react';

const ShortcutRow: React.FC<{ k: string; label: string }> = ({ k, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-[var(--on-surface)] text-sm">{label}</span>
        <span className="bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] px-3 py-1 rounded-[8px] text-xs font-mono font-medium border border-[var(--outline-variant)]">
            {k}
        </span>
    </div>
);

interface ShortcutsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[var(--surface-container)] rounded-[28px] p-6 w-full max-w-[320px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[24px] text-[var(--on-surface)] font-display">Shortcuts</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[var(--on-surface)]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="flex flex-col gap-4">
                    <ShortcutRow k="h" label="Toggle UI / Overlays" />
                    <ShortcutRow k="c" label="Collapse Controls" />
                    <ShortcutRow k="e" label="Export Frame" />
                    <ShortcutRow k="r" label="Toggle Specs" />
                    <ShortcutRow k="g" label="Toggle Guidelines" />
                    <ShortcutRow k="s" label="Toggle Color Styles" />
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="text-[var(--primary)] font-medium text-sm px-4 py-2 hover:bg-[var(--primary)]/10 rounded-full transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
