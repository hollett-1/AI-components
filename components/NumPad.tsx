
import React from 'react';

interface NumPadProps {
    className?: string;
}

export const NumPad: React.FC<NumPadProps> = ({ className }) => {
    const handleTouch = (key: string) => {
        const active = document.activeElement as HTMLInputElement;
        if (active && active.tagName === 'INPUT') {
            const val = active.value;
            let newVal = val;
            
            if (key === 'backspace') {
                newVal = val.slice(0, -1);
            } else if (key === 'menu') {
                // Placeholder for menu action
                return;
            } else {
                newVal = val + key;
            }

            // Programmatically update input value and trigger events
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(active, newVal);
                const ev = new Event('input', { bubbles: true });
                active.dispatchEvent(ev);
            }
        }
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Reduced height from 72px to 60px
    const numberBtnClass = `
        h-[60px] w-full flex items-center justify-center 
        text-[28px] font-display font-extrabold text-[#004A77]
        bg-[#D3E3FD] rounded-[30px]
        transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]
        active:rounded-[12px] active:scale-[0.96] active:bg-[#C2E7FF]
        select-none outline-none
    `;

    return (
        <div 
            className={`w-full bg-[#F0F4F9] pt-1 pb-4 px-6 rounded-t-[40px] shadow-[0_-8px_32px_rgba(0,0,0,0.08)] absolute bottom-0 left-0 z-[100] flex flex-col items-center animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.1,0.8,0.2,1)] ${className}`}
            onMouseDown={(e) => e.preventDefault()} // Keep focus on the input
        >
             {/* Grab Handle - Reduced margins */}
             <div className="w-8 h-1 bg-[#444746] opacity-20 rounded-full mt-2 mb-4" />

             <div className="grid grid-cols-3 gap-x-3 gap-y-2 w-full max-w-[360px]">
                 {keys.map(k => (
                     <button
                        key={k}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleTouch(k)}
                        className={numberBtnClass}
                        style={{ fontVariationSettings: "'wght' 850, 'wdth' 100" }}
                     >
                         {k}
                     </button>
                 ))}

                 {/* Bottom Row - Consistent height with numbers */}
                 <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleTouch('menu')}
                    className="h-[60px] w-[60px] mx-auto flex items-center justify-center bg-white rounded-full transition-all active:scale-90 active:bg-gray-100 shadow-sm outline-none"
                 >
                     <span className="material-symbols-outlined text-[#444746] text-[24px]">more_vert</span>
                 </button>

                 <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleTouch('0')}
                    className={numberBtnClass}
                    style={{ fontVariationSettings: "'wght' 850, 'wdth' 100" }}
                 >
                     0
                 </button>

                 <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleTouch('backspace')}
                    className="h-[60px] w-[60px] mx-auto flex items-center justify-center bg-[#7FCFFF] rounded-full transition-all active:scale-90 active:bg-[#5bb8f0] shadow-sm outline-none group"
                 >
                     <span className="material-symbols-outlined text-[#003355] text-[24px] font-bold">backspace</span>
                 </button>
             </div>

             {/* Android Navigation Bar Indicator - Tightened margin */}
             <div className="w-32 h-1 bg-black rounded-full mt-4 opacity-90" />
        </div>
    );
};
