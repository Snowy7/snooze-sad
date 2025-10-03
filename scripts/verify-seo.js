#!/usr/bin/env node

/**
 * SEO Verification Script
 * 
 * Run this script to verify that all SEO configurations are working correctly.
 * 
 * Usage:
 *   node scripts/verify-seo.js
 * 
 * Or add to package.json:
 *   "scripts": { "verify-seo": "node scripts/verify-seo.js" }
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const IS_PRODUCTION = SITE_URL.includes('snooze.app');

console.log('🔍 SEO Verification Script');
console.log(`Testing: ${SITE_URL}`);
console.log(`Mode: ${IS_PRODUCTION ? 'Production' : 'Local'}\n`);

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(test) {
  log(`✓ ${test}`, 'green');
}

function fail(test, reason = '') {
  log(`✗ ${test}${reason ? ': ' + reason : ''}`, 'red');
}

function warn(test) {
  log(`⚠ ${test}`, 'yellow');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

// Check if file exists
function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    pass(`${description} exists`);
    return true;
  } else {
    fail(`${description} missing`, filePath);
    return false;
  }
}

// Fetch URL and check response
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

// Check if URL is accessible
async function checkUrl(path, description) {
  const url = `${SITE_URL}${path}`;
  try {
    const { status } = await fetchUrl(url);
    if (status === 200) {
      pass(`${description} accessible (${status})`);
      return true;
    } else {
      fail(`${description} returned ${status}`, url);
      return false;
    }
  } catch (error) {
    fail(`${description} not accessible`, error.message);
    return false;
  }
}

// Check meta tags on a page
async function checkMetaTags(path, description) {
  const url = `${SITE_URL}${path}`;
  try {
    const { data } = await fetchUrl(url);
    
    const checks = {
      'title': /<title>.*?<\/title>/i.test(data),
      'description': /<meta\s+name="description"/i.test(data),
      'og:title': /<meta\s+property="og:title"/i.test(data),
      'og:description': /<meta\s+property="og:description"/i.test(data),
      'og:image': /<meta\s+property="og:image"/i.test(data),
      'twitter:card': /<meta\s+name="twitter:card"/i.test(data),
      'canonical': /<link\s+rel="canonical"/i.test(data),
    };
    
    const missing = Object.entries(checks)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);
    
    if (missing.length === 0) {
      pass(`${description} has all meta tags`);
      return true;
    } else {
      fail(`${description} missing meta tags`, missing.join(', '));
      return false;
    }
  } catch (error) {
    fail(`Could not check ${description}`, error.message);
    return false;
  }
}

// Check sitemap XML validity
async function checkSitemap() {
  try {
    const { data, status } = await fetchUrl(`${SITE_URL}/sitemap.xml`);
    
    if (status !== 200) {
      fail('Sitemap not accessible', `Status: ${status}`);
      return false;
    }
    
    const checks = {
      'XML declaration': data.includes('<?xml'),
      'urlset tag': data.includes('<urlset'),
      'url entries': data.includes('<url>'),
      'loc tags': data.includes('<loc>'),
      'lastmod tags': data.includes('<lastmod>'),
      'priority tags': data.includes('<priority>'),
    };
    
    const allChecks = Object.values(checks).every(v => v);
    
    if (allChecks) {
      const urlCount = (data.match(/<url>/g) || []).length;
      pass(`Sitemap valid with ${urlCount} URLs`);
      return true;
    } else {
      const failed = Object.entries(checks)
        .filter(([k, v]) => !v)
        .map(([k]) => k);
      fail('Sitemap validation failed', failed.join(', '));
      return false;
    }
  } catch (error) {
    fail('Could not check sitemap', error.message);
    return false;
  }
}

// Check robots.txt
async function checkRobotsTxt() {
  try {
    const { data, status } = await fetchUrl(`${SITE_URL}/robots.txt`);
    
    if (status !== 200) {
      fail('robots.txt not accessible', `Status: ${status}`);
      return false;
    }
    
    const checks = {
      'User-agent': data.includes('User-agent:'),
      'Allow or Disallow': data.includes('Allow:') || data.includes('Disallow:'),
      'Sitemap reference': data.includes('Sitemap:'),
    };
    
    const allChecks = Object.values(checks).every(v => v);
    
    if (allChecks) {
      pass('robots.txt is valid');
      return true;
    } else {
      const failed = Object.entries(checks)
        .filter(([k, v]) => !v)
        .map(([k]) => k);
      fail('robots.txt validation failed', failed.join(', '));
      return false;
    }
  } catch (error) {
    fail('Could not check robots.txt', error.message);
    return false;
  }
}

// Main verification function
async function runVerification() {
  let totalTests = 0;
  let passedTests = 0;
  
  function test(fn) {
    totalTests++;
    return fn().then(result => {
      if (result) passedTests++;
      return result;
    });
  }
  
  // File existence checks
  info('\n1. Checking Required Files...');
  await test(() => Promise.resolve(checkFile('src/app/sitemap.ts', 'Sitemap config')));
  await test(() => Promise.resolve(checkFile('src/app/robots.ts', 'Robots config')));
  await test(() => Promise.resolve(checkFile('public/site.webmanifest', 'Web manifest')));
  await test(() => Promise.resolve(checkFile('SEO_SETUP.md', 'SEO documentation')));
  await test(() => Promise.resolve(checkFile('SEO_IMPLEMENTATION_SUMMARY.md', 'Implementation summary')));
  
  // Image assets (warnings only)
  info('\n2. Checking Image Assets...');
  if (!checkFile('public/og-image.png', 'OG Image')) {
    warn('  Create OG image (1200x630px) - see public/README_ASSETS.md');
  }
  if (!checkFile('public/favicon.ico', 'Favicon')) {
    warn('  Create favicon - see public/README_ASSETS.md');
  }
  if (!checkFile('public/apple-touch-icon.png', 'Apple Touch Icon')) {
    warn('  Create Apple touch icon (180x180px)');
  }
  if (!checkFile('public/icon-192.png', 'PWA Icon (192)')) {
    warn('  Create PWA icon 192x192px');
  }
  if (!checkFile('public/icon-512.png', 'PWA Icon (512)')) {
    warn('  Create PWA icon 512x512px');
  }
  
  // URL accessibility checks
  info('\n3. Checking URL Accessibility...');
  if (SITE_URL.includes('localhost')) {
    warn('Server must be running for URL checks (npm run dev or npm start)');
    try {
      await test(() => checkUrl('/', 'Landing page'));
      await test(() => checkUrl('/sitemap.xml', 'Sitemap'));
      await test(() => checkUrl('/robots.txt', 'Robots.txt'));
      await test(() => checkUrl('/site.webmanifest', 'Web manifest'));
    } catch (error) {
      warn('Could not connect to local server. Start it with: npm run dev');
    }
  } else {
    await test(() => checkUrl('/', 'Landing page'));
    await test(() => checkUrl('/sitemap.xml', 'Sitemap'));
    await test(() => checkUrl('/robots.txt', 'Robots.txt'));
    await test(() => checkUrl('/site.webmanifest', 'Web manifest'));
  }
  
  // Meta tag checks
  info('\n4. Checking Meta Tags...');
  if (SITE_URL.includes('localhost')) {
    try {
      await test(() => checkMetaTags('/', 'Landing page'));
      await test(() => checkMetaTags('/contact', 'Contact page'));
      await test(() => checkMetaTags('/privacy', 'Privacy page'));
      await test(() => checkMetaTags('/terms', 'Terms page'));
    } catch (error) {
      warn('Could not check meta tags. Ensure server is running.');
    }
  } else {
    await test(() => checkMetaTags('/', 'Landing page'));
    await test(() => checkMetaTags('/contact', 'Contact page'));
    await test(() => checkMetaTags('/privacy', 'Privacy page'));
    await test(() => checkMetaTags('/terms', 'Terms page'));
  }
  
  // Structured validation
  info('\n5. Validating XML Files...');
  if (SITE_URL.includes('localhost')) {
    try {
      await test(() => checkSitemap());
      await test(() => checkRobotsTxt());
    } catch (error) {
      warn('Could not validate XML. Ensure server is running.');
    }
  } else {
    await test(() => checkSitemap());
    await test(() => checkRobotsTxt());
  }
  
  // Summary
  info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const color = percentage === 100 ? 'green' : percentage >= 70 ? 'yellow' : 'red';
  log(`\n Tests Passed: ${passedTests}/${totalTests} (${percentage}%)`, color);
  
  if (percentage === 100) {
    log('\n🎉 All SEO configurations are working correctly!', 'green');
  } else if (percentage >= 70) {
    log('\n⚠ Most configurations are working, but some issues need attention.', 'yellow');
  } else {
    log('\n❌ Several issues need to be fixed.', 'red');
  }
  
  // Next steps
  info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  info('\nNext Steps:');
  console.log('  1. Create missing image assets (see public/README_ASSETS.md)');
  console.log('  2. Test locally: npm run build && npm start');
  console.log('  3. Deploy to production');
  console.log('  4. Submit sitemap to Google Search Console');
  console.log('  5. Validate using online tools:');
  console.log('     - Open Graph: https://www.opengraph.xyz/');
  console.log('     - Twitter Cards: https://cards-dev.twitter.com/validator');
  console.log('     - Structured Data: https://search.google.com/test/rich-results');
  console.log('     - Mobile: https://search.google.com/test/mobile-friendly');
  console.log('     - Speed: https://pagespeed.web.dev/\n');
  
  process.exit(percentage < 70 ? 1 : 0);
}

// Run the verification
runVerification().catch(error => {
  fail('Verification script error', error.message);
  console.error(error);
  process.exit(1);
});

