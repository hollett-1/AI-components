// Utility to generate MD3-like tonal palettes using HSL approximation
import { ThemeVariant } from '../types';

interface HSL {
    h: number;
    s: number;
    l: number;
}

// Convert Hex to HSL
const hexToHsl = (hex: string): HSL => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    const toHex = (x: number) => {
        const val = Math.min(255, Math.max(0, Math.round((x + m) * 255)));
        const hex = val.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Generate a tonal palette (10, 20, ..., 90, 100)
const generateTonalPalette = (h: number, s: number): Record<number, string> => {
    const tones: Record<number, string> = {};
    const toneLValues: Record<number, number> = {
        0: 0,
        4: 4,
        6: 6,
        10: 10,
        12: 12,
        17: 17,
        20: 20,
        22: 22,
        30: 30,
        40: 40,
        50: 50,
        60: 60,
        70: 70,
        80: 80,
        90: 90,
        92: 92,
        94: 94,
        95: 95,
        96: 96,
        98: 98,
        99: 99,
        100: 100
    };

    for (const [tone, lightness] of Object.entries(toneLValues)) {
        tones[Number(tone)] = hslToHex(h, s, lightness);
    }
    return tones;
};

export const generateThemeFromSeed = (hex: string, isDark: boolean, variant: ThemeVariant = 'tonal_spot'): Record<string, string> => {
    const hsl = hexToHsl(hex);
    
    // MD3 uses specific shifts for secondary/tertiary/neutral
    // This is an approximation
    let primaryPalette = generateTonalPalette(hsl.h, hsl.s);
    let secondaryPalette = generateTonalPalette(hsl.h, Math.max(10, hsl.s - 20));
    let tertiaryPalette = generateTonalPalette((hsl.h + 60) % 360, Math.max(10, hsl.s - 10));
    let neutralPalette = generateTonalPalette(hsl.h, Math.min(10, hsl.s * 0.1));
    let neutralVariantPalette = generateTonalPalette(hsl.h, Math.min(20, hsl.s * 0.3));

    if (variant === 'vibrant') {
        primaryPalette = generateTonalPalette(hsl.h, Math.min(100, hsl.s + 10));
        secondaryPalette = generateTonalPalette(hsl.h, Math.min(100, hsl.s + 5));
        tertiaryPalette = generateTonalPalette((hsl.h + 60) % 360, Math.min(100, hsl.s + 15));
    } else if (variant === 'expressive') {
        primaryPalette = generateTonalPalette((hsl.h + 240) % 360, hsl.s);
        secondaryPalette = generateTonalPalette((hsl.h + 120) % 360, hsl.s);
        tertiaryPalette = generateTonalPalette(hsl.h, hsl.s);
    } else if (variant === 'monochrome') {
        primaryPalette = generateTonalPalette(hsl.h, 0);
        secondaryPalette = generateTonalPalette(hsl.h, 0);
        tertiaryPalette = generateTonalPalette(hsl.h, 0);
        neutralPalette = generateTonalPalette(hsl.h, 0);
        neutralVariantPalette = generateTonalPalette(hsl.h, 0);
    } else if (variant === 'neutral') {
        primaryPalette = generateTonalPalette(hsl.h, 10);
        secondaryPalette = generateTonalPalette(hsl.h, 10);
        tertiaryPalette = generateTonalPalette(hsl.h, 10);
    }

    if (isDark) {
        return {
            primary: primaryPalette[80],
            onPrimary: primaryPalette[20],
            primaryContainer: primaryPalette[30],
            onPrimaryContainer: primaryPalette[90],
            
            secondary: secondaryPalette[80],
            onSecondary: secondaryPalette[20],
            secondaryContainer: secondaryPalette[30],
            onSecondaryContainer: secondaryPalette[90],
            
            tertiary: tertiaryPalette[80],
            onTertiary: tertiaryPalette[20],
            tertiaryContainer: tertiaryPalette[30],
            onTertiaryContainer: tertiaryPalette[90],
            
            surface: neutralPalette[6], // Surface on dark is very dark
            surfaceLowest: neutralPalette[4],
            surfaceContainerLow: neutralPalette[10],
            surfaceContainer: neutralPalette[12],
            surfaceContainerHigh: neutralPalette[17],
            surfaceContainerHighest: neutralPalette[22],
            
            outline: neutralVariantPalette[60],
            outlineVariant: neutralVariantPalette[30],
            
            onSurface: neutralPalette[90],
            onSurfaceVariant: neutralVariantPalette[80]
        };
    } else {
        return {
            primary: primaryPalette[40],
            onPrimary: primaryPalette[100],
            primaryContainer: primaryPalette[90],
            onPrimaryContainer: primaryPalette[10],
            
            secondary: secondaryPalette[40],
            onSecondary: secondaryPalette[100],
            secondaryContainer: secondaryPalette[90],
            onSecondaryContainer: secondaryPalette[10],
            
            tertiary: tertiaryPalette[40],
            onTertiary: tertiaryPalette[100],
            tertiaryContainer: tertiaryPalette[90],
            onTertiaryContainer: tertiaryPalette[10],
            
            surface: neutralPalette[98], // Surface on light is very light
            surfaceLowest: neutralPalette[100],
            surfaceContainerLow: neutralPalette[96],
            surfaceContainer: neutralPalette[94],
            surfaceContainerHigh: neutralPalette[92],
            surfaceContainerHighest: neutralPalette[90],
            
            outline: neutralVariantPalette[50],
            outlineVariant: neutralVariantPalette[80],
            
            onSurface: neutralPalette[10],
            onSurfaceVariant: neutralVariantPalette[30]
        };
    }
};
