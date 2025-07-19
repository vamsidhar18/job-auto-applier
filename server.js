const express = require('express');
const cors = require('cors');

// Railway-optimized Puppeteer setup
let puppeteer;
let chromium;

try {
  puppeteer = require('puppeteer-core');
  chromium = require('@sparticuz/chromium');
  console.log('✅ Using Railway-optimized Puppeteer setup');
} catch (e) {
  console.log('⚠️ Falling back to regular Puppeteer (local dev mode)');
  puppeteer = require('puppeteer');
}

const app = express();
app.use(cors());
app.use(express.json());

// LinkedIn credentials
const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL || 'vdr1800@gmail.com';
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD || 'Vamsidhar@16';

// Updated applicant profile with your correct details
const COMPLETE_APPLICANT_PROFILE = {
  firstName: "Vamsidhar Reddy",
  lastName: "M",
  email: "vdr1800@gmail.com",
  phone: "+16692928219",
  address: "754 The Alameda",
  city: "San Jose",
  state: "CA",
  country: "US",
  zipCode: "95126",
  linkedinProfile: "https://www.linkedin.com/in/vamsidhar1800/",
  portfolioWebsite: "https://www.linkedin.com/in/vamsidhar1800/",
  workAuthorization: "Yes",
  requiresSponsorship: "Yes",
  visaStatus: "F1 STEM OPT",
  yearsOfExperience: "3",
  currentJobTitle: "Software Engineer",
  currentCompany: "Genpact Global INC",
  university: "San Jose State University",
  degree: "Master of Science",
  major: "Computer Science",
  startYear: "2022"
  graduationYear: "2023",
  preferredSalary: "100000",
  availableStartDate: "Immediately",
  willingToRelocate: "Yes",
  remoteWork: "Yes",
  coverLetter: `Dear Hiring Manager,

I am excited to apply for this Software Engineer position. As an MS Computer Science graduate from San Jose State University with 3 years of hands-on experience at Genpact Global INC, I am eager to contribute to your team.

My technical expertise includes JavaScript, Python, React, Node.js, and cloud technologies. I have successfully built and deployed web applications, worked with databases, and implemented automated systems in my current role at Genpact Global INC.

As an F1 STEM OPT holder, I am authorized to work and seeking sponsorship opportunities. I am passionate about creating efficient, scalable solutions and would love to bring my professional experience and technical skills to your organization.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
Vamsidhar Reddy M`
};

// Railway-optimized browser launch with enhanced stealth
async function createBrowser() {
  console.log('🚀 Launching stealth browser for Railway environment...');
  
  try {
    if (chromium) {
      return await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--no-default-browser-check',
          '--disable-infobars',
          '--disable-notifications',
          '--disable-save-password-bubble'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      return await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled'
        ]
      });
    }
  } catch (error) {
    console.error('❌ Browser launch failed:', error.message);
    throw new Error('Failed to launch browser in Railway environment');
  }
}

