import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';

/* --- Dummy Material Components for Grid --- */
const M3Card = () => (
    <div className="bg-[var(--surface-container-high)] p-4 rounded-xl h-full flex flex-col gap-2 transition-transform hover:scale-[1.02] cursor-pointer">
        <div className="h-24 bg-[var(--primary-container)] rounded-lg w-full mb-1 opacity-80" />
        <div className="h-3 bg-[var(--on-surface)] rounded w-3/4 opacity-70" />
        <div className="h-3 bg-[var(--on-surface)] rounded w-1/2 opacity-50" />
    </div>
);

const M3Buttons = () => (
    <div className="flex flex-col gap-3 items-center justify-center h-full">
        <button className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95">Filled</button>
        <button className="h-10 px-6 rounded-full border border-[var(--outline)] text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/5 transition-colors">Outlined</button>
        <button className="h-10 px-6 rounded-full text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/10 transition-colors">Text Button</button>
    </div>
);

const M3TextFields = () => (
    <div className="flex flex-col gap-3 justify-center h-full px-4">
        <div className="h-14 rounded-t-lg bg-[var(--surface-container-highest)] border-b border-[var(--on-surface)] relative px-3 pt-2 group cursor-text">
            <span className="text-xs text-[var(--primary)]">Label</span>
            <div className="text-sm text-[var(--on-surface)]">Input text</div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary)] scale-x-0 group-hover:scale-x-100 transition-transform" />
        </div>
        <div className="h-14 rounded-lg border border-[var(--outline)] px-3 pt-2 relative hover:border-[var(--on-surface)] transition-colors cursor-text">
             <span className="text-xs bg-[var(--surface)] px-1 absolute -top-2 left-2 text-[var(--outline)]">Label</span>
             <div className="text-sm text-[var(--on-surface)] mt-1">Input text</div>
        </div>
    </div>
);

const M3Chips = () => (
    <div className="flex flex-wrap gap-2 justify-center content-center h-full px-4">
        <span className="h-8 px-3 rounded-lg bg-[var(--surface-container-highest)] border border-[var(--outline)] text-[var(--on-surface)] text-sm flex items-center hover:bg-[var(--surface-container-high)] cursor-pointer transition-colors">Assist</span>
        <span className="h-8 px-3 rounded-lg bg-[var(--primary-container)] text-[var(--on-primary-container)] text-sm flex items-center gap-1 hover:shadow transition-shadow cursor-pointer"><span className="material-symbols-outlined text-sm">check</span>Filter</span>
        <span className="h-8 px-3 rounded-lg border border-[var(--outline)] text-[var(--on-surface)] text-sm flex items-center hover:bg-[var(--on-surface)]/5 cursor-pointer">Input</span>
        <span className="h-8 px-3 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-sm flex items-center">Suggestion</span>
    </div>
);

const M3Toggles = () => {
    const [t1, setT1] = useState(true);
    const [t2, setT2] = useState(false);
    return (
        <div className="flex flex-col gap-4 items-center justify-center h-full">
            <div className="flex gap-4 items-center">
                <div onClick={() => setT1(!t1)} className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${t1 ? 'bg-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border border-[var(--outline)]'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${t1 ? 'right-1 bg-[var(--on-primary)]' : 'left-1 bg-[var(--outline)]'}`} />
                </div>
                <div onClick={() => setT2(!t2)} className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${t2 ? 'bg-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border border-[var(--outline)]'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${t2 ? 'right-1 bg-[var(--on-primary)]' : 'left-1 bg-[var(--outline)]'}`} />
                </div>
            </div>
            <div className="flex gap-4">
                <span className="material-symbols-outlined text-[var(--primary)] cursor-pointer">check_box</span>
                <span className="material-symbols-outlined text-[var(--on-surface-variant)] cursor-pointer">check_box_outline_blank</span>
            </div>
            <div className="flex gap-4">
                <span className="material-symbols-outlined text-[var(--primary)] cursor-pointer">radio_button_checked</span>
                <span className="material-symbols-outlined text-[var(--on-surface-variant)] cursor-pointer">radio_button_unchecked</span>
            </div>
        </div>
    );
};

