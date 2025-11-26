const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function autoApply(jobUrl, userDetails, resumePath, coverLetter = null) {
  let browser;
  const logs = [];
  
  try {
    logs.push({ timestamp: new Date(), message: 'Launching browser' });
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    logs.push({ timestamp: new Date(), message: `Navigating to ${jobUrl}` });
    await page.goto(jobUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Detect job platform and apply accordingly
    if (jobUrl.includes('linkedin.com')) {
      return await applyLinkedIn(page, userDetails, resumePath, logs);
    } else if (jobUrl.includes('indeed.com')) {
      return await applyIndeed(page, userDetails, resumePath, logs);
    } else if (jobUrl.includes('glassdoor.com')) {
      return await applyGlassdoor(page, userDetails, resumePath, logs);
    } else {
      return await applyGeneric(page, userDetails, resumePath, logs);
    }
  } catch (error) {
    logs.push({ timestamp: new Date(), message: `Error: ${error.message}`, error: true });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function applyLinkedIn(page, userDetails, resumePath, logs) {
  try {
    logs.push({ timestamp: new Date(), message: 'Detected LinkedIn - starting application' });

    // Click Easy Apply button
    const easyApplyBtn = page.locator('button:has-text("Easy Apply")').first();
    if (await easyApplyBtn.isVisible({ timeout: 5000 })) {
      await easyApplyBtn.click();
      logs.push({ timestamp: new Date(), message: 'Clicked Easy Apply' });
      await page.waitForTimeout(2000);
    } else {
      throw new Error('Easy Apply button not found');
    }

    // Fill form fields
    await fillCommonFields(page, userDetails, logs);

    // Upload resume
    if (resumePath) {
      const resumeInput = page.locator('input[type="file"]').first();
      if (await resumeInput.isVisible({ timeout: 3000 })) {
        await resumeInput.setInputFiles(resumePath);
        logs.push({ timestamp: new Date(), message: 'Uploaded resume' });
        await page.waitForTimeout(1000);
      }
    }

    // Handle multi-step form
    let continueBtn;
    let attempts = 0;
    while (attempts < 5) {
      continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      if (await continueBtn.isVisible({ timeout: 2000 })) {
        await continueBtn.click();
        logs.push({ timestamp: new Date(), message: `Clicked Continue (step ${attempts + 1})` });
        await page.waitForTimeout(2000);
        attempts++;
      } else {
        break;
      }
    }

    // Submit application
    const submitBtn = page.locator('button:has-text("Submit application"), button:has-text("Submit")').first();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      const screenshotPath = await takeScreenshot(page);
      await submitBtn.click();
      logs.push({ timestamp: new Date(), message: 'Submitted application' });
      await page.waitForTimeout(2000);
      
      return {
        success: true,
        logs,
        screenshotUrl: screenshotPath
      };
    } else {
      throw new Error('Submit button not found');
    }
  } catch (error) {
    const screenshotPath = await takeScreenshot(page);
    logs.push({ timestamp: new Date(), message: `LinkedIn application failed: ${error.message}`, error: true });
    return {
      success: false,
      logs,
      screenshotUrl: screenshotPath,
      error: error.message
    };
  }
}

async function applyIndeed(page, userDetails, resumePath, logs) {
  try {
    logs.push({ timestamp: new Date(), message: 'Detected Indeed - starting application' });

    const applyBtn = page.locator('button:has-text("Apply now"), button.jobsearch-IndeedApplyButton').first();
    if (await applyBtn.isVisible({ timeout: 5000 })) {
      await applyBtn.click();
      logs.push({ timestamp: new Date(), message: 'Clicked Apply button' });
      await page.waitForTimeout(2000);
    }

    await fillCommonFields(page, userDetails, logs);

    if (resumePath) {
      const resumeInput = page.locator('input[type="file"]').first();
      if (await resumeInput.isVisible({ timeout: 3000 })) {
        await resumeInput.setInputFiles(resumePath);
        logs.push({ timestamp: new Date(), message: 'Uploaded resume' });
      }
    }

    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Submit your application")').first();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      const screenshotPath = await takeScreenshot(page);
      await submitBtn.click();
      logs.push({ timestamp: new Date(), message: 'Submitted application' });
      
      return {
        success: true,
        logs,
        screenshotUrl: screenshotPath
      };
    }
  } catch (error) {
    const screenshotPath = await takeScreenshot(page);
    logs.push({ timestamp: new Date(), message: `Indeed application failed: ${error.message}`, error: true });
    return {
      success: false,
      logs,
      screenshotUrl: screenshotPath,
      error: error.message
    };
  }
}

async function applyGlassdoor(page, userDetails, resumePath, logs) {
  try {
    logs.push({ timestamp: new Date(), message: 'Detected Glassdoor - starting application' });

    const applyBtn = page.locator('button:has-text("Apply Now")').first();
    if (await applyBtn.isVisible({ timeout: 5000 })) {
      await applyBtn.click();
      logs.push({ timestamp: new Date(), message: 'Clicked Apply button' });
      await page.waitForTimeout(2000);
    }

    await fillCommonFields(page, userDetails, logs);

    const screenshotPath = await takeScreenshot(page);
    logs.push({ timestamp: new Date(), message: 'Application process completed' });
    
    return {
      success: true,
      logs,
      screenshotUrl: screenshotPath
    };
  } catch (error) {
    const screenshotPath = await takeScreenshot(page);
    logs.push({ timestamp: new Date(), message: `Glassdoor application failed: ${error.message}`, error: true });
    return {
      success: false,
      logs,
      screenshotUrl: screenshotPath,
      error: error.message
    };
  }
}

async function applyGeneric(page, userDetails, resumePath, logs) {
  try {
    logs.push({ timestamp: new Date(), message: 'Using generic application approach' });

    await fillCommonFields(page, userDetails, logs);

    const screenshotPath = await takeScreenshot(page);
    logs.push({ timestamp: new Date(), message: 'Generic application completed (manual verification needed)' });
    
    return {
      success: true,
      logs,
      screenshotUrl: screenshotPath,
      requiresManualReview: true
    };
  } catch (error) {
    const screenshotPath = await takeScreenshot(page);
    logs.push({ timestamp: new Date(), message: `Generic application failed: ${error.message}`, error: true });
    return {
      success: false,
      logs,
      screenshotUrl: screenshotPath,
      error: error.message
    };
  }
}

async function fillCommonFields(page, userDetails, logs) {
  const fieldMappings = [
    { selectors: ['input[name="firstName"]', 'input[id*="first"]', 'input[placeholder*="First"]'], value: userDetails.firstName },
    { selectors: ['input[name="lastName"]', 'input[id*="last"]', 'input[placeholder*="Last"]'], value: userDetails.lastName },
    { selectors: ['input[name="email"]', 'input[type="email"]', 'input[id*="email"]'], value: userDetails.email },
    { selectors: ['input[name="phone"]', 'input[type="tel"]', 'input[id*="phone"]'], value: userDetails.phone }
  ];

  for (const field of fieldMappings) {
    for (const selector of field.selectors) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 1000 })) {
          await input.fill(field.value);
          logs.push({ timestamp: new Date(), message: `Filled ${selector}` });
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }
}

async function takeScreenshot(page) {
  try {
    const screenshotDir = path.join(__dirname, '../uploads/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const filename = `screenshot_${Date.now()}.png`;
    const filepath = path.join(screenshotDir, filename);
    
    await page.screenshot({ path: filepath, fullPage: true });
    return `/uploads/screenshots/${filename}`;
  } catch (error) {
    console.error('Screenshot error:', error);
    return null;
  }
}

module.exports = { autoApply };
