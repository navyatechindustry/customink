const fs = require('fs');

const indexHtml = fs.readFileSync('site/index.html', 'utf8');
const termsHtml = fs.readFileSync('site/terms.html', 'utf8');
const privacyHtml = fs.readFileSync('site/privacy.html', 'utf8');

[
  { name: 'index.html', html: indexHtml },
  { name: 'terms.html', html: termsHtml },
  { name: 'privacy.html', html: privacyHtml }
].forEach(page => {
  console.log(`\n--- Schema Validation for ${page.name} ---`);
  const blocks = page.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  console.log(`  Found ${blocks.length} block(s)`);
  blocks.forEach((block, idx) => {
    const raw = block.replace(/<\/?script[^>]*>/g, '').trim();
    try {
      const parsed = JSON.parse(raw);
      const types = parsed['@graph'] ? parsed['@graph'].map(g => g['@type']).join(', ') : parsed['@type'];
      console.log(`    Block ${idx + 1}: OK (${types})`);
    } catch (e) {
      console.error(`    Block ${idx + 1}: ERROR - ${e.message}`);
    }
  });
});
