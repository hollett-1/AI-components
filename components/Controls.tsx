
import React, { useState, useRef } from 'react';
import { AppState, UnitPreset, ThemeStyle, AmPmColorMode, SoundType, MotionPreset, ThemeVariant } from '../types';
import { UNIT_PRESETS, GLOBAL_PRESETS } from '../presets';
import { SHAPE_FILES } from '../constants';
import { 
    M3SectionTitle, 
    M3Switch, 
    M3ListItemSwitch, 
    M3Slider, 
    M3Select, 
    M3SegmentedButton, 
    M3TextInput 
} from './M3Components';
import { ShortcutsDialog } from './ShortcutsDialog';

const GRADIENT_COLORS = [
  '#2f80ed', // Blue
  '#00b4d8', // Teal
  '#00c853', // Green
  '#84cc16', // Yellow-Green
  '#ffd600', // Yellow
  '#ff6d00', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#aa00ff', // Purple
  '#6366f1', // Indigo
  '#2f80ed'  // Blue
];

const COLOR_PICKER_DOTS = [
  { pct: 0.06, size: 24 },
  { pct: 0.16, size: 14 },
  { pct: 0.22, size: 12 },
  { pct: 0.29, size: 28 },
  { pct: 0.32, size: 28 },
  { pct: 0.39, size: 14 },
  { pct: 0.46, size: 14 },
  { pct: 0.53, size: 30 },
  { pct: 0.61, size: 14 },
  { pct: 0.68, size: 30 },
  { pct: 0.71, size: 30 },
  { pct: 0.79, size: 12 },
  { pct: 0.83, size: 12 },
  { pct: 0.91, size: 24 }
];

const getColorAtPercentage = (p: number): string => {
    const clampedP = Math.max(0, Math.min(1, p));
    const index = clampedP * (GRADIENT_COLORS.length - 1);
    const i = Math.floor(index);
    const f = index - i;
    
    if (i >= GRADIENT_COLORS.length - 1) {
        return GRADIENT_COLORS[GRADIENT_COLORS.length - 1];
    }
    
    const color1 = GRADIENT_COLORS[i];
    const color2 = GRADIENT_COLORS[i + 1];
    
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + f * (r2 - r1));
    const g = Math.round(g1 + f * (g2 - g1));
    const b = Math.round(b1 + f * (b2 - b1));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

function findClosestPercentage(hex: string): number {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return 0.5;
    const rT = parseInt(hex.substring(1, 3), 16);
    const gT = parseInt(hex.substring(3, 5), 16);
    const bT = parseInt(hex.substring(5, 7), 16);

    let minDiff = Infinity;
    let bestPct = 0;

    for (let p = 0; p <= 1; p += 0.01) {
        const color = getColorAtPercentage(p);
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);

        const diff = Math.pow(r - rT, 2) + Math.pow(g - gT, 2) + Math.pow(b - bT, 2);
        if (diff < minDiff) {
            minDiff = diff;
            bestPct = p;
        }
    }
    return bestPct;
}

interface ColorPickerProps {
    value: string;
    onChange: (hex: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const currentPct = findClosestPercentage(value);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        updateColor(e);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (trackRef.current && e.buttons > 0) {
            updateColor(e);
        }
    };

