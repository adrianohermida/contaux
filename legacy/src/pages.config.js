/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import AccountingCalendar from './pages/AccountingCalendar';
import App from './pages/App';
import AuditLogs from './pages/AuditLogs';
import Automations from './pages/Automations';
import BankReconciliation from './pages/BankReconciliation';
import Blog from './pages/Blog';
import BlogManager from './pages/BlogManager';
import BlogSingle from './pages/BlogSingle';
import Campaigns from './pages/Campaigns';
import CashFlow from './pages/CashFlow';
import CashFlowForecast from './pages/CashFlowForecast';
import ChartOfAccounts from './pages/ChartOfAccounts';
import ClientPanel from './pages/ClientPanel';
import ClientPortal from './pages/ClientPortal';
import Clients from './pages/Clients';
import Communication from './pages/Communication';
import Contact from './pages/Contact';
import ContactDetails from './pages/ContactDetails';
import ContractManagement from './pages/ContractManagement';
import ConversionRateOptimizer from './pages/ConversionRateOptimizer';
import ConversionTracking from './pages/ConversionTracking';
import Dashboard from './pages/Dashboard';
import DocumentManagement from './pages/DocumentManagement';
import Entries from './pages/Entries';
import Home from './pages/Home';
import ImportCSV from './pages/ImportCSV';
import Invoicing from './pages/Invoicing';
import LegalProcesses from './pages/LegalProcesses';
import LoyaltyPrograms from './pages/LoyaltyPrograms';
import ManualPosting from './pages/ManualPosting';
import MyBookmarks from './pages/MyBookmarks';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Portfolio from './pages/Portfolio';
import Pricing from './pages/Pricing';
import QuoteRequest from './pages/QuoteRequest';
import Quotes from './pages/Quotes';
import RLSDebugger from './pages/RLSDebugger';
import Reports from './pages/Reports';
import ReportsAdvanced from './pages/ReportsAdvanced';
import ReportsAnalytics from './pages/ReportsAnalytics';
import ReportsOperations from './pages/ReportsOperations';
import Sales from './pages/Sales';
import SecurityCenter from './pages/SecurityCenter';
import Services from './pages/Services';
import SettingsPage from './pages/SettingsPage';
import TaxCalculation from './pages/TaxCalculation';
import TaxInvoices from './pages/TaxInvoices';
import Tickets from './pages/Tickets';
import Transactions from './pages/Transactions';
import VirtualCounter from './pages/VirtualCounter';
import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AccountingCalendar": AccountingCalendar,
    "App": App,
    "AuditLogs": AuditLogs,
    "Automations": Automations,
    "BankReconciliation": BankReconciliation,
    "Blog": Blog,
    "BlogManager": BlogManager,
    "BlogSingle": BlogSingle,
    "Campaigns": Campaigns,
    "CashFlow": CashFlow,
    "CashFlowForecast": CashFlowForecast,
    "ChartOfAccounts": ChartOfAccounts,
    "ClientPanel": ClientPanel,
    "ClientPortal": ClientPortal,
    "Clients": Clients,
    "Communication": Communication,
    "Contact": Contact,
    "ContactDetails": ContactDetails,
    "ContractManagement": ContractManagement,
    "ConversionRateOptimizer": ConversionRateOptimizer,
    "ConversionTracking": ConversionTracking,
    "Dashboard": Dashboard,
    "DocumentManagement": DocumentManagement,
    "Entries": Entries,
    "Home": Home,
    "ImportCSV": ImportCSV,
    "Invoicing": Invoicing,
    "LegalProcesses": LegalProcesses,
    "LoyaltyPrograms": LoyaltyPrograms,
    "ManualPosting": ManualPosting,
    "MyBookmarks": MyBookmarks,
    "Notifications": Notifications,
    "Payments": Payments,
    "Portfolio": Portfolio,
    "Pricing": Pricing,
    "QuoteRequest": QuoteRequest,
    "Quotes": Quotes,
    "RLSDebugger": RLSDebugger,
    "Reports": Reports,
    "ReportsAdvanced": ReportsAdvanced,
    "ReportsAnalytics": ReportsAnalytics,
    "ReportsOperations": ReportsOperations,
    "Sales": Sales,
    "SecurityCenter": SecurityCenter,
    "Services": Services,
    "SettingsPage": SettingsPage,
    "TaxCalculation": TaxCalculation,
    "TaxInvoices": TaxInvoices,
    "Tickets": Tickets,
    "Transactions": Transactions,
    "VirtualCounter": VirtualCounter,
    "Welcome": Welcome,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};