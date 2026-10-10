const fs = require('fs');

// Test 1: fb-reviews.js
const reviewsContent = fs.readFileSync('site/assets/js/fb-reviews.js', 'utf8');
const match = reviewsContent.match(/window\.FB_REVIEWS\s*=\s*(\[[\s\S]*?\]);/);
if (!match) throw new Error('Could not parse reviews');
const reviews = JSON.parse(match[1]);
console.log('REVIEWS COUNT:', reviews.length, 'expected: 377');
if (reviews.length !== 377) throw new Error('Reviews count mismatch: ' + reviews.length);

// Test 2: HTML files metadata
const pages = [
  { file: 'site/index.html' },
  { file: 'site/privacy.html' },
  { file: 'site/terms.html' },
  { file: 'site/404.html' }
];

const titles = new Set();
const descriptions = new Set();

pages.forEach(p => {
  const html = fs.readFileSync(p.file, 'utf8');
  const tMatch = html.match(/<title>([^<]+)<\/title>/);
  const dMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (!tMatch) throw new Error('Missing title in ' + p.file);
  if (!dMatch) throw new Error('Missing description in ' + p.file);
  console.log(p.file, '-> Title:', tMatch[1], '| Desc length:', dMatch[1].length);
  if (titles.has(tMatch[1])) throw new Error('Duplicate title: ' + tMatch[1]);
  if (descriptions.has(dMatch[1])) throw new Error('Duplicate description: ' + dMatch[1]);
  titles.add(tMatch[1]);
  descriptions.add(dMatch[1]);
});

// Test 3: Self-harm safety trigger check
const mainJs = fs.readFileSync('site/assets/js/main.js', 'utf8');
const hasSafety = mainJs.includes('isSafetyRisk') && mainJs.includes('112') && mainJs.includes('45 45 45') && mainJs.includes('findahelpline.com');
console.log('SAFETY INTERCEPTOR PRESENT:', hasSafety);
if (!hasSafety) throw new Error('Missing crisis hotline verification');

// Test 4: Form validation and honeypot
const hasHoneypot = mainJs.includes('_hp_company');
console.log('HONEYPOT CHECK PRESENT:', hasHoneypot);
if (!hasHoneypot) throw new Error('Missing honeypot validation');

// Test 5: Cookie consent and GA gating
const hasConsentGate = mainJs.includes('ci_cookie_consent_v1') && mainJs.includes('applyConsent');
console.log('CONSENT GATING PRESENT:', hasConsentGate);
if (!hasConsentGate) throw new Error('Missing consent gating logic');

console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
