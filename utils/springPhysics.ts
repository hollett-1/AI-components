
/**
 * Calculates the position of a spring at a given time point.
 * Adapted from the Android Spring implementation logic.
 */
export interface SpringResult {
    value: number;
    velocity: number;
}

export interface SpringParams {
    stiffness: number;
    damping: number; // Damping Ratio (0-1)
    mass: number;
    initialVelocity: number;
}

export function solveSpring(
    startValue: number,
    endValue: number,
    params: SpringParams,
    timeElapsedSeconds: number // Time in seconds
): SpringResult {
    const { stiffness, damping: dampingRatio, initialVelocity } = params;
    
    // Initial State relative to equilibrium (endValue)
    const initialDisplacement = startValue - endValue;
    const finalPosition = endValue;

    const naturalFreq = Math.sqrt(stiffness);
    const dampingRatioSquared = dampingRatio * dampingRatio;

    let displacement = 0;
    let currentVelocity = 0;

    // Based on `updateValues` in provided logic
    if (dampingRatio > 1) {
        // Overdamped
        const gammaPlus = -dampingRatio * naturalFreq + naturalFreq * Math.sqrt(dampingRatioSquared - 1);
        const gammaMinus = -dampingRatio * naturalFreq - naturalFreq * Math.sqrt(dampingRatioSquared - 1);
        
        const coeffA = initialDisplacement - (gammaMinus * initialDisplacement - initialVelocity) / (gammaMinus - gammaPlus);
        const coeffB = (gammaMinus * initialDisplacement - initialVelocity) / (gammaMinus - gammaPlus);
        
        displacement = coeffA * Math.exp(gammaMinus * timeElapsedSeconds) + 
                       coeffB * Math.exp(gammaPlus * timeElapsedSeconds);
        
        currentVelocity = coeffA * gammaMinus * Math.exp(gammaMinus * timeElapsedSeconds) + 
                          coeffB * gammaPlus * Math.exp(gammaPlus * timeElapsedSeconds);

    } else if (dampingRatio === 1) {
        // Critically Damped
        const coeffA = initialDisplacement;
        const coeffB = initialVelocity + naturalFreq * initialDisplacement;
        
        displacement = (coeffA + coeffB * timeElapsedSeconds) * Math.exp(-naturalFreq * timeElapsedSeconds);
        
        currentVelocity = (coeffA + coeffB * timeElapsedSeconds) * Math.exp(-naturalFreq * timeElapsedSeconds) * -naturalFreq +
                          coeffB * Math.exp(-naturalFreq * timeElapsedSeconds);

    } else {
        // Underdamped (Most common for animations)
        const dampedFreq = naturalFreq * Math.sqrt(1 - dampingRatioSquared);
        
        const cosCoeff = initialDisplacement;
        const sinCoeff = (1 / dampedFreq) * (dampingRatio * naturalFreq * initialDisplacement + initialVelocity);
        
        const exponentialDecay = Math.exp(-dampingRatio * naturalFreq * timeElapsedSeconds);
        
        displacement = exponentialDecay * 
                      (cosCoeff * Math.cos(dampedFreq * timeElapsedSeconds) + 
                       sinCoeff * Math.sin(dampedFreq * timeElapsedSeconds));
                       
        currentVelocity = displacement * -naturalFreq * dampingRatio + 
                          exponentialDecay * 
                          (-dampedFreq * cosCoeff * Math.sin(dampedFreq * timeElapsedSeconds) + 
                           dampedFreq * sinCoeff * Math.cos(dampedFreq * timeElapsedSeconds));
    }

    return {
        value: displacement + finalPosition,
        velocity: currentVelocity
    };
}
