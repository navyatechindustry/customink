const fs = require('fs');
const path = require('path');

// 1. Read canonical data/custom-ink-reviews.ts
const tsPath = path.resolve(__dirname, '../data/custom-ink-reviews.ts');
const tsContent = fs.readFileSync(tsPath, 'utf8');

// Extract the reviews array between 'export const reviews: Review[] = [' and '];'
const startIdx = tsContent.indexOf('export const reviews: Review[] = [');
if (startIdx === -1) {
  throw new Error('Could not find reviews array in data/custom-ink-reviews.ts');
}

const arrStart = tsContent.indexOf('[', startIdx);
const arrEnd = tsContent.lastIndexOf('];');
if (arrStart === -1 || arrEnd === -1) {
  throw new Error('Could not locate bounds of reviews array');
}

const arrayCode = tsContent.slice(arrStart, arrEnd + 1);

// Safely evaluate using Function in isolated context
const reviews = (new Function(`return ${arrayCode};`))();

if (!Array.isArray(reviews) || reviews.length === 0) {
  throw new Error('Evaluated reviews array is empty or not an array');
}

console.log(`Read ${reviews.length} reviews from ${tsPath}`);

// 2. Write to site/assets/js/reviews-data.js (ES Module + Window Global)
const jsOutPath = path.resolve(__dirname, '../site/assets/js/reviews-data.js');
const jsContent = `/* Auto-generated from data/custom-ink-reviews.ts — DO NOT EDIT DIRECTLY */
export const reviews = ${JSON.stringify(reviews, null, 2)};

if (typeof window !== 'undefined') {
  window.FB_REVIEWS = reviews;
}

export default reviews;
`;

fs.writeFileSync(jsOutPath, jsContent, 'utf8');
console.log(`Wrote ${jsOutPath} (${reviews.length} reviews)`);

// 3. Also write site/assets/data/reviews.json for standard JSON access
const jsonDir = path.resolve(__dirname, '../site/assets/data');
if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir, { recursive: true });
}
const jsonOutPath = path.join(jsonDir, 'reviews.json');
fs.writeFileSync(jsonOutPath, JSON.stringify(reviews, null, 2), 'utf8');
console.log(`Wrote ${jsonOutPath}`);

// 4. Update site/assets/js/fb-reviews.js for backward compatibility
const fbReviewsPath = path.resolve(__dirname, '../site/assets/js/fb-reviews.js');
const fbReviewsContent = `/* Auto-generated from data/custom-ink-reviews.ts — Google Reviews Dataset (${reviews.length} reviews) */
export const reviews = ${JSON.stringify(reviews)};

if (typeof window !== 'undefined') {
  window.FB_REVIEWS = reviews;
}

export default reviews;
`;
fs.writeFileSync(fbReviewsPath, fbReviewsContent, 'utf8');
console.log(`Updated ${fbReviewsPath}`);

// 5. Update site/public/assets/js for static public distribution
const pubJsDir = path.resolve(__dirname, '../site/public/assets/js');
if (!fs.existsSync(pubJsDir)) {
  fs.mkdirSync(pubJsDir, { recursive: true });
}
fs.writeFileSync(path.join(pubJsDir, 'reviews-data.js'), jsContent, 'utf8');
fs.writeFileSync(path.join(pubJsDir, 'fb-reviews.js'), fbReviewsContent, 'utf8');
fs.copyFileSync(
  path.resolve(__dirname, '../site/assets/js/main.js'),
  path.join(pubJsDir, 'main.js')
);
console.log(`Updated public copies in ${pubJsDir}`);

console.log('Review export completed successfully.');