const M3SliderDummy = () => (
    <div className="flex flex-col gap-6 items-center justify-center h-full w-full px-6">
        <div className="w-full h-1 bg-[var(--primary-container)] rounded relative group cursor-pointer">
            <div className="absolute left-0 top-0 h-full bg-[var(--primary)] w-1/2 rounded" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--primary)] rounded-full shadow group-hover:scale-125 transition-transform" />
        </div>
        <div className="w-full h-1 bg-[var(--surface-container-highest)] rounded relative group cursor-pointer">
            <div className="absolute left-0 top-0 h-full bg-[var(--primary)] w-3/4 rounded" />
            <div className="absolute left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--primary)] rounded-full shadow group-hover:scale-125 transition-transform" />
        </div>
    </div>
);

const M3FABs = () => (
    <div className="flex gap-4 items-center justify-center h-full">
        <button className="w-14 h-14 rounded-2xl bg-[var(--primary-container)] flex items-center justify-center text-[var(--on-primary-container)] shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-2xl">edit</span>
        </button>
        <button className="w-10 h-10 rounded-xl bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary)] shadow-sm hover:bg-[var(--surface-container-highest)] transition-colors">
            <span className="material-symbols-outlined text-lg">add</span>
        </button>
    </div>
);

const M3BottomNav = () => (
    <div className="flex items-end h-full w-full">
        <div className="w-full h-16 bg-[var(--surface-container)] flex items-center justify-around rounded-t-xl shadow-sm border-t border-[var(--outline-variant)]/20">
            <div className="flex flex-col items-center opacity-50 cursor-pointer hover:opacity-100"><span className="material-symbols-outlined">home</span><span className="text-[10px] font-medium">Home</span></div>
            <div className="flex flex-col items-center cursor-pointer"><div className="bg-[var(--primary-container)] w-14 h-8 rounded-full flex items-center justify-center mb-0.5"><span className="material-symbols-outlined text-[var(--on-primary-container)]">schedule</span></div><span className="text-[10px] font-medium text-[var(--on-surface)]">Time</span></div>
            <div className="flex flex-col items-center opacity-50 cursor-pointer hover:opacity-100"><span className="material-symbols-outlined">settings</span><span className="text-[10px] font-medium">Settings</span></div>
        </div>
    </div>
);

const M3Loading = () => (
    <div className="flex flex-col gap-6 items-center justify-center h-full w-full px-6">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--surface-container-highest)] border-t-[var(--primary)] animate-spin" />
        <div className="w-full h-1 bg-[var(--surface-container-highest)] rounded overflow-hidden">
            <div className="h-full bg-[var(--primary)] w-1/2 animate-pulse" />
        </div>
    </div>
);

const M3Toolbars = () => (
    <div className="flex flex-col h-full w-full justify-between bg-[var(--surface-container-low)] rounded-xl overflow-hidden border border-[var(--outline-variant)]/30">
        <div className="h-14 bg-[var(--surface)] flex items-center px-4 justify-between shadow-sm">
            <span className="material-symbols-outlined text-[var(--on-surface)]">menu</span>
            <span className="text-sm font-medium text-[var(--on-surface)]">Page Title</span>
            <span className="material-symbols-outlined text-[var(--on-surface)]">account_circle</span>
        </div>
        <div className="p-4 flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--surface-container-highest)]" />
            <div className="flex-1 space-y-2">
                <div className="h-2 bg-[var(--outline-variant)] rounded w-full opacity-50" />
                <div className="h-2 bg-[var(--outline-variant)] rounded w-2/3 opacity-50" />
            </div>
        </div>
    </div>
);

const M3DialogPreview = () => (
    <div className="flex items-center justify-center h-full w-full p-4">
        <div className="bg-[var(--surface-container-high)] p-4 rounded-[28px] w-full shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[var(--primary)]">
                <span className="material-symbols-outlined">info</span>
                <span className="text-sm font-bold">Alert</span>
            </div>
            <div className="h-2 bg-[var(--on-surface-variant)] rounded w-full opacity-40" />
            <div className="h-2 bg-[var(--on-surface-variant)] rounded w-4/5 opacity-40" />
            <div className="flex justify-end gap-2 mt-1">
                <span className="text-xs font-medium text-[var(--primary)]">Cancel</span>
                <span className="text-xs font-medium text-[var(--primary)]">OK</span>
            </div>
        </div>
    </div>
);

