
export type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'baseline' | 'purple' | 'green' | 'red' | 'teal' | 'pink' | 'yellow' | 'aurora' | 'custom';
export type ThemeVariant = 'content' | 'expressive' | 'fidelity' | 'fidelity_unsafe' | 'fruit_salad' | 'monochrome' | 'neutral' | 'rainbow' | 'search' | 'tonal_spot' | 'vibrant';
export type UnitPreset = 'time_mm_ss' | 'time_hh_mm' | 'time_hh_mm_ss' | 'weight_lbs' | 'length_ft_in' | 'temp_c';
export type ExportFormat = 'png';
export type SoundType = 'tick' | 'click' | 'beep' | 'pop';
export type MotionPreset = 'standard' | 'expressive' | 'custom';

export type AmPmColorMode = 
    | 'primary' 
    | 'secondary' 
    | 'tertiary' 
    | 'primary-container' 
    | 'secondary-container' 
    | 'tertiary-container';

export interface TypographyConfig {
  size: number;
  width: number;
  weight: number;
  roundness?: number;
  colorRole?: 'outline' | 'outline-variant' | 'on-surface-variant' | 'on-surface';
}

export interface LayoutConfig {
  gap: number;
  width: number;
  height: number;
  itemHeight: number;
  containerRadius: number;
  highlightRadius: number;
  roundedFrame: boolean;
}

export interface AmPmConfig {
  enabled: boolean; // If 12h mode is on
  containerGap: number;
  buttonGap: number;
  buttonHeight: number;
  fontSize: number;
  isSquare: boolean;
  align: 'flex-start' | 'center' | 'flex-end';
  colorMode: AmPmColorMode; // NEW: Color combination for selected state
}

export interface VariableScrollConfig {
  rangeMultiplier: number;
  easing: number;
  invert: boolean;
  intensity: number;
}

export interface ExportConfig {
  format: ExportFormat;
  scale: number;
  fps: number;
  includeBackground: boolean;
}

export interface MockupConfig {
    enabled: boolean;
}

export interface BackgroundImageConfig {
    url: string | null;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    proportional: boolean;
    opacity: number;
    visible: boolean;
    width: number;
    height: number;
}

export interface PrimaryActionConfig {
    enabled: boolean;
    label: string;
    showIcon: boolean;
    icon: string;
}

export interface SecondaryActionConfig {
    enabled: boolean;
    label: string;
}

export interface SpringConfig {
    stiffness: number;
    damping: number;
    mass: number;
    preset: MotionPreset;
}

export interface GenerativeBackgroundConfig {
    enabled: boolean;
    seed: number;
    particleType: 'material_shapes';
    isPlaying?: boolean;
    auroraGlow?: boolean;
    glowIntensity?: number;
    glowSpeed?: number;
    symbolScale?: number;
    isolateShape?: boolean;
    glowThickness?: number;
    glowNoise?: number;
    glowPulse?: number;
    glowSoftness?: number;
    glowBackdropWidth?: number;
    glowCoreWidth?: number;
    glowSegmentLength?: number;
    glowSegmentGap?: number;
    glowCoreSoftness?: number;
    
    // Legacy properties kept optional for full backward compatibility
    divisions?: number;
    canvasSize?: number;
    lineOrientation?: 'horizontal' | 'vertical' | 'mix';
    patternType?: 'gradient_strips' | 'symbols_3d';
    useSymbols?: boolean;
    selectedSymbol?: string;
    motionStyle?: 'continuous' | 'steps';
    stripShape?: 'horizontal' | 'concentric' | 'shape-1' | 'shape-2' | 'shape-3' | 'shape-5' | 'shape-6' | 'shape-7' | 'shape-main';
    edgeGlow?: boolean;
    motionSpeed?: number;
    glowAmount?: number;
}

export interface AppState {
  // General
  preset: string;
  unit: UnitPreset;
  
  // Theme
  mode: ThemeMode;
  style: ThemeStyle;
  themeVariant?: ThemeVariant;
  customColor: string;
  
  // Toggles
  showSeparators: boolean;
  showLabels: boolean;
  hideInactive: boolean;
  embeddedLabels: boolean;
  variableScroll: boolean;
  labelYPosition: number;
  isMono: boolean;
  showGuidelines: boolean;
  showMeasurements: boolean;
  showColorAnnotations: boolean;
  showShadow: boolean;
  showScrim: boolean;
  showInputModeToggle: boolean;
  showModalTitle: boolean;
  modalTitle: string;
  
  // Increments
  customizeTimeIncrements: boolean;
  timeIncrement: number;

  // Motion
  spring: SpringConfig;

  // Feedback
  hapticsEnabled: boolean;
  hapticIntensity: number; // 0.0 to 1.0
  soundEnabled: boolean;
  soundType: SoundType;
  
  // Typography Behavior
  independentTypography: boolean;
  
  // Time Picker Specifics
  is24Hour: boolean;
  isModal: boolean;
  modalPadding: number;
  
  // Sub-configs
  layout: LayoutConfig;
  activeType: TypographyConfig;
  inactiveType: TypographyConfig;
  amPm: AmPmConfig;
  variableScrollConfig: VariableScrollConfig;
  exportConfig: ExportConfig;
  mockup: MockupConfig;
  backgroundImage: BackgroundImageConfig;
  primaryAction: PrimaryActionConfig;
  secondaryAction: SecondaryActionConfig;
  generativeBackground: GenerativeBackgroundConfig;
  canvasShapes: CanvasShape[];
  selectedShapeId?: string | null;
  scatterZ?: boolean;
  globalGlowEnabled?: boolean;
  glowBounceEnabled?: boolean;
  glowIntensityMultiplier?: number;
  glowBounceIntensity?: number;
  targetScrollZ?: number;
  stepScatterEnabled?: boolean;
}

export interface CanvasShape {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  cornerRadius: number;
  fillType?: 'solid' | 'linear' | 'radial';
  gradientColorStart?: string;
  gradientOpacityStart?: number;
  gradientColorEnd?: string;
  gradientOpacityEnd?: number;
  gradientAngle?: number;
  zOffset?: number;
  iconIndex?: number;
  localIndex?: number;
  gradientStops?: { color: string; opacity: number; offset: number }[];
  radialCenterX?: number;
  radialCenterY?: number;
  radialRadiusX?: number;
  radialRadiusY?: number;
  blur?: number;
  hasGlow?: boolean;
}

export interface ColumnData {
  range?: [number, number];
  options?: string[];
  label: string;
  padZero?: boolean;
  startValue?: number;
}

export interface PresetConfig {
  type?: 'weight' | 'temperature' | 'time';
  columns: ColumnData[];
  separator: string;
}
