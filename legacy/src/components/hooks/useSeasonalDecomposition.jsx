/**
 * useSeasonalDecomposition Hook
 * Advanced seasonal pattern detection and decomposition
 */

import { useCallback, useState } from 'react';

export function useSeasonalDecomposition() {
  const [seasonalPatterns, setSeasonalPatterns] = useState([]);
  const [decompositionResult, setDecompositionResult] = useState(null);

  // Detect seasonal period
  const detectSeasonalPeriod = useCallback((data) => {
    if (!data || data.length < 24) {
      return 12; // Default to 12 for monthly data
    }

    const values = data.map((d) => d.value || d);
    const acf = [];

    // Calculate ACF for different lags
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const centered = values.map((v) => v - mean);
    const variance = centered.reduce((a, b) => a + b * b, 0) / values.length;

    for (let lag = 1; lag <= Math.min(60, Math.floor(values.length / 2)); lag++) {
      let sum = 0;
      for (let i = 0; i < values.length - lag; i++) {
        sum += centered[i] * centered[i + lag];
      }
      acf.push({ lag, correlation: sum / (values.length * variance) });
    }

    // Find dominant period (highest ACF peak after lag 1)
    let maxCorr = 0;
    let period = 12;

    for (let i = 6; i < acf.length; i++) {
      if (acf[i].correlation > maxCorr && acf[i].correlation > 0.3) {
        maxCorr = acf[i].correlation;
        period = acf[i].lag;
      }
    }

    return period;
  }, []);

  // Extract seasonal pattern
  const extractSeasonalPattern = useCallback((data, period) => {
    const values = data.map((d) => d.value || d);
    const pattern = Array(period).fill(0);
    const counts = Array(period).fill(0);

    // Calculate average for each seasonal position
    for (let i = 0; i < values.length; i++) {
      const position = i % period;
      pattern[position] += values[i];
      counts[position]++;
    }

    // Normalize by count
    const seasonalPattern = pattern.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 0));

    // Normalize to zero mean
    const mean = seasonalPattern.reduce((a, b) => a + b, 0) / seasonalPattern.length;
    return seasonalPattern.map((s) => s - mean);
  }, []);

  // Perform STL decomposition (Seasonal and Trend decomposition using Loess)
  const performSTLDecomposition = useCallback(
    (data, period = null, seasonalLength = 13, trendLength = null) => {
      const values = data.map((d) => d.value || d);
      const detectedPeriod = period || detectSeasonalPeriod(data);
      const trend = [];
      const seasonal = [];
      const residual = [];

      // Simple STL-like decomposition
      // Step 1: Calculate trend using centered moving average
      const halfPeriod = Math.floor(detectedPeriod / 2);
      for (let i = 0; i < values.length; i++) {
        const windowStart = Math.max(0, i - halfPeriod);
        const windowEnd = Math.min(values.length, i + halfPeriod + 1);
        const trendVal = values.slice(windowStart, windowEnd).reduce((a, b) => a + b, 0) /
          (windowEnd - windowStart);
        trend.push(trendVal);
      }

      // Step 2: Detrend
      const detrended = values.map((v, i) => v - trend[i]);

      // Step 3: Calculate seasonal component
      const seasonalComponent = extractSeasonalPattern(
        detrended.map((v, i) => ({ value: v, index: i })),
        detectedPeriod
      );

      // Expand seasonal to full length
      for (let i = 0; i < values.length; i++) {
        const position = i % detectedPeriod;
        seasonal.push(seasonalComponent[position]);
      }

      // Step 4: Calculate residual
      for (let i = 0; i < values.length; i++) {
        residual.push(values[i] - trend[i] - seasonal[i]);
      }

      const result = {
        original: values,
        trend,
        seasonal,
        residual,
        period: detectedPeriod,
        strength: calculateSeasonalStrength(values, seasonal, residual),
      };

      setDecompositionResult(result);
      return result;
    },
    [detectSeasonalPeriod, extractSeasonalPattern]
  );

  // Calculate seasonal strength
  const calculateSeasonalStrength = useCallback((original, seasonal, residual) => {
    const var_seasonal = seasonal.reduce((a, b) => a + b * b, 0) / seasonal.length;
    const var_residual = residual.reduce((a, b) => a + b * b, 0) / residual.length;
    const strength = var_seasonal / (var_seasonal + var_residual);
    return Math.min(1, Math.max(0, strength));
  }, []);

  // Detect anomalies in seasonal pattern
  const detectSeasonalAnomalies = useCallback((data, threshold = 2) => {
    if (!decompositionResult) {
      throw new Error('Run decomposition first');
    }

    const { residual } = decompositionResult;
    const mean = residual.reduce((a, b) => a + b, 0) / residual.length;
    const std = Math.sqrt(residual.reduce((a, b) => a + (b - mean) * (b - mean), 0) / residual.length);

    const anomalies = [];
    residual.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / (std || 1));
      if (zScore > threshold) {
        anomalies.push({
          index,
          value,
          zScore,
          magnitude: Math.abs(value),
        });
      }
    });

    return anomalies.sort((a, b) => b.zScore - a.zScore);
  }, [decompositionResult]);

  // Get seasonal indices
  const getSeasonalIndices = useCallback(
    (data, period = null) => {
      const detectedPeriod = period || detectSeasonalPeriod(data);
      const values = data.map((d) => d.value || d);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;

      const indices = Array(detectedPeriod).fill(0);
      const counts = Array(detectedPeriod).fill(0);

      for (let i = 0; i < values.length; i++) {
        const position = i % detectedPeriod;
        indices[position] += values[i] / mean;
        counts[position]++;
      }

      return indices.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 1));
    },
    [detectSeasonalPeriod]
  );

  return {
    seasonalPatterns,
    decompositionResult,
    detectSeasonalPeriod,
    extractSeasonalPattern,
    performSTLDecomposition,
    calculateSeasonalStrength,
    detectSeasonalAnomalies,
    getSeasonalIndices,
  };
}

export default useSeasonalDecomposition;