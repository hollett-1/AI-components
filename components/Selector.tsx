
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AppState, AmPmColorMode } from '../types';
import { UNIT_PRESETS } from '../presets';
import { THEME_COLORS, THEME_COLORS_DARK } from '../themes';
import { generateThemeFromSeed } from '../utils/color';
import { Column, ColumnHandle } from './Column';
import { InfiniteGuideLines, MeasureLabel, ColorLabel } from './Overlays';
import { useSpring } from '../hooks/useSpring';
import { GoogleGenAI } from "@google/genai";
import { NumPad } from './NumPad';

interface SelectorProps {
  state: AppState;
}

const AmPmButton: React.FC<{
    label: string;
    isSelected: boolean;
    top: number;
    width: number;
    height: number;
    fontSize: number;
    containerRadius: number;
    config: AppState['spring'];
    colorClasses: { bg: string, text: string, bgName: string, bgHex: string, textName: string, textHex: string };
    onClick: () => void;
    showGuidelines: boolean;
    showMeasurements: boolean;
    showColorAnnotations: boolean;
    isSquare: boolean;
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}> = ({ 
    label, 
    isSelected, 
    top, 
    width, 
    height,
    fontSize,
    containerRadius, 
    config, 
    colorClasses, 
    onClick,
    showGuidelines,
    showMeasurements,
    showColorAnnotations,
    isSquare,
    buttonRef,
    onKeyDown
}) => {
    const springConfig = useMemo(() => ({
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
        threshold: 0.1
    }), [config]);
    const targetRadius = isSelected ? containerRadius : height / 2;
    const radiusSpring = useSpring(targetRadius, springConfig);
    const activeOpacitySpring = useSpring(isSelected ? 1 : 0, springConfig);
    const inactiveOpacitySpring = useSpring(isSelected ? 0 : 1, springConfig);
    return (
        <button
            type="button"
            ref={buttonRef}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`absolute flex items-center justify-center transition-colors duration-200 cursor-pointer select-none font-display group/btn outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] rounded-[${targetRadius}px] ${isSelected ? 'z-20' : 'z-10'}`}
            style={{ top: `${top}px`, height: `${height}px`, width: `${width}px`, borderRadius: `${radiusSpring.value}px`, fontSize: `${fontSize}px` }}>
            <div className={`absolute inset-0 bg-[var(--surface-lowest)] z-0 pointer-events-none`} style={{ borderRadius: `${radiusSpring.value}px`, opacity: inactiveOpacitySpring.value }} />
            <div className={`absolute inset-0 ${colorClasses.bg} z-0 pointer-events-none`} style={{ borderRadius: `${radiusSpring.value}px`, opacity: activeOpacitySpring.value }} />
            <span className={`relative z-10 transition-colors duration-200 ${isSelected ? colorClasses.text + ' font-semibold' : 'text-[var(--on-surface-variant)] font-medium'}`}>{label}</span>
            {showGuidelines && <InfiniteGuideLines />}
            {showColorAnnotations && isSelected && (
                <ColorLabel name={colorClasses.bgName} hex={colorClasses.bgHex} style={{ position: 'absolute', top: 'calc(50% + 26px)', left: 'calc(50% + 12px)', transform: 'translateY(-50%)', zIndex: 200 }} />
            )}
            {showMeasurements && isSelected && (
                <>
                    <MeasureLabel text={`H: ${height}px`} style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} className="group-hover/btn:opacity-100" />
                    <MeasureLabel text={`W: ${width}px`} style={{ top: '-25px', left: '50%', transform: 'translateX(-50%)' }} className="group-hover/btn:opacity-100" />
                    <MeasureLabel text={`R: ${Math.round(radiusSpring.value)}px`} style={{ bottom: '-25px', left: '50%', transform: 'translateX(-50%)' }} className="group-hover/btn:opacity-100" />
                </>
            )}
        </button>
    );
};

