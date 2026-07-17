import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { generateThemeFromSeed } from '../utils/color';
import { THEME_COLORS, THEME_COLORS_DARK } from '../themes';
import { useSpring } from '../hooks/useSpring';

const PRODUCT_ICONS = [
  'calendar_2026-192px.svg',
  'chat_2026-192px.svg',
  'docs_2026-192px.svg',
  'drive_2026-192px.svg',
  'forms_2026-192px.svg',
  'gemini_2026-192px.svg',
  'gmail_2026-192px.svg',
  'keep_2026-192px.svg',
  'meet_2026-192px.svg',
  'sheets_2026-192px.svg',
  'tasks_2026-192px.svg',
  'vids_2026-192px.svg',
  'voice_2026-192px.svg'
];

const GOOGLE_SYMBOLS = [
  'star', 'favorite', 'home', 'settings', 'search', 'person', 'mail', 'notifications',
  'share', 'delete', 'edit', 'info', 'help', 'calendar_today', 'chat', 'camera',
  'image', 'music_note', 'shopping_cart', 'map', 'explore', 'bolt', 'spa', 'pets',
  'work', 'grade', 'sunny', 'umbrella', 'eco', 'diamond'
];

const SHAPE_KEYS = ['shape-1', 'shape-2', 'shape-3', 'shape-5', 'shape-6', 'shape-7', 'shape-main'];

function seededRandom(seed: number) {
    let currentSeed = seed;
    return function() {
        const x = Math.sin(currentSeed++) * 10000;
        return x - Math.floor(x);
    };
}

interface CanvasItem {
    id: number;
    x: number;
    y: number;
    z: number;
    rotSpeed: number;
    baseAngle: number;
    iconName: string;
    symbolName: string;
    shapeKey: string;
    colorType: 'primary' | 'secondary' | 'tertiary' | 'accent';
    scaleFactor: number;
}

const generateCanvases = (seed: number, count: number): CanvasItem[] => {
    const rng = seededRandom(seed);
    const items: CanvasItem[] = [];
    for (let i = 0; i < count; i++) {
        items.push({
            id: i,
            x: (rng() - 0.5) * 1400, // range [-700, 700]
            y: (rng() - 0.5) * 1400, // range [-700, 700]
            z: rng() * -1000 - 50,   // depth from -1050 to -50
            rotSpeed: (rng() - 0.5) * 2,
            baseAngle: rng() * 360,
            iconName: PRODUCT_ICONS[Math.floor(rng() * PRODUCT_ICONS.length)],
            symbolName: GOOGLE_SYMBOLS[Math.floor(rng() * GOOGLE_SYMBOLS.length)],
            shapeKey: SHAPE_KEYS[Math.floor(rng() * SHAPE_KEYS.length)],
            colorType: (['primary', 'secondary', 'tertiary', 'accent'][Math.floor(rng() * 4)] as any),
            scaleFactor: 0.5 + rng() * 0.6
        });
    }
    return items;
};


