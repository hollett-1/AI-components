
import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AppState, ColumnData } from '../types';
import { MeasureLabel, ColorLabel, InfiniteGuideLines } from './Overlays';
import { useSpring } from '../hooks/useSpring';

interface ColumnProps {
  data: ColumnData;
  state: AppState;
  onValueChange: (val: string) => void;
  initialValue?: string | number;
  onNext?: () => void;
  onPrev?: () => void;
  onEditStart?: () => void;
  showMeasurements?: boolean;
  showColorAnnotations?: boolean;
  themeColors?: Record<string, string>;
}

export interface ColumnHandle {
    focus: () => void;
    scrollToValue: (value: string | number) => void;
}

const MAX_OVERSCROLL = 100;
const REPEAT_COUNT = 80;

export const Column = forwardRef<ColumnHandle, ColumnProps>(({ data, state, onValueChange, initialValue, onNext, onPrev, onEditStart, showMeasurements, showColorAnnotations, themeColors }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Use a ref to prevent race conditions during value commitment
  const isCommitting = useRef(false);
  
  const measureRef = useRef<HTMLSpanElement>(null);
  const [caretPos, setCaretPos] = useState({ left: 0, visible: false });
  
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocityRef = useRef(0);
  
  const wheelTimeout = useRef<number | null>(null);
  const itemHeight = state.layout.itemHeight;
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
      if (state.soundEnabled && !audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
      }
  };

  const playClickSound = () => {
      if (!state.soundEnabled) return;
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      const now = ctx.currentTime;
      const type = state.soundType || 'tick';
      if (type === 'tick') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.start(now);
          osc.stop(now + 0.03);
      } else if (type === 'click') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
          gainNode.gain.setValueAtTime(0.08, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.05);
      } else if (type === 'beep') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          gainNode.gain.setValueAtTime(0.04, now);
          gainNode.gain.linearRampToValueAtTime(0.04, now + 0.03);
          gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.09);
      } else if (type === 'pop') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.06);
      }
  };

  const triggerHaptic = () => {
      if (state.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
          const intensity = state.hapticIntensity ?? 0.5;
          const duration = Math.max(5, Math.floor(intensity * 40));
          navigator.vibrate(duration);
      }
  };

  const baseItems = useMemo(() => {
    if (data.options) return data.options;
    if (data.range) {
      const arr = [];
      for (let i = data.range[0]; i <= data.range[1]; i++) {
        arr.push(data.padZero ? String(i).padStart(2, '0') : String(i));
      }
      return arr;
    }
    return [];
  }, [data]);

  const items = useMemo(() => {
    if (data.options && data.options.length < 5) return data.options;
    return Array(REPEAT_COUNT).fill(baseItems).flat();
  }, [baseItems, data.options]);

  const paddingHeight = (state.layout.height / 2) - (itemHeight / 2);
  const maxScroll = (items.length - 1) * itemHeight;

  const updateItemStyles = (scrollTop: number) => {
      const center = scrollTop + paddingHeight + (itemHeight / 2);
      const inactiveRole = state.inactiveType.colorRole || 'outline';
      const activeW = state.activeType.weight;
      const inactiveW = state.inactiveType.weight;
      const activeWidth = state.activeType.width;
      const inactiveWidth = state.inactiveType.width;
      const activeSize = state.activeType.size;
      const inactiveSize = state.inactiveType.size;
      const easing = state.variableScrollConfig.easing || 1.0;

      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
      const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + state.layout.height) / itemHeight) + 2);

      itemsRef.current.forEach((el, index) => {
          if (!el) return;
          if (index < startIndex || index > endIndex) {
              el.style.opacity = '0';
              return;
          }

          const itemCenter = (index * itemHeight) + paddingHeight + (itemHeight / 2);
          const distance = Math.abs(center - itemCenter);
          const maxDistance = itemHeight * 1.5;
          let intensity = 1 - Math.min(distance / maxDistance, 1);
          intensity = Math.pow(intensity, easing);
          const currentWeight = inactiveW + ((activeW - inactiveW) * intensity);
          const currentWidth = inactiveWidth + ((activeWidth - inactiveWidth) * intensity);
          const currentSize = inactiveSize + ((activeSize - inactiveSize) * intensity);
          let currentOpacity = 1;
          
          if (state.hideInactive) {
             const opacityMaxDistance = itemHeight * 0.5;
             const opacityIntensity = 1 - Math.min(distance / opacityMaxDistance, 1);
             currentOpacity = Math.pow(opacityIntensity, 2);
          }
          
          el.style.fontWeight = String(currentWeight);
          el.style.fontVariationSettings = `'wdth' ${currentWidth}`;
          el.style.fontSize = `${currentSize}px`;
          el.style.opacity = String(currentOpacity);
          
          if (distance < itemHeight / 4) {
             el.style.color = 'var(--on-surface)';
          } else {
             el.style.color = `var(--${inactiveRole})`;
          }
      });
  };

  const spring = useSpring(
      targetIndex * itemHeight, 
      {
          stiffness: state.spring.stiffness,
          damping: state.spring.damping,
          mass: state.spring.mass,
          threshold: 0.5
      }
  );

  const updateCaret = () => {
    if (inputRef.current && measureRef.current) {
        const val = inputRef.current.value;
        const selStart = inputRef.current.selectionStart ?? 0;
        const selEnd = inputRef.current.selectionEnd ?? 0;
        
        if (selStart !== selEnd) {
            setCaretPos({ ...caretPos, visible: false });
            return;
        }
        
        const textBefore = val.substring(0, selStart);
        measureRef.current.textContent = textBefore;
        const widthBefore = measureRef.current.getBoundingClientRect().width;
        measureRef.current.textContent = val;
        const totalWidth = measureRef.current.getBoundingClientRect().width;
        const inputWidth = inputRef.current.getBoundingClientRect().width;
        
        const startOfText = (inputWidth / 2) - (totalWidth / 2);
        setCaretPos({ left: startOfText + widthBefore, visible: true });
    }
  };

  useEffect(() => {
      if (isEditing) return;
      let scrollPos = spring.value;
      let overshoot = 0;
      if (scrollPos < 0) {
          overshoot = scrollPos;
          scrollPos = 0;
      } else if (scrollPos > maxScroll) {
          overshoot = scrollPos - maxScroll;
          scrollPos = maxScroll;
      }
      if (scrollRef.current) scrollRef.current.scrollTop = scrollPos;
      if (containerRef.current) {
         if (overshoot !== 0) {
             containerRef.current.style.transform = `translateY(${-overshoot * 0.4}px)`;
         } else {
             containerRef.current.style.transform = 'translateY(0px)';
         }
      }
      updateItemStyles(spring.value);
      const newIndex = Math.round(spring.value / itemHeight);
      const clamped = Math.max(0, Math.min(items.length - 1, newIndex));
      if (clamped !== activeIndex) setActiveIndex(clamped);
  }, [spring.value, isEditing, itemHeight, maxScroll]);

  const handlePointerDown = (e: React.PointerEvent) => {
      if (isEditing) return;
      isDragging.current = true;
      lastY.current = e.clientY;
      lastTime.current = performance.now();
      velocityRef.current = 0;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      spring.update(spring.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      e.preventDefault();
      const now = performance.now();
      const deltaY = lastY.current - e.clientY;
      const dt = now - lastTime.current;
      if (dt > 0) velocityRef.current = velocityRef.current * 0.8 + (deltaY / dt) * 0.2;
      lastY.current = e.clientY;
      lastTime.current = now;
      let effectiveDelta = deltaY;
      const currentScroll = spring.current;
      if (currentScroll < 0 || currentScroll > maxScroll) effectiveDelta *= 0.3;
      let newScroll = Math.max(-MAX_OVERSCROLL, Math.min(currentScroll + effectiveDelta, maxScroll + MAX_OVERSCROLL));
      spring.update(newScroll);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      const currentScroll = spring.current;
      let velocity = velocityRef.current * 1000;
      let newTargetIndex = 0;
      if (currentScroll < 0) {
          newTargetIndex = 0;
          if (velocity < 0) velocity = 0;
      } else if (currentScroll > maxScroll) {
          newTargetIndex = items.length - 1;
          if (velocity > 0) velocity = 0;
      } else {
          newTargetIndex = Math.round((currentScroll + velocityRef.current * 200) / itemHeight);
          newTargetIndex = Math.max(0, Math.min(items.length - 1, newTargetIndex));
      }
      setTargetIndex(newTargetIndex);
      setActiveIndex(newTargetIndex);
      const MAX_VELOCITY = 6000;
      velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
      spring.update(currentScroll, velocity); 
      spring.start();
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (isEditing) return;
      const currentScroll = spring.current; 
      let delta = e.deltaY;
      if (currentScroll < 0 || currentScroll > maxScroll) delta *= 0.3;
      let newScroll = Math.max(-MAX_OVERSCROLL, Math.min(currentScroll + delta, maxScroll + MAX_OVERSCROLL));
      spring.update(newScroll);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(() => {
          let newTargetIndex = Math.max(0, Math.min(items.length - 1, Math.round(newScroll / itemHeight)));
          setTargetIndex(newTargetIndex);
          setActiveIndex(newTargetIndex);
          spring.start();
      }, 60);
  };

  useEffect(() => {
     onValueChange(items[activeIndex]);
     playClickSound();
     triggerHaptic();
  }, [activeIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      let baseIndex = 0;
      if (initialValue !== undefined) {
          const strVal = String(initialValue);
          baseIndex = baseItems.findIndex(i => data.padZero ? Number(i) === Number(strVal) : i === strVal);
          if (baseIndex === -1) baseIndex = 0;
      } else if (data.startValue !== undefined) {
        const strVal = String(data.startValue);
        baseIndex = baseItems.findIndex(i => data.padZero ? Number(i) === Number(strVal) : i === strVal);
      }
      
      baseIndex = Math.max(0, Math.min(baseItems.length - 1, baseIndex));
      let finalIndex = baseIndex;
      if (items.length > baseItems.length) {
          finalIndex = (Math.floor(REPEAT_COUNT / 2) * baseItems.length) + baseIndex;
      }

      setActiveIndex(finalIndex);
      setTargetIndex(finalIndex);
      spring.update(finalIndex * itemHeight);
      updateItemStyles(finalIndex * itemHeight);
    }
  }, [baseItems, items]); 

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      requestAnimationFrame(() => {
          updateCaret();
      });
    }
  }, [isEditing]);

  const stopEditing = (finalVal?: string) => {
      if (!isEditing || isCommitting.current) return;
      isCommitting.current = true;
      setIsEditing(false);
      
      let valToParse = (finalVal !== undefined ? finalVal : inputValue).trim();
      if (!valToParse) valToParse = items[activeIndex];
      
      let newVal = parseInt(valToParse, 10);
      if (isNaN(newVal)) newVal = parseInt(items[activeIndex], 10);
      
      // Strict 12-hour clock normalization: Map 0 or 00 to 12 only if range is 1-12
      const isTypedZero = valToParse === "0" || valToParse === "00";
      if (isTypedZero && data.range && data.range[0] === 1 && data.range[1] === 12) {
          newVal = 12;
      }
      
      if (data.range) newVal = Math.max(data.range[0], Math.min(data.range[1], newVal));
      
      // Find the base index using numeric comparison
      let baseIndex = baseItems.findIndex(item => parseInt(item, 10) === newVal);
      
      if (baseIndex === -1) {
          const strVal = data.padZero ? String(newVal).padStart(2, '0') : String(newVal);
          baseIndex = baseItems.indexOf(strVal);
      }

      if (baseIndex !== -1) {
          const currentBlock = Math.floor(activeIndex / baseItems.length);
          const newIndex = (currentBlock * baseItems.length) + baseIndex;
          
          setActiveIndex(newIndex);
          setTargetIndex(newIndex);
          spring.update(newIndex * itemHeight);
          updateItemStyles(newIndex * itemHeight);
      }
      
      setTimeout(() => { isCommitting.current = false; }, 50);
  };

  useImperativeHandle(ref, () => ({
      focus: () => {
          if (data.options && data.options.length < 5) return;
          setInputValue(items[activeIndex]);
          setIsEditing(true);
          isCommitting.current = false;
          onEditStart?.();
      },
      scrollToValue: (val: string | number) => {
          const strVal = String(val);
          const baseIndex = baseItems.findIndex(i => data.padZero ? Number(i) === Number(strVal) : i === strVal);
          if (baseIndex !== -1) {
              const currentBlock = Math.floor(activeIndex / baseItems.length);
              const target = (currentBlock * baseItems.length) + baseIndex;
              setActiveIndex(target);
              setTargetIndex(target);
              spring.update(target * itemHeight);
              spring.start();
          }
      }
  }));
  
  const getInactiveColorHex = () => {
      const role = state.inactiveType.colorRole || 'outline';
      if (!themeColors) return '#747775';
      switch (role) {
          case 'outline': return themeColors.outline;
          case 'outline-variant': return themeColors.outlineVariant;
          case 'on-surface-variant': return themeColors.onSurfaceVariant;
          case 'on-surface': return themeColors.onSurface;
          default: return themeColors.outline;
      }
  };

  const getInactiveColorName = () => {
      const role = state.inactiveType.colorRole || 'outline';
      return role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex flex-col items-center gap-2 relative group">
        <span ref={measureRef} className="absolute opacity-0 pointer-events-none whitespace-pre"
            style={{ fontFamily: state.isMono ? 'Google Sans Mono' : 'Google Sans Flex', fontSize: `${state.activeType.size}px`, fontWeight: state.activeType.weight, letterSpacing: 'normal' }} />
        {state.embeddedLabels && !data.options && data.label && (
            <span className="absolute right-3 z-20 text-sm font-medium text-[var(--active-color)] pointer-events-none transition-all duration-300"
                style={{ top: `${state.labelYPosition}%`, transform: 'translateY(-50%)' }}>
                {data.label.replace('Minutes', 'min').replace('Seconds', 'sec').replace('Hours', 'hr')}
            </span>
        )}
        {showMeasurements && (
            <>
                <MeasureLabel text={`W: ${state.layout.width}px`} style={{ top: '-30px', left: '50%', transform: 'translateX(-50%)' }} />
                <MeasureLabel text={`H: ${state.layout.height}px`} style={{ top: '50%', right: '-50px', transform: 'translateY(-50%)' }} />
            </>
        )}
        {showColorAnnotations && themeColors && (
            <>
                <ColorLabel name="On Surface" hex={themeColors.onSurface} style={{ top: 'calc(50% + 14px)', left: 'calc(50% + 20px)', transform: 'translateY(-50%)', zIndex: 100 }} />
                <ColorLabel name={getInactiveColorName()} hex={getInactiveColorHex()} style={{ top: `calc(50% - ${itemHeight}px + 14px)`, left: 'calc(50% + 20px)', transform: 'translateY(-50%)', zIndex: 100 }} />
            </>
        )}
      <div className="relative" style={{ width: `${state.layout.width}px`, height: `${state.layout.height}px` }}>
          {state.showGuidelines && <InfiniteGuideLines />}
          <div className={`absolute inset-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isEditing ? `ring-2 ring-inset ring-[var(--primary)] ${state.showShadow ? 'shadow-md' : ''}` : ''}`}
            style={{ backgroundColor: 'var(--surface-lowest)', borderRadius: isEditing ? `${state.layout.roundedFrame ? Math.max(state.layout.width, state.layout.height) : state.layout.containerRadius}px` : `${state.layout.containerRadius}px` }}>
            {isEditing && (
                <>
                <input 
                    ref={inputRef} 
                    type="text" 
                    inputMode={state.mockup.enabled ? "none" : "numeric"} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-full bg-transparent text-center outline-none z-30 caret-transparent selection:bg-[Highlight] selection:text-[HighlightText]"
                    style={{ height: `${itemHeight}px`, fontFamily: state.isMono ? 'Google Sans Mono' : 'Google Sans Flex', fontSize: `${state.activeType.size}px`, fontWeight: state.activeType.weight, color: 'var(--on-surface)', paddingRight: state.embeddedLabels ? '30px' : '0' }}
                    value={inputValue} 
                    onChange={(e) => { 
                        const val = e.target.value; 
                        if (/^\d*$/.test(val)) { 
                            setInputValue(val); 
                            // Auto-advance strictly on 2nd character
                            if (val.length === 2 && onNext) { 
                                stopEditing(val); 
                                onNext?.(); 
                            } 
                        } 
                    }}
                    onSelect={updateCaret} 
                    onKeyUp={updateCaret} 
                    onClick={updateCaret} 
                    onInput={updateCaret} 
                    onBlur={() => stopEditing()}
                    onKeyDown={(e) => { 
                        if (e.key === 'Enter' || e.key === 'Escape') {
                            stopEditing(); 
                        } else if (e.key === 'Tab') { 
                            e.preventDefault(); 
                            stopEditing();
                            if (e.shiftKey) onPrev?.(); 
                            else onNext?.(); 
                        } 
                    }} 
                />
                {caretPos.visible && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-[3px] bg-[var(--primary)] rounded-full z-20 animate-m3-blink pointer-events-none"
                        style={{ height: `${state.activeType.size * 0.8}px`, left: `${caretPos.left}px`, transform: 'translateX(-50%) translateY(-50%)' }} />
                )}
                </>
            )}
            <div ref={scrollRef} className="h-full overflow-hidden touch-none scrollbar-hide" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onWheel={handleWheel}>
                <div ref={containerRef} className="will-change-transform">
                    <div style={{ height: `${paddingHeight}px` }} />
                    {items.map((item, idx) => (
                        <div key={idx} ref={el => { itemsRef.current[idx] = el }} className="flex items-center justify-center cursor-pointer select-none z-10 relative will-change-transform"
                            style={{
                                height: `${itemHeight}px`,
                                fontFamily: state.isMono ? 'Google Sans Mono' : 'Google Sans Flex',
                                fontSize: `${state.inactiveType.size}px`,
                                color: `var(--${state.inactiveType.colorRole || 'outline'})`,
                                opacity: (isEditing && idx === activeIndex) ? 0 : (isEditing ? 0 : (state.hideInactive ? 0 : 1)),
                                paddingRight: state.embeddedLabels && !data.options ? '30px' : '0',
                            }}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!isEditing) { 
                                    if (idx === activeIndex) {
                                        setInputValue(items[idx]);
                                        setIsEditing(true); 
                                    } else { 
                                        setActiveIndex(idx); 
                                        setTargetIndex(idx); 
                                        spring.update(idx * itemHeight); 
                                        spring.start(); 
                                    } 
                                } 
                            }}>
                            {item}
                        </div>
                    ))}
                    <div style={{ height: `${paddingHeight}px` }} />
                </div>
            </div>
          </div>
      </div>
      {!state.embeddedLabels && state.showLabels && data.label && (
        <div className="text-sm font-medium text-[var(--on-surface-variant)]">{data.label}</div>
      )}
    </div>
  );
});
