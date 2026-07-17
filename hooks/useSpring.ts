
import { useState, useRef, useEffect, useCallback } from 'react';
import { solveSpring, SpringParams } from '../utils/springPhysics';

interface UseSpringOptions extends Omit<SpringParams, 'initialVelocity'> {
    initialVelocity?: number;
    threshold?: number;
}

export interface SpringHandle {
    value: number;
    current: number;
    update: (newValue: number, newVelocity?: number) => void;
    start: () => void;
}

/**
 * Hook that interpolates a value using spring physics.
 * Returns an object with the current value and an update function to manually set state.
 */
export const useSpring = (
    target: number, 
    config: UseSpringOptions,
    onChange?: (value: number) => void
): SpringHandle => {
    const [value, setValue] = useState(target);
    const state = useRef({
        currentValue: target,
        targetValue: target,
        velocity: config.initialVelocity || 0,
        startTime: 0,
        startValue: target,
        animating: false,
        lastFrameTime: 0
    });
    
    const configRef = useRef(config);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        configRef.current = config;
        onChangeRef.current = onChange;
    });

    const rafRef = useRef<number>(0);

    const animate = useCallback((timestamp: number) => {
        if (!state.current.animating) return;

        if (state.current.startTime === 0) {
            state.current.startTime = timestamp;
            state.current.lastFrameTime = timestamp;
        }

        const timeSinceLastFrame = timestamp - state.current.lastFrameTime;
        const fpsInterval = 1000 / 24; // ~41.67ms for 24 FPS

        if (timeSinceLastFrame < fpsInterval) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }

        // Adjust last frame time to keep the target frame rate stable
        state.current.lastFrameTime = timestamp - (timeSinceLastFrame % fpsInterval);

        const elapsedSeconds = (timestamp - state.current.startTime) / 1000;
        
        // Solve the physics
        const result = solveSpring(
            state.current.startValue,
            state.current.targetValue,
            {
                stiffness: configRef.current.stiffness,
                damping: configRef.current.damping,
                mass: configRef.current.mass,
                initialVelocity: state.current.velocity
            },
            elapsedSeconds
        );

        state.current.currentValue = result.value;
        state.current.velocity = result.velocity;

        // Check for rest (threshold)
        const isResting = Math.abs(state.current.targetValue - result.value) < (configRef.current.threshold || 0.1) && 
                          Math.abs(result.velocity) < (configRef.current.threshold || 0.1);

        if (isResting) {
            state.current.currentValue = state.current.targetValue;
            state.current.velocity = 0;
            state.current.animating = false;
        }

        // Update React state or Callback
        if (onChangeRef.current) {
            onChangeRef.current(state.current.currentValue);
        } else {
            setValue(state.current.currentValue);
        }

        if (!isResting) {
            rafRef.current = requestAnimationFrame(animate);
        }
    }, []);

    // Imperative start to resume animation (e.g. after manual drag release)
    const start = useCallback(() => {
        if (state.current.animating) return;
        
        const now = performance.now();
        // Reset start conditions relative to current position
        state.current.startValue = state.current.currentValue;
        state.current.startTime = now;
        state.current.lastFrameTime = now;
        state.current.animating = true;
        
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
    }, [animate]);

    useEffect(() => {
        // Target changed
        if (target !== state.current.targetValue) {
            const now = performance.now();
            
            // Start new animation relative to current position
            state.current.startValue = state.current.currentValue;
            state.current.targetValue = target;
            
            // Keep continuous timeline if already animating
            state.current.startTime = state.current.animating ? (state.current.lastFrameTime || now) : now;
            state.current.lastFrameTime = state.current.animating ? (state.current.lastFrameTime || now) : now;
            
            state.current.animating = true;
            
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(animate);
        }
    }, [target, animate]);

    // Manual Update Function
    const update = useCallback((newValue: number, newVelocity?: number) => {
        const now = performance.now();
        state.current.currentValue = newValue;
        state.current.startValue = newValue;
        state.current.startTime = now;
        state.current.lastFrameTime = now;
        state.current.animating = false; // Stop animation loop to allow manual control
        
        if (newVelocity !== undefined) {
            state.current.velocity = newVelocity;
        }

        if (onChange) {
            onChange(newValue);
        } else {
            setValue(newValue);
        }
    }, [onChange]);

    // Cleanup
    useEffect(() => {
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return { 
        value: onChange ? state.current.currentValue : value, 
        update,
        start,
        // Expose synchronous getter for refs/handlers
        get current() { return state.current.currentValue; }
    };
};