const CUSTOM_SHAPES: Record<string, { d: string; w: number; h: number; label: string }> = {
    'shape-1': {
        label: 'Blob 1',
        w: 320, h: 290,
        d: 'M232.422 59.9068C223.213 45.2936 213.84 30.4777 201.389 18.8739C188.938 7.24119 172.808 -0.97696 156.27 0.0937147C141.748 1.04864 128.288 9.09317 117.662 19.5974C107.036 30.1015 98.7807 43.0365 90.6614 55.8556C68.7011 90.4645 46.7136 125.073 24.7533 159.711C14.3181 176.147 3.61045 193.307 0.722376 212.898C-2.76511 236.568 6.63475 260.673 23.3093 276.415C40.7467 292.88 69.0008 291.549 90.2254 287.035C113.493 282.086 136.244 272.797 159.975 272.797C180.301 272.797 199.945 279.685 219.726 284.691C239.479 289.668 260.704 292.735 279.776 285.327C303.453 276.154 320.454 250.082 319.991 223.315C319.555 198.892 293.508 156.759 293.508 156.759C293.508 156.759 252.78 92.1937 232.422 59.9068Z'
    },
    'shape-2': {
        label: 'Blob 2',
        w: 303, h: 312,
        d: 'M0 79.3221C0 35.5137 35.5137 0 79.3221 0H222.928C266.736 0 302.25 35.5137 302.25 79.3221C302.25 115.45 278.097 145.937 245.057 155.516C244.842 155.579 244.692 155.776 244.692 156C244.692 156.224 244.842 156.421 245.057 156.484C278.097 166.063 302.25 196.55 302.25 232.678C302.25 276.486 266.736 312 222.928 312H79.3221C35.5137 312 0 276.486 0 232.678C0 196.785 23.8388 166.461 56.547 156.674C56.845 156.585 57.0514 156.311 57.0514 156C57.0514 155.689 56.845 155.415 56.547 155.326C23.8388 145.539 0 115.214 0 79.3221Z'
    },
    'shape-3': {
        label: 'Ghost',
        w: 300, h: 300,
        d: 'M0 142.857C0 63.9593 67.1573 0 150 0C232.843 0 300 63.9593 300 142.857L300 242.857C300 274.416 273.137 300 240 300C230.178 300 220.907 297.752 212.724 293.768C208.554 291.737 204.394 289.512 200.216 287.277C185.513 279.411 170.592 271.429 154.27 271.429H145.73C129.408 271.429 114.487 279.411 99.7841 287.277C95.6062 289.512 91.4459 291.737 87.276 293.768C79.0926 297.752 69.8219 300 60 300C26.8629 300 0 274.416 0 242.857L0 142.857Z'
    },
    'shape-5': {
        label: 'Vase Shape',
        w: 296, h: 296,
        d: 'M21.0014 148C7.89536 132.339 0 112.126 0 90.0596C0 40.321 40.1131 0 89.5951 0C111.99 0 132.466 8.2594 148.173 21.9131C163.843 8.2594 184.271 0 206.614 0C255.981 0 296 40.321 296 90.0596C296 112.126 288.123 132.339 275.048 148C288.123 163.661 296 183.874 296 205.94C296 255.679 255.981 296 206.614 296C184.271 296 163.843 287.741 148.173 274.087C132.466 287.741 111.99 296 89.5951 296C40.1131 296 0 255.679 0 205.94C0 183.874 7.89536 163.661 21.0014 148Z'
    },
    'shape-6': {
        label: 'Organic Squiggle',
        w: 292, h: 292,
        d: 'M186.389 6.47298C249.109 -20.7672 312.767 42.8908 285.527 105.611L281.023 115.981C272.707 135.13 272.707 156.87 281.023 176.019L285.527 186.389C312.767 249.109 249.109 312.767 186.389 285.527L176.019 281.023C156.87 272.707 135.13 272.707 115.981 281.023L105.611 285.527C42.8908 312.767 -20.7672 249.109 6.47299 186.389L10.9768 176.019C19.2934 156.87 19.2934 135.13 10.9768 115.981L6.47298 105.611C-20.7672 42.8908 42.8908 -20.7672 105.611 6.47299L115.981 10.9768C135.13 19.2934 156.87 19.2934 176.019 10.9768L186.389 6.47298Z'
    },
    'shape-7': {
        label: 'Eye Shape',
        w: 300, h: 300,
        d: 'M231.309 231.309C161.705 300.913 68.8765 320.935 23.9707 276.029C-20.9352 231.123 -0.913343 138.295 68.6908 68.6908C138.295 -0.913329 231.123 -20.9352 276.029 23.9707C320.935 68.8765 300.913 161.705 231.309 231.309Z'
    },
    'shape-main': {
        label: 'Flower',
        w: 324, h: 320,
        d: 'M126.828 13.3757C128.575 11.9499 129.448 11.237 130.245 10.6352C149.03 -3.54505 174.97 -3.54505 193.755 10.6352C194.552 11.237 195.426 11.9499 197.172 13.3757C197.952 14.0122 198.342 14.3305 198.728 14.6334C207.568 21.5789 218.406 25.5149 229.653 25.8637C230.143 25.8789 230.647 25.8852 231.654 25.8977C233.911 25.9256 235.039 25.9396 236.038 25.9899C259.563 27.1743 279.435 43.8108 284.689 66.7206C284.912 67.693 285.122 68.7992 285.541 71.0116C285.728 71.9993 285.822 72.4931 285.922 72.9724C288.22 83.9624 293.987 93.9286 302.377 101.409C302.743 101.735 303.125 102.063 303.889 102.718C305.599 104.187 306.455 104.921 307.187 105.6C324.446 121.595 328.95 147.084 318.216 168.003C317.76 168.891 317.208 169.873 316.104 171.837C315.611 172.714 315.365 173.152 315.133 173.583C309.812 183.475 307.809 194.808 309.418 205.92C309.488 206.404 309.569 206.9 309.732 207.892C310.096 210.114 310.278 211.225 310.402 212.215C313.318 235.536 300.348 257.951 278.647 267.092C277.726 267.48 276.671 267.878 274.56 268.674C273.617 269.03 273.146 269.207 272.69 269.389C262.242 273.555 253.406 280.952 247.48 290.495C247.221 290.911 246.964 291.343 246.45 292.208C245.297 294.143 244.721 295.111 244.178 295.949C231.387 315.684 207.011 324.536 184.498 317.621C183.543 317.328 182.478 316.956 180.348 316.212C179.397 315.88 178.921 315.714 178.455 315.561C167.767 312.051 156.233 312.051 145.545 315.561C145.079 315.714 144.604 315.88 143.653 316.212C141.523 316.956 140.458 317.328 139.502 317.621C116.989 324.536 92.6131 315.684 79.8223 295.949C79.2794 295.111 78.7031 294.143 77.5505 292.208C77.036 291.343 76.7788 290.911 76.5203 290.495C70.5942 280.952 61.7586 273.555 51.3098 269.389C50.8541 269.207 50.3829 269.03 49.4406 268.674C47.3297 267.878 46.2742 267.48 45.3532 267.092C23.6525 257.951 10.6822 235.536 13.5983 212.215C13.722 211.225 13.9042 210.114 14.2684 207.892C14.431 206.9 14.5123 206.404 14.5825 205.92C16.1911 194.808 14.1882 183.475 8.86773 173.583C8.63566 173.152 8.38924 172.714 7.89641 171.837C6.79237 169.873 6.24036 168.891 5.78474 168.003C-4.9499 147.084 -0.445344 121.595 16.8131 105.6C17.5456 104.921 18.4009 104.187 20.1116 102.718C20.8752 102.063 21.257 101.735 21.623 101.409C30.0136 93.9285 35.7807 83.9624 38.0779 72.9724C38.1781 72.4931 38.2718 71.9993 38.459 71.0116C38.8785 68.7992 39.0883 67.6929 39.3113 66.7206C44.5654 43.8108 64.4372 27.1743 87.9625 25.9899C88.961 25.9396 90.0894 25.9256 92.346 25.8977C93.3534 25.8852 93.857 25.8789 94.3476 25.8637C105.594 25.5149 116.433 21.5789 125.273 14.6334C125.658 14.3305 126.048 14.0122 126.828 13.3757Z'
    }
};