// Enhanced stealth LinkedIn login with retry mechanism
async function linkedInLoginWithRetry(page, maxRetries = 3) {
  console.log('🔐 Attempting stealth LinkedIn login...');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Login attempt ${attempt}/${maxRetries}`);
      
      // Add stealth measures
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });
      
      await page.evaluateOnNewDocument(() => {
        window.navigator.chrome = {
          runtime: {},
        };
      });
      
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
      });
      
      // Go to LinkedIn login with random delay
      await page.goto('https://www.linkedin.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Random delay between 1-3 seconds
      await page.waitForTimeout(1000 + Math.random() * 2000);

      // Enter credentials with human-like typing
      await page.waitForSelector('#username', { timeout: 10000 });
      
      // Type email slowly
      await page.click('#username');
      await page.waitForTimeout(500);
      for (const char of LINKEDIN_EMAIL) {
        await page.type('#username', char, { delay: 50 + Math.random() * 100 });
      }
      
      await page.waitForTimeout(500);
      
      // Type password slowly
      await page.click('#password');
      await page.waitForTimeout(500);
      for (const char of LINKEDIN_PASSWORD) {
        await page.type('#password', char, { delay: 50 + Math.random() * 100 });
      }
      
      await page.waitForTimeout(1000);
      
      // Click submit with delay
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
      ]);

      const currentUrl = page.url();
      console.log(`🔍 Current URL after login attempt ${attempt}: ${currentUrl}`);

      // Check for successful login
      if (currentUrl.includes('/feed') || currentUrl.includes('/in/') || currentUrl.includes('/mynetwork')) {
        console.log('✅ LinkedIn login successful!');
        return true;
      } else if (currentUrl.includes('/challenge') || currentUrl.includes('/checkpoint')) {
        console.log(`⚠️ Security challenge detected on attempt ${attempt}`);
        
        if (attempt < maxRetries) {
          console.log('🔄 Waiting before retry...');
          await page.waitForTimeout(5000 + Math.random() * 5000); // Wait 5-10 seconds
          continue;
        } else {
          // On final attempt, try to handle challenge manually
          console.log('🚨 Final attempt - trying to handle challenge...');
          
          // Look for "Not now" or "Skip" buttons
          const skipButtons = await page.$$('button');
          for (const button of skipButtons) {
            const text = await button.evaluate(el => el.textContent.toLowerCase());
            if (text.includes('not now') || text.includes('skip') || text.includes('later')) {
              console.log(`🔘 Found skip button: ${text}`);
              await button.click();
              await page.waitForTimeout(2000);
              
              const newUrl = page.url();
              if (newUrl.includes('/feed') || newUrl.includes('/in/')) {
                console.log('✅ Successfully skipped challenge!');
                return true;
              }
            }
          }
          
          throw new Error('LinkedIn security challenge - please log in manually first');
        }
      } else {
        throw new Error(`Login failed - unexpected URL: ${currentUrl}`);
      }
      
    } catch (error) {
      console.error(`❌ Login attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      await page.waitForTimeout(3000 + Math.random() * 2000);
    }
  }
  
  return false;
}

