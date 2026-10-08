import { lazy } from 'react';

// Lazy load de componentes pesados de Charts
export const LazyRevenueChart = lazy(() => import('./RevenueChart'));
export const LazyPaymentStatusChart = lazy(() => import('./PaymentStatusChart'));
export const LazyTicketAnalyticsChart = lazy(() => import('./TicketAnalyticsChart'));
export const LazyComparisonCard = lazy(() => import('./ComparisonCard'));

// Lazy load de componentes de Analytics
export const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
export const LazyReportsCharts = lazy(() => import('./ReportsCharts'));