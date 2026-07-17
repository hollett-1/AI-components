
import React, { useState, useEffect, useRef } from 'react';
import { Controls } from './components/Controls';
import { AppState, ThemeStyle, UnitPreset, CanvasShape } from './types';
import { DEFAULT_STATE, PRODUCT_ICON_PRESETS_LIST } from './constants';
import { useThemeInjection } from './hooks/useThemeInjection';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCanvasControls } from './hooks/useCanvasControls';

const getCssColor = (hex: string, opacity: number = 1) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getDeterministicRandom = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const val = Math.abs(Math.sin(hash) * 10000);
  return val - Math.floor(val);
};

interface ParsedSvg {
  viewBox: string;
  elements: string[];
  defs: string[];
}

const parsedSvgCache: Record<string, ParsedSvg> = {};

const loadSvgElements = async (svgUrl: string): Promise<ParsedSvg> => {
  if (parsedSvgCache[svgUrl]) {
    return parsedSvgCache[svgUrl];
  }
  try {
    const response = await fetch(svgUrl);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'image/svg+xml');
    
    const svgEl = doc.querySelector('svg');
    if (!svgEl) {
        throw new Error("No SVG element found");
    }
    let viewBox = svgEl.getAttribute('viewBox');
    if (!viewBox) {
      const width = svgEl.getAttribute('width') || '192';
      const height = svgEl.getAttribute('height') || '192';
      viewBox = `0 0 ${width} ${height}`;
    }
    
    const allShapes = Array.from(doc.querySelectorAll('path, rect, circle'));
    const visualShapes = allShapes.filter(el => {
        return !el.closest('mask') && !el.closest('clipPath') && !el.closest('defs');
    });
    
    const elements = visualShapes.map((targetEl, targetIdx) => {
        const svgClone = svgEl.cloneNode(true) as SVGElement;
        
        const cloneShapes = Array.from(svgClone.querySelectorAll('path, rect, circle'));
        const cloneVisualShapes = cloneShapes.filter(el => {
            return !el.closest('mask') && !el.closest('clipPath') && !el.closest('defs');
        });
        
        cloneVisualShapes.forEach((el, idx) => {
            if (idx === targetIdx) {
                const fill = el.getAttribute('fill');
                const stroke = el.getAttribute('stroke');
                
                if (stroke && stroke !== 'none') {
                    el.setAttribute('stroke', 'black');
                }
                if (fill && fill !== 'none') {
                    el.setAttribute('fill', 'black');
                } else if (!fill && (!stroke || stroke === 'none')) {
                    el.setAttribute('fill', 'black');
                }
            } else {
                el.remove();
            }
        });
        
        const outerHtml = svgClone.outerHTML;
        const base64Svg = btoa(unescape(encodeURIComponent(outerHtml)));
        return `url("data:image/svg+xml;base64,${base64Svg}")`;
    });
      
    const result = { 
        viewBox, 
        elements,
        defs: []
    };
    parsedSvgCache[svgUrl] = result;
    return result;
  } catch (e) {
    console.error('Failed to load SVG elements', e);
    return { viewBox: '0 0 192 192', elements: [], defs: [] };
  }
};

const parseSvgColor = (colorStr: string | null): string => {
  if (!colorStr || colorStr === 'none') return '#FFFFFF';
  return colorStr;
};