// Enhanced LinkedIn Auto-Apply with stealth and retry
async function processLinkedInApplicationStealth(jobData, applicantData) {
  console.log(`🎯 Starting stealth LinkedIn application for: ${applicantData.firstName} ${applicantData.lastName}`);
  console.log(`📋 Job: ${jobData.title} at ${jobData.url}`);
  console.log(`👤 Profile: ${COMPLETE_APPLICANT_PROFILE.currentJobTitle} at ${COMPLETE_APPLICANT_PROFILE.currentCompany}`);
  
  let browser;
  let result = {
    success: false,
    message: '',
    applicant: `${applicantData.firstName} ${applicantData.lastName}`,
    job: jobData.title,
    platform: 'linkedin',
    timestamp: new Date().toISOString(),
    details: {}
  };

  try {
    browser = await createBrowser();
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ 
      width: 1366 + Math.floor(Math.random() * 100), 
      height: 768 + Math.floor(Math.random() * 100) 
    });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    // Login with retry mechanism
    const loginSuccess = await linkedInLoginWithRetry(page);
    if (!loginSuccess) {
      throw new Error('LinkedIn login failed after multiple attempts');
    }
    
    // Navigate to job posting
    console.log(`🔍 Navigating to job: ${jobData.url}`);
    await page.goto(jobData.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait a bit to avoid looking like a bot
    await page.waitForTimeout(2000 + Math.random() * 3000);

    // Find and click Easy Apply button
    console.log('🔍 Looking for Easy Apply button...');
    
    const easyApplySelectors = [
      'button[aria-label*="Easy Apply"]',
      '.jobs-apply-button--top-card button',
      '.jobs-s-apply button',
      'button[data-control-name="jobdetails_topcard_inapply"]',
      '.jobs-apply-button button',
      'button:has-text("Easy Apply")'
    ];

    let easyApplyButton = null;
    for (const selector of easyApplySelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        easyApplyButton = await page.$(selector);
        if (easyApplyButton) {
          const isVisible = await easyApplyButton.isIntersectingViewport();
          if (isVisible) {
            const buttonText = await easyApplyButton.evaluate(el => el.textContent);
            console.log(`✅ Found Easy Apply button: ${buttonText}`);
            break;
          }
        }
        easyApplyButton = null;
      } catch (e) {
        continue;
      }
    }

    if (!easyApplyButton) {
      throw new Error('Easy Apply button not found - job may not support Easy Apply or may require external application');
    }

    // Scroll to button and click
    await easyApplyButton.scrollIntoView();
    await page.waitForTimeout(1000);
    await easyApplyButton.click();
    await page.waitForTimeout(3000);

    console.log('📝 Starting form filling with updated profile...');

    // Handle application form
    const formResult = await fillApplicationFormStealth(page, COMPLETE_APPLICANT_PROFILE);
    
    result.success = formResult.completed;
    result.message = formResult.completed ? 
      'Application submitted successfully with stealth approach' : 
      'Application process completed but submission unclear';
    result.details = {
      stepsProcessed: formResult.stepsProcessed,
      formStatus: formResult.status,
      approach: 'stealth-mode',
      profileUsed: {
        experience: COMPLETE_APPLICANT_PROFILE.yearsOfExperience + ' years',
        currentCompany: COMPLETE_APPLICANT_PROFILE.currentCompany,
        graduationYear: COMPLETE_APPLICANT_PROFILE.graduationYear
      }
    };

  } catch (error) {
    console.error('❌ LinkedIn application error:', error.message);
    result.success = false;
    result.message = `Application failed: ${error.message}`;
    result.details.error = error.message;
    result.details.approach = 'stealth-mode';
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Stealth form filling with human-like behavior
async function fillApplicationFormStealth(page, applicantData, maxSteps = 10) {
  let currentStep = 1;
  let applicationCompleted = false;
  
  console.log('📝 Starting stealth form filling...');
  
  while (currentStep <= maxSteps && !applicationCompleted) {
    console.log(`📄 Processing step ${currentStep}...`);
    
    try {
      // Random delay between steps
      await page.waitForTimeout(1000 + Math.random() * 2000);
      
      // Fill forms with human-like behavior
      await fillFieldsStealth(page, applicantData);
      await handleWorkAuthStealth(page, applicantData);
      await fillTextAreasStealth(page, applicantData);
      await handleDropdownsStealth(page, applicantData);
      
      console.log(`✅ Completed step ${currentStep}`);
      
      // Look for navigation buttons
      const buttons = await page.$$('button');
      let hasSubmit = false;
      let hasNext = false;
      let submitButton = null;
      let nextButton = null;
      
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent.toLowerCase());
        const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label')?.toLowerCase() || '');
        
        if (text.includes('submit') || ariaLabel.includes('submit')) {
          hasSubmit = true;
          submitButton = button;
        } else if (text.includes('next') || text.includes('continue') || ariaLabel.includes('continue')) {
          hasNext = true;
          nextButton = button;
        }
      }
      
      if (hasSubmit && submitButton) {
        console.log('🎯 Submitting application...');
        await submitButton.scrollIntoView();
        await page.waitForTimeout(1000);
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        // Check for success
        const success = await page.evaluate(() => {
          const bodyText = document.body.textContent.toLowerCase();
          return bodyText.includes('submitted') || 
                 bodyText.includes('application sent') ||
                 bodyText.includes('thank you') ||
                 bodyText.includes('success') ||
                 window.location.href.includes('success');
        });
        
        if (success) {
          applicationCompleted = true;
          console.log('🎉 Application submitted successfully!');
        }
        break;
      } else if (hasNext && nextButton) {
        console.log('➡️ Continuing to next step...');
        await nextButton.scrollIntoView();
        await page.waitForTimeout(1000);
        await nextButton.click();
        await page.waitForTimeout(2000);
        currentStep++;
      } else {
        console.log('❓ No clear navigation found, checking page content...');
        
        // Try to find any clickable button to continue
        const allButtons = await page.$$('button[type="button"], button[type="submit"]');
        let foundContinue = false;
        
        for (const btn of allButtons) {
          const isVisible = await btn.isIntersectingViewport();
          if (isVisible) {
            await btn.click();
            await page.waitForTimeout(2000);
            foundContinue = true;
            break;
          }
        }
        
        if (!foundContinue) {
          throw new Error(`No navigation options found on step ${currentStep}`);
        }
        currentStep++;
      }
      
    } catch (stepError) {
      console.error(`❌ Error on step ${currentStep}:`, stepError.message);
      break;
    }
  }
  
  return {
    completed: applicationCompleted,
    stepsProcessed: currentStep,
    status: applicationCompleted ? 'submitted' : 'incomplete'
  };
}

