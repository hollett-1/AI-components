
import React, { useState } from 'react';

/* --- Material Design 3 Components --- */

export const M3SectionTitle: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-1 text-[var(--primary)]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <h3 className="text-[15px] font-medium font-display tracking-wide">{title}</h3>
    </div>
);

export const M3Switch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <div 
        className="flex items-center justify-between cursor-pointer group py-2"
        onClick={() => onChange(!checked)}
    >
        <span className="text-[14px] text-[var(--on-surface)] font-normal font-sans">{label}</span>
        <div className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-200 
            ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border-[var(--outline-variant)]'} border-2`}
        >
            <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] flex items-center justify-center rounded-full shadow-sm
                ${checked ? 'left-[calc(100%-24px)] w-[20px] h-[20px] bg-[var(--on-primary)]' : 'left-[5px] w-[14px] h-[14px] bg-[var(--outline-variant)] group-hover:bg-[var(--on-surface-variant)]'}`}
            >
                {checked && <span className="material-symbols-outlined text-[var(--primary)] text-[14px] font-bold">check</span>}
            </div>
        </div>
    </div>
);

export const M3ListItemSwitch: React.FC<{ label: string; checked: boolean; onChange: (c: boolean) => void; last?: boolean }> = ({ label, checked, onChange, last }) => (
    <div 
        className={`flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[var(--on-surface)]/5 transition-colors`}
        onClick={() => onChange(!checked)}
    >
        <span className="text-[14px] text-[var(--on-surface)] font-sans">{label}</span>
        <div className={`relative w-[40px] h-[24px] rounded-full transition-colors duration-200 
            ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border-[var(--outline-variant)]'} border-2`}
        >
             <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 rounded-full shadow-sm
                ${checked ? 'left-[calc(100%-18px)] w-[14px] h-[14px] bg-[var(--on-primary)]' : 'left-[4px] w-[12px] h-[12px] bg-[var(--outline-variant)]'}`}
            />
        </div>
    </div>
);


export const M3Slider: React.FC<{ 
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step?: number; 
    onChange: (val: number) => void; 
    disabled?: boolean;
}> = ({ label, value, min, max, step = 1, onChange, disabled }) => (
    <div className={`flex flex-col gap-2 transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-end">
             <span className="text-[13px] font-medium text-[var(--on-surface-variant)] font-sans">{label}</span>
             <span className="text-xs font-medium text-[var(--on-primary-container)] bg-[var(--primary-container)] px-2 py-0.5 rounded-[4px] font-mono min-w-[36px] text-center">{value?.toFixed(step < 1 ? 2 : 0)}</span>
        </div>
        <div className="h-[16px] flex items-center">
            <input 
                type="range" min={min} max={max} value={value} step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                className="m3-range w-full"
                disabled={disabled}
            />
        </div>
    </div>
);

export const M3Select: React.FC<{ 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    options: {label: string, value: string}[] 
}> = ({ label, value, onChange, options }) => (
    <div className="relative group">
        <div className="absolute -top-2 left-3 bg-[var(--surface-container)] px-1 z-10">
            <span className="text-[11px] font-medium text-[var(--primary)]">{label}</span>
        </div>
        <div className="relative w-full h-[48px] rounded-[8px] border border-[var(--outline-variant)] hover:border-[var(--on-surface)] has-[:focus]:border-2 has-[:focus]:border-[var(--primary)] transition-all bg-transparent">
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full px-3 pt-0 bg-transparent text-[var(--on-surface)] outline-none appearance-none cursor-pointer font-sans text-[14px]"
            >
                {options.map(o => <option key={o.value} value={o.value} className="bg-[var(--surface-container)] py-2">{o.label}</option>)}
            </select>
            {/* Dropdown Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-[20px]">arrow_drop_down</span>
            </div>
        </div>
    </div>
);

export const M3SegmentedButton: React.FC<{
    options: { label: string; value: string; icon?: string }[];
    value: string;
    onChange: (val: string) => void;
}> = ({ options, value, onChange }) => (
    <div className="flex w-full h-[40px] rounded-full border border-[var(--outline-variant)] overflow-hidden">
        {options.map((opt, i) => {
            const selected = value === opt.value;
            return (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 text-[13px] font-medium transition-colors relative
                        ${selected ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]' : 'bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--on-surface)]/5'}
                        ${i < options.length - 1 ? 'border-r border-[var(--outline-variant)]' : ''}
                    `}
                >
                    {selected && <span className="material-symbols-outlined text-[16px]">check</span>}
                    {!selected && opt.icon && <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>}
                    {!opt.icon && <span>{opt.label}</span>}
                </button>
            )
        })}
    </div>
);

export const M3TextInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="relative group">
        <div className="absolute -top-2 left-3 bg-[var(--surface-container)] px-1 z-10">
            <span className="text-[11px] font-medium text-[var(--primary)]">{label}</span>
        </div>
        <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[48px] rounded-[8px] border border-[var(--outline-variant)] hover:border-[var(--on-surface)] focus:border-2 focus:border-[var(--primary)] bg-transparent px-3 text-[14px] text-[var(--on-surface)] outline-none transition-all"
        />
    </div>
);
