const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function scrapeJob(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const html = await page.content();
    await browser.close();
    
    return html;
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

module.exports = { scrapeJob };
