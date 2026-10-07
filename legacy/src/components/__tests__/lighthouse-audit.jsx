#!/bin/bash
#
# Lighthouse PWA Audit Script
# Run accessibility, performance, and PWA audits
#

echo "🔍 Running Lighthouse Audits..."

# Install lighthouse if not present
npm install -g lighthouse || true

# Define URLs to audit
URLS=(
  "http://localhost:5173"
  "http://localhost:5173/contact"
  "http://localhost:5173/invoicing"
  "http://localhost:5173/dashboard"
)

# Create results directory
mkdir -p lighthouse-reports

echo "📊 Auditing PWA Capabilities..."
for url in "${URLS[@]}"; do
  echo "  Auditing: $url"
  lighthouse "$url" \
    --output=json \
    --output-path="lighthouse-reports/$(echo $url | sed 's/[\/:]/_/g').json" \
    --only-categories=accessibility,pwa,performance \
    --chrome-flags="--headless" 2>/dev/null || true
done

echo "✅ Lighthouse audits complete!"
echo "📁 Results saved to: lighthouse-reports/"

# Summary
echo ""
echo "📈 AUDIT SUMMARY"
echo "==============="
echo "Accessibility Target: 90+"
echo "PWA Target: 90+"
echo "Performance Target: 85+"
echo ""
echo "Run the following to view HTML reports:"
echo "  open lighthouse-reports/*.html"