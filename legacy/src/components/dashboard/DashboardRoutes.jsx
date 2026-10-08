import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LazyPageWrapper from './LazyPageWrapper';
import {
  LazyDashboard,
  LazyVirtualCounter,
  LazyClients,
  LazyTickets,
  LazyLegalProcesses,
  LazyInvoicing,
  LazyPayments,
  LazyQuotes,
  LazySales,
  LazyCashFlow,
  LazyServices,
  LazyEntries,
  LazyImportCSV,
  LazyBankReconciliation,
  LazyManualPosting,
  LazyChartOfAccounts,
  LazyTaxInvoices,
  LazyAccountingCalendar,
  LazyAutomations,
  LazyReports,
  LazyCommunication,
  LazyClientPortal,
  LazySettings,
  LazyBlogManager,
  LazyAuditLogs,
  LazySecurityCenter,
  LazyTransactions,
  LazyCashFlowForecast,
  LazyDocumentManagement,
  LazyRLSDebugger,
  LazyAdvancedReports,
  LazyReportsOperations
} from './LazyPages';

// Public pages (não precisam de LazyPageWrapper)
const Home = lazy(() => import('../../pages/Home'));
const Blog = lazy(() => import('../../pages/Blog'));
const BlogSingle = lazy(() => import('../../pages/BlogSingle'));
const About = lazy(() => import('../../pages/About'));
const Contact = lazy(() => import('../../pages/Contact'));
const Pricing = lazy(() => import('../../pages/Pricing'));
const ContactDetails = lazy(() => import('../../pages/ContactDetails'));

export default function DashboardRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogSingle />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        <LazyPageWrapper>
          <LazyDashboard />
        </LazyPageWrapper>
      } />
      
      <Route path="/virtualcounter" element={
        <LazyPageWrapper>
          <LazyVirtualCounter />
        </LazyPageWrapper>
      } />
      
      <Route path="/contact" element={
        <LazyPageWrapper>
          <Contact />
        </LazyPageWrapper>
      } />
      
      <Route path="/contact/:contactId" element={
        <LazyPageWrapper>
          <ContactDetails />
        </LazyPageWrapper>
      } />
      
      <Route path="/tickets" element={
        <LazyPageWrapper>
          <LazyTickets />
        </LazyPageWrapper>
      } />
      
      <Route path="/legalprocesses" element={
        <LazyPageWrapper>
          <LazyLegalProcesses />
        </LazyPageWrapper>
      } />
      
      {/* Financial Routes */}
      <Route path="/invoicing" element={
        <LazyPageWrapper>
          <LazyInvoicing />
        </LazyPageWrapper>
      } />
      
      <Route path="/payments" element={
        <LazyPageWrapper>
          <LazyPayments />
        </LazyPageWrapper>
      } />
      
      <Route path="/quotes" element={
        <LazyPageWrapper>
          <LazyQuotes />
        </LazyPageWrapper>
      } />
      
      <Route path="/sales" element={
        <LazyPageWrapper>
          <LazySales />
        </LazyPageWrapper>
      } />
      
      <Route path="/cashflow" element={
        <LazyPageWrapper>
          <LazyCashFlow />
        </LazyPageWrapper>
      } />
      
      {/* Services */}
      <Route path="/services" element={
        <LazyPageWrapper>
          <LazyServices />
        </LazyPageWrapper>
      } />
      
      {/* Accounting Routes */}
      <Route path="/entries" element={
        <LazyPageWrapper>
          <LazyEntries />
        </LazyPageWrapper>
      } />
      
      <Route path="/importcsv" element={
        <LazyPageWrapper>
          <LazyImportCSV />
        </LazyPageWrapper>
      } />
      
      <Route path="/bankreconciliation" element={
        <LazyPageWrapper>
          <LazyBankReconciliation />
        </LazyPageWrapper>
      } />
      
      <Route path="/manualposting" element={
        <LazyPageWrapper>
          <LazyManualPosting />
        </LazyPageWrapper>
      } />
      
      <Route path="/chartofaccounts" element={
        <LazyPageWrapper>
          <LazyChartOfAccounts />
        </LazyPageWrapper>
      } />
      
      {/* Other Routes */}
      <Route path="/taxinvoices" element={
        <LazyPageWrapper>
          <LazyTaxInvoices />
        </LazyPageWrapper>
      } />
      
      <Route path="/accountingcalendar" element={
        <LazyPageWrapper>
          <LazyAccountingCalendar />
        </LazyPageWrapper>
      } />
      
      <Route path="/automations" element={
        <LazyPageWrapper>
          <LazyAutomations />
        </LazyPageWrapper>
      } />
      
      <Route path="/reports" element={
        <LazyPageWrapper>
          <LazyReports />
        </LazyPageWrapper>
      } />
      
      <Route path="/communication" element={
        <LazyPageWrapper>
          <LazyCommunication />
        </LazyPageWrapper>
      } />
      
      <Route path="/clientportal" element={
        <LazyPageWrapper>
          <LazyClientPortal />
        </LazyPageWrapper>
      } />
      
      <Route path="/settings" element={
        <LazyPageWrapper>
          <LazySettings />
        </LazyPageWrapper>
      } />
      
      <Route path="/blogmanager" element={
        <LazyPageWrapper>
          <LazyBlogManager />
        </LazyPageWrapper>
      } />
      
      <Route path="/auditlogs" element={
        <LazyPageWrapper>
          <LazyAuditLogs />
        </LazyPageWrapper>
      } />
      
      <Route path="/securitycenter" element={
        <LazyPageWrapper>
          <LazySecurityCenter />
        </LazyPageWrapper>
      } />
      
      <Route path="/transactions" element={
        <LazyPageWrapper>
          <LazyTransactions />
        </LazyPageWrapper>
      } />
      
      <Route path="/cashflowforecast" element={
        <LazyPageWrapper>
          <LazyCashFlowForecast />
        </LazyPageWrapper>
      } />
      
      <Route path="/documentmanagement" element={
        <LazyPageWrapper>
          <LazyDocumentManagement />
        </LazyPageWrapper>
      } />
      
      <Route path="/rlsdebugger" element={
        <LazyPageWrapper>
          <LazyRLSDebugger />
        </LazyPageWrapper>
      } />
      
      <Route path="/reportsadvanced" element={
        <LazyPageWrapper>
          <LazyAdvancedReports />
        </LazyPageWrapper>
      } />
      
      <Route path="/reportsoperations" element={
        <LazyPageWrapper>
          <LazyReportsOperations />
        </LazyPageWrapper>
      } />
    </Routes>
  );
}