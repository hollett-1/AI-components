
import { AppState } from './types';

export const DEFAULT_STATE: AppState = {
  preset: 'All Icons (Grid)',
  unit: 'time_hh_mm',
  mode: 'light',
  style: 'baseline',
  themeVariant: (['vibrant', 'expressive', 'monochrome', 'neutral', 'tonal_spot'] as const)[Math.floor(Math.random() * 5)],
  customColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
  showSeparators: true,
  showLabels: false,
  hideInactive: false,
  embeddedLabels: false,
  variableScroll: false,
  labelYPosition: 50,
  isMono: false,
  independentTypography: true,
  is24Hour: false,
  isModal: true,
  modalPadding: 12,
  showGuidelines: false,
  showMeasurements: false,
  showColorAnnotations: false,
  showShadow: false,
  showScrim: false,
  showInputModeToggle: true,
  showModalTitle: false,
  modalTitle: 'Select Value',
  customizeTimeIncrements: false,
  timeIncrement: 1,
  hapticsEnabled: true,
  hapticIntensity: 0.5,
  soundEnabled: true,
  soundType: 'tick',
  spring: {
      stiffness: 380,
      damping: 0.8,
      mass: 1,
      preset: 'expressive'
  },
  layout: {
    gap: 0,
    width: 100,
    height: 120,
    itemHeight: 53,
    containerRadius: 16,
    highlightRadius: 12,
    roundedFrame: false,
  },
  activeType: { size: 56, width: 100, weight: 500 },
  inactiveType: { size: 36, width: 100, weight: 400, colorRole: 'outline' },
  amPm: {
    enabled: true,
    containerGap: 8,
    buttonGap: 8,
    buttonHeight: 56,
    fontSize: 16,
    isSquare: true,
    align: 'center',
    colorMode: 'primary-container'
  },
  variableScrollConfig: {
    rangeMultiplier: 1.5,
    easing: 1.0,
    invert: false,
    intensity: 0.3
  },
  exportConfig: {
    format: 'png',
    scale: 2,
    fps: 30,
    includeBackground: true
  },
  mockup: {
    enabled: false
  },
  backgroundImage: {
      url: null,
      x: 0,
      y: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      proportional: true,
      opacity: 1,
      visible: true,
      width: 824,
      height: 1834
  },
  primaryAction: {
      enabled: true,
      label: 'OK',
      showIcon: false,
      icon: 'check'
  },
  secondaryAction: {
      enabled: true,
      label: 'Cancel'
  },
  generativeBackground: {
      enabled: true,
      seed: Math.floor(Math.random() * 1000),
      particleType: 'material_shapes',
      isPlaying: false,
      auroraGlow: false,
      glowIntensity: 1.0,
      glowSpeed: 0.4,
      symbolScale: 1.0,
      isolateShape: true,
      glowThickness: 33.0,
      glowNoise: 50.0,
      glowPulse: 2.0,
      glowSoftness: 38.0,
      glowBackdropWidth: 4.0,
      glowCoreWidth: 0.35,
      glowSegmentLength: 160.0,
      glowSegmentGap: 220.0,
      glowCoreSoftness: 10.0
  },
  canvasShapes: [],
  selectedShapeId: null,
  scatterZ: false,
  globalGlowEnabled: false,
  glowBounceEnabled: false,
  glowIntensityMultiplier: 1.0,
  glowBounceIntensity: 0.5,
  targetScrollZ: 0,
  stepScatterEnabled: false
};

export const SHAPE_FILES = [
  'Clip path group.svg',
  'Mask group-1.svg',
  'Mask group-2.svg',
  'Mask group.svg',
  'Vector-1.svg',
  'Vector-2.svg',
  'Vector-3.svg',
  'Vector-4.svg',
  'Vector-5.svg',
  'Vector-6.svg',
  'Vector-7.svg',
  'Vector-8.svg',
  'Vector.svg',
  'shape-1.svg',
  'shape-2.svg',
  'shape-3.svg',
  'shape-4.svg',
  'shape-5.svg',
  'shape-6.svg',
  'shape-7.svg',
  'shape.svg'
];

export const PRODUCT_ICON_PRESETS_LIST = [
  { name: 'Calendar', filename: 'calendar_2026-192px.svg' },
  { name: 'Chat', filename: 'chat_2026-192px.svg' },
  { name: 'Docs', filename: 'docs_2026-192px.svg' },
  { name: 'Drive', filename: 'drive_2026-192px.svg' },
  { name: 'Forms', filename: 'forms_2026-192px.svg' },
  { name: 'Gmail', filename: 'gmail_2026-192px.svg' },
  { name: 'Keep', filename: 'keep_2026-192px.svg' },
  { name: 'Meet', filename: 'meet_2026-192px.svg' },
  { name: 'Sheets', filename: 'sheets_2026-192px.svg' },
  { name: 'Tasks', filename: 'tasks_2026-192px.svg' },
  { name: 'Vids', filename: 'vids_2026-192px.svg' },
  { name: 'Voice', filename: 'voice_2026-192px.svg' }
];