// Human-like field filling
async function fillFieldsStealth(page, data) {
  const fields = [
    { patterns: ['first', 'given'], value: data.firstName },
    { patterns: ['last', 'family', 'surname'], value: data.lastName },
    { patterns: ['email'], value: data.email },
    { patterns: ['phone', 'mobile'], value: data.phone },
    { patterns: ['city'], value: data.city },
    { patterns: ['company'], value: data.currentCompany },
    { patterns: ['title', 'position'], value: data.currentJobTitle },
  ];
  
  const inputs = await page.$$('input[type="text"], input[type="email"], input[type="tel"]');
  
  for (const input of inputs) {
    try {
      const placeholder = await input.evaluate(el => el.placeholder?.toLowerCase() || '');
      const name = await input.evaluate(el => el.name?.toLowerCase() || '');
      const id = await input.evaluate(el => el.id?.toLowerCase() || '');
      const context = `${placeholder} ${name} ${id}`;
      
      for (const field of fields) {
        if (field.patterns.some(pattern => context.includes(pattern)) && field.value) {
          await input.scrollIntoView();
          await page.waitForTimeout(200);
          await input.click({ clickCount: 3 });
          await page.waitForTimeout(100);
          
          // Type with human-like delay
          for (const char of field.value) {
            await input.type(char, { delay: 50 + Math.random() * 100 });
          }
          
          console.log(`✅ Filled field: ${context.substring(0, 20)}... with ${field.value}`);
          await page.waitForTimeout(200);
          break;
        }
      }
    } catch (e) {
      continue;
    }
  }
}

async function handleWorkAuthStealth(page, data) {
  try {
    const sections = await page.$$('fieldset, .fb-dash-form-element, .jobs-easy-apply-form-section');
    for (const section of sections) {
      const text = await section.evaluate(el => el.textContent.toLowerCase());
      if (text.includes('authorized') || text.includes('sponsorship') || text.includes('visa')) {
        const inputs = await section.$$('input[type="radio"], input[type="checkbox"]');
        for (const input of inputs) {
          const value = await input.evaluate(el => (el.value || el.nextElementSibling?.textContent || '').toLowerCase());
          if (value.includes('yes') && data.workAuthorization === 'Yes') {
            await input.click();
            console.log('✅ Selected work authorization: Yes');
            await page.waitForTimeout(500);
            break;
          }
        }
      }
    }
  } catch (e) {
    console.log('⚠️ Could not handle work authorization');
  }
}

async function fillTextAreasStealth(page, data) {
  try {
    const textAreas = await page.$$('textarea');
    for (const textArea of textAreas) {
      const placeholder = await textArea.evaluate(el => el.placeholder?.toLowerCase() || '');
      const label = await textArea.evaluate(el => el.getAttribute('aria-label')?.toLowerCase() || '');
      
      if (placeholder.includes('cover') || label.includes('cover') || placeholder.includes('why')) {
        await textArea.scrollIntoView();
        await page.waitForTimeout(500);
        await textArea.click();
        
        // Type cover letter with realistic speed
        const sentences = data.coverLetter.split('. ');
        for (const sentence of sentences) {
          await textArea.type(sentence + '. ', { delay: 10 });
          await page.waitForTimeout(200 + Math.random() * 300);
        }
        
        console.log('✅ Filled cover letter');
        break;
      }
    }
  } catch (e) {
    console.log('⚠️ Could not fill text areas');
  }
}

