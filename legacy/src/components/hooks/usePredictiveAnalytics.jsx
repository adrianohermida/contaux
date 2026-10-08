/**
 * usePredictiveAnalytics Hook
 * ML-powered predictive analytics and forecasting
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function usePredictiveAnalytics(workspaceId, dataPoints = []) {
  const [predictions, setPredictions] = useState([]);

  // Fetch historical data for training
  const { data: historicalData = [] } = useQuery({
    queryKey: ['historical-data', workspaceId],
    queryFn: async () => {
      // In production, fetch from base44 entities
      return dataPoints || [];
    },
    enabled: !!workspaceId,
  });

  // Simple linear regression implementation
  const calculateLinearRegression = useCallback((data) => {
    if (data.length < 2) return null;

    const n = data.length;
    const xValues = data.map((_, i) => i);
    const yValues = data.map((d) => d.value || d);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }, []);

  // Generate predictions using linear regression
  const predictTrend = useCallback(
    (data, futurePoints = 5) => {
      const regression = calculateLinearRegression(data);
      if (!regression) return [];

      const { slope, intercept } = regression;
      const predictions = [];
      const startIndex = data.length;

      for (let i = 0; i < futurePoints; i++) {
        const x = startIndex + i;
        const predictedValue = slope * x + intercept;
        const confidence = Math.max(0.5, 1 - i * 0.1); // Decreasing confidence over time

        predictions.push({
          period: i + 1,
          value: Math.max(0, predictedValue), // Ensure non-negative
          confidence: confidence,
          lower_bound: predictedValue * 0.9,
          upper_bound: predictedValue * 1.1,
        });
      }

      return predictions;
    },
    [calculateLinearRegression]
  );

  // Calculate simple moving average
  const calculateMovingAverage = useCallback((data, window = 3) => {
    if (data.length < window) return data;

    const values = data.map((d) => d.value || d);
    const movingAverages = [];

    for (let i = window - 1; i < values.length; i++) {
      const avg = values
        .slice(i - window + 1, i + 1)
        .reduce((a, b) => a + b, 0) / window;
      movingAverages.push(avg);
    }

    return movingAverages;
  }, []);

  // Detect trend direction
  const detectTrend = useCallback((data) => {
    if (data.length < 2) return 'stable';

    const values = data.map((d) => d.value || d);
    const recent = values.slice(-5);
    const older = values.slice(Math.max(0, values.length - 10), -5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0;

    const percentChange = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    if (percentChange > 5) return 'up';
    if (percentChange < -5) return 'down';
    return 'stable';
  }, []);

  // Calculate prediction accuracy metrics
  const calculateAccuracy = useCallback((actual, predicted) => {
    if (actual.length === 0 || predicted.length === 0) return 0;

    const minLength = Math.min(actual.length, predicted.length);
    const values = actual.slice(0, minLength);
    const preds = predicted.slice(0, minLength);

    // Mean Absolute Percentage Error (MAPE)
    let sumError = 0;
    for (let i = 0; i < minLength; i++) {
      const actualVal = values[i].value || values[i];
      const predVal = preds[i].value || preds[i];
      if (actualVal !== 0) {
        sumError += Math.abs((actualVal - predVal) / actualVal);
      }
    }

    const mape = (sumError / minLength) * 100;
    const accuracy = Math.max(0, 100 - mape);

    return Math.min(100, accuracy);
  }, []);

  // Generate confidence intervals
  const generateConfidenceIntervals = useCallback((predictions, confidence = 0.95) => {
    return predictions.map((pred) => {
      const zScore = confidence === 0.95 ? 1.96 : confidence === 0.90 ? 1.645 : 1;
      const margin = pred.value * 0.1; // 10% margin

      return {
        ...pred,
        lower_bound: pred.value - zScore * margin,
        upper_bound: pred.value + zScore * margin,
      };
    });
  }, []);

  // Create prediction
  const createPrediction = useCallback(
    (name, data, futurePoints = 5) => {
      const predictions = predictTrend(data, futurePoints);
      const trend = detectTrend(data);
      const movingAvg = calculateMovingAverage(data);
      const confidence = calculateAccuracy(data, movingAvg);
      const intervalsWithCI = generateConfidenceIntervals(predictions);

      const prediction = {
        id: Math.random().toString(36).substr(2, 9),
        workspace_id: workspaceId,
        name,
        trend,
        predictions: intervalsWithCI,
        confidence,
        data_points: data.length,
        created_at: new Date().toISOString(),
      };

      setPredictions((prev) => [...prev, prediction]);
      return prediction;
    },
    [
      workspaceId,
      predictTrend,
      detectTrend,
      calculateMovingAverage,
      calculateAccuracy,
      generateConfidenceIntervals,
    ]
  );

  // Get prediction statistics
  const getPredictionStats = useCallback(() => {
    if (predictions.length === 0) {
      return {
        total: 0,
        avgConfidence: 0,
        trendBreakdown: { up: 0, down: 0, stable: 0 },
      };
    }

    const avgConfidence =
      predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const trendBreakdown = {
      up: predictions.filter((p) => p.trend === 'up').length,
      down: predictions.filter((p) => p.trend === 'down').length,
      stable: predictions.filter((p) => p.trend === 'stable').length,
    };

    return {
      total: predictions.length,
      avgConfidence: Math.round(avgConfidence),
      trendBreakdown,
    };
  }, [predictions]);

  // Get predictive insights
  const getInsights = useCallback(() => {
    const stats = getPredictionStats();
    const insights = [];

    if (stats.avgConfidence > 85) {
      insights.push({
        type: 'high_confidence',
        title: 'High Confidence Predictions',
        message: `Current predictions have ${stats.avgConfidence}% average confidence`,
      });
    }

    if (stats.trendBreakdown.up > stats.trendBreakdown.down) {
      insights.push({
        type: 'upward_trend',
        title: 'Upward Trend Detected',
        message: `${stats.trendBreakdown.up} metrics showing upward trend`,
      });
    }

    if (stats.trendBreakdown.down > 0) {
      insights.push({
        type: 'downward_trend',
        title: 'Downward Trend Detected',
        message: `${stats.trendBreakdown.down} metrics showing downward trend`,
      });
    }

    return insights;
  }, [getPredictionStats]);

  return {
    predictions,
    createPrediction,
    predictTrend,
    detectTrend,
    calculateMovingAverage,
    calculateAccuracy,
    generateConfidenceIntervals,
    getPredictionStats,
    getInsights,
  };
}

export default usePredictiveAnalytics;