const parseSvgToShapes = (text: string, filename: string): CanvasShape[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  
  const svgEl = doc.querySelector('svg');
  let viewBox = svgEl?.getAttribute('viewBox');
  if (!viewBox) {
    const width = svgEl?.getAttribute('width') || '192';
    const height = svgEl?.getAttribute('height') || '192';
    viewBox = `0 0 ${width} ${height}`;
  }
  const parts = viewBox.trim().split(/\s+/);
  const vbWidth = parseFloat(parts[2]) || 192;
  const vbHeight = parseFloat(parts[3]) || 192;
  
  const gradients: Record<string, {
      type: 'linear' | 'radial';
      stops: { color: string; opacity: number; offset: number }[];
      angle?: number;
      radialCenterX?: number;
      radialCenterY?: number;
      radialRadiusX?: number;
      radialRadiusY?: number;
  }> = {};
  
  doc.querySelectorAll('linearGradient, radialGradient').forEach(grad => {
      const id = grad.getAttribute('id');
      if (!id) return;
      
      const type = grad.tagName === 'linearGradient' ? 'linear' : 'radial';
      const stops: { color: string; opacity: number; offset: number }[] = [];
      
      grad.querySelectorAll('stop').forEach(stop => {
          const stopColor = stop.getAttribute('stop-color') || '#FFFFFF';
          const stopOpacityAttr = stop.getAttribute('stop-opacity');
          const stopOpacity = stopOpacityAttr !== null ? parseFloat(stopOpacityAttr) : 1.0;
          
          const offsetAttr = stop.getAttribute('offset') || '0';
          const offset = offsetAttr.endsWith('%') 
              ? parseFloat(offsetAttr) / 100 
              : parseFloat(offsetAttr);
              
          stops.push({ color: stopColor, opacity: stopOpacity, offset });
      });
      
      let angle = 180;
      let mappedStops = stops;
      let radialCenterX: number | undefined;
      let radialCenterY: number | undefined;
      let radialRadiusX: number | undefined;
      let radialRadiusY: number | undefined;

      if (type === 'linear') {
          const x1 = parseFloat(grad.getAttribute('x1') || '0');
          const y1 = parseFloat(grad.getAttribute('y1') || '0');
          const x2 = parseFloat(grad.getAttribute('x2') || '100');
          const y2 = parseFloat(grad.getAttribute('y2') || '0');
          
          const isUserSpace = grad.getAttribute('gradientUnits') === 'userSpaceOnUse';
          let px1 = x1;
          let py1 = y1;
          let px2 = x2;
          let py2 = y2;
          
          if (isUserSpace) {
              px1 = x1 / vbWidth;
              py1 = y1 / vbHeight;
              px2 = x2 / vbWidth;
              py2 = y2 / vbHeight;
          } else {
              if (px1 > 1) px1 /= 100;
              if (py1 > 1) py1 /= 100;
              if (px2 > 1) px2 /= 100;
              if (py2 > 1) py2 /= 100;
          }
          
          const dy = py2 - py1;
          const dx = px2 - px1;
          if (dx !== 0 || dy !== 0) {
              const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
              angle = Math.round(deg + 90);
              if (angle < 0) angle += 360;
              if (angle >= 360) angle -= 360;
          } else {
              angle = 180;
          }
          
          const L = Math.sqrt(dx * dx + dy * dy);
          if (L > 0) {
              const ux = dx / L;
              const uy = dy / L;
              const dp1 = px1 * ux + py1 * uy;
              
              const d00 = 0;
              const d10 = ux;
              const d01 = uy;
              const d11 = ux + uy;
              
              const dMin = Math.min(d00, d10, d01, d11);
              const dMax = Math.max(d00, d10, d01, d11);
              const dSpan = dMax - dMin;
              
              if (dSpan > 0) {
                  mappedStops = stops.map(s => {
                      const tCss = (dp1 + s.offset * L - dMin) / dSpan;
                      return {
                          ...s,
                          offset: Math.min(1, Math.max(0, tCss))
                      };
                  });
              }
          }
      } else {
          let cx = parseFloat(grad.getAttribute('cx') || '0.5');
          let cy = parseFloat(grad.getAttribute('cy') || '0.5');
          let r = parseFloat(grad.getAttribute('r') || '0.5');
          
          const isUserSpace = grad.getAttribute('gradientUnits') === 'userSpaceOnUse';
          const transform = grad.getAttribute('gradientTransform');
          
          let rx = r;
          let ry = r;
          
          if (transform) {
              const matrixMatch = transform.match(/matrix\(([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)\)/) 
                               || transform.match(/matrix\(([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+)\)/);
              if (matrixMatch) {
                  const a = parseFloat(matrixMatch[1]);
                  const b = parseFloat(matrixMatch[2]);
                  const c = parseFloat(matrixMatch[3]);
                  const d = parseFloat(matrixMatch[4]);
                  const e = parseFloat(matrixMatch[5]);
                  const f = parseFloat(matrixMatch[6]);
                  
                  const newCx = a * cx + c * cy + e;
                  const newCy = b * cx + d * cy + f;
                  cx = newCx;
                  cy = newCy;
                  
                  rx = Math.sqrt(a * a + b * b) * r;
                  ry = Math.sqrt(c * c + d * d) * r;
              } else {
                  const translateMatch = transform.match(/translate\(([-\d.e]+)\s+([-\d.e]+)\)/) || transform.match(/translate\(([-\d.e]+),\s*([-\d.e]+)\)/) || transform.match(/translate\(([-\d.e]+)\)/);
                  let tx = 0, ty = 0;
                  if (translateMatch) {
                      tx = parseFloat(translateMatch[1]);
                      ty = translateMatch[2] ? parseFloat(translateMatch[2]) : tx;
                  }
                  const scaleMatch = transform.match(/scale\(([-\d.e]+)\s+([-\d.e]+)\)/) || transform.match(/scale\(([-\d.e]+),\s*([-\d.e]+)\)/) || transform.match(/scale\(([-\d.e]+)\)/);
                  let sx = 1, sy = 1;
                  if (scaleMatch) {
                      sx = parseFloat(scaleMatch[1]);
                      sy = scaleMatch[2] ? parseFloat(scaleMatch[2]) : sx;
                  }
                  cx = cx * sx + tx;
                  cy = cy * sy + ty;
                  rx = r * Math.abs(sx);
                  ry = r * Math.abs(sy);
              }
          }
          
          if (isUserSpace) {
              radialCenterX = cx / vbWidth;
              radialCenterY = cy / vbHeight;
              radialRadiusX = rx / vbWidth;
              radialRadiusY = ry / vbHeight;
          } else {
              if (cx > 1) cx /= 100;
              if (cy > 1) cy /= 100;
              if (rx > 1) rx /= 100;
              if (ry > 1) ry /= 100;
              radialCenterX = cx;
              radialCenterY = cy;
              radialRadiusX = rx;
              radialRadiusY = ry;
          }
      }
      
      gradients[id] = { 
          type, 
          stops: mappedStops, 
          angle,
          radialCenterX,
          radialCenterY,
          radialRadiusX,
          radialRadiusY
      };
  });
  
  const shapeElements = Array.from(doc.querySelectorAll('path, rect, circle'));
  const shapes: CanvasShape[] = [];
  let validIndex = 0;
  
  shapeElements.forEach((el) => {
      if (el.closest('mask') || el.closest('clipPath') || el.closest('defs')) {
          return;
      }
      
      const fillAttr = el.getAttribute('fill');
      const strokeAttr = el.getAttribute('stroke');
      
      if (fillAttr === 'none' && (!strokeAttr || strokeAttr === 'none')) {
          return;
      }
      
      let color = '#FFFFFF';
      let fillType: 'solid' | 'linear' | 'radial' = 'solid';
      let gradientColorStart: string | undefined;
      let gradientColorEnd: string | undefined;
      let gradientOpacityStart: number | undefined;
      let gradientOpacityEnd: number | undefined;
      let gradientAngle: number | undefined;
      let gradientStops: { color: string; opacity: number; offset: number }[] | undefined;
      let radialCenterX: number | undefined;
      let radialCenterY: number | undefined;
      let radialRadiusX: number | undefined;
      let radialRadiusY: number | undefined;
      
      const fillVal = fillAttr || strokeAttr;
      if (fillVal && fillVal.startsWith('url(#')) {
          const gradId = fillVal.replace(/url\(#([^)]+)\)/, '$1');
          const grad = gradients[gradId];
          if (grad) {
              fillType = grad.type;
              gradientStops = grad.stops;
              if (grad.stops.length > 0) {
                  gradientColorStart = grad.stops[0].color;
                  gradientOpacityStart = grad.stops[0].opacity;
                  if (grad.stops.length > 1) {
                      gradientColorEnd = grad.stops[grad.stops.length - 1].color;
                      gradientOpacityEnd = grad.stops[grad.stops.length - 1].opacity;
                  } else {
                      gradientColorEnd = grad.stops[0].color;
                      gradientOpacityEnd = grad.stops[0].opacity;
                  }
                  color = gradientColorStart;
              }
              gradientAngle = grad.angle;
              radialCenterX = grad.radialCenterX;
              radialCenterY = grad.radialCenterY;
              radialRadiusX = grad.radialRadiusX;
              radialRadiusY = grad.radialRadiusY;
          }
      } else if (fillVal && fillVal !== 'none') {
          color = parseSvgColor(fillVal);
          fillType = 'solid';
      }
      
      let blur: number | undefined;
      const filterTarget = el.closest('[filter]');
      if (filterTarget) {
          const filterAttr = filterTarget.getAttribute('filter');
          if (filterAttr) {
              const match = filterAttr.match(/url\(#([^)]+)\)/);
              if (match) {
                  const filterId = match[1];
                  const filterEl = doc.getElementById(filterId) || doc.querySelector(`[id="${filterId}"]`);
                  if (filterEl) {
                      const blurEl = filterEl.querySelector('feGaussianBlur');
                      if (blurEl) {
                          const stdDevAttr = blurEl.getAttribute('stdDeviation') || '0';
                          const stdDev = parseFloat(stdDevAttr.split(/[\s,]+/)[0]);
                          if (!isNaN(stdDev) && stdDev > 0) {
                              blur = stdDev;
                          }
                      }
                  }
              }
          }
      }
      
      shapes.push({
          id: `shape_preset_${filename}_${validIndex}_${Math.floor(Math.random() * 1000)}`,
          name: `product-icons/${filename}#${validIndex}`,
          x: 220,
          y: 220,
          width: 360,
          height: 360,
          color,
          cornerRadius: el.tagName === 'rect' ? parseFloat(el.getAttribute('rx') || '0') : 0,
          fillType,
          gradientColorStart,
          gradientOpacityStart,
          gradientColorEnd,
          gradientOpacityEnd,
          gradientAngle,
          gradientStops,
          radialCenterX,
          radialCenterY,
          radialRadiusX,
          radialRadiusY,
          blur,
          localIndex: validIndex
      });
      
      validIndex++;
  });
  
  return shapes;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isGuiVisible, setIsGuiVisible] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  const [svgDataMap, setSvgDataMap] = useState<Record<string, ParsedSvg>>({});

  const [scrollZ, setScrollZ] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const dragStartRotateRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const targetScrollZ = state.targetScrollZ !== undefined ? state.targetScrollZ : 0;
  const setTargetScrollZ = (updater: number | ((prev: number) => number)) => {
      const current = state.targetScrollZ !== undefined ? state.targetScrollZ : 0;
      const next = typeof updater === 'function' ? updater(current) : updater;
      updateState({ targetScrollZ: next });
  };

  let minOffset = 0;
  (state.canvasShapes || []).forEach(s => {
      let z = s.zOffset || 0;
      if (state.scatterZ) {
          z += getDeterministicRandom(s.id) * -3000;
      }
      if (z < minOffset) {
          minOffset = z;
      }
  });
  const maxScroll = Math.max(1000, -minOffset + 1000);
  const lastScrollTimeRef = useRef(0);
  const scrollZRef = useRef(0);
  const targetScrollRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [scatterProgress, setScatterProgress] = useState(DEFAULT_STATE.scatterZ ? 1 : 0);
  const scatterProgressRef = useRef(DEFAULT_STATE.scatterZ ? 1 : 0);
  const scatterRafRef = useRef<number | null>(null);

  useEffect(() => {
      const targetVal = state.scatterZ ? 1 : 0;
      const startVal = scatterProgressRef.current;
      if (startVal === targetVal) return;

      const duration = 5000; // 5 seconds
      const startTime = performance.now();

      const easeInOutCubic = (t: number): number => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animateScatter = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / duration);
          const easedT = easeInOutCubic(t);
          const currentVal = startVal + (targetVal - startVal) * easedT;
          
          scatterProgressRef.current = currentVal;
          setScatterProgress(currentVal);

          if (t < 1) {
              scatterRafRef.current = requestAnimationFrame(animateScatter);
          } else {
              scatterRafRef.current = null;
          }
      };

      if (scatterRafRef.current !== null) {
          cancelAnimationFrame(scatterRafRef.current);
      }
      scatterRafRef.current = requestAnimationFrame(animateScatter);

      return () => {
          if (scatterRafRef.current !== null) {
              cancelAnimationFrame(scatterRafRef.current);
          }
      };
  }, [state.scatterZ]);

  const handleMainWheel = (e: React.WheelEvent | WheelEvent) => {
      const isCycle3D = state.preset === 'All Icons (Cycle 3D)';

      if (isCycle3D) {
          if (Math.abs(e.deltaY) < 4) {
              return;
          }
          const now = Date.now();
          if (now - lastScrollTimeRef.current < 300) {
              return;
          }
          const direction = e.deltaY > 0 ? 1 : -1;
          setTargetScrollZ(prev => {
              const currentStep = Math.round(prev / 1000);
              const nextStep = Math.max(0, Math.min(Math.round(-minOffset / 1000), currentStep + direction));
              lastScrollTimeRef.current = now;
              return nextStep * 1000;
          });
      } else {
          setTargetScrollZ(prev => {
              const next = prev + e.deltaY * 0.15;
              return Math.min(maxScroll, Math.max(0, next));
          });
      }
  };

  const prevShapeIdsRef = useRef<string[]>([]);
  useEffect(() => {
      const currentIds = (state.canvasShapes || []).map(s => s.id);
      const isDifferent = currentIds.length !== prevShapeIdsRef.current.length || 
                          currentIds.some((id, idx) => id !== prevShapeIdsRef.current[idx]);
      if (isDifferent) {
          if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
          }
          scrollZRef.current = 0;
          targetScrollRef.current = 0;
          setScrollZ(0);
          setTargetScrollZ(0);
          prevShapeIdsRef.current = currentIds;
      }
  }, [state.canvasShapes]);

  useEffect(() => {
      const mainEl = mainRef.current;
      if (!mainEl) return;

      const handleWheel = (e: WheelEvent) => {
          const isZoomBg = state.backgroundImage.url && state.backgroundImage.visible && (e.ctrlKey || e.metaKey);
          if (isZoomBg) {
              canvas.handleBgWheel(e);
          } else {
              e.preventDefault();
              handleMainWheel(e);
          }
      };

      mainEl.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
          mainEl.removeEventListener('wheel', handleWheel);
      };
  }, [state.canvasShapes, state.preset, state.scatterZ, state.backgroundImage, state.targetScrollZ]);

  useEffect(() => {
      targetScrollRef.current = targetScrollZ;
      
      if (rafRef.current === null) {
          const animate = () => {
              const diff = targetScrollRef.current - scrollZRef.current;
              if (Math.abs(diff) < 0.1) {
                  scrollZRef.current = targetScrollRef.current;
                  setScrollZ(targetScrollRef.current);
                  rafRef.current = null;
                  return;
              }
              
              scrollZRef.current += diff * 0.12;
              setScrollZ(scrollZRef.current);
              rafRef.current = requestAnimationFrame(animate);
          };
          
          if (Math.abs(targetScrollRef.current - scrollZRef.current) >= 0.1) {
              rafRef.current = requestAnimationFrame(animate);
          }
      }
  }, [targetScrollZ]);

  useEffect(() => {
      if (state.targetScrollZ !== undefined && state.targetScrollZ > 0 && state.glowBounceEnabled) {
          updateState({ glowBounceEnabled: false });
      }
  }, [state.targetScrollZ, state.glowBounceEnabled]);

  useEffect(() => {
      return () => {
          if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current);
          }
      };
  }, []);

  useEffect(() => {
      const urlsToLoad = new Set<string>();
      (state.canvasShapes || []).forEach(shape => {
          if (shape.name.includes('#')) {
              const [url] = shape.name.split('#');
              urlsToLoad.add(url);
          }
      });
      
      urlsToLoad.forEach(async (url) => {
          if (!svgDataMap[url]) {
              const data = await loadSvgElements(`./${url}`);
              setSvgDataMap(prev => ({ ...prev, [url]: data }));
          }
      });
  }, [state.canvasShapes]);

  const [presets, setPresets] = useState<any[]>([]);
  const [initialLayoutDone, setInitialLayoutDone] = useState(false);
  const [undoStack, setUndoStack] = useState<CanvasShape[][]>([]);

  useEffect(() => {
      const loadPresets = async () => {
          const loaded = await Promise.all(
              PRODUCT_ICON_PRESETS_LIST.map(async (file) => {
                  try {
                      const response = await fetch(`./product-icons/${file.filename}`);
                      const text = await response.text();
                      const shapes = parseSvgToShapes(text, file.filename);
                      return {
                          name: file.name,
                          icon: file.filename,
                          shapes
                      };
                  } catch (e) {
                      console.error(`Failed to load preset ${file.name}`, e);
                      return null;
                  }
              })
          );
          const validPresets = loaded.filter((p): p is { name: string; icon: string; shapes: CanvasShape[] } => p !== null);
          
          // 1. Grid Preset
          const gridShapes: CanvasShape[] = [];
          
          validPresets.forEach((p, iconIdx) => {
              p.shapes.forEach((shape, shapeIdx) => {
                  gridShapes.push({
                      ...shape,
                      id: `grid_${p.name}_${shapeIdx}_${Math.floor(Math.random()*1000)}`,
                      iconIndex: iconIdx
                  });
              });
          });
          
          const gridPreset = {
              name: 'All Icons (Grid)',
              icon: 'docs_2026-192px.svg',
              shapes: gridShapes
          };

          // 1b. Grid Glow Preset
          const gridGlowShapes: CanvasShape[] = [];
          validPresets.forEach((p, iconIdx) => {
              p.shapes.forEach((shape, shapeIdx) => {
                  gridGlowShapes.push({
                      ...shape,
                      id: `gridglow_${p.name}_${shapeIdx}_${Math.floor(Math.random()*1000)}`,
                      iconIndex: iconIdx,
                      hasGlow: true
                  });
              });
          });

          const gridGlowPreset = {
              name: 'All Icons (Grid Glow)',
              icon: 'vids_2026-192px.svg',
              shapes: gridGlowShapes
          };

          // 2. Cycle Preset (Tunnel)
          const cycleShapes: CanvasShape[] = [];
          validPresets.forEach((p, iconIdx) => {
              const zOffset = -iconIdx * 1000;
              p.shapes.forEach((shape, shapeIdx) => {
                  cycleShapes.push({
                      ...shape,
                      id: `cycle_${p.name}_${shapeIdx}_${Math.floor(Math.random()*1000)}`,
                      zOffset
                  });
              });
          });
          
          const cyclePreset = {
              name: 'All Icons (Cycle 3D)',
              icon: 'gemini_2026-192px.svg',
              shapes: cycleShapes
          };
          
          setPresets([gridPreset, gridGlowPreset, cyclePreset, ...validPresets]);
      };

      loadPresets();
  }, []);

  useEffect(() => {
      if (presets.length === 0 || dimensions.width === 0 || initialLayoutDone) {
          return;
      }
      
      const gridPreset = presets.find(p => p.name === 'All Icons (Grid)');
      if (gridPreset && (!state.canvasShapes || state.canvasShapes.length === 0)) {
          const columns = 4;
          const uniqueIconIndices = Array.from(new Set(gridPreset.shapes.map((s: any) => s.iconIndex).filter((x: any) => x !== undefined)));
          const numIcons = uniqueIconIndices.length || 12;
          const rows = Math.ceil(numIcons / columns);
          const padding = 60;
          const availableWidth = dimensions.width - padding * 2;
          const availableHeight = dimensions.height - padding * 2;
          
          const calculatedCellSize = Math.max(60, Math.min(240, availableWidth / 4.75, availableHeight / 4.75));
          const gap = calculatedCellSize * 0.35;
          
          const gridWidth = columns * calculatedCellSize + (columns - 1) * gap;
          const gridHeight = rows * calculatedCellSize + (rows - 1) * gap;
          
          const startX = Math.max(20, (dimensions.width - gridWidth) / 2);
          const startY = Math.max(20, (dimensions.height - gridHeight) / 2);
          
          const uniqueShapes = gridPreset.shapes.map((s: any, idx: number) => {
              const iconIdx = s.iconIndex ?? 0;
              const col = iconIdx % columns;
              const row = Math.floor(iconIdx / columns);
              
              const shapeX = Math.round(startX + col * (calculatedCellSize + gap));
              const shapeY = Math.round(startY + row * (calculatedCellSize + gap));
              const shapeW = Math.round(calculatedCellSize);
              const shapeH = Math.round(calculatedCellSize);
              
              return {
                  ...s,
                  id: `shape_preset_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
                  x: shapeX,
                  y: shapeY,
                  width: shapeW,
                  height: shapeH
              };
          });

          setState(prev => ({
              ...prev,
              preset: 'All Icons (Grid)',
              canvasShapes: uniqueShapes,
              selectedShapeId: null
          }));
          setInitialLayoutDone(true);
      }
  }, [presets, dimensions, initialLayoutDone, state.canvasShapes]);

  const [animatedPositions, setAnimatedPositions] = useState<Record<string, { x: number; y: number }>>({});
  const animRef = useRef<number | null>(null);
  const physicsStateRef = useRef<Record<string, { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      phase: 'idle' | 'x' | 'y' | 'done' | 'x_parallel' | 'y_parallel';
      targetX: number;
      targetY: number;
      startX: number;
      startY: number;
  }>>({});
  const activeIndexRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
      const isEnabled = state.stepScatterEnabled || false;
      const shapesList = state.canvasShapes || [];
      if (shapesList.length === 0) return;

      const centerX = dimensions.width / 2 || 400;
      const centerY = dimensions.height / 2 || 400;

      shapesList.forEach((s, idx) => {
          const currentPhys = physicsStateRef.current[s.id];
          const currentX = currentPhys ? currentPhys.x : s.x;
          const currentY = currentPhys ? currentPhys.y : s.y;

          let targetX = s.x;
          let targetY = s.y;

          if (isEnabled) {
              const dx = s.x + s.width / 2 - centerX;
              const dy = s.y + s.height / 2 - centerY;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              
              const angleOffset = 0.5;
              const rx = dx * Math.cos(angleOffset) - dy * Math.sin(angleOffset);
              const ry = dx * Math.sin(angleOffset) + dy * Math.cos(angleOffset);
              const rLen = Math.sqrt(rx * rx + ry * ry) || 1;

              const scatterDistance = 200 + getDeterministicRandom(s.id) * 350;
              targetX = s.x + (rx / rLen) * scatterDistance;
              targetY = s.y + (ry / rLen) * scatterDistance;
          }

          physicsStateRef.current[s.id] = {
              x: currentX,
              y: currentY,
              vx: currentPhys ? currentPhys.vx : 0,
              vy: currentPhys ? currentPhys.vy : 0,
              phase: 'idle',
              targetX,
              targetY,
              startX: currentX,
              startY: currentY
          };
      });

      if (isEnabled) {
          activeIndexRef.current = 0;
          const firstShape = shapesList[0];
          if (firstShape) {
              physicsStateRef.current[firstShape.id].phase = 'x';
          }
      } else {
          activeIndexRef.current = null;
          shapesList.forEach(s => {
              const phys = physicsStateRef.current[s.id];
              if (phys) {
                  phys.phase = 'x_parallel';
              }
          });
      }

      lastTimeRef.current = null;

      const tick = (now: number) => {
          if (lastTimeRef.current === null) {
              lastTimeRef.current = now;
              animRef.current = requestAnimationFrame(tick);
              return;
          }

          const dt = Math.min(0.03, (now - lastTimeRef.current) / 1000);
          lastTimeRef.current = now;

          const stiffness = 380;
          const damping = 33;
          const mass = 1;

          let allDone = true;
          const nextAnimatedPositions: Record<string, { x: number; y: number }> = {};

          shapesList.forEach((s, idx) => {
              const phys = physicsStateRef.current[s.id];
              if (!phys) return;

              if (phys.phase === 'x') {
                  const fX = -stiffness * (phys.x - phys.targetX) - damping * phys.vx;
                  phys.vx += (fX / mass) * dt;
                  phys.x += phys.vx * dt;

                  const xDiff = Math.abs(phys.x - phys.targetX);
                  const xVel = Math.abs(phys.vx);
                  if (xDiff < 0.2 && xVel < 1.0) {
                      phys.x = phys.targetX;
                      phys.vx = 0;
                      phys.phase = 'y';
                  }
                  allDone = false;
              } else if (phys.phase === 'y') {
                  const fY = -stiffness * (phys.y - phys.targetY) - damping * phys.vy;
                  phys.vy += (fY / mass) * dt;
                  phys.y += phys.vy * dt;

                  const yDiff = Math.abs(phys.y - phys.targetY);
                  const yVel = Math.abs(phys.vy);
                  if (yDiff < 0.2 && yVel < 1.0) {
                      phys.y = phys.targetY;
                      phys.vy = 0;
                      phys.phase = 'done';

                      const nextIdx = idx + 1;
                      if (nextIdx < shapesList.length) {
                          activeIndexRef.current = nextIdx;
                          physicsStateRef.current[shapesList[nextIdx].id].phase = 'x';
                      }
                  }
                  allDone = false;
              } else if (phys.phase === 'x_parallel') {
                  const fX = -stiffness * (phys.x - phys.targetX) - damping * phys.vx;
                  phys.vx += (fX / mass) * dt;
                  phys.x += phys.vx * dt;

                  const xDiff = Math.abs(phys.x - phys.targetX);
                  const xVel = Math.abs(phys.vx);
                  if (xDiff < 0.2 && xVel < 1.0) {
                      phys.x = phys.targetX;
                      phys.vx = 0;
                      phys.phase = 'y_parallel';
                  }
                  allDone = false;
              } else if (phys.phase === 'y_parallel') {
                  const fY = -stiffness * (phys.y - phys.targetY) - damping * phys.vy;
                  phys.vy += (fY / mass) * dt;
                  phys.y += phys.vy * dt;

                  const yDiff = Math.abs(phys.y - phys.targetY);
                  const yVel = Math.abs(phys.vy);
                  if (yDiff < 0.2 && yVel < 1.0) {
                      phys.y = phys.targetY;
                      phys.vy = 0;
                      phys.phase = 'done';
                  }
                  allDone = false;
              } else if (phys.phase === 'idle') {
                  allDone = false;
              } else if (phys.phase === 'done') {
                  phys.x = phys.targetX;
                  phys.y = phys.targetY;
              }

              nextAnimatedPositions[s.id] = { x: phys.x, y: phys.y };
          });

          setAnimatedPositions(nextAnimatedPositions);

          if (!allDone) {
              animRef.current = requestAnimationFrame(tick);
          } else {
              animRef.current = null;
          }
      };

      if (animRef.current !== null) {
          cancelAnimationFrame(animRef.current);
      }
      animRef.current = requestAnimationFrame(tick);

      return () => {
          if (animRef.current !== null) {
              cancelAnimationFrame(animRef.current);
          }
      };
  }, [state.stepScatterEnabled, state.canvasShapes, dimensions]);

  const saveHistory = (shapesToSave: CanvasShape[]) => {
      const clone = JSON.parse(JSON.stringify(shapesToSave));
      setUndoStack(prev => {
          const next = [...prev, clone];
          if (next.length > 50) next.shift();
          return next;
      });
  };

  const undo = () => {
      if (undoStack.length === 0) return;
      setUndoStack(prev => {
          const next = [...prev];
          const lastState = next.pop();
          if (lastState) {
              setState(current => ({ ...current, canvasShapes: lastState }));
          }
          return next;
      });
  };

  // Custom Hook: Theme
  useThemeInjection(state.mode, state.style, state.customColor, state.themeVariant);

  // Helper State Update
  const updateState = (updates: Partial<AppState>, saveUndo = false) => {
      if (saveUndo && updates.canvasShapes !== undefined) {
          saveHistory(state.canvasShapes || []);
      }
      setState(prev => ({ ...prev, ...updates }));
  };

  // Custom Hook: Canvas Controls (Bg Image Drag/Resize)
  const canvas = useCanvasControls({ state, updateState, mainRef });

  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [resizingShapeId, setResizingShapeId] = useState<string | null>(null);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const initialShapeRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeStartMouseRef = useRef({ x: 0, y: 0 });

  const handleShapeMouseDown = (e: React.MouseEvent, shape: any) => {
      e.stopPropagation();
      setDraggingShapeId(shape.id);
      updateState({ selectedShapeId: shape.id });
      
      const parentRect = mainRef.current?.getBoundingClientRect();
      if (parentRect) {
          dragOffsetRef.current = {
              x: e.clientX - parentRect.left - shape.x,
              y: e.clientY - parentRect.top - shape.y
          };
      }
  };

  const handleShapeResizeMouseDown = (e: React.MouseEvent, shape: any, corner: string) => {
      e.stopPropagation();
      e.preventDefault();
      setResizingShapeId(shape.id);
      setResizeCorner(corner);
      initialShapeRectRef.current = {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height
      };
      resizeStartMouseRef.current = {
          x: e.clientX,
          y: e.clientY
      };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.group\\/shape') || (e.target as HTMLElement).closest('.resize-handle')) {
          return;
      }
      if ((e.target as HTMLElement).closest('button, input, select, .controls-panel')) {
          return;
      }
      
      setIsRotating(true);
      dragStartRotateRef.current = {
          x: e.clientX,
          y: e.clientY,
          rotX: rotateX,
          rotY: rotateY
      };
      updateState({ selectedShapeId: null });
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.group\\/shape') || (e.target as HTMLElement).closest('.resize-handle')) {
          return;
      }
      if ((e.target as HTMLElement).closest('button, input, select, .controls-panel')) {
          return;
      }
      setRotateX(0);
      setRotateY(0);
  };

  const handleMainMouseMove = (e: React.MouseEvent) => {
      if (isRotating) {
          const dx = e.clientX - dragStartRotateRef.current.x;
          const dy = e.clientY - dragStartRotateRef.current.y;
          const nextRotY = dragStartRotateRef.current.rotY + dx * 0.5;
          const nextRotX = Math.min(80, Math.max(-80, dragStartRotateRef.current.rotX - dy * 0.5));
          setRotateX(nextRotX);
          setRotateY(nextRotY);
          return;
      }
      if (resizingShapeId && resizeCorner) {
          const dx = e.clientX - resizeStartMouseRef.current.x;
          const dy = e.clientY - resizeStartMouseRef.current.y;
          const rect = initialShapeRectRef.current;
          
          let newWidth = rect.width;
          let newHeight = rect.height;
          let newX = rect.x;
          let newY = rect.y;

          if (resizeCorner === 'br') {
              newWidth = Math.max(10, rect.width + dx);
              newHeight = Math.max(10, rect.height + dy);
          } else if (resizeCorner === 'bl') {
              newWidth = Math.max(10, rect.width - dx);
              newHeight = Math.max(10, rect.height + dy);
              newX = rect.x + (rect.width - newWidth);
          } else if (resizeCorner === 'tr') {
              newWidth = Math.max(10, rect.width + dx);
              newHeight = Math.max(10, rect.height - dy);
              newY = rect.y + (rect.height - newHeight);
          } else if (resizeCorner === 'tl') {
              newWidth = Math.max(10, rect.width - dx);
              newHeight = Math.max(10, rect.height - dy);
              newX = rect.x + (rect.width - newWidth);
              newY = rect.y + (rect.height - newHeight);
          }

          updateState({
              canvasShapes: (state.canvasShapes || []).map(s => 
                  s.id === resizingShapeId ? { ...s, x: newX, y: newY, width: newWidth, height: newHeight } : s
              )
          });
      } else if (draggingShapeId) {
          const parentRect = mainRef.current?.getBoundingClientRect();
          if (parentRect) {
              const newX = e.clientX - parentRect.left - dragOffsetRef.current.x;
              const newY = e.clientY - parentRect.top - dragOffsetRef.current.y;
              updateState({
                  canvasShapes: (state.canvasShapes || []).map(s => 
                      s.id === draggingShapeId ? { ...s, x: newX, y: newY } : s
                  )
              });
          }
      } else {
          canvas.handleMouseMove(e);
      }
  };

  const handleMainMouseUp = (e: React.MouseEvent) => {
      if (isRotating) {
          setIsRotating(false);
          return;
      }
      if (resizingShapeId || draggingShapeId) {
          saveHistory(state.canvasShapes || []);
          setResizingShapeId(null);
          setResizeCorner(null);
          setDraggingShapeId(null);
      } else {
          canvas.handleMouseUp(e);
      }
  };

  // Detect Mobile
  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Canvas Dimensions Observer
  useEffect(() => {
      if (!mainRef.current) return;
      const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
              setDimensions({
                  width: Math.round(entry.contentRect.width),
                  height: Math.round(entry.contentRect.height)
              });
          }
      });
      observer.observe(mainRef.current);
      return () => observer.disconnect();
  }, []);

  const handleExport = async () => {
      const targetId = state.exportConfig.includeBackground ? 'main-preview-area' : 'selector-capture-target';
      const element = document.getElementById(targetId);
      
      // @ts-ignore
      if (!element || !window.htmlToImage) {
          console.warn("Export failed: Element not found or html-to-image missing");
          return;
      }
      
      try {
          // @ts-ignore
          const dataUrl = await window.htmlToImage.toPng(element, {
              backgroundColor: state.exportConfig.includeBackground ? null : 'transparent',
              pixelRatio: state.exportConfig.scale,
              cacheBust: true,
              filter: (node: HTMLElement) => node.id !== 'gui-toggle-btn' && node.id !== 'dimensions-indicator' && node.id !== 'drop-overlay' && !node.classList?.contains('resize-handle') && !node.classList?.contains('bg-border-box'),
          });
          
          const link = document.createElement('a');
          link.download = `product_icon_gen_${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
      } catch (err) {
          console.error('Export failed:', err);
          alert("Failed to export PNG. See console for details.");
      }
  };

  // Custom Hook: Keyboard Shortcuts
  useKeyboardShortcuts(state, updateState, () => setIsGuiVisible(!isGuiVisible), handleExport, isMobile, undo);

  const randomize = () => {
    const styles: ThemeStyle[] = ['baseline', 'purple', 'green', 'red', 'teal', 'pink', 'yellow', 'aurora'];
    const units: UnitPreset[] = ['time_mm_ss', 'time_hh_mm', 'time_hh_mm_ss', 'weight_lbs', 'length_ft_in', 'temp_c'];
    const modes: ('light'|'dark')[] = ['light', 'dark'];
    
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];

    const sizeScale = 0.8 + Math.random() * 0.4; 
    const isMono = Math.random() > 0.3;

    const baseWeight = Math.floor(Math.random() * 7 + 2) * 100; 
    const baseWidth = Math.floor(Math.random() * (125 - 75 + 1) + 75);
    
    setState(prev => ({
        ...prev,
        preset: 'custom',
        style: randomStyle,
        unit: randomUnit,
        mode: randomMode,
        showLabels: Math.random() > 0.5,
        showSeparators: Math.random() > 0.2,
        isMono: isMono,
        embeddedLabels: Math.random() > 0.7,
        hideInactive: Math.random() > 0.8,
        layout: {
            ...prev.layout,
            width: Math.floor(130 * sizeScale),
            height: Math.floor(170 * sizeScale),
            itemHeight: Math.floor(45 * sizeScale),
            gap: Math.floor(Math.random() * 10),
            containerRadius: Math.max(8, Math.floor(Math.random() * 32 + 8)),
            roundedFrame: Math.random() > 0.5
        },
        activeType: {
            size: Math.floor(45 * sizeScale),
            weight: baseWeight,
            width: baseWidth,
        },
        inactiveType: {
            size: Math.floor(45 * sizeScale * 0.9), 
            weight: Math.max(100, baseWeight - 100),
            width: baseWidth,
            colorRole: 'outline'
        },
        independentTypography: true
    }));
  };

  let toggleIcon = 'chevron_left';
  if (!isGuiVisible) {
      toggleIcon = isMobile ? 'expand_less' : 'tune'; 
  }
  if (isGuiVisible) {
      toggleIcon = 'chevron_left';
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden font-[Google_Sans_Text]">
      
      <div 
        className={`
            flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden z-50 border-r-0
            ${isGuiVisible ? 'w-full h-full md:w-[400px] md:h-full opacity-100' : 'w-0 h-0 md:w-0 md:h-full opacity-0'}
        `}
      >
          <Controls 
            state={state} 
            updateState={updateState} 
            randomize={randomize} 
            onExport={handleExport} 
            isMobile={isMobile}
            onToggleGui={() => setIsGuiVisible(!isGuiVisible)}
            canvasDimensions={dimensions}
            presets={presets}
            scrollZ={scrollZ}
            maxScroll={maxScroll}
          />
      </div>

      <main 
          id="main-preview-area"
          ref={mainRef}
          className="flex-1 relative overflow-hidden bg-[var(--surface)] flex items-center justify-center"
          style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d'
          }}
          onMouseDown={handleCanvasMouseDown}
          onDoubleClick={handleCanvasDoubleClick}
          onMouseMove={handleMainMouseMove}
          onMouseUp={handleMainMouseUp}
          onMouseLeave={(e) => {
              setIsRotating(false);
              handleMainMouseUp(e);
          }}
          onDragOver={canvas.handleDragOver}
          onDragLeave={canvas.handleDragLeave}
          onDrop={(e) => {
              const file = canvas.handleDrop(e);
              if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                      if (ev.target?.result) {
                          const img = new Image();
                          img.onload = () => {
                              updateState({
                                  backgroundImage: { 
                                      ...state.backgroundImage, 
                                      url: ev.target?.result as string,
                                      x: 0,
                                      y: 0,
                                      scaleX: 0.5,
                                      scaleY: 0.5,
                                      proportional: true,
                                      opacity: 1,
                                      visible: true,
                                      width: img.width,
                                      height: img.height
                                    },
                                    preset: 'custom',
                                    mode: 'light',
                                    style: 'baseline',
                                    mockup: { enabled: true },
                                    showScrim: true
                                });
                            };
                            img.src = ev.target.result as string;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }}
        >
          <button
            id="gui-toggle-btn"
            data-html2canvas-ignore="true"
            onClick={() => setIsGuiVisible(!isGuiVisible)}
            className="absolute top-4 left-4 z-40 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--primary)] hover:bg-[var(--surface-container-highest)] shadow-sm transition-all duration-300"
            title={isGuiVisible ? "Hide Controls (h)" : "Show Controls (h)"}
          >
              <span className="material-symbols-outlined text-[20px]">{toggleIcon}</span>
          </button>

          {state.backgroundImage.url && state.backgroundImage.visible && (
              <div
                className={`absolute z-0 select-none ${canvas.isDragging ? 'cursor-grabbing' : 'cursor-move'} group top-1/2 left-1/2`}
                style={{
                      transform: `translate(calc(-50% + ${state.backgroundImage.x}px), calc(-50% + ${state.backgroundImage.y}px))`,
                      opacity: state.backgroundImage.opacity * (scrollZ > 0 ? Math.max(0, 1 - scrollZ / 300) : 1),
                }}
                onMouseDown={canvas.handleBgMouseDown}
              >
                  <div 
                    className="relative inline-block bg-border-box"
                    style={{
                        transform: `scale(${state.backgroundImage.scaleX}, ${state.backgroundImage.scaleY})`
                    }}
                  >
                      <img 
                          src={state.backgroundImage.url}
                          alt="Reference"
                          className="block pointer-events-none select-none"
                          style={{ maxWidth: 'none' }}
                      />
                      
                      <div className={`absolute inset-0 pointer-events-none border-2 border-[var(--primary)] transition-opacity duration-200 ${canvas.isDragging || canvas.isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                           style={{ 
                               borderWidth: `${2 / Math.max(state.backgroundImage.scaleX, state.backgroundImage.scaleY)}px`
                           }}
                      />
                      
                      {[
                          { pos: '-top-1.5 -left-1.5', cursor: 'cursor-nwse-resize', corner: 'tl' },
                          { pos: '-top-1.5 -right-1.5', cursor: 'cursor-nesw-resize', corner: 'tr' },
                          { pos: '-bottom-1.5 -left-1.5', cursor: 'cursor-nesw-resize', corner: 'bl' },
                          { pos: '-bottom-1.5 -right-1.5', cursor: 'cursor-nwse-resize', corner: 'br' }
                      ].map((h) => (
                          <div
                             key={h.corner}
                             className={`resize-handle absolute ${h.pos} bg-white border-2 border-[var(--primary)] z-50 ${h.cursor} transition-opacity duration-200 ${canvas.isDragging || canvas.isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                             style={{
                                 width: '12px',
                                 height: '12px',
                                 transform: `scale(${1 / state.backgroundImage.scaleX}, ${1 / state.backgroundImage.scaleY})`,
                                 borderWidth: '2px'
                             }}
                             onMouseDown={canvas.handleResizeMouseDown}
                          />
                      ))}
                   </div>
              </div>
          )}
          
          {canvas.isDragOver && (
              <div 
                id="drop-overlay"
                className="absolute inset-4 border-2 border-dashed border-[var(--primary)] bg-[var(--surface-container)]/80 z-50 flex items-center justify-center rounded-[32px] backdrop-blur-none transition-all duration-200 pointer-events-none"
              >
                  <div className="flex flex-col items-center gap-4 text-[var(--primary)]">
                      <span className="material-symbols-outlined text-5xl">cloud_upload</span>
                      <span className="text-xl font-bold font-display">Drop Image Here</span>
                  </div>
              </div>
          )}


          <div
              id="shapes-3d-container"
              className="absolute inset-0 pointer-events-none"
              style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
              }}
          >
              {/* 1. Main Shapes */}
              <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                  {(() => {
                      const sortedShapes = (state.canvasShapes || [])
                          .map((shape, originalIndex) => ({ shape, originalIndex }))
                          .sort((a, b) => {
                              const zA = a.shape.zOffset || 0;
                              const zB = b.shape.zOffset || 0;
                              if (zA !== zB) {
                                  return zA - zB;
                              }
                              return a.originalIndex - b.originalIndex;
                          });

                      return sortedShapes.map(({ shape, originalIndex }) => {
                          const isSelected = state.selectedShapeId === shape.id;
                          const filterId = `round-filter-${shape.id}`;
                          const radius = shape.cornerRadius || 0;
                          const stdDev = radius / 4;
                          
                          const scaleFactor = shape.width / 192;
                          const computedBlur = shape.blur ? shape.blur * scaleFactor : 0;

                          const shapeIndex = shape.localIndex !== undefined ? shape.localIndex : originalIndex;
                          const scatterOffset = (getDeterministicRandom(shape.id) * -3000) * scatterProgress;
                          const baseZ = scrollZ + (shape.zOffset || 0) + scatterOffset;
                          const layerZ = baseZ + (Math.max(0, baseZ) * shapeIndex * 0.15);

                          const perspective = 1000;
                          const fadeStart = perspective - 200;
                          let opacity = 1;
                          
                          const minOpacityZ = -600 - (2900 * scatterProgress);
                          if (layerZ >= perspective) {
                              opacity = 0;
                          } else if (layerZ > fadeStart) {
                              opacity = (perspective - layerZ) / 200;
                          } else if (layerZ < minOpacityZ) {
                              opacity = 0;
                          } else if (layerZ < 0) {
                              opacity = (layerZ - minOpacityZ) / -minOpacityZ;
                          }

                          const getShapeBackground = () => {
                              if (shape.gradientStops && shape.gradientStops.length > 0) {
                                  const stopsStr = shape.gradientStops.map(s => {
                                      const pct = Math.round(s.offset * 100);
                                      return `${getCssColor(s.color, s.opacity)} ${pct}%`;
                                  }).join(', ');
                                  
                                  const angle = shape.gradientAngle !== undefined ? shape.gradientAngle : 180;
                                  if (shape.fillType === 'linear') {
                                      return `linear-gradient(in oklab ${angle}deg, ${stopsStr})`;
                                  } else if (shape.fillType === 'radial') {
                                      const cx = shape.radialCenterX !== undefined ? shape.radialCenterX * 100 : 50;
                                      const cy = shape.radialCenterY !== undefined ? shape.radialCenterY * 100 : 50;
                                      const rx = shape.radialRadiusX !== undefined ? shape.radialRadiusX * 100 : 50;
                                      const ry = shape.radialRadiusY !== undefined ? shape.radialRadiusY * 100 : 50;
                                      return `radial-gradient(in oklab ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, ${stopsStr})`;
                                  }
                              }

                              const colorStart = shape.gradientColorStart || shape.color;
                              const colorEnd = shape.gradientColorEnd || shape.color;
                              const opStart = shape.gradientOpacityStart !== undefined ? shape.gradientOpacityStart : 1;
                              const opEnd = shape.gradientOpacityEnd !== undefined ? shape.gradientOpacityEnd : 0;
                              const angle = shape.gradientAngle !== undefined ? shape.gradientAngle : 180;
                              
                              if (shape.fillType === 'linear') {
                                  return `linear-gradient(in oklab ${angle}deg, ${getCssColor(colorStart, opStart)}, ${getCssColor(colorEnd, opEnd)})`;
                              } else if (shape.fillType === 'radial') {
                                  const cx = shape.radialCenterX !== undefined ? shape.radialCenterX * 100 : 50;
                                  const cy = shape.radialCenterY !== undefined ? shape.radialCenterY * 100 : 50;
                                  const rx = shape.radialRadiusX !== undefined ? shape.radialRadiusX * 100 : 50;
                                  const ry = shape.radialRadiusY !== undefined ? shape.radialRadiusY * 100 : 50;
                                  return `radial-gradient(in oklab ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, ${getCssColor(colorStart, opStart)}, ${getCssColor(colorEnd, opEnd)})`;
                              }
                              return shape.color;
                          };

                          const maskUrl = (() => {
                              if (shape.name.includes('#')) {
                                  const [url, indexStr] = shape.name.split('#');
                                  const index = parseInt(indexStr, 10);
                                  const data = svgDataMap[url];
                                  if (data && data.elements[index]) {
                                      return data.elements[index];
                                  }
                                  return 'none';
                              }
                              return `url("./Shapes/${shape.name}")`;
                          })();

                          const glowMult = state.glowIntensityMultiplier !== undefined ? state.glowIntensityMultiplier : 1.0;
                          const showGlow = shape.hasGlow || state.globalGlowEnabled;

                          const posX = animatedPositions[shape.id] ? animatedPositions[shape.id].x : shape.x;
                          const posY = animatedPositions[shape.id] ? animatedPositions[shape.id].y : shape.y;

                          return (
                              <div
                                  key={shape.id}
                                  onMouseDown={(e) => handleShapeMouseDown(e, shape)}
                                  className="absolute select-none cursor-move group/shape pointer-events-auto"
                                  style={{
                                      left: `${posX}px`,
                                      top: `${posY}px`,
                                      width: `${shape.width}px`,
                                      height: `${shape.height}px`,
                                      transform: `translateZ(${layerZ}px)`,
                                      opacity: opacity,
                                      pointerEvents: scrollZ > 0 ? 'none' : 'auto',
                                      filter: showGlow ? `drop-shadow(0px 0px ${8 * glowMult}px ${getCssColor(shape.color, 0.85)}) drop-shadow(0px 0px ${16 * glowMult}px ${getCssColor(shape.color, 0.4)})` : undefined
                                  }}
                              >
                                  {radius > 0 && (
                                      <svg className="absolute w-0 h-0" style={{ pointerEvents: 'none' }}>
                                          <defs>
                                              <filter id={filterId}>
                                                  <feGaussianBlur in="SourceGraphic" stdDeviation={stdDev} result="blur" />
                                                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                                                  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                                              </filter>
                                          </defs>
                                      </svg>
                                  )}

                                  <div
                                      className="w-full h-full"
                                      style={{
                                          background: getShapeBackground(),
                                          maskImage: maskUrl,
                                          maskSize: '100% 100%',
                                          maskRepeat: 'no-repeat',
                                          maskPosition: 'center',
                                          WebkitMaskImage: maskUrl,
                                          WebkitMaskSize: '100% 100%',
                                          WebkitMaskRepeat: 'no-repeat',
                                          WebkitMaskPosition: 'center',
                                          filter: radius > 0 
                                              ? `url(#${filterId})${computedBlur > 0 ? ` blur(${computedBlur}px)` : ''}` 
                                              : (computedBlur > 0 ? `blur(${computedBlur}px)` : undefined),
                                      }}
                                  />

                                  {isSelected && (
                                      <>
                                          <div 
                                              className="absolute -inset-1.5 border-2 border-dashed border-[var(--primary)] pointer-events-none rounded-[8px] animate-pulse"
                                          />
                                          {[
                                              { pos: '-top-2 -left-2', cursor: 'cursor-nwse-resize', corner: 'tl' },
                                              { pos: '-top-2 -right-2', cursor: 'cursor-nesw-resize', corner: 'tr' },
                                              { pos: '-bottom-2 -left-2', cursor: 'cursor-nesw-resize', corner: 'bl' },
                                              { pos: '-bottom-2 -right-2', cursor: 'cursor-nwse-resize', corner: 'br' }
                                          ].map((h) => (
                                              <div
                                                 key={h.corner}
                                                 className={`absolute ${h.pos} w-3 h-3 bg-white border-2 border-[var(--primary)] z-[100] ${h.cursor} rounded-full`}
                                                 onMouseDown={(e) => handleShapeResizeMouseDown(e, shape, h.corner)}
                                              />
                                          ))}
                                      </>
                                  )}
                              </div>
                          );
                      });
                  })()}
              </div>

              {/* 2. Glow Bounce Layers */}
              {state.globalGlowEnabled && state.glowBounceEnabled && (
                  <div 
                      className="absolute inset-0 pointer-events-none" 
                      style={{ 
                          transformStyle: 'preserve-3d',
                          mixBlendMode: 'screen'
                      }}
                  >
                      {(() => {
                          const sortedShapes = (state.canvasShapes || [])
                              .map((shape, originalIndex) => ({ shape, originalIndex }))
                              .sort((a, b) => {
                                  const zA = a.shape.zOffset || 0;
                                  const zB = b.shape.zOffset || 0;
                                  if (zA !== zB) {
                                      return zA - zB;
                                  }
                                  return a.originalIndex - b.originalIndex;
                              });

                          return sortedShapes.map(({ shape, originalIndex }) => {
                              const shapeIndex = shape.localIndex !== undefined ? shape.localIndex : originalIndex;
                              const scatterOffset = (getDeterministicRandom(shape.id) * -3000) * scatterProgress;
                              const baseZ = scrollZ + (shape.zOffset || 0) + scatterOffset;
                              
                              const bounceIntensity = state.glowBounceIntensity !== undefined ? state.glowBounceIntensity : 0.5;
                              const layerZ = baseZ + (Math.max(0, baseZ) * shapeIndex * 0.15) + 15;

                              const perspective = 1000;
                              const fadeStart = perspective - 200;
                              let opacity = 1;
                              
                              const minOpacityZ = -600 - (2900 * scatterProgress);
                              if (layerZ >= perspective) opacity = 0;
                              else if (layerZ > fadeStart) opacity = (perspective - layerZ) / 200;
                              else if (layerZ < minOpacityZ) opacity = 0;
                              else if (layerZ < 0) opacity = (layerZ - minOpacityZ) / -minOpacityZ;

                              opacity *= bounceIntensity;

                              const maskUrl = (() => {
                                  if (shape.name.includes('#')) {
                                      const [url, indexStr] = shape.name.split('#');
                                      const index = parseInt(indexStr, 10);
                                      const data = svgDataMap[url];
                                      if (data && data.elements[index]) return data.elements[index];
                                      return 'none';
                                  }
                                  return `url("./Shapes/${shape.name}")`;
                              })();

                              const glowMult = state.glowIntensityMultiplier !== undefined ? state.glowIntensityMultiplier : 1.0;
                              const glowColor = getCssColor(shape.color, 0.95);
                              
                              const posX = animatedPositions[shape.id] ? animatedPositions[shape.id].x : shape.x;
                              const posY = animatedPositions[shape.id] ? animatedPositions[shape.id].y : shape.y;

                              return (
                                  <div
                                      key={`bounce_${shape.id}`}
                                      className="absolute pointer-events-none"
                                      style={{
                                          left: `${posX}px`,
                                          top: `${posY}px`,
                                          width: `${shape.width}px`,
                                          height: `${shape.height}px`,
                                          transform: `translateZ(${layerZ}px)`,
                                          opacity: opacity,
                                          pointerEvents: 'none',
                                          backgroundColor: glowColor,
                                          maskImage: maskUrl,
                                          WebkitMaskImage: maskUrl,
                                          maskSize: '100% 100%',
                                          WebkitMaskSize: '100% 100%',
                                          filter: `blur(${16 * glowMult}px) drop-shadow(0px 0px ${24 * glowMult}px ${glowColor})`,
                                      }}
                                  />
                              );
                          });
                      })()}
                  </div>
              )}
          </div>

          {(scrollZ > 0 || rotateX !== 0 || rotateY !== 0) && (
              <button
                id="reset-view-btn"
                data-html2canvas-ignore="true"
                onClick={() => {
                    if (rafRef.current !== null) {
                        cancelAnimationFrame(rafRef.current);
                        rafRef.current = null;
                    }
                    scrollZRef.current = 0;
                    targetScrollRef.current = 0;
                    setScrollZ(0);
                    setTargetScrollZ(0);
                    setRotateX(0);
                    setRotateY(0);
                }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 shadow-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 pointer-events-auto"
              >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Reset 3D View
              </button>
          )}

          <div 
                id="dimensions-indicator"
                data-html2canvas-ignore="true"
                className="absolute bottom-4 right-4 z-60 px-2 py-1 rounded-md bg-[var(--surface-container-high)]/80 backdrop-blur-sm text-[var(--on-surface-variant)] text-[11px] font-mono font-medium pointer-events-none select-none opacity-70 hover:opacity-100 transition-opacity"
            >
                {dimensions.width} x {dimensions.height}
            </div>
      </main>
    </div>
  );
};

export default App;
