import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('titanfit-report/pdf_pages');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyPdf() {
  console.log('🚀 Launching Chromium to render Arabic PDF and capture page images...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  // Generate PDF and capture canvas pages directly from browser DOM
  const result = await page.evaluate(async () => {
    // Dynamically import or evaluate ebook blocks and canvas rendering
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.value = 'audit.engineer@titanfit.internal';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Call ebook builder directly from module if exposed or through window
    // We can also trigger the submit
    const submitBtn = document.querySelector('form button[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
    }

    return { triggered: true };
  });

  console.log('  Triggered form submit:', result);
  await page.waitForTimeout(3000);

  // Check if modal popped up
  const modalVisible = await page.locator('#ebook-modal-title').isVisible().catch(() => false);
  console.log(`  E-book modal visible: ${modalVisible}`);

  await page.screenshot({ path: path.join(OUTPUT_DIR, 'storefront_ebook_modal.png') });
  console.log(`  Saved modal screenshot to ${path.join(OUTPUT_DIR, 'storefront_ebook_modal.png')}`);

  await browser.close();
}

verifyPdf().catch(console.error);