const M3List = () => (
    <div className="flex flex-col h-full w-full bg-[var(--surface)] rounded-xl overflow-hidden border border-[var(--outline-variant)]/30 py-2">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--surface-container-highest)] cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center text-xs font-bold">{String.fromCharCode(64+i)}</div>
                <div className="flex-1">
                    <div className="h-2 bg-[var(--on-surface)] rounded w-20 mb-1 opacity-80" />
                    <div className="h-1.5 bg-[var(--on-surface-variant)] rounded w-32 opacity-60" />
                </div>
            </div>
        ))}
    </div>
);

/* --- DRAGGABLE WRAPPER FOR GRID ITEMS --- */
const DraggableGridItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const currentOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent drag if clicking an input or button inside the dummy component
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') return;
        
        e.preventDefault();
        setIsDragging(true);
        startPos.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            setOffset({ x: currentOffset.current.x + dx, y: currentOffset.current.y + dy });
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            currentOffset.current = { x: currentOffset.current.x + dx, y: currentOffset.current.y + dy };
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div 
            className={`${className} transition-transform duration-75 ease-linear ${isDragging ? 'z-50 cursor-grabbing' : 'z-auto cursor-grab'}`}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            onMouseDown={handleMouseDown}
        >
            {children}
        </div>
    );
};

export const M3PreviewGrid: React.FC<{ state: AppState, children: React.ReactNode }> = ({ state, children }) => {
  return (
      <div className={`grid gap-4 p-4 w-full overflow-y-auto ${state.mockup.enabled ? 'grid-cols-2 max-w-[412px] max-h-[919px] gap-2 p-2' : 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 w-full max-w-none max-h-screen'}`}>
          {/* Row 1 */}
          <DraggableGridItem className="aspect-square"><M3Card /></DraggableGridItem>
          <DraggableGridItem className="aspect-square"><M3Buttons /></DraggableGridItem>
          <DraggableGridItem className="aspect-square"><M3TextFields /></DraggableGridItem>
          
          {/* Row 2 */}
          <DraggableGridItem className="aspect-square"><M3Chips /></DraggableGridItem>
          <DraggableGridItem className={`flex items-center justify-center z-20 min-w-min min-h-min ${state.mockup.enabled ? 'col-span-2 row-span-1' : 'col-span-2 row-span-2'}`}>
              {/* Center Content: Grid cell spans to allow content to be full size without squishing */}
              <div className="origin-center pointer-events-auto">
                  {children}
              </div>
          </DraggableGridItem>
          {!state.mockup.enabled && <DraggableGridItem className="aspect-square"><M3Toggles /></DraggableGridItem>}
          
          {/* Row 3 */}
          <DraggableGridItem className="aspect-square"><M3SliderDummy /></DraggableGridItem>
          {state.mockup.enabled && <DraggableGridItem className="aspect-square"><M3Toggles /></DraggableGridItem>}
          <DraggableGridItem className="aspect-square"><M3FABs /></DraggableGridItem>
          <DraggableGridItem className="aspect-square"><M3BottomNav /></DraggableGridItem>
          
          {/* Extra Components for Full Grid */}
          {!state.mockup.enabled && (
              <>
                <DraggableGridItem className="aspect-square"><M3Loading /></DraggableGridItem>
                <DraggableGridItem className="col-span-2 aspect-[2/1]"><M3Toolbars /></DraggableGridItem>
                <DraggableGridItem className="aspect-square"><M3DialogPreview /></DraggableGridItem>
                <DraggableGridItem className="aspect-[1/2] row-span-2"><M3List /></DraggableGridItem>
                <DraggableGridItem className="aspect-square"><M3Card /></DraggableGridItem>
              </>
          )}
      </div>
  );
};