async function handleDropdownsStealth(page, data) {
  try {
    const selects = await page.$$('select');
    for (const select of selects) {
      const options = await select.$$('option');
      if (options.length > 1) {
        // Try to find relevant option based on experience
        let selectedOption = null;
        for (const option of options) {
          const text = await option.evaluate(el => el.textContent.toLowerCase());
          if (text.includes('3') || text.includes('mid') || text.includes('intermediate')) {
            selectedOption = option;
            break;
          }
        }
        
        if (!selectedOption && options.length > 1) {
          selectedOption = options[1]; // Fallback to second option
        }
        
        if (selectedOption) {
          const value = await selectedOption.evaluate(el => el.value);
          await select.selectValue(value);
          console.log('✅ Selected dropdown option');
          await page.waitForTimeout(300);
        }
      }
    }
  } catch (e) {
    console.log('⚠️ Could not handle dropdowns');
  }
}

// API endpoint
app.post('/apply-job', async (req, res) => {
  const { job_data, applicant_data } = req.body;
  
  console.log('📋 New Stealth LinkedIn Application:');
  console.log('Job:', job_data?.title);
  console.log('URL:', job_data?.url);
  console.log('Profile:', COMPLETE_APPLICANT_PROFILE.yearsOfExperience, 'years at', COMPLETE_APPLICANT_PROFILE.currentCompany);
  
  try {
    if (!job_data?.url || !job_data.url.includes('linkedin.com')) {
      return res.json({
        success: false,
        message: 'Only LinkedIn jobs are supported',
        applicant: `${applicant_data?.firstName} ${applicant_data?.lastName}`,
        job: job_data?.title,
        platform: 'other'
      });
    }

    const result = await processLinkedInApplicationStealth(job_data, applicant_data);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Application error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      applicant: `${applicant_data?.firstName} ${applicant_data?.lastName}`,
      job: job_data?.title
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Stealth LinkedIn Auto-Applier - Vamsidhar Profile',
    version: '5.0.0',
    features: ['stealth_mode', 'human_behavior', 'retry_mechanism', 'updated_profile'],
    environment: process.env.RAILWAY_ENVIRONMENT || 'local',
    profile: {
      experience: COMPLETE_APPLICANT_PROFILE.yearsOfExperience + ' years',
      company: COMPLETE_APPLICANT_PROFILE.currentCompany,
      graduation: COMPLETE_APPLICANT_PROFILE.graduationYear
    },
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Stealth LinkedIn Auto-Apply Server is ready!',
    applicant: 'Vamsidhar Reddy M',
    email: 'vdr1800@gmail.com',
    status: 'ready_with_stealth_mode',
    approach: 'human-like behavior, no email verification required',
    profile: {
      experience: COMPLETE_APPLICANT_PROFILE.yearsOfExperience + ' years',
      currentCompany: COMPLETE_APPLICANT_PROFILE.currentCompany,
      title: COMPLETE_APPLICANT_PROFILE.currentJobTitle,
      graduation: COMPLETE_APPLICANT_PROFILE.graduationYear,
      visaStatus: COMPLETE_APPLICANT_PROFILE.visaStatus
    },
    capabilities: [
      'Stealth LinkedIn automation',
      'Human-like typing behavior',
      'Multiple login retry attempts',
      'Enhanced anti-detection measures',
      'No Gmail verification required',
      'Form auto-filling with 3 years experience',
      'Professional Genpact background'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Stealth LinkedIn Auto-Apply Server running on port ${PORT}`);
  console.log(`🥷 Mode: Stealth (no email verification required)`);
  console.log(`👤 Profile: ${COMPLETE_APPLICANT_PROFILE.currentJobTitle} at ${COMPLETE_APPLICANT_PROFILE.currentCompany}`);
  console.log(`💼 Experience: ${COMPLETE_APPLICANT_PROFILE.yearsOfExperience} years`);
  console.log(`🔐 LinkedIn account: ${LINKEDIN_EMAIL}`);
});
