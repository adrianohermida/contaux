/**
 * useAIPersonalization Hook
 * AI-powered personalization, ML recommendations, A/B testing, and dynamic UI adaptation
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useAIPersonalization(options = {}) {
  const {
    enableML = true,
    enableABTesting = true,
    enableDynamicUI = true,
    modelVersion = '1.0',
  } = options;

  const [personalizationState, setPersonalizationState] = useState({
    isLoading: false,
    error: null,
    userProfile: null,
    activeTests: 0,
    recommendationCount: 0,
    conversionLift: 0,
    lastUpdate: null,
  });

  const [recommendations, setRecommendations] = useState([]);
  const [abTests, setAbTests] = useState([]);
  const [userSegments, setUserSegments] = useState([]);
  const [personalizedLayout, setPersonalizedLayout] = useState(null);
  const userProfileCache = useRef({});

  // Build user profile from behavior
  const buildUserProfile = useCallback((behaviorData = {}) => {
    const profile = {
      userId: behaviorData.userId || `user-${Math.random().toString(36).substr(2, 9)}`,
      segment: behaviorData.segment || 'new',
      preferences: behaviorData.preferences || {},
      behavior: {
        viewCount: behaviorData.viewCount || 0,
        clickCount: behaviorData.clickCount || 0,
        purchaseCount: behaviorData.purchaseCount || 0,
        timeSpent: behaviorData.timeSpent || 0,
        lastActive: Date.now(),
      },
      engagement: behaviorData.engagement || 'medium',
      lifetime_value: behaviorData.lifetime_value || 0,
      churnRisk: behaviorData.churnRisk || 'low',
    };

    userProfileCache.current[profile.userId] = profile;
    return profile;
  }, []);

  // Generate AI recommendations
  const generateRecommendations = useCallback((userProfile, items = []) => {
    if (!enableML || !userProfile) return [];

    const recs = [];
    const baseItems = items.length > 0 ? items : [
      { id: 1, name: 'Item A', category: 'electronics', rating: 4.5 },
      { id: 2, name: 'Item B', category: 'clothing', rating: 4.2 },
      { id: 3, name: 'Item C', category: 'books', rating: 4.8 },
      { id: 4, name: 'Item D', category: 'electronics', rating: 4.3 },
      { id: 5, name: 'Item E', category: 'home', rating: 4.6 },
    ];

    // Score items based on user profile
    baseItems.forEach((item) => {
      let score = 0;

      // Base rating
      score += item.rating * 10;

      // Behavioral factors
      if (userProfile.behavior.purchaseCount > 0) {
        score += 5;
      }

      // Engagement factor
      if (userProfile.engagement === 'high') {
        score += 10;
      } else if (userProfile.engagement === 'medium') {
        score += 5;
      }

      // Randomize for diversity
      score += Math.random() * 5;

      recs.push({
        ...item,
        score: parseFloat(score.toFixed(2)),
        confidence: Math.min(95, 50 + userProfile.behavior.viewCount * 5),
        reason: `Recommended based on ${item.category} preference`,
      });
    });

    return recs.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [enableML]);

  // Create A/B test
  const createABTest = useCallback((testConfig) => {
    if (!enableABTesting) return null;

    const test = {
      id: `test-${Date.now()}`,
      name: testConfig.name || 'Unnamed Test',
      status: 'active',
      variants: testConfig.variants || [
        { id: 'a', name: 'Control', weight: 50, conversions: 0, visits: 0 },
        { id: 'b', name: 'Variant B', weight: 50, conversions: 0, visits: 0 },
      ],
      startDate: Date.now(),
      endDate: Date.now() + testConfig.duration || 604800000, // 7 days
      hypothesis: testConfig.hypothesis || '',
      metric: testConfig.metric || 'conversion_rate',
      statisticalSignificance: 0,
      winner: null,
    };

    setAbTests((prev) => [...prev, test]);
    return test;
  }, [enableABTesting]);

  // Assign user to test variant
  const assignVariant = useCallback((testId, userId) => {
    const test = abTests.find((t) => t.id === testId);
    if (!test) return null;

    // Weighted random assignment
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (rand <= cumulative) {
        variant.visits += 1;
        return variant;
      }
    }

    return test.variants[0];
  }, [abTests]);

  // Track conversion
  const trackConversion = useCallback((testId, variantId, value = 1) => {
    setAbTests((prev) =>
      prev.map((test) => {
        if (test.id === testId) {
          return {
            ...test,
            variants: test.variants.map((variant) => {
              if (variant.id === variantId) {
                return {
                  ...variant,
                  conversions: variant.conversions + value,
                };
              }
              return variant;
            }),
          };
        }
        return test;
      })
    );
  }, []);

  // Calculate statistical significance
  const calculateSignificance = useCallback((test) => {
    if (test.variants.length < 2) return 0;

    const [v1, v2] = test.variants;
    const cr1 = v1.visits > 0 ? v1.conversions / v1.visits : 0;
    const cr2 = v2.visits > 0 ? v2.conversions / v2.visits : 0;

    // Simplified chi-square calculation
    const diff = Math.abs(cr1 - cr2);
    const avgVisits = (v1.visits + v2.visits) / 2;
    const significance = Math.min(100, (diff * Math.sqrt(avgVisits)) * 100);

    return parseFloat(significance.toFixed(2));
  }, []);

  // Generate personalized layout
  const generatePersonalizedLayout = useCallback((userProfile) => {
    if (!enableDynamicUI || !userProfile) return null;

    const layout = {
      theme: userProfile.engagement === 'high' ? 'premium' : 'standard',
      sidebarPosition: userProfile.engagement === 'high' ? 'left' : 'hidden',
      cardLayout: userProfile.viewCount > 10 ? 'grid' : 'list',
      contentDensity: userProfile.engagement === 'high' ? 'dense' : 'comfortable',
      colorScheme: Math.random() > 0.5 ? 'blue' : 'purple',
      features: {
        showNotifications: userProfile.engagement !== 'low',
        showRecommendations: userProfile.behavior.viewCount > 5,
        showSocialProof: userProfile.engagement === 'high',
        enableAdvancedFilters: userProfile.engagement === 'high',
      },
    };

    return layout;
  }, [enableDynamicUI]);

  // Segment users
  const segmentUsers = useCallback((users = []) => {
    const segments = {
      premium: { count: 0, characteristics: ['high_engagement', 'high_ltv'] },
      engaged: { count: 0, characteristics: ['medium_engagement', 'repeat_visitor'] },
      atrisk: { count: 0, characteristics: ['low_engagement', 'high_churn_risk'] },
      new: { count: 0, characteristics: ['first_visit', 'low_interaction'] },
    };

    users.forEach((user) => {
      let segment = 'new';

      if (user.behavior?.viewCount > 50 && user.lifetime_value > 1000) {
        segment = 'premium';
      } else if (user.behavior?.viewCount > 10) {
        segment = 'engaged';
      } else if (user.churnRisk === 'high') {
        segment = 'atrisk';
      }

      if (segments[segment]) {
        segments[segment].count += 1;
      }
    });

    const segmentArray = Object.entries(segments).map(([name, data]) => ({
      name,
      ...data,
    }));

    setUserSegments(segmentArray);
    return segmentArray;
  }, []);

  // Get personalization summary
  const getPersonalizationSummary = useCallback(() => {
    const activeCampaigns = abTests.filter((t) => t.status === 'active').length;
    const totalRecommendations = recommendations.length;

    setPersonalizationState((prev) => ({
      ...prev,
      activeTests: activeCampaigns,
      recommendationCount: totalRecommendations,
      lastUpdate: new Date(),
    }));

    return {
      ...personalizationState,
      activeTests: activeCampaigns,
      recommendationCount: totalRecommendations,
      tests: abTests,
      segments: userSegments,
    };
  }, [abTests, recommendations, personalizationState, userSegments]);

  // Update recommendations
  const updateRecommendations = useCallback((userProfile, items) => {
    const newRecommendations = generateRecommendations(userProfile, items);
    setRecommendations(newRecommendations);
    return newRecommendations;
  }, [generateRecommendations]);

  // Get personalization insights
  const getInsights = useCallback(() => {
    const insights = [];

    // Test insights
    abTests.forEach((test) => {
      if (test.status === 'active') {
        const significance = calculateSignificance(test);
        if (significance > 95) {
          const winner = test.variants.reduce((prev, curr) =>
            curr.conversions / (curr.visits || 1) > prev.conversions / (prev.visits || 1)
              ? curr
              : prev
          );
          insights.push({
            type: 'test_winner',
            test: test.name,
            winner: winner.name,
            lift: `${((winner.conversions / (winner.visits || 1)) * 100).toFixed(2)}%`,
          });
        }
      }
    });

    // Segment insights
    userSegments.forEach((segment) => {
      if (segment.count > 0) {
        insights.push({
          type: 'segment',
          segment: segment.name,
          count: segment.count,
          action: `Focus on ${segment.name} users`,
        });
      }
    });

    return insights;
  }, [abTests, userSegments, calculateSignificance]);

  return {
    personalizationState,
    recommendations,
    abTests,
    userSegments,
    personalizedLayout,
    buildUserProfile,
    generateRecommendations,
    createABTest,
    assignVariant,
    trackConversion,
    calculateSignificance,
    generatePersonalizedLayout,
    segmentUsers,
    getPersonalizationSummary,
    updateRecommendations,
    getInsights,
  };
}

export default useAIPersonalization;