interface GenerativeBackgroundProps {
  state: AppState;
  windowDimensions: { width: number; height: number };
}

export const GenerativeBackground: React.FC<GenerativeBackgroundProps> = ({ state, windowDimensions }) => {
    const config = state.generativeBackground;
    const size = Math.max(windowDimensions.width, windowDimensions.height) || 1000;

    const [localTarget, setLocalTarget] = useState(config.seed);
    const [fallbackValue, setFallbackValue] = useState(config.seed);
    const svgRef = useRef<SVGSVGElement>(null);

    const [zoom, setZoom] = useState(1.0);
    const [yaw, setYaw] = useState(0.0);
    const [pitch, setPitch] = useState(0.0);
    const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

    const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            yaw,
            pitch
        };
    };

    const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        if (!dragStartRef.current) return;
        e.stopPropagation();
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        setYaw(dragStartRef.current.yaw + dx * 0.005);
        setPitch(Math.max(-1.4, Math.min(1.4, dragStartRef.current.pitch - dy * 0.005)));
    };

    const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
        e.stopPropagation();
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {}
        dragStartRef.current = null;
    };

    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.stopPropagation();
        setZoom(prev => Math.max(0.2, Math.min(5.0, prev - e.deltaY * 0.0015)));
    };

    const spring = useSpring(localTarget, {
        stiffness: state.spring.stiffness,
        damping: state.spring.damping,
        mass: state.spring.mass,
        threshold: 0.01
    }, (value) => {
        setFallbackValue(value);
    });

    useEffect(() => {
        if (!config.isPlaying) return;
        
        if (config.motionStyle === 'steps') {
            const interval = setInterval(() => {
                setLocalTarget(prev => prev + 2.0);
            }, 1500);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setLocalTarget(prev => prev + 0.05);
            }, 16);
            return () => clearInterval(interval);
        }
    }, [config.isPlaying, config.motionStyle]);

    const theme = useMemo(() => {
        if (!config.enabled) return {} as Record<string, string>;
        
        if (state.style === 'custom') {
            return generateThemeFromSeed(state.customColor || '#0B57D0', state.mode === 'dark', state.themeVariant);
        } else if (state.themeVariant && state.themeVariant !== 'tonal_spot') {
            const baseTheme = state.mode === 'dark' ? THEME_COLORS_DARK[state.style] : THEME_COLORS[state.style];
            const seedColor = baseTheme.primary;
            return generateThemeFromSeed(seedColor, state.mode === 'dark', state.themeVariant);
        } else {
            return state.mode === 'dark' ? THEME_COLORS_DARK[state.style] : THEME_COLORS[state.style];
        }
    }, [state.style, state.customColor, state.mode, state.themeVariant, config.enabled]);

    const canvases = useMemo(() => {
        return generateCanvases(config.seed, 100);
    }, [config.seed]);

    const projectedCanvases = useMemo(() => {
        const isMaterialShapes = config.particleType === 'material_shapes';
        const isIsolated = config.isolateShape && isMaterialShapes;
        
        // If isolated, project exactly one centered centerpiece shape for closer study!
        const itemsToProject = isIsolated
            ? [{
                id: 0,
                x: 0,
                y: 0,
                z: -550,
                rotSpeed: 0,
                baseAngle: 0,
                iconName: PRODUCT_ICONS[0],
                symbolName: GOOGLE_SYMBOLS[0],
                shapeKey: 'shape-main', // Beautiful centerpiece flower!
                colorType: 'primary',
                scaleFactor: 12.0 // 12x scale factor for way bigger detailed view
            } as CanvasItem]
            : canvases;

        if (itemsToProject.length === 0) return [];
        // Dynamic camera distance D: shrinks as zoom increases to amplify wide-angle perspective
        const D = Math.max(250, 600 - (zoom - 1.0) * 150);
        // Z shifting: acts as a dolly camera translation into the 3D space
        const zShift = (zoom - 1.0) * 250;

        const t = isMaterialShapes ? 0 : fallbackValue * 15; // Motion speed multiplier
        const zMin = -1050;
        const zMax = -50;
        const zRange = zMax - zMin;

        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosX = Math.cos(pitch);
        const sinX = Math.sin(pitch);
        const zCenter = -550;

        const projected = itemsToProject.map((c) => {
            let z = isMaterialShapes ? c.z : c.z + t;
            if (!isMaterialShapes) {
                z = ((z - zMin) % zRange) + zMin;
                if (z > zMax) z -= zRange;
            }

            const swayX = isMaterialShapes ? 0 : Math.sin(fallbackValue * 0.4 + c.id) * 40;
            const swayY = isMaterialShapes ? 0 : Math.cos(fallbackValue * 0.3 + c.id * 1.3) * 40;

            const x0 = c.x + swayX;
            const y0 = c.y + swayY;
            const z0 = z - zCenter;

            // Apply X rotation (pitch)
            const y1 = y0 * cosX - z0 * sinX;
            const z1 = y0 * sinX + z0 * cosX;

            // Apply Y rotation (yaw)
            const xRot = x0 * cosY + z1 * sinY;
            const zRot = -x0 * sinY + z1 * cosY + zCenter;

            // Add camera dolly translation (zShift) to depth
            const zRotShifted = zRot + zShift;

            // 3D perspective projection using rotated & shifted coordinates
            const denom = Math.max(30, D - zRotShifted);
            const scale = (D / denom) * (zoom * 0.5 + 0.5);

            const x2d = size / 2 + xRot * scale;
            const y2d = size / 2 + y1 * scale;

            const baseCardSize = 96 * c.scaleFactor;
            const cardSize = baseCardSize * scale;

            // Handle opacity based on the final shifted depth to fade out close/far elements smoothly
            let opacity = 1.0;
            if (zRotShifted < -1200) {
                opacity = 0.0;
            } else if (zRotShifted < -850) {
                opacity = (zRotShifted - (-1200)) / 350;
            } else if (zRotShifted > -100) {
                opacity = (-50 - zRotShifted) / 100;
            }
            opacity = Math.max(0, Math.min(1, opacity));

            return {
                ...c,
                z: zRotShifted,
                x2d,
                y2d,
                cardSize,
                opacity,
                scale
            };
        });

        return projected.sort((a, b) => a.z - b.z);
    }, [canvases, fallbackValue, size, yaw, pitch, zoom]);

    if (!config.enabled) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <svg 
                ref={svgRef}
                width={size} 
                height={size} 
                viewBox={`0 0 ${size} ${size}`}
                style={{ 
                    background: state.mode === 'dark' ? '#121212' : 'white'
                }}
                className="pointer-events-auto cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
            >
                <g>
                    <defs>
                        <radialGradient id="aurora-glow-primary" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="25%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="65%" stopColor={theme.primary || '#0B57D0'} stopOpacity={1.0} />
                            <stop offset="100%" stopColor={theme.primary || '#0B57D0'} stopOpacity={config.glowIntensity ?? 0.5} />
                        </radialGradient>
                        <radialGradient id="aurora-glow-secondary" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="25%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="65%" stopColor={theme.secondary || '#6793f1'} stopOpacity={1.0} />
                            <stop offset="100%" stopColor={theme.secondary || '#6793f1'} stopOpacity={config.glowIntensity ?? 0.5} />
                        </radialGradient>
                        <radialGradient id="aurora-glow-tertiary" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="25%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="65%" stopColor={theme.tertiary || '#ff2d55'} stopOpacity={1.0} />
                            <stop offset="100%" stopColor={theme.tertiary || '#ff2d55'} stopOpacity={config.glowIntensity ?? 0.5} />
                        </radialGradient>
                        <radialGradient id="aurora-glow-accent" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="25%" stopColor="#FFFFFF" stopOpacity={1.0} />
                            <stop offset="65%" stopColor={theme.primaryContainer || '#D3E3FD'} stopOpacity={1.0} />
                            <stop offset="100%" stopColor={theme.primaryContainer || '#D3E3FD'} stopOpacity={config.glowIntensity ?? 0.5} />
                        </radialGradient>

                        {/* Advanced Multi-color Linear Plasma Gradients */}
                        <linearGradient id="plasma-gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="35%" stopColor={theme.primary || '#0B57D0'} />
                            <stop offset="70%" stopColor={theme.secondary || '#6793f1'} />
                            <stop offset="100%" stopColor="#A37BFF" />
                        </linearGradient>
                        <linearGradient id="plasma-gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="35%" stopColor={theme.secondary || '#6793f1'} />
                            <stop offset="70%" stopColor="#FF63B1" />
                            <stop offset="100%" stopColor={theme.primary || '#0B57D0'} />
                        </linearGradient>
                        <linearGradient id="plasma-gradient-tertiary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="35%" stopColor={theme.tertiary || '#ff2d55'} />
                            <stop offset="70%" stopColor="#FBBC04" />
                            <stop offset="100%" stopColor="#A37BFF" />
                        </linearGradient>
                        <linearGradient id="plasma-gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="35%" stopColor={theme.primaryContainer || '#D3E3FD'} />
                            <stop offset="70%" stopColor={theme.primary || '#0B57D0'} />
                            <stop offset="100%" stopColor="#81C995" />
                        </linearGradient>
                        
                        {/* Volumetric blur and plasma wave filters */}
                        <filter id="aurora-backdrop-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation={(config.glowSoftness ?? 18.0) * (config.glowIntensity ?? 0.5)} />
                        </filter>
                        
                        <filter id="aurora-plasma-turbulent" x="-50%" y="-50%" width="200%" height="200%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale={18 * (config.glowIntensity ?? 0.5)} xChannelSelector="R" yChannelSelector="G" />
                            <feGaussianBlur stdDeviation={(config.glowCoreSoftness ?? 3.0) * (config.glowIntensity ?? 0.5)} />
                        </filter>
                    </defs>
                    <g>
                        {projectedCanvases.map((item) => {
                            const itemColor = (() => {
                                switch (item.colorType) {
                                    case 'primary': return theme.primary || '#0B57D0';
                                    case 'secondary': return theme.secondary || '#6793f1';
                                    case 'tertiary': return theme.tertiary || '#ff2d55';
                                    case 'accent': return theme.primaryContainer || '#D3E3FD';
                                }
                            })();
                            
                            const cardSize = item.cardSize;
                            const halfSize = cardSize / 2;
                            const type = config.particleType || 'product_icons';
                            
                            // If auroraGlow is active, fill shape directly with gradient, otherwise use flat theme color
                            const shapeFill = (config.auroraGlow && type === 'material_shapes') ? `url(#aurora-glow-${item.colorType})` : itemColor;
                            
                            return (
                                <g 
                                    key={item.id} 
                                    transform={`translate(${item.x2d}, ${item.y2d})`}
                                    opacity={item.opacity}
                                >
                                    {/* 1. Render Product Icons */}
                                    {type === 'product_icons' && (
                                        <image 
                                            href={`./product-icons/${item.iconName}`}
                                            x={-halfSize * 0.6} 
                                            y={-halfSize * 0.6} 
                                            width={cardSize * 0.6} 
                                            height={cardSize * 0.6}
                                            className="pointer-events-none select-none"
                                        />
                                    )}

                                    {/* 2. Render Google Symbols (Rounded & Filled) */}
                                    {type === 'google_symbols' && (
                                        <text 
                                            fontFamily="Material Symbols Rounded" 
                                            fontSize={cardSize * 0.65 * (config.symbolScale ?? 1.0)}
                                            fill={shapeFill}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            className="pointer-events-none select-none"
                                            style={{
                                                fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                                            }}
                                        >
                                            {item.symbolName}
                                        </text>
                                    )}

                                    {/* 3. Render Material Shapes */}
                                    {type === 'material_shapes' && (() => {
                                        const shapeInfo = CUSTOM_SHAPES[item.shapeKey];
                                        if (!shapeInfo) return null;
                                        
                                        const maxDim = Math.max(shapeInfo.w, shapeInfo.h);
                                        const shapeScale = (cardSize * 0.75) / maxDim;
                                        
                                        if (config.auroraGlow) {
                                            const speedFactor = config.glowSpeed ?? 1.0;
                                            const strokeOffsetValue = config.isPlaying ? -fallbackValue * 180 * speedFactor : 0;
                                            
                                            // Biological breathing wave modulation based on the Glow Pulsing parameter
                                            const pulseFactor = config.glowPulse ?? 0.8;
                                            const pulseMod = config.isPlaying ? Math.sin(fallbackValue * 1.2) * 6 * pulseFactor : 0;
                                            
                                            const baseThickness = config.glowThickness ?? 20;
                                            const backdropWidth = Math.max(3, baseThickness * (config.glowBackdropWidth ?? 1.8) + pulseMod) * (config.glowIntensity ?? 0.5);
                                            const plasmaWidth = Math.max(1.5, baseThickness * (config.glowCoreWidth ?? 0.5) + pulseMod * 0.35) * (config.glowIntensity ?? 0.5);
                                            const segmentGap = config.glowSegmentGap ?? 220.0;
                                            
                                            const clipPathId = `clip-shape-${item.id}-${item.shapeKey}-${config.seed}`;
                                            
                                            return (
                                                <g>
                                                    <defs>
                                                        <clipPath id={clipPathId}>
                                                            <path d={shapeInfo.d} />
                                                        </clipPath>
                                                    </defs>
                                                    <g transform={`scale(${shapeScale}) translate(${-shapeInfo.w / 2}, ${-shapeInfo.h / 2})`}>
                                                        {/* Solid transparent container backing */}
                                                        <path 
                                                            d={shapeInfo.d}
                                                            fill={state.mode === 'dark' ? 'rgba(18, 18, 20, 0.45)' : 'rgba(255, 255, 255, 0.45)'}
                                                            stroke={itemColor}
                                                            strokeWidth={1.5}
                                                            className="transition-colors duration-300"
                                                        />
                                                        {/* Inner Aurora Glow restricted inside shape by clip path */}
                                                        <g clipPath={`url(#${clipPathId})`}>
                                                            {/* A. Soft backdrop blur inner glow */}
                                                            <path 
                                                                d={shapeInfo.d}
                                                                fill="none"
                                                                stroke={itemColor}
                                                                strokeWidth={backdropWidth}
                                                                filter="url(#aurora-backdrop-blur)"
                                                                opacity={0.65 * (config.glowIntensity ?? 0.5)}
                                                            />
                                                            
                                                            {/* B. Animated, wriggling, multi-color neon plasma ribbon core */}
                                                            <path 
                                                                d={shapeInfo.d}
                                                                fill="none"
                                                                stroke={`url(#plasma-gradient-${item.colorType})`}
                                                                strokeWidth={plasmaWidth}
                                                                strokeDasharray={`${config.glowSegmentLength ?? 160.0} ${segmentGap}`}
                                                                strokeDashoffset={strokeOffsetValue}
                                                                filter="url(#aurora-plasma-turbulent)"
                                                                opacity={0.85}
                                                            />
                                                        </g>
                                                    </g>
                                                </g>
                                            );
                                        }

                                        return (
                                            <path 
                                                d={shapeInfo.d}
                                                fill={shapeFill}
                                                transform={`scale(${shapeScale}) translate(${-shapeInfo.w / 2}, ${-shapeInfo.h / 2})`}
                                                className="pointer-events-none select-none transition-all duration-300"
                                            />
                                        );
                                    })()}
                                </g>
                            );
                        })}
                    </g>
                </g>
            </svg>
        </div>
    );
};