    const updateColor = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        const color = getColorAtPercentage(pct);
        onChange(color);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Gradient Track */}
            <div 
                ref={trackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                className="h-10 w-full rounded-full cursor-pointer relative"
                style={{
                    background: `linear-gradient(to right, ${GRADIENT_COLORS.join(', ')})`,
                }}
            >
                {/* Active Indicator / Handle */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-md pointer-events-none"
                    style={{
                        left: `${currentPct * 100}%`,
                        backgroundColor: value,
                    }}
                />
            </div>

            {/* Dots */}
            <div className="flex justify-between items-center relative h-10 px-2 select-none">
                {COLOR_PICKER_DOTS.map((dot, idx) => {
                    const dotColor = getColorAtPercentage(dot.pct);
                    const isSelected = Math.abs(currentPct - dot.pct) < 0.02;
                    return (
                        <button
                            key={idx}
                            onClick={() => onChange(dotColor)}
                            className="rounded-full cursor-pointer transition-transform hover:scale-125 active:scale-95 absolute -translate-x-1/2 top-1/2 -translate-y-1/2 border border-black/10"
                            style={{
                                left: `${dot.pct * 100}%`,
                                width: `${dot.size}px`,
                                height: `${dot.size}px`,
                                backgroundColor: dotColor,
                                border: isSelected ? '2px solid var(--on-surface)' : undefined,
                                boxShadow: isSelected ? '0 0 8px rgba(0,0,0,0.3)' : undefined
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface ControlsProps {
  state: AppState;
  updateState: (updates: Partial<AppState>, saveUndo?: boolean) => void;
  randomize: () => void;
  onExport: () => void;
  isMobile: boolean;
  onToggleGui: () => void;
  canvasDimensions: { width: number; height: number };
  presets: any[];
  scrollZ: number;
  maxScroll: number;
}

export const Controls: React.FC<ControlsProps> = ({ state, updateState, randomize, onExport, isMobile, onToggleGui, canvasDimensions, presets, scrollZ, maxScroll }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Wrap updateState to automatically switch to 'custom' when specific settings are changed
  const handleSettingChange = (updates: Partial<AppState>, saveUndo = false) => {
      // If we are modifying the current preset's properties, switch to custom
      if (state.preset !== 'custom' && !updates.preset) {
          updateState({ ...updates, preset: 'custom' }, saveUndo);
      } else {
          updateState(updates, saveUndo);
      }
  };

  const handleNestedChange = <K extends keyof AppState>(
    section: K, 
    key: keyof AppState[K], 
    value: any
  ) => {
    // Fix: Assert that currentSection is an object to avoid "Spread types may only be created from object types"
    // as AppState contains both primitive and object types.
    const currentSection = state[section] as any;
    handleSettingChange({ 
      [section]: { ...currentSection, [key]: value } 
    } as Partial<AppState>);
  };

  const handleMotionPresetChange = (preset: MotionPreset) => {
      let stiffness = state.spring.stiffness;
      let damping = state.spring.damping;

      if (preset === 'standard') {
          stiffness = 700;
          damping = 0.9;
      } else if (preset === 'expressive') {
          stiffness = 380;
          damping = 0.8;
      }

      handleSettingChange({
          spring: {
              ...state.spring,
              preset,
              stiffness,
              damping
          }
      });
  };

  const handleExportChange = (key: keyof AppState['exportConfig'], value: any) => {
      const updates = { ...state.exportConfig, [key]: value };
      
      // Automatic Scale Override: If Include Whole Canvas is turned OFF, set Scale to 4.
      if (key === 'includeBackground' && value === false) {
          updates.scale = 4;
      }
      
      handleSettingChange({ exportConfig: updates });
  };

  const handleBackgroundImageChange = (key: keyof AppState['backgroundImage'], value: any) => {
      const updates = { ...state.backgroundImage, [key]: value };
      
      // Handle Proportional Scaling Logic
      if (state.backgroundImage.proportional) {
          if (key === 'scaleX') {
              updates.scaleY = value;
          } else if (key === 'scaleY') {
              updates.scaleX = value;
          }
      }
      
      handleSettingChange({ backgroundImage: updates });
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          if (e.target?.result) {
              const img = new Image();
              img.onload = () => {
                   handleSettingChange({ 
                      backgroundImage: { 
                          ...state.backgroundImage, 
                          url: e.target?.result as string,
                          x: 0,
                          y: 0,
                          scaleX: 0.5,
                          scaleY: 0.5,
                          proportional: true,
                          width: img.width,
                          height: img.height,
                          visible: true,
                          opacity: 1
                      },
                      mode: 'light',
                      style: 'baseline',
                      mockup: { enabled: true },
                      showScrim: true
                  });
              };
              img.src = e.target?.result as string;
          }
      };
      reader.readAsDataURL(file);
  };

  const handlePresetChange = (presetName: string) => {
      if (presetName === 'random') {
          randomize();
      } else if (presetName === 'custom') {
          updateState({ preset: 'custom' });
      } else {
          const preset = GLOBAL_PRESETS[presetName];
          if (preset) {
              // Explicitly default toggles that might be missing in the preset definition
              // to prevent "stuck" state from previous presets
              const cleanState: Partial<AppState> = {
                  hideInactive: false,
                  embeddedLabels: false,
                  showLabels: false,
                  showSeparators: true,
                  variableScroll: false,
                  isMono: false,
                  independentTypography: false,
                  showGuidelines: false,
                  showMeasurements: false,
                  showColorAnnotations: false,
                  showShadow: true,
                  showScrim: false,
                  showInputModeToggle: false,
                  showModalTitle: false,
                  modalTitle: 'Select Value',
                  customizeTimeIncrements: false,
                  timeIncrement: 1,
                  hapticsEnabled: true,
                  hapticIntensity: 0.5,
                  soundEnabled: true,
                  soundType: 'tick',
                  spring: { stiffness: 380, damping: 0.8, mass: 1, preset: 'expressive' },
                  variableScrollConfig: { rangeMultiplier: 1.5, easing: 1.0, invert: false, intensity: 1.0 },
                  exportConfig: { format: 'png', scale: 2, fps: 30, includeBackground: false },
                  mockup: { enabled: false },
                  backgroundImage: { url: null, x: 0, y: 0, scaleX: 1, scaleY: 1, proportional: true, opacity: 0.5, visible: true, width: 0, height: 0 },
                  primaryAction: { enabled: false, label: 'OK', showIcon: true, icon: 'check' },
                  secondaryAction: { enabled: false, label: 'Cancel' },
                  canvasShapes: state.canvasShapes || [],
                  ...preset,
                  preset: presetName
              };
              updateState(cleanState);
          }
      }
  };

  const handleAddShape = (shapeName: string) => {
      const width = 360;
      const height = 360;
      const x = canvasDimensions.width > 0 ? (canvasDimensions.width - width) / 2 : 150;
      const y = canvasDimensions.height > 0 ? (canvasDimensions.height - height) / 2 : 150;

      const newShape = {
          id: `shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: shapeName,
          x,
          y,
          width,
          height,
          color: '#0B57D0',
          cornerRadius: 0
      };
      handleSettingChange({
          canvasShapes: [...(state.canvasShapes || []), newShape],
          selectedShapeId: newShape.id
      }, true);
  };

  const handleDuplicateShape = (id: string) => {
      const shapes = state.canvasShapes || [];
      const source = shapes.find(s => s.id === id);
      if (!source) return;
      
      const newShape = {
          ...source,
          id: `shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          x: source.x + 20,
          y: source.y + 20
      };
      handleSettingChange({
          canvasShapes: [...shapes, newShape],
          selectedShapeId: newShape.id
      }, true);
  };

  const handleSavePreset = () => {
      const presetData = {
          name: "Custom Preset",
          shapes: state.canvasShapes || []
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presetData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `product_icon_preset_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleLoadPreset = (preset: any) => {
      const isGrid = preset.name === 'All Icons (Grid)' || preset.name === 'All Icons (Grid Glow)';
      console.log('handleLoadPreset:', preset.name, 'isGrid:', isGrid, 'canvasDimensions:', canvasDimensions);
      
      let gridCalculations: {
          cellSize: number;
          gap: number;
          startX: number;
          startY: number;
          columns: number;
      } | null = null;
      
      if (isGrid) {
          const columns = 4;
          const uniqueIconIndices = Array.from(new Set(preset.shapes.map((s: any) => s.iconIndex).filter((x: any) => x !== undefined)));
          const numIcons = uniqueIconIndices.length || 12;
          const rows = Math.ceil(numIcons / columns);
          const padding = 60;
          const availableWidth = canvasDimensions.width - padding * 2;
          const availableHeight = canvasDimensions.height - padding * 2;
          
          const calculatedCellSize = Math.max(60, Math.min(240, availableWidth / 4.75, availableHeight / 4.75));
          const gap = calculatedCellSize * 0.35;
          
          const gridWidth = columns * calculatedCellSize + (columns - 1) * gap;
          const gridHeight = rows * calculatedCellSize + (rows - 1) * gap;
          
          const startX = Math.max(20, (canvasDimensions.width - gridWidth) / 2);
          const startY = Math.max(20, (canvasDimensions.height - gridHeight) / 2);
          
          gridCalculations = {
              cellSize: calculatedCellSize,
              gap,
              startX,
              startY,
              columns
          };
      }

      const size = 360;
      const x = Math.max(10, Math.round((canvasDimensions.width - size) / 2));
      const y = Math.max(10, Math.round((canvasDimensions.height - size) / 2));

      const uniqueShapes = preset.shapes.map((s: any, idx: number) => {
          let shapeX = x;
          let shapeY = y;
          let shapeW = size;
          let shapeH = size;
          
          if (isGrid && gridCalculations) {
              const iconIdx = s.iconIndex ?? 0;
              const col = iconIdx % gridCalculations.columns;
              const row = Math.floor(iconIdx / gridCalculations.columns);
              
              shapeX = Math.round(gridCalculations.startX + col * (gridCalculations.cellSize + gridCalculations.gap));
              shapeY = Math.round(gridCalculations.startY + row * (gridCalculations.cellSize + gridCalculations.gap));
              shapeW = Math.round(gridCalculations.cellSize);
              shapeH = Math.round(gridCalculations.cellSize);
              if (idx % 10 === 0) {
                  console.log(`Shape mapping: idx=${idx}, iconIdx=${iconIdx}, col=${col}, row=${row}, x=${shapeX}, y=${shapeY}, size=${shapeW}`);
              }
          }
          
          return {
              ...s,
              id: `shape_preset_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
              x: shapeX,
              y: shapeY,
              width: shapeW,
              height: shapeH
          };
      });

      handleSettingChange({
          preset: preset.name,
          canvasShapes: uniqueShapes,
          selectedShapeId: null
      }, true);
  };

  const handleUpdateShape = (id: string, updates: Partial<any>, saveUndo = false) => {
      const updated = (state.canvasShapes || []).map(s => s.id === id ? { ...s, ...updates } : s);
      handleSettingChange({ canvasShapes: updated }, saveUndo);
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
      const shapes = [...(state.canvasShapes || [])];
      const index = shapes.findIndex(s => s.id === id);
      if (index === -1) return;
      const targetIndex = direction === 'up' ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= shapes.length) return;
      
      const temp = shapes[index];
      shapes[index] = shapes[targetIndex];
      shapes[targetIndex] = temp;
      handleSettingChange({ canvasShapes: shapes }, true);
  };

  const handleDeleteShape = (id: string) => {
      const filtered = (state.canvasShapes || []).filter(s => s.id !== id);
      const updates: Partial<AppState> = { canvasShapes: filtered };
      if (state.selectedShapeId === id) {
          updates.selectedShapeId = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
      }
      handleSettingChange(updates, true);
  };

  const downloadConfiguration = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `product_icon_gen_config_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };
  
  const handleActiveTypeChange = (key: keyof AppState['activeType'], value: number) => {
      const updates: Partial<AppState> = {
          activeType: { ...state.activeType, [key]: value }
      };
      
      // If typography is NOT independent, sync inactive settings to match active
      if (!state.independentTypography) {
          updates.inactiveType = { ...state.inactiveType, [key]: value };
      }
      
      handleSettingChange(updates);
  };
  
  // Custom Slider Logic for "1, 2, 3, 4, 5, 10, 15, 20, 30"
  // All factors of 60.
  const incrementOptions = [1, 2, 3, 4, 5, 10, 15, 20, 30];
  const incrementSliderValue = incrementOptions.indexOf(state.timeIncrement) !== -1 
      ? incrementOptions.indexOf(state.timeIncrement) 
      : 0;

  return (
    <aside className="w-full md:w-[400px] flex-shrink-0 bg-[var(--surface)] h-full overflow-y-auto flex flex-col z-50 shadow-2xl md:shadow-none font-sans subtle-scrollbar relative border-r-0">
      
      {/* Header */}
      <div className="px-5 pt-[14px] pb-6 bg-[var(--surface)] sticky top-0 z-20 bg-[var(--surface)]/95 backdrop-blur-sm flex items-center justify-between border-b-0">
        <div className="flex flex-col">
            <h1 
                className="text-[28px] leading-9 text-[var(--on-surface)] font-display tracking-tight"
                style={{ fontVariationSettings: "'wdth' 75, 'wght' 600" }}
            >
                Controls
            </h1>
        </div>
        
        {/* Mobile: Close Button | Desktop: Shortcuts Button */}
        {isMobile ? (
            <button 
                onClick={onToggleGui}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--surface-container-highest)] transition-colors"
                title="Close Controls"
            >
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
        ) : (
            <button 
                onClick={() => setShowShortcuts(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] transition-colors"
                title="Keyboard Shortcuts"
            >
                <span className="material-symbols-outlined">keyboard</span>
            </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 pb-12">



        {/* --- Style Card --- */}
        <div className="flex flex-col gap-4 p-5 rounded-[16px] bg-[var(--surface-container)]">
             <M3SectionTitle title="Theme" icon="palette" />
             <M3Switch label="Dark Theme" checked={state.mode === 'dark'} onChange={(c) => handleSettingChange({ mode: c ? 'dark' : 'light' })} />
        </div>

        {/* --- 3D & Glow Settings Card --- */}
        <div className="flex flex-col gap-4 p-5 rounded-[16px] bg-[var(--surface-container)]">
             <M3SectionTitle title="3D & Glow Settings" icon="blur_on" />
             
             <M3Switch 
                 label="Emit Glow (Global)" 
                 checked={state.globalGlowEnabled || false} 
                 onChange={(v) => handleSettingChange({ globalGlowEnabled: v })} 
             />
             
             {state.globalGlowEnabled && (
                 <M3Slider
                     label="Glow Intensity"
                     value={state.glowIntensityMultiplier !== undefined ? state.glowIntensityMultiplier : 1.0}
                     min={0.1}
                     max={2.5}
                     step={0.05}
                     onChange={(v) => handleSettingChange({ glowIntensityMultiplier: v })}
                 />
             )}
             
             {state.globalGlowEnabled && (
                 <>
                     <M3Switch 
                         label="Glow Bounce" 
                         checked={state.glowBounceEnabled || false} 
                         onChange={(v) => handleSettingChange({ glowBounceEnabled: v })} 
                     />
                     
                     {state.glowBounceEnabled && (
                         <M3Slider
                             label="Bounce Intensity"
                             value={state.glowBounceIntensity !== undefined ? state.glowBounceIntensity : 0.5}
                             min={0.1}
                             max={1.0}
                             step={0.05}
                             onChange={(v) => handleSettingChange({ glowBounceIntensity: v })}
                         />
                     )}
                 </>
             )}
             
             <div className="pt-2 border-t border-[var(--outline-variant)]/10" />
             
             <M3Slider
                 label="3D Depth Scroll"
                 value={scrollZ}
                 min={0}
                 max={maxScroll}
                 step={1}
                 onChange={(v) => {
                     handleSettingChange({ targetScrollZ: v });
                 }}
             />

             <div className="pt-2 border-t border-[var(--outline-variant)]/10" />

             <M3Switch
                 label="Step Axial Scatter"
                 checked={state.stepScatterEnabled || false}
                 onChange={(v) => handleSettingChange({ stepScatterEnabled: v })}
             />
        </div>

        {/* --- Presets Card --- */}
        <div className="flex flex-col gap-4 p-5 rounded-[16px] bg-[var(--surface-container)]">
             <M3SectionTitle title="Presets" icon="grid_view" />
             <div className="grid grid-cols-1 gap-2">
                 {presets.map((preset) => (
                     <button
                         key={preset.name}
                         onClick={() => handleLoadPreset(preset)}
                         className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[var(--surface-container-high)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)] active:scale-98 transition-all border border-[var(--outline-variant)]/10 text-left"
                     >
                         <img src={`./product-icons/${preset.icon}`} className="w-5 h-5 object-contain" alt={preset.name} />
                         <div className="flex flex-col">
                             <span className="text-sm font-semibold">{preset.name}</span>
                             <span className="text-xs text-[var(--on-surface-variant)]">{preset.shapes.length} layer{(preset.shapes.length > 1) ? 's' : ''}</span>
                         </div>
                     </button>
                 ))}
             </div>

             <div className="mt-2 pt-2 border-t border-[var(--outline-variant)]/10">
                 <M3Switch 
                     label="Scatter Z Depth" 
                     checked={state.scatterZ || false} 
                     onChange={(v) => handleSettingChange({ scatterZ: v })} 
                 />
             </div>
             
             {state.canvasShapes && state.canvasShapes.length > 0 && (
                 <button
                     onClick={handleSavePreset}
                     className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-[12px] bg-[var(--primary)] hover:bg-[var(--primary)]/95 text-[var(--on-primary)] active:scale-95 transition-all font-medium text-xs w-full"
                     title="Save current canvas shapes as preset JSON"
                 >
                     <span className="material-symbols-outlined text-[16px]">download</span>
                     Save Preset as JSON
                 </button>
             )}
        </div>

        {/* --- Shapes Card --- */}
        <div className="flex flex-col gap-4 p-5 rounded-[16px] bg-[var(--surface-container)]">
            <M3SectionTitle title="Shapes" icon="category" />
            
            {/* Shape Grid */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-widest ml-1">Add Shape</span>
                <div className="grid grid-cols-4 gap-2 bg-[var(--surface-container-highest)] p-2 rounded-[12px] max-h-[160px] overflow-y-auto subtle-scrollbar">
                    {SHAPE_FILES.map((shapeName) => (
                        <button
                            key={shapeName}
                            onClick={() => handleAddShape(shapeName)}
                            className="aspect-square flex items-center justify-center p-2 rounded-[8px] bg-[var(--surface-container)] hover:bg-[var(--primary-container)] active:scale-95 transition-all border border-[var(--outline-variant)]/20"
                            title={shapeName.replace('.svg', '')}
                        >
                            <img
                                src={`./Shapes/${shapeName}`}
                                alt={shapeName}
                                className="w-full h-full object-contain pointer-events-none select-none invert dark:invert-0 opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas Shapes Layers list */}
            {state.canvasShapes && state.canvasShapes.length > 0 && (
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-widest ml-1">Layers</span>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto subtle-scrollbar">
                        {[...state.canvasShapes].reverse().map((shape) => {
                            const isSelected = state.selectedShapeId === shape.id;
                            return (
                                <div
                                    key={shape.id}
                                    onClick={() => handleSettingChange({ selectedShapeId: shape.id })}
                                    className={`flex items-center justify-between p-3 rounded-[12px] cursor-pointer transition-all border ${isSelected ? 'bg-[var(--primary-container)] border-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border-transparent hover:bg-[var(--surface-container-high)]'}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div 
                                            className="w-8 h-8 rounded-[6px] border border-[var(--outline-variant)] flex-shrink-0 flex items-center justify-center bg-white dark:bg-zinc-800"
                                            style={{ borderColor: shape.color }}
                                        >
                                            <div 
                                                className="w-6 h-6"
                                                style={{
                                                    backgroundColor: shape.color,
                                                    maskImage: `url("./Shapes/${shape.name}")`,
                                                    maskSize: 'contain',
                                                    maskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                    WebkitMaskImage: `url("./Shapes/${shape.name}")`,
                                                    WebkitMaskSize: 'contain',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center'
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-[var(--on-surface)] truncate">
                                            {shape.name.replace('.svg', '')}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleMoveLayer(shape.id, 'up')}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)] active:scale-90 transition-transform"
                                            title="Bring Forward"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                                        </button>
                                        <button
                                            onClick={() => handleMoveLayer(shape.id, 'down')}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)] active:scale-90 transition-transform"
                                            title="Send Backward"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                                        </button>
                                        <button
                                            onClick={() => handleDuplicateShape(shape.id)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)] active:scale-90 transition-transform"
                                            title="Duplicate Layer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteShape(shape.id)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-90 transition-all ml-1"
                                            title="Delete Shape"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Shape Properties */}
            {(() => {
                const selectedShape = (state.canvasShapes || []).find(s => s.id === state.selectedShapeId);
                if (!selectedShape) return null;
                return (
                    <div className="flex flex-col gap-4 border-t border-[var(--outline-variant)]/20 pt-4 animate-in fade-in duration-200">
                        <span className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-widest ml-1">Shape Style</span>
                        
                        {/* Fill Type */}
                        <M3Select
                            label="Fill Type"
                            value={selectedShape.fillType || 'solid'}
                            onChange={(v) => handleUpdateShape(selectedShape.id, { fillType: v })}
                            options={[
                                { label: 'Solid Color', value: 'solid' },
                                { label: 'Linear Gradient', value: 'linear' },
                                { label: 'Radial Gradient', value: 'radial' }
                            ]}
                        />

                        {/* Solid Color Config */}
                        {(!selectedShape.fillType || selectedShape.fillType === 'solid') && (
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-[var(--on-surface-variant)] ml-1">Color</span>
                                <ColorPicker
                                    value={selectedShape.color}
                                    onChange={(c) => handleUpdateShape(selectedShape.id, { color: c })}
                                />
                            </div>
                        )}

                        {/* Gradient Config */}
                        {selectedShape.fillType && selectedShape.fillType !== 'solid' && (
                            <div className="flex flex-col gap-4 bg-[var(--surface-container-low)] p-3 rounded-[12px] border border-[var(--outline-variant)]/10">
                                {/* Start Color */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider ml-1">Start Color</span>
                                    <ColorPicker
                                        value={selectedShape.gradientColorStart || selectedShape.color}
                                        onChange={(c) => handleUpdateShape(selectedShape.id, { gradientColorStart: c })}
                                    />
                                    <M3Slider
                                        label="Start Opacity"
                                        value={selectedShape.gradientOpacityStart !== undefined ? selectedShape.gradientOpacityStart : 1}
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        onChange={(v) => handleUpdateShape(selectedShape.id, { gradientOpacityStart: v })}
                                    />
                                </div>

                                {/* End Color */}
                                <div className="flex flex-col gap-2 border-t border-[var(--outline-variant)]/20 pt-3">
                                    <span className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider ml-1">End Color</span>
                                    <ColorPicker
                                        value={selectedShape.gradientColorEnd || selectedShape.color}
                                        onChange={(c) => handleUpdateShape(selectedShape.id, { gradientColorEnd: c })}
                                    />
                                    <M3Slider
                                        label="End Opacity"
                                        value={selectedShape.gradientOpacityEnd !== undefined ? selectedShape.gradientOpacityEnd : 0}
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        onChange={(v) => handleUpdateShape(selectedShape.id, { gradientOpacityEnd: v })}
                                    />
                                </div>

                                {/* Linear Angle */}
                                {selectedShape.fillType === 'linear' && (
                                    <div className="border-t border-[var(--outline-variant)]/20 pt-3">
                                        <M3Slider
                                            label="Gradient Angle"
                                            value={selectedShape.gradientAngle !== undefined ? selectedShape.gradientAngle : 180}
                                            min={0}
                                            max={360}
                                            step={5}
                                            onChange={(v) => handleUpdateShape(selectedShape.id, { gradientAngle: v })}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Corner Radius Slider */}
                        <M3Slider
                            label="Corner Radius"
                            value={selectedShape.cornerRadius || 0}
                            min={0}
                            max={100}
                            step={1}
                            onChange={(v) => handleUpdateShape(selectedShape.id, { cornerRadius: v })}
                        />

                        {/* Glow Effect Toggle */}
                        <M3Switch
                            label="Glow Effect"
                            checked={selectedShape.hasGlow || false}
                            onChange={(v) => handleUpdateShape(selectedShape.id, { hasGlow: v })}
                        />

                        {/* Size sliders */}
                        <div className="grid grid-cols-2 gap-3">
                            <M3Slider
                                label="Width"
                                value={selectedShape.width}
                                min={20}
                                max={500}
                                step={5}
                                onChange={(v) => handleUpdateShape(selectedShape.id, { width: v })}
                            />
                            <M3Slider
                                label="Height"
                                value={selectedShape.height}
                                min={20}
                                max={500}
                                step={5}
                                onChange={(v) => handleUpdateShape(selectedShape.id, { height: v })}
                            />
                        </div>
                    </div>
                );
            })()}
        </div>





      </div>

      <ShortcutsDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </aside>
  );
};
