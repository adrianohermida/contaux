/**
 * useAdvancedAnalyticsEngine Hook
 * Real-time event tracking, behavioral analytics, cohort analysis, and predictive insights
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useAdvancedAnalyticsEngine(options = {}) {
  const {
    enableRealTime = true,
    enablePredictive = true,
    enableCohorts = true,
    batchSize = 50,
    flushInterval = 5000,
  } = options;

  const [analyticsState, setAnalyticsState] = useState({
    totalEvents: 0,
    totalSessions: 0,
    activeUsers: 0,
    conversionRate: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    isProcessing: false,
    error: null,
    lastUpdate: null,
  });

  const [eventData, setEventData] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [cohortData, setCohortData] = useState([]);
  const [predictiveMetrics, setPredictiveMetrics] = useState({});
  const eventQueue = useRef([]);
  const sessionTimer = useRef(null);
  const flushTimer = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);

  // Track event
  const trackEvent = useCallback((eventName, properties = {}) => {
    const event = {
      id: `event-${Date.now()}-${Math.random()}`,
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: properties.userId || 'anonymous',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    eventQueue.current.push(event);
    setEventData((prev) => [...prev, event].slice(-500)); // Keep last 500 events

    // Auto-flush if queue reaches batch size
    if (eventQueue.current.length >= batchSize) {
      flushEvents();
    }

    return event;
  }, [batchSize]);

  // Flush events to analytics backend
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    setAnalyticsState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const batch = [...eventQueue.current];
      eventQueue.current = [];

      // Simulate sending to backend
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update total events
      setAnalyticsState((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents + batch.length,
        lastUpdate: new Date(),
        isProcessing: false,
      }));

      return { success: true, count: batch.length };
    } catch (error) {
      setAnalyticsState((prev) => ({
        ...prev,
        isProcessing: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, []);

  // Calculate conversion metrics
  const calculateConversions = useCallback((events) => {
    if (events.length === 0) return { rate: 0, conversions: 0 };

    const conversionEvents = events.filter((e) =>
      ['purchase', 'signup', 'subscribe', 'conversion'].includes(e.name)
    );

    const rate = (conversionEvents.length / events.length) * 100;
    return { rate: parseFloat(rate.toFixed(2)), conversions: conversionEvents.length };
  }, []);

  // Calculate session metrics
  const calculateSessionMetrics = useCallback((sessions) => {
    if (sessions.length === 0) {
      return { avgDuration: 0, bounceRate: 0, totalSessions: 0 };
    }

    const avgDuration =
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    const bouncedSessions = sessions.filter((s) => s.eventCount === 1).length;
    const bounceRate = (bouncedSessions / sessions.length) * 100;

    return {
      avgDuration: parseFloat(avgDuration.toFixed(2)),
      bounceRate: parseFloat(bounceRate.toFixed(2)),
      totalSessions: sessions.length,
    };
  }, []);

  // Create session
  const startSession = useCallback(() => {
    const newSession = {
      id: sessionId.current,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      eventCount: 0,
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      events: [],
    };

    setSessionData((prev) => [...prev, newSession]);

    // Auto-end session after 30 minutes
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = setTimeout(() => {
      endSession();
    }, 30 * 60 * 1000);

    return newSession;
  }, []);

  // End session
  const endSession = useCallback(() => {
    setSessionData((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].endTime = Date.now();
        updated[updated.length - 1].duration =
          updated[updated.length - 1].endTime - updated[updated.length - 1].startTime;
      }
      return updated;
    });

    sessionId.current = `session-${Date.now()}`;
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
  }, []);

  // Create user cohorts based on behavior
  const createCohorts = useCallback(() => {
    const cohorts = {};

    eventData.forEach((event) => {
      const behaviorType = event.name;
      if (!cohorts[behaviorType]) {
        cohorts[behaviorType] = {
          name: behaviorType,
          users: new Set(),
          eventCount: 0,
          firstSeen: event.timestamp,
          lastSeen: event.timestamp,
        };
      }

      cohorts[behaviorType].users.add(event.userId);
      cohorts[behaviorType].eventCount += 1;
      cohorts[behaviorType].lastSeen = Math.max(cohorts[behaviorType].lastSeen, event.timestamp);
    });

    // Convert Set to count for display
    const cohortArray = Object.values(cohorts).map((cohort) => ({
      ...cohort,
      userCount: cohort.users.size,
      users: undefined, // Don't expose full set
    }));

    setCohortData(cohortArray);
    return cohortArray;
  }, [eventData]);

  // Calculate funnel metrics
  const calculateFunnel = useCallback((steps) => {
    const eventNames = steps.map((s) => s.toLowerCase());
    const funnel = [];

    eventNames.forEach((step) => {
      const stepEvents = eventData.filter((e) => e.name.toLowerCase() === step);
      const uniqueUsers = new Set(stepEvents.map((e) => e.userId)).size;

      funnel.push({
        step,
        count: stepEvents.length,
        uniqueUsers,
        rate:
          funnel.length > 0
            ? ((stepEvents.length / funnel[0].count) * 100).toFixed(2)
            : 100,
      });
    });

    return funnel;
  }, [eventData]);

  // Generate predictive metrics using simple ML
  const generatePredictiveMetrics = useCallback(() => {
    if (eventData.length < 10) return {};

    // Simple trend analysis
    const recent = eventData.slice(-100);
    const older = eventData.slice(-200, -100);

    const recentRate = recent.length / 100;
    const olderRate = older.length / 100;
    const trend = ((recentRate - olderRate) / olderRate) * 100;

    // Predict conversion rate
    const conversions = calculateConversions(eventData);
    const predictedConversion = conversions.rate * (1 + trend / 100);

    // Predict churn risk
    const inactiveSessions = sessionData.filter((s) => {
      const timeSinceEnd = Date.now() - (s.endTime || Date.now());
      return timeSinceEnd > 7 * 24 * 60 * 60 * 1000; // 7 days
    }).length;

    const churnRisk = (inactiveSessions / sessionData.length) * 100 || 0;

    return {
      trend: parseFloat(trend.toFixed(2)),
      predictedConversion: parseFloat(predictedConversion.toFixed(2)),
      churnRisk: parseFloat(churnRisk.toFixed(2)),
      growthMomentum: trend > 0 ? 'positive' : 'negative',
    };
  }, [eventData, sessionData, calculateConversions]);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const conversions = calculateConversions(eventData);
    const sessionMetrics = calculateSessionMetrics(sessionData);
    const predictive = generatePredictiveMetrics();

    setAnalyticsState((prev) => ({
      ...prev,
      conversionRate: conversions.rate,
      avgSessionDuration: sessionMetrics.avgDuration,
      bounceRate: sessionMetrics.bounceRate,
      totalSessions: sessionMetrics.totalSessions,
      activeUsers: new Set(eventData.map((e) => e.userId)).size,
    }));

    setPredictiveMetrics(predictive);

    return {
      ...analyticsState,
      conversions: conversions.conversions,
      conversionRate: conversions.rate,
      ...sessionMetrics,
      predictive,
    };
  }, [eventData, sessionData, calculateConversions, calculateSessionMetrics, generatePredictiveMetrics, analyticsState]);

  // Auto-flush events on interval
  useEffect(() => {
    if (!enableRealTime) return;

    flushTimer.current = setInterval(() => {
      if (eventQueue.current.length > 0) {
        flushEvents();
      }
    }, flushInterval);

    return () => clearInterval(flushTimer.current);
  }, [enableRealTime, flushInterval, flushEvents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
      if (flushTimer.current) clearInterval(flushTimer.current);
      flushEvents();
    };
  }, [flushEvents]);

  return {
    analyticsState,
    eventData,
    sessionData,
    cohortData,
    predictiveMetrics,
    trackEvent,
    flushEvents,
    startSession,
    endSession,
    createCohorts,
    calculateFunnel,
    getAnalyticsSummary,
    calculateConversions,
    calculateSessionMetrics,
  };
}

export default useAdvancedAnalyticsEngine;