import React from 'react';

export const InfiniteGuideLines: React.FC = () => (
    <>
        <div className="absolute top-[-9999px] bottom-[-9999px] left-0 w-px border-l border-dashed border-cyan-500 opacity-50 pointer-events-none z-50" />
        <div className="absolute top-[-9999px] bottom-[-9999px] right-0 w-px border-r border-dashed border-cyan-500 opacity-50 pointer-events-none z-50" />
        <div className="absolute left-[-9999px] right-[-9999px] top-0 h-px border-t border-dashed border-cyan-500 opacity-50 pointer-events-none z-50" />
        <div className="absolute left-[-9999px] right-[-9999px] bottom-0 h-px border-b border-dashed border-cyan-500 opacity-50 pointer-events-none z-50" />
    </>
);

export const MeasureLabel: React.FC<{ text: string; className?: string; style?: React.CSSProperties; forceVisible?: boolean }> = ({ text, className, style, forceVisible }) => (
    <div 
        className={`absolute z-[100] text-[10px] font-mono font-bold text-pink-500 bg-white/90 dark:bg-black/90 px-1 rounded border border-pink-500 whitespace-nowrap pointer-events-none transition-opacity duration-200 ${forceVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${className}`}
        style={style}
    >
        {text}
    </div>
);

export const ColorLabel: React.FC<{ name: string; hex: string; style?: React.CSSProperties }> = ({ name, hex, style }) => (
    <div className="absolute flex flex-col items-start z-[70] pointer-events-none" style={style}>
        <div className="w-2 h-2 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }}></div>
        <div className="bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded mt-1 border border-white/20 shadow-xl backdrop-blur-md">
            <span className="block font-bold leading-none mb-0.5">{name}</span>
            <span className="opacity-70 leading-none uppercase">{hex}</span>
        </div>
    </div>
);