
import { AppState, PresetConfig } from './types';

export const UNIT_PRESETS: Record<string, PresetConfig> = {
  time_mm_ss: {
    type: 'time',
    columns: [
      { range: [0, 59], label: 'Minutes', padZero: true },
      { range: [0, 59], label: 'Seconds', padZero: true }
    ],
    separator: ':'
  },
  time_hh_mm: {
    type: 'time',
    columns: [
      { range: [0, 23], label: 'Hours', padZero: true },
      { range: [0, 59], label: 'Minutes', padZero: true }
    ],
    separator: ':'
  },
  time_hh_mm_ss: {
    type: 'time',
    columns: [
      { range: [0, 23], label: 'Hours', padZero: true },
      { range: [0, 59], label: 'Minutes', padZero: true },
      { range: [0, 59], label: 'Seconds', padZero: true }
    ],
    separator: ':'
  },
  weight_lbs: {
    type: 'weight',
    columns: [
      { range: [0, 300], label: 'Weight', padZero: false, startValue: 150 },
      { range: [0, 9], label: '', padZero: false },
      { options: ['lbs', 'kgs'], label: 'Unit' }
    ],
    separator: '.'
  },
  length_ft_in: {
    columns: [
      { range: [0, 100], label: 'Feet', padZero: false, startValue: 5 },
      { range: [0, 11], label: 'Inches', padZero: false, startValue: 8 }
    ],
    separator: "'"
  },
  temp_c: {
    type: 'temperature',
    columns: [
      { range: [-50, 150], label: 'Temp', padZero: false, startValue: 22 },
      { options: ['°C', '°F'], label: 'Unit' }
    ],
    separator: ''
  }
};

export const REFERENCE_IMAGE_PRESETS = [
    { label: 'Custom / Upload', value: 'custom', url: '' },
    { label: 'G Leads prezo', value: 'g_leads_prezo', url: '/assets/g_leads_prezo.png' }, 
    { label: 'Alarm List', value: 'alarm_list', url: '/assets/alarm_list.png' },
    { label: 'December Calendar', value: 'december_calendar', url: '/assets/december_calendar.png' },
];

export const GLOBAL_PRESETS: Record<string, Partial<AppState>> = {
  // 1. Expressive (Light)
  preset_1: {
    mode: 'light',
    style: 'baseline',
    unit: 'time_hh_mm',
    showSeparators: true,
    showLabels: false,
    embeddedLabels: false,
    variableScroll: false,
    hideInactive: false,
    isModal: true,
    labelYPosition: 50,
    modalPadding: 12,
    showGuidelines: false,
    showMeasurements: false,
    showColorAnnotations: false,
    showShadow: false,
    showScrim: false,
    showInputModeToggle: true,
    showModalTitle: false,
    modalTitle: 'Select Time',
    customizeTimeIncrements: false,
    timeIncrement: 1,
    hapticsEnabled: true,
    soundEnabled: true,
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
    isMono: false,
    independentTypography: true,
    amPm: { enabled: true, containerGap: 8, buttonGap: 8, buttonHeight: 56, fontSize: 16, isSquare: true, align: 'center', colorMode: 'primary-container' },
    variableScrollConfig: { rangeMultiplier: 1.5, easing: 1.0, invert: false, intensity: 0.3 },
    exportConfig: { format: 'png', scale: 2, fps: 30, includeBackground: true },
    mockup: { enabled: false },
    backgroundImage: { url: null, x: 0, y: 0, scaleX: 0.5, scaleY: 0.5, proportional: true, opacity: 1, visible: true, width: 824, height: 1834 },
    primaryAction: { enabled: true, label: 'OK', showIcon: false, icon: 'check' },
    secondaryAction: { enabled: true, label: 'Cancel' }
  },
  // 2. Expressive (Dark)
  preset_2: {
    mode: 'dark',
    style: 'baseline',
    unit: 'time_hh_mm',
    showSeparators: true,
    showLabels: false,
    embeddedLabels: false,
    variableScroll: false,
    hideInactive: false,
    isModal: true,
    labelYPosition: 50,
    modalPadding: 12,
    showGuidelines: false,
    showMeasurements: false,
    showColorAnnotations: false,
    showShadow: false,
    showScrim: false,
    showInputModeToggle: true,
    showModalTitle: false,
    modalTitle: 'Select Time',
    customizeTimeIncrements: false,
    timeIncrement: 1,
    hapticsEnabled: true,
    soundEnabled: true,
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
    isMono: false,
    independentTypography: true,
    amPm: { enabled: true, containerGap: 8, buttonGap: 8, buttonHeight: 56, fontSize: 16, isSquare: true, align: 'center', colorMode: 'primary-container' },
    variableScrollConfig: { rangeMultiplier: 1.5, easing: 1.0, invert: false, intensity: 0.3 },
    exportConfig: { format: 'png', scale: 2, fps: 30, includeBackground: true },
    mockup: { enabled: false },
    backgroundImage: { url: null, x: 0, y: 0, scaleX: 0.5, scaleY: 0.5, proportional: true, opacity: 1, visible: true, width: 824, height: 1834 },
    primaryAction: { enabled: true, label: 'OK', showIcon: false, icon: 'check' },
    secondaryAction: { enabled: true, label: 'Cancel' }
  }
};
