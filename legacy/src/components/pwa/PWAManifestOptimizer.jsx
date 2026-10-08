/**
 * PWA Manifest Configuration
 * Generates optimized manifest.json for PWA installation
 */

// This file generates the manifest.json configuration
// Add to public/manifest.json:

const manifest = {
  "name": "ContauxCRM - Business Management",
  "short_name": "ContauxCRM",
  "description": "Complete CRM system with invoicing, contacts, and financial management",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "screenshots": [
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/screenshot-mobile.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow",
      "purpose": "any"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/screenshot-tablet.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "purpose": "any"
    }
  ],
  "icons": [
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots_purpose": "any",
  "shortcuts": [
    {
      "name": "New Contact",
      "short_name": "Contact",
      "description": "Create a new contact",
      "url": "/contact",
      "icons": [
        {
          "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/icon-contact.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "New Invoice",
      "short_name": "Invoice",
      "description": "Create a new invoice",
      "url": "/invoicing",
      "icons": [
        {
          "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/icon-invoice.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "application/pdf"]
        }
      ]
    }
  },
  "prefer_related_applications": false
};

export default manifest;

/**
 * Implementation instructions:
 * 
 * 1. Copy the manifest object above to public/manifest.json
 * 
 * 2. Add to index.html <head>:
 *    <link rel="manifest" href="/manifest.json">
 *    <meta name="theme-color" content="#000000">
 *    <meta name="apple-mobile-web-app-capable" content="yes">
 *    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
 *    <meta name="apple-mobile-web-app-title" content="ContauxCRM">
 * 
 * 3. Ensure Service Worker is registered in Layout.jsx (already done)
 * 
 * 4. Test with Lighthouse PWA audit
 *    Target score: 90+ for PWA
 * 
 * 5. Test installation on:
 *    - Chrome Desktop
 *    - Chrome Android
 *    - Samsung Internet
 *    - Edge Desktop
 */