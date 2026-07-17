
import { useEffect } from 'react';
import { ThemeMode, ThemeStyle, ThemeVariant } from '../types';
import { THEME_COLORS, THEME_COLORS_DARK } from '../themes';
import { generateThemeFromSeed } from '../utils/color';

export const useThemeInjection = (mode: ThemeMode, style: ThemeStyle, customColor: string, themeVariant: ThemeVariant = 'tonal_spot') => {
  useEffect(() => {
    const root = document.documentElement;
    
    let theme: Record<string, string>;
    if (style === 'custom') {
        theme = generateThemeFromSeed(customColor, mode === 'dark', themeVariant);
    } else if (themeVariant && themeVariant !== 'tonal_spot') {
        const baseTheme = mode === 'dark' ? THEME_COLORS_DARK[style] : THEME_COLORS[style];
        const seedColor = baseTheme.primary;
        theme = generateThemeFromSeed(seedColor, mode === 'dark', themeVariant);
    } else {
        theme = mode === 'dark' ? THEME_COLORS_DARK[style] : THEME_COLORS[style];
    }
    
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--on-primary', theme.onPrimary);
    root.style.setProperty('--primary-container', theme.primaryContainer);
    root.style.setProperty('--on-primary-container', theme.onPrimaryContainer);
    
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--on-secondary', theme.onSecondary);
    root.style.setProperty('--secondary-container', theme.secondaryContainer);
    root.style.setProperty('--on-secondary-container', theme.onSecondaryContainer);
    
    root.style.setProperty('--tertiary', theme.tertiary);
    root.style.setProperty('--on-tertiary', theme.onTertiary);
    root.style.setProperty('--tertiary-container', theme.tertiaryContainer);
    root.style.setProperty('--on-tertiary-container', theme.onTertiaryContainer);

    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--surface-lowest', theme.surfaceLowest);
    root.style.setProperty('--surface-container-low', theme.surfaceContainerLow);
    root.style.setProperty('--surface-container', theme.surfaceContainer);
    root.style.setProperty('--surface-container-high', theme.surfaceContainerHigh); 
    root.style.setProperty('--surface-container-highest', theme.surfaceContainerHighest);
    
    root.style.setProperty('--outline', theme.outline);
    root.style.setProperty('--outline-variant', theme.outlineVariant);
    
    // Prefer theme-specific onSurface, fallback to global defaults
    root.style.setProperty('--on-surface', theme.onSurface || (mode === 'dark' ? '#e3e3e3' : '#1b1b1f'));
    root.style.setProperty('--on-surface-variant', theme.onSurfaceVariant || (mode === 'dark' ? '#c4c7c5' : '#444746'));
    
    document.body.style.backgroundColor = theme.surface;
    document.body.style.color = theme.onSurface || (mode === 'dark' ? '#e3e3e3' : '#1b1b1f');

  }, [mode, style, customColor, themeVariant]);
};
