import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';

interface UseCanvasControlsProps {
    state: AppState;
    updateState: (updates: Partial<AppState>) => void;
    mainRef: React.RefObject<HTMLElement>;
}

export const useCanvasControls = ({ state, updateState, mainRef }: UseCanvasControlsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [isResizing, setIsResizing] = useState(false);
  const [initialResizeDist, setInitialResizeDist] = useState(0);
  const [initialScaleX, setInitialScaleX] = useState(1);
  const [initialScaleY, setInitialScaleY] = useState(1);
  
  const [isDragOver, setIsDragOver] = useState(false);

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const handleBgMouseDown = (e: React.MouseEvent) => {
      if (!state.backgroundImage.url || !state.backgroundImage.visible) return;
      if ((e.target as HTMLElement).closest('.resize-handle')) return;
      
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ 
          x: e.clientX - state.backgroundImage.x, 
          y: e.clientY - state.backgroundImage.y 
      });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setInitialScaleX(state.backgroundImage.scaleX);
      setInitialScaleY(state.backgroundImage.scaleY);
      
      const rect = mainRef.current?.getBoundingClientRect();
      if (rect) {
          const centerX = rect.left + (rect.width / 2) + state.backgroundImage.x;
          const centerY = rect.top + (rect.height / 2) + state.backgroundImage.y;
          
          const dist = getDistance(centerX, centerY, e.clientX, e.clientY);
          setInitialResizeDist(dist);
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          updateState({
              backgroundImage: {
                  ...state.backgroundImage,
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
              }
          });
      } else if (isResizing) {
          const rect = mainRef.current?.getBoundingClientRect();
          if (rect) {
              const centerX = rect.left + (rect.width / 2) + state.backgroundImage.x;
              const centerY = rect.top + (rect.height / 2) + state.backgroundImage.y;
              
              const currentDist = getDistance(centerX, centerY, e.clientX, e.clientY);
              
              if (initialResizeDist > 0) {
                  const ratio = currentDist / initialResizeDist;
                  const newScaleX = initialScaleX * ratio;
                  const newScaleY = initialScaleY * ratio;

                  updateState({
                      backgroundImage: { 
                          ...state.backgroundImage, 
                          scaleX: Math.max(0.05, newScaleX),
                          scaleY: Math.max(0.05, newScaleY)
                      }
                  });
              }
          }
      }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
  };

  const handleBgWheel = (e: React.WheelEvent | WheelEvent) => {
      if (!state.backgroundImage.url || !state.backgroundImage.visible) return;
      
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY * 0.001;
          const newScaleX = Math.max(0.05, Math.min(5.0, state.backgroundImage.scaleX - delta));
          const newScaleY = Math.max(0.05, Math.min(5.0, state.backgroundImage.scaleY - delta));
          
          updateState({
              backgroundImage: { ...state.backgroundImage, scaleX: newScaleX, scaleY: newScaleY }
          });
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
             return file;
          }
      }
      return null;
  };

  return {
      handleBgMouseDown,
      handleResizeMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleBgWheel,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      isDragging,
      isResizing,
      isDragOver
  };
};