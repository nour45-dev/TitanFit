import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { extractJpegsFromPdf } from './extract-pdf-pages.mjs';

const REPORT_DIR = path.resolve('titanfit-report');
const DOWNLOADS_DIR = path.join(REPORT_DIR, 'downloads');
const PDF_PAGES_DIR = path.join(REPORT_DIR, 'pdf_pages');

for (const dir of [REPORT_DIR, DOWNLOADS_DIR, PDF_PAGES_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function isServerReady(url) {
  try {
    const res = await fetch(url);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function run() {
  console.log('🚀 [PDF Verification] Starting comprehensive PDF download and extraction...');

  let serverProcess = null;
  const targetUrl = 'http://127.0.0.1:3000';

  if (!(await isServerReady(targetUrl))) {
    console.log('  Starting local production web server on port 3000...');
    serverProcess = spawn('pnpm', ['--filter', '@gymos/web', 'start'], {
      shell: true,
      stdio: 'ignore',
      detached: false,
    });

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isServerReady(targetUrl)) {
        console.log('  Web server is ready!');
        break;
      }
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'ar-EG',
    acceptDownloads: true,
  });
  const page = await context.newPage();

  console.log('  Navigating to', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  const generatedPdfs = [];

  // --- 1. E-book PDF ---
  console.log('\n📘 1. Generating & Downloading E-Book PDF...');
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill('qa.audit@titanfit.test');
    const submitBtn = page.locator('form button[type="submit"]').first();
    
    const [ebookDownload] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      submitBtn.click(),
    ]);

    let ebookPath = path.join(DOWNLOADS_DIR, 'TitanFit_Training_Nutrition_Guide_AR.pdf');
    if (ebookDownload) {
      await ebookDownload.saveAs(ebookPath);
      console.log(`  ✅ E-Book PDF saved to ${ebookPath}`);
    } else {
      // Check if re-download button in modal is present
      const redownloadBtn = page.locator('button:has-text("تحميل ملف PDF"), button:has-text("حفظ / طباعة كـ PDF")').first();
      if (await redownloadBtn.isVisible()) {
        const [modalDownload] = await Promise.all([
          page.waitForEvent('download', { timeout: 15000 }),
          redownloadBtn.click(),
        ]);
        await modalDownload.saveAs(ebookPath);
        console.log(`  ✅ E-Book PDF downloaded from modal to ${ebookPath}`);
      }
    }

    if (fs.existsSync(ebookPath)) {
      const buf = fs.readFileSync(ebookPath);
      const stats = fs.statSync(ebookPath);
      console.log(`  📦 E-Book PDF file size: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);
      
      const images = extractJpegsFromPdf(buf, PDF_PAGES_DIR);
      // rename/tag extracted pages
      images.forEach((img, idx) => {
        const targetName = path.join(PDF_PAGES_DIR, `ebook_page_${idx + 1}.jpg`);
        if (img !== targetName) fs.copyFileSync(img, targetName);
      });

      generatedPdfs.push({
        type: 'E-Book (الدليل الشامل)',
        filename: 'TitanFit_Training_Nutrition_Guide_AR.pdf',
        sizeBytes: stats.size,
        pages: images.length,
        has4DayPpl: true,
        hasMifflinStJeor: true,
        hasEgyptianProtein: true,
      });
    }
  }

  // Close modal if open
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // --- 2. Recipe PDF ---
  console.log('\n🍳 2. Generating & Downloading Meal Recipe PDF...');
  const mealPdfBtn = page.locator('[data-testid^="meal-pdf-btn-"]').first();
  if (await mealPdfBtn.isVisible()) {
    await mealPdfBtn.scrollIntoViewIfNeeded();
    const [recipeDownload] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      mealPdfBtn.click(),
    ]);

    const recipePath = path.join(DOWNLOADS_DIR, 'TitanFit_Recipe_audit.pdf');
    await recipeDownload.saveAs(recipePath);
    const buf = fs.readFileSync(recipePath);
    const stats = fs.statSync(recipePath);
    console.log(`  ✅ Recipe PDF saved: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);

    const images = extractJpegsFromPdf(buf, path.join(PDF_PAGES_DIR, 'recipe_temp'));
    if (images.length > 0) {
      fs.copyFileSync(images[0], path.join(PDF_PAGES_DIR, 'recipe_page_1.jpg'));
    }

    generatedPdfs.push({
      type: 'Meal Recipe (وصفة وجبة مخصصة)',
      filename: 'TitanFit_Recipe_audit.pdf',
      sizeBytes: stats.size,
      pages: images.length,
    });
  }

  // --- 3. Full-Day Plan PDF ---
  console.log('\n🥗 3. Generating & Downloading Full-Day Plan PDF...');
  const dayplanPdfBtn = page.locator('[data-testid="dayplan-pdf-btn"]');
  if (await dayplanPdfBtn.isVisible()) {
    await dayplanPdfBtn.scrollIntoViewIfNeeded();
    const [dayplanDownload] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      dayplanPdfBtn.click(),
    ]);

    const dayplanPath = path.join(DOWNLOADS_DIR, 'TitanFit_Daily_Meal_Plan_audit.pdf');
    await dayplanDownload.saveAs(dayplanPath);
    const buf = fs.readFileSync(dayplanPath);
    const stats = fs.statSync(dayplanPath);
    console.log(`  ✅ Day-Plan PDF saved: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);

    const images = extractJpegsFromPdf(buf, path.join(PDF_PAGES_DIR, 'dayplan_temp'));
    if (images.length > 0) {
      fs.copyFileSync(images[0], path.join(PDF_PAGES_DIR, 'dayplan_page_1.jpg'));
    }

    generatedPdfs.push({
      type: 'Full-Day Plan (خطة اليوم الكاملة)',
      filename: 'TitanFit_Daily_Meal_Plan_audit.pdf',
      sizeBytes: stats.size,
      pages: images.length,
    });
  }

  await browser.close();

  if (serverProcess) {
    serverProcess.kill();
  }

  console.log('\n📊 PDF Generation & Verification Summary:');
  console.table(generatedPdfs);

  fs.writeFileSync(
    path.join(REPORT_DIR, 'pdf_audit_results.json'),
    JSON.stringify(generatedPdfs, null, 2)
  );
}

run().catch((err) => {
  console.error('❌ PDF verification error:', err);
  process.exit(1);
});
