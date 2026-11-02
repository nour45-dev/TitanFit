import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const DOWNLOADS = path.resolve('titanfit-report/downloads');
const SCREENSHOTS = path.resolve('titanfit-report/pdf_pages');

async function testPdfInChrome() {
  console.log('🔍 Testing PDF rendering in Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const files = [
    'TitanFit_Training_Nutrition_Guide_AR.pdf',
    'TitanFit_Recipe_audit.pdf',
    'TitanFit_Daily_Meal_Plan_audit.pdf',
  ];

  for (const f of files) {
    const fullPath = path.join(DOWNLOADS, f);
    if (!fs.existsSync(fullPath)) continue;
    const fileUrl = `file://${fullPath.replace(/\\/g, '/')}`;
    console.log(`  Opening ${fileUrl}...`);
    try {
      await page.goto(fileUrl, { waitUntil: 'load' });
      await page.waitForTimeout(1000);
      const outImg = path.join(SCREENSHOTS, `chrome_render_${path.parse(f).name}.png`);
      await page.screenshot({ path: outImg });
      console.log(`  📸 Chrome rendered successfully: ${outImg}`);
    } catch (err) {
      console.error(`  ❌ Failed to render ${f} in Chrome:`, err.message);
    }
  }

  await browser.close();
}

testPdfInChrome().catch(console.error);
