/**
 * useTimeSeriesAnalysis Hook
 * Time-series analysis and decomposition
 */

import { useCallback, useState } from 'react';

export function useTimeSeriesAnalysis() {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Decompose time series into trend, seasonal, and residual components
  const decomposeTimeSeries = useCallback((data, period = 12) => {
    if (!data || data.length < period * 2) {
      throw new Error('Insufficient data for decomposition');
    }

    const values = data.map((d) => d.value || d);

    // Calculate trend using centered moving average
    const trend = [];
    for (let i = Math.floor(period / 2); i < values.length - Math.floor(period / 2); i++) {
      const windowStart = i - Math.floor(period / 2);
      const windowEnd = i + Math.floor(period / 2) + 1;
      const avg = values.slice(windowStart, windowEnd).reduce((a, b) => a + b, 0) / period;
      trend.push(avg);
    }

    // Calculate seasonal component
    const seasonal = [];
    for (let i = 0; i < period; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i; j < values.length; j += period) {
        sum += values[j];
        count++;
      }
      seasonal.push(sum / count);
    }

    // Normalize seasonal
    const seasonalAvg = seasonal.reduce((a, b) => a + b, 0) / seasonal.length;
    const normalizedSeasonal = seasonal.map((s) => s - seasonalAvg);

    // Calculate residual (remainder)
    const residual = [];
    for (let i = 0; i < values.length; i++) {
      const trendIdx = i - Math.floor(period / 2);
      const seasonalIdx = i % period;
      const trendVal = trendIdx >= 0 && trendIdx < trend.length ? trend[trendIdx] : values[i];
      const seasonalVal = normalizedSeasonal[seasonalIdx];
      residual.push(values[i] - trendVal - seasonalVal);
    }

    return {
      original: values,
      trend,
      seasonal: normalizedSeasonal,
      residual,
      period,
    };
  }, []);

  // Calculate autocorrelation
  const calculateAutocorrelation = useCallback((data, maxLag = 20) => {
    const values = data.map((d) => d.value || d);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const centered = values.map((v) => v - mean);

    const variance = centered.reduce((a, b) => a + b * b, 0) / values.length;

    const acf = [];
    for (let lag = 0; lag <= maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < values.length - lag; i++) {
        sum += centered[i] * centered[i + lag];
      }
      acf.push(sum / (values.length * variance));
    }

    return acf;
  }, []);

  // Detect stationarity (simple test)
  const testStationarity = useCallback((data) => {
    const values = data.map((d) => d.value || d);

    // Split into two halves
    const half = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, half);
    const secondHalf = values.slice(half);

    const mean1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const mean2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const var1 = firstHalf.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / firstHalf.length;
    const var2 = secondHalf.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / secondHalf.length;

    const meanDiff = Math.abs(mean1 - mean2);
    const varRatio = Math.max(var1, var2) / (Math.min(var1, var2) || 1);

    // Simple heuristic for stationarity
    const isStationary = meanDiff < values.reduce((a, b) => a + b, 0) / values.length * 0.1 && varRatio < 2;

    return {
      isStationary,
      mean1,
      mean2,
      variance1: var1,
      variance2: var2,
      pValue: isStationary ? 0.05 : 0.95, // Simplified p-value
    };
  }, []);

  // Calculate differencing
  const differenceTimeSeries = useCallback((data, order = 1) => {
    let current = data.map((d) => d.value || d);

    for (let i = 0; i < order; i++) {
      const differenced = [];
      for (let j = 1; j < current.length; j++) {
        differenced.push(current[j] - current[j - 1]);
      }
      current = differenced;
    }

    return current;
  }, []);

  // Perform full analysis
  const analyzeTimeSeries = useCallback((data, period = 12) => {
    const decomposed = decomposeTimeSeries(data, period);
    const stationarity = testStationarity(data);
    const acf = calculateAutocorrelation(data);

    const analysis = {
      decomposition: decomposed,
      stationarity,
      autocorrelation: acf,
      timestamp: new Date().toISOString(),
    };

    setAnalysisResults(analysis);
    setTimeSeriesData(data);

    return analysis;
  }, [decomposeTimeSeries, testStationarity, calculateAutocorrelation]);

  return {
    timeSeriesData,
    analysisResults,
    analyzeTimeSeries,
    decomposeTimeSeries,
    calculateAutocorrelation,
    testStationarity,
    differenceTimeSeries,
  };
}

export default useTimeSeriesAnalysis;