export const Selector: React.FC<SelectorProps> = ({ state }) => {
  const [values, setValues] = useState<Record<number, string>>({});
  const [amPm, setAmPm] = useState('AM');
  const [isInputMode, setIsInputMode] = useState(false);
  const colRefs = useRef<(ColumnHandle | null)[]>([]);
  const amBtnRef = useRef<HTMLButtonElement>(null);
  const pmBtnRef = useRef<HTMLButtonElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [randomStartValues, setRandomStartValues] = useState<number[]>([10, 30, 0]);
  const prevPresetRef = useRef(state.preset);
  const prevUnitValues = useRef<Record<number, string>>({});
  const themeColors = state.style === 'custom' 
      ? generateThemeFromSeed(state.customColor, state.mode === 'dark') 
      : (state.mode === 'dark' ? THEME_COLORS_DARK[state.style] : THEME_COLORS[state.style]);
  const fullThemeColors = { onSurface: state.mode === 'dark' ? '#e3e3e3' : '#1b1b1f', onSurfaceVariant: state.mode === 'dark' ? '#c4c7c5' : '#444746', ...themeColors };

  useEffect(() => {
      if (state.preset !== 'custom' && state.preset !== prevPresetRef.current) {
          if (state.unit.includes('time')) {
              const h = Math.floor(Math.random() * 24);
              const m = Math.floor(Math.random() * 60);
              const s = Math.floor(Math.random() * 60);
              setRandomStartValues([h, m, s]);
              setAmPm(Math.random() > 0.5 ? 'PM' : 'AM');
          }
      }
      prevPresetRef.current = state.preset;
  }, [state.preset, state.unit]);

  useEffect(() => {
      if (!state.showInputModeToggle) setIsInputMode(false);
  }, [state.showInputModeToggle]);

  const performConversion = async (val: number, fromUnit: string, toUnit: string): Promise<number | null> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Convert ${val} ${fromUnit} to ${toUnit}. Return ONLY the numeric value, no text.`,
            });
            const text = response.text?.trim();
            const num = parseFloat(text || '');
            return isNaN(num) ? null : num;
        } catch (e) {
            console.error("Conversion failed", e);
            return null;
        }
  };

  useEffect(() => {
    if (state.unit === 'temp_c') {
        const unitColIdx = 1;
        const valColIdx = 0;
        const currentUnit = values[unitColIdx];
        const prevUnit = prevUnitValues.current[unitColIdx];
        if (currentUnit && prevUnit && currentUnit !== prevUnit) {
            const currentVal = parseFloat(values[valColIdx]);
            if (!isNaN(currentVal)) {
                performConversion(currentVal, prevUnit, currentUnit).then(newVal => {
                    if (newVal !== null && colRefs.current[valColIdx]) {
                        colRefs.current[valColIdx]?.scrollToValue(Math.round(newVal));
                    }
                });
            }
        }
        prevUnitValues.current[unitColIdx] = currentUnit;
    }
    if (state.unit === 'weight_lbs') {
        const unitColIdx = 2;
        const wholeColIdx = 0;
        const decColIdx = 1;
        const currentUnit = values[unitColIdx];
        const prevUnit = prevUnitValues.current[unitColIdx];
        if (currentUnit && prevUnit && currentUnit !== prevUnit) {
             const whole = parseFloat(values[wholeColIdx]) || 0;
             const dec = parseFloat(values[decColIdx]) || 0;
             const val = whole + (dec / 10);
             performConversion(val, prevUnit, currentUnit).then(newVal => {
                 if (newVal !== null) {
                     const newWhole = Math.floor(newVal);
                     const newDec = Math.round((newVal - newWhole) * 10);
                     colRefs.current[wholeColIdx]?.scrollToValue(newWhole);
                     colRefs.current[decColIdx]?.scrollToValue(newDec);
                 }
             });
        }
        prevUnitValues.current[unitColIdx] = currentUnit;
    }
  }, [values, state.unit]);

  const config = useMemo(() => {
      let c = UNIT_PRESETS[state.unit];
      if (c.type === 'time') {
          const increment = (state.customizeTimeIncrements && state.timeIncrement > 1) ? state.timeIncrement : 1;
          const cols = c.columns.map((col, idx) => {
              let newCol = { ...col, startValue: randomStartValues[idx] ?? col.startValue };
              if (increment > 1 && col.range && col.range[1] === 59) {
                   const options = [];
                   for (let i = col.range[0]; i <= col.range[1]; i += increment) {
                       options.push(col.padZero ? String(i).padStart(2, '0') : String(i));
                   }
                   newCol = { ...newCol, range: undefined, options: options };
                   if (newCol.startValue !== undefined) {
                       const nearest = Math.round(newCol.startValue / increment) * increment;
                       const valid = Math.min(Math.max(nearest, col.range[0]), Math.floor(col.range[1] / increment) * increment);
                       newCol.startValue = valid;
                   }
              }
              return newCol;
          });
          c = { ...c, columns: cols };
      }
      if (c.type === 'time' && state.unit.includes('hh')) {
          if (!state.is24Hour) {
              const columns = [...c.columns];
              let h = columns[0].startValue ?? 0;
              h = h % 12;
              if (h === 0) h = 12;
              columns[0] = { ...columns[0], range: [1, 12], startValue: h };
              c = { ...c, columns };
          }
      }
      return c;
  }, [state.unit, state.is24Hour, randomStartValues, state.timeIncrement, state.customizeTimeIncrements]);

  const handleValueChange = useCallback((idx: number, val: string) => {
      setValues(prev => ({ ...prev, [idx]: val }));
  }, []);

  const focusLastColumn = () => {
      let idx = config.columns.length - 1;
      while (idx >= 0) {
          if (!config.columns[idx].options) {
              colRefs.current[idx]?.focus();
              return;
          }
          idx--;
      }
  };

  const handleNext = (currentIndex: number) => {
      let nextIndex = currentIndex + 1;
      while (nextIndex < config.columns.length) {
          const colData = config.columns[nextIndex];
          if (!colData.options) {
              const ref = colRefs.current[nextIndex];
              if (ref) ref.focus();
              return;
          }
          nextIndex++;
      }
      if (showAmPm) amBtnRef.current?.focus();
      else if (state.showInputModeToggle) toggleBtnRef.current?.focus();
  };

  const handlePrev = (currentIndex: number) => {
      let prevIndex = currentIndex - 1;
      while (prevIndex >= 0) {
          const colData = config.columns[prevIndex];
          if (!colData.options) {
              const ref = colRefs.current[prevIndex];
              if (ref) ref.focus();
              return;
          }
          prevIndex--;
      }
  };

  const handleAmKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
          if (e.shiftKey) { e.preventDefault(); focusLastColumn(); }
          else { e.preventDefault(); pmBtnRef.current?.focus(); }
      }
  };

  const handlePmKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
          if (e.shiftKey) { e.preventDefault(); amBtnRef.current?.focus(); }
          else if (state.showInputModeToggle) { e.preventDefault(); toggleBtnRef.current?.focus(); }
      }
  };

  const handleToggleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          if (showAmPm) pmBtnRef.current?.focus();
          else focusLastColumn();
      }
  };

  const handleInputModeToggle = () => {
      const nextMode = !isInputMode;
      setIsInputMode(nextMode);
      if (nextMode && colRefs.current[0]) colRefs.current[0].focus();
  };

  const handleEditStart = () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      setIsInputMode(true);
  };
  const handleFocusEnter = () => { if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current); };
  const handleFocusLeave = (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
           blurTimeoutRef.current = setTimeout(() => setIsInputMode(false), 10);
      }
  };

  const isTimePicker = state.unit.includes('time');
  const showAmPm = isTimePicker && state.unit.includes('hh') && !state.is24Hour && state.amPm.enabled;
  const effectiveGap = Math.max(2, state.layout.gap);
  const buttonHeight = 40;
  const totalModalHeight = state.layout.height + (state.isModal ? state.modalPadding * 2 : 0) + ((state.primaryAction.enabled || state.secondaryAction.enabled || state.showInputModeToggle) ? (buttonHeight + 16) : 0);
  const colCount = config.columns.length;
  const totalColWidth = colCount * state.layout.width;
  const totalGapWidth = (colCount - 1) * effectiveGap;
  const amPmBtnWidth = state.amPm.isSquare ? state.amPm.buttonHeight : 50;
  let amPmWidth = 0;
  if (showAmPm) amPmWidth = amPmBtnWidth + state.amPm.containerGap + effectiveGap;
  const totalModalWidth = totalColWidth + totalGapWidth + amPmWidth + (state.isModal ? state.modalPadding * 2 : 0);

  const getAmPmColors = (mode: AmPmColorMode) => {
      switch (mode) {
          case 'primary': return { bg: 'bg-[var(--primary)]', text: 'text-[var(--on-primary)]', bgHex: themeColors.primary, textHex: themeColors.onPrimary, bgName: 'Primary', textName: 'On Primary' };
          case 'secondary': return { bg: 'bg-[var(--secondary)]', text: 'text-[var(--on-secondary)]', bgHex: themeColors.secondary, textHex: themeColors.onSecondary, bgName: 'Secondary', textName: 'On Secondary' };
          case 'tertiary': return { bg: 'bg-[var(--tertiary)]', text: 'text-[var(--on-tertiary)]', bgHex: themeColors.tertiary, textHex: themeColors.onTertiary, bgName: 'Tertiary', textName: 'On Tertiary' };
          case 'primary-container': return { bg: 'bg-[var(--primary-container)]', text: 'text-[var(--on-primary-container)]', bgHex: themeColors.primaryContainer, textHex: themeColors.onPrimaryContainer, bgName: 'Primary Container', textName: 'On Primary Container' };
          case 'secondary-container': return { bg: 'bg-[var(--secondary-container)]', text: 'text-[var(--on-secondary-container)]', bgHex: themeColors.secondaryContainer, textHex: themeColors.onSecondaryContainer, bgName: 'Secondary Container', textName: 'On Secondary Container' };
          case 'tertiary-container': return { bg: 'bg-[var(--tertiary-container)]', text: 'text-[var(--on-tertiary-container)]', bgHex: themeColors.tertiaryContainer, textHex: themeColors.onTertiaryContainer, bgName: 'Tertiary Container', textName: 'On Tertiary Container' };
          default: return { bg: 'bg-[var(--primary-container)]', text: 'text-[var(--on-primary-container)]', bgHex: themeColors.primaryContainer, textHex: themeColors.onPrimaryContainer, bgName: 'Primary Container', textName: 'On Primary Container' };
      }
  };

  const amPmColors = getAmPmColors(state.amPm.colorMode || 'primary-container');
  const amPmBtnHeight = state.amPm.buttonHeight;
  const amPmGap = state.amPm.buttonGap;
  const totalBtnsHeight = (amPmBtnHeight * 2) + amPmGap;
  let startY = 0;
  if (state.amPm.align === 'center') startY = (state.layout.height - totalBtnsHeight) / 2;
  else if (state.amPm.align === 'flex-end') startY = state.layout.height - totalBtnsHeight;

  const renderPickerContent = () => (
    <div className="flex items-start justify-center relative group" style={{ gap: `${effectiveGap}px` }}>
        {config.columns.map((col, idx) => (
            <React.Fragment key={idx}>
                {idx > 0 && state.showMeasurements && (
                    <div className="absolute top-0 bottom-0 w-[20px] z-50 group/gap cursor-help flex justify-center" style={{ left: `calc(${(idx * state.layout.width) + (idx * effectiveGap) - (effectiveGap / 2) - 10}px)` }}>
                         <div className="absolute top-0 bottom-0 w-px border-l border-pink-500 border-dashed" />
                         <MeasureLabel text={`Gap: ${effectiveGap}px`} style={{ bottom: '-25px' }} className="group-hover/gap:opacity-100" />
                    </div>
                )}
                {idx > 0 && state.showSeparators && !col.options && (
                        <div className="flex items-center justify-center h-full pb-3 text-[var(--outline)] transition-all duration-300 relative"
                            style={{ height: `${state.layout.height}px`, fontFamily: state.isMono ? 'Google Sans Mono' : 'Google Sans Flex', fontSize: `${state.activeType.size}px`, fontWeight: state.activeType.weight }}>
                            {config.separator}
                            {state.showColorAnnotations && <ColorLabel name="Outline" hex={themeColors.outline} style={{ top: 'calc(50% - 2px)', left: 'calc(50% + 20px)', transform: 'translate(-50%, -50%)' }} />}
                        </div>
                )}
                <Column ref={(el) => { colRefs.current[idx] = el; }} data={col} state={state} onValueChange={(val) => handleValueChange(idx, val)} initialValue={col.startValue} onNext={() => handleNext(idx)} onPrev={() => handlePrev(idx)} onEditStart={handleEditStart} showMeasurements={state.showMeasurements} showColorAnnotations={state.showColorAnnotations && idx === 0} themeColors={fullThemeColors} />
            </React.Fragment>
        ))}
        {showAmPm && (
            <div className="flex flex-col items-center relative group/ampm" style={{ height: `${state.layout.height}px`, marginLeft: `${state.amPm.containerGap}px`, width: `${amPmBtnWidth}px` }}>
                {state.showMeasurements && (
                    <div className="absolute top-auto bottom-0 left-0 h-[20px] w-full -ml-[4px] z-50 group/ampmgap cursor-help" style={{ width: `${state.amPm.containerGap}px`, marginLeft: `-${state.amPm.containerGap}px`, bottom: '0' }}>
                         <div className="absolute top-0 bottom-0 w-full border-t border-pink-500 border-dashed" style={{ bottom: '-25px' }} />
                         <MeasureLabel text={`Gap: ${state.amPm.containerGap}px`} style={{ bottom: '-25px', right: '0' }} className="group-hover/ampmgap:opacity-100" />
                    </div>
                )}
                {state.showGuidelines && <InfiniteGuideLines />}
                <AmPmButton buttonRef={amBtnRef} onKeyDown={handleAmKeyDown} label="AM" isSelected={amPm === 'AM'} onClick={() => setAmPm('AM')} top={startY} width={amPmBtnWidth} height={amPmBtnHeight} fontSize={state.amPm.fontSize} containerRadius={state.layout.containerRadius} config={state.spring} colorClasses={amPmColors} showGuidelines={state.showGuidelines} showMeasurements={state.showMeasurements} showColorAnnotations={state.showColorAnnotations} isSquare={state.amPm.isSquare} />
                <AmPmButton buttonRef={pmBtnRef} onKeyDown={handlePmKeyDown} label="PM" isSelected={amPm === 'PM'} onClick={() => setAmPm('PM')} top={startY + amPmBtnHeight + amPmGap} width={amPmBtnWidth} height={amPmBtnHeight} fontSize={state.amPm.fontSize} containerRadius={state.layout.containerRadius} config={state.spring} colorClasses={amPmColors} showGuidelines={state.showGuidelines} showMeasurements={state.showMeasurements} showColorAnnotations={state.showColorAnnotations} isSquare={state.amPm.isSquare} />
                 {state.showMeasurements && (
                     <div className="absolute left-1/2 w-full h-[20px] z-50 group/btngap flex items-center justify-center" style={{ top: `${startY + amPmBtnHeight}px`, height: `${state.amPm.buttonGap}px`, transform: 'translateX(-50%)' }}>
                          <div className="w-px h-full border-l border-pink-500 border-dashed" />
                          <MeasureLabel text={`${state.amPm.buttonGap}px`} style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} className="group-hover/btngap:opacity-100" />
                     </div>
                 )}
            </div>
        )}
    </div>
  );

  const renderModalContent = () => (
      <div id="selector-capture-target" onBlur={handleFocusLeave} onFocus={handleFocusEnter} className={`pointer-events-auto transition-all duration-300 flex flex-col items-center justify-center relative ${state.isModal ? 'bg-[var(--surface-container)] group/modal' : 'bg-transparent group/modal'} w-fit h-fit ${state.isModal && state.showShadow ? 'shadow-xl' : ''}`} style={{ padding: state.isModal ? `${state.modalPadding}px` : '0', borderRadius: state.isModal ? `${state.modalPadding + state.layout.containerRadius}px` : '0' }}>
           {state.showGuidelines && state.isModal && <InfiniteGuideLines />}
           {state.showColorAnnotations && state.isModal && <ColorLabel name="Surface Container" hex={themeColors.surfaceContainer} style={{ bottom: '4px', right: '80px' }} />}
           {state.isModal && state.showMeasurements && (
               <>
                    <MeasureLabel text={`Pad: ${state.modalPadding}px`} style={{ top: 'auto', bottom: '4px', left: '50%', transform: 'translateX(-50%)' }} forceVisible={state.showMeasurements} className="group-hover/modal:opacity-100" />
                    <MeasureLabel text={`W: ${totalModalWidth}px`} style={{ top: '-65px', left: '50%', transform: 'translateX(-50%)' }} forceVisible={state.showMeasurements} className="group-hover/modal:opacity-100" />
                    <MeasureLabel text={`H: ${totalModalHeight}px`} style={{ top: '50%', left: '-85px', transform: 'translateY(-50%)' }} forceVisible={state.showMeasurements} className="group-hover/modal:opacity-100" />
                    <div className="absolute top-0 left-0 border-l border-t border-pink-500 w-2 h-2" />
                    <div className="absolute top-0 right-0 border-r border-t border-pink-500 w-2 h-2" />
                    <div className="absolute bottom-0 left-0 border-l border-b border-pink-500 w-2 h-2" />
                    <div className="absolute bottom-0 right-0 border-r border-b border-pink-500 w-2 h-2" />
               </>
           )}
           {state.showModalTitle && <div className="w-full flex justify-start mb-1 p-[2px]"><span className="text-[var(--on-surface-variant)] text-[11px] leading-[16px] font-medium tracking-[0.5px]">{state.modalTitle}</span></div>}
          <div className="transform-none">{renderPickerContent()}</div>
          {(state.primaryAction.enabled || state.secondaryAction.enabled || state.showInputModeToggle) && (
              <div className="w-full flex justify-between items-center mt-4">
                  <div className="flex-1 flex justify-start">
                    {state.showInputModeToggle && (
                         <button type="button" ref={toggleBtnRef} onKeyDown={handleToggleKeyDown} onClick={handleInputModeToggle} className="group relative w-10 h-10 flex items-center justify-center rounded-full text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" title={isInputMode ? "Switch to Scroll" : "Switch to Keyboard Input"}>
                             <div className="absolute inset-0 rounded-full bg-[var(--on-surface-variant)] w-10 h-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200 z-0" />
                             <span className="material-symbols-outlined text-[24px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isInputMode ? 'swipe_vertical' : 'keyboard'}
                             </span>
                             {state.showColorAnnotations && <ColorLabel name="On Surface Variant" hex={fullThemeColors.onSurfaceVariant} style={{ top: '4px', left: '20px', zIndex: 200, width: 'max-content' }} />}
                         </button>
                    )}
                  </div>
                  <div className="flex flex-1 justify-end items-center gap-2">
                    {state.secondaryAction.enabled && <button type="button" className="flex items-center justify-center px-4 rounded-full transition-colors font-sans font-medium text-sm hover:bg-[var(--on-surface)]/10 text-[var(--primary)] h-[40px]">{state.secondaryAction.label}</button>}
                    {state.primaryAction.enabled && (
                        <button type="button" className="flex items-center justify-center gap-2 rounded-full transition-colors font-sans font-medium text-sm hover:bg-[var(--primary)]/10" style={{ height: '40px', color: 'var(--primary)', minWidth: state.amPm.enabled ? (state.amPm.isSquare ? `${state.amPm.buttonHeight}px` : '50px') : '60px', padding: '0 16px' }}>
                            {state.primaryAction.showIcon && <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{state.primaryAction.icon}</span>}
                            {(!state.primaryAction.showIcon || state.primaryAction.label !== 'OK') && state.primaryAction.label}
                            {state.primaryAction.showIcon && state.primaryAction.label === 'OK' && <span className="sr-only">{state.primaryAction.label}</span>}
                        </button>
                    )}
                  </div>
              </div>
          )}
      </div>
  );

  return (
    <div className="flex items-center justify-center h-full w-full transition-colors duration-500 bg-transparent pointer-events-none relative">
      {state.showScrim && !state.mockup.enabled && <div className="absolute inset-0 bg-black/[0.38] z-0 pointer-events-none w-full h-full" />}
      {state.mockup.enabled ? (
          <div className="relative w-[412px] h-[919px] rounded-[55px] border-[6px] border-[#383838] bg-transparent shadow-2xl flex flex-col items-center overflow-hidden ring-1 ring-white/20 pointer-events-auto box-border select-none z-10">
              {state.showScrim && <div className="absolute inset-0 bg-black/[0.38] z-0 pointer-events-none" />}
              <div className="absolute -right-[9px] top-[140px] w-[3px] h-[40px] bg-[#303030] rounded-r-md"></div>
              <div className="absolute -right-[9px] top-[200px] w-[3px] h-[70px] bg-[#303030] rounded-r-md"></div>
              <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden z-10">
                  <div className="scale-100">{renderModalContent()}</div>
                  {isInputMode && <NumPad />}
              </div>
          </div>
      ) : (
          <div className="w-full h-full flex items-center justify-center p-8 z-10 pointer-events-none">{renderModalContent()}</div>
      )}
    </div>
  );
};
