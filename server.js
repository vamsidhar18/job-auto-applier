const express = require('express');
const cors = require('cors');

// Railway-optimized Puppeteer setup
let puppeteer;
let chromium;

try {
  // Try to load Railway-compatible versions
  puppeteer = require('puppeteer-core');
  chromium = require('@sparticuz/chromium');
  console.log('✅ Using Railway-optimized Puppeteer setup');
} catch (e) {
  // Fallback to regular puppeteer for local development
  console.log('⚠️ Falling back to regular Puppeteer (local dev mode)');
  puppeteer = require('puppeteer');
}

const app = express();
app.use(cors());
app.use(express.json());

// LinkedIn credentials
const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL || 'vdr1800@gmail.com';
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD || 'Vamsidhar@123';

// Complete applicant profile
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
  portfolioWebsite: "https://github.com/vamsidhar1800",
  workAuthorization: "Yes",
  requiresSponsorship: "Yes",
  visaStatus: "F1 STEM OPT",
  yearsOfExperience: "2",
  currentJobTitle: "Software Engineer",
  currentCompany: "Genpact Global INC",
  university: "San Jose State University",
  degree: "Master of Science",
  major: "Computer Science",
  startYear: "2022",
  graduationYear: "2023",
  preferredSalary: "100000",
  availableStartDate: "Immediately",
  willingToRelocate: "Yes",
  remoteWork: "Yes",
  coverLetter: `Dear Hiring Manager,

I am excited to apply for this Software Engineer position. As a recent MS Computer Science graduate from San Jose State University with hands-on experience in full-stack development, I am eager to contribute to your team.

My technical expertise includes JavaScript, Python, React, Node.js, and cloud technologies. I have successfully built and deployed web applications, worked with databases, and implemented automated systems.

As an F1 STEM OPT holder, I am authorized to work and seeking sponsorship opportunities. I am passionate about creating efficient, scalable solutions and would love to bring my skills to your organization.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
Vamsidhar Reddy M`
};

// Railway-optimized browser launch
async function createBrowser() {
  console.log('🚀 Launching browser for Railway environment...');
  
  try {
    if (chromium) {
      // Railway/Production environment with chromium
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
          '--disable-features=VizDisplayCompositor'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      // Local development fallback
      return await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
  } catch (error) {
    console.error('❌ Browser launch failed:', error.message);
    throw new Error('Failed to launch browser in Railway environment');
  }
}

// Enhanced LinkedIn Auto-Apply
async function processLinkedInApplication(jobData, applicantData) {
  console.log(`🎯 Starting LinkedIn application for: ${applicantData.firstName} ${applicantData.lastName}`);
  console.log(`📋 Job: ${jobData.title} at ${jobData.url}`);
  
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
    // Launch Railway-optimized browser
    browser = await createBrowser();
    const page = await browser.newPage();
    
    // Set realistic user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    console.log('🔐 Logging into LinkedIn...');
    
    // Step 1: Login to LinkedIn
    await page.goto('https://www.linkedin.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('#username', { timeout: 10000 });
    await page.type('#username', LINKEDIN_EMAIL);
    await page.type('#password', LINKEDIN_PASSWORD);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    // Check for security challenges
    const currentUrl = page.url();
    if (currentUrl.includes('/challenge') || currentUrl.includes('/checkpoint')) {
      throw new Error('LinkedIn security challenge detected - manual intervention required');
    }

    console.log('✅ LinkedIn login successful');
    
    // Step 2: Navigate to job posting
    console.log(`🔍 Navigating to job: ${jobData.url}`);
    await page.goto(jobData.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Step 3: Find and click Easy Apply button
    console.log('🔍 Looking for Easy Apply button...');
    
    const easyApplySelectors = [
      'button[aria-label*="Easy Apply"]',
      'button:has-text("Easy Apply")',
      '.jobs-apply-button--top-card button',
      '.jobs-s-apply button',
      'button[data-control-name="jobdetails_topcard_inapply"]',
      '.jobs-apply-button button'
    ];

    let easyApplyButton = null;
    for (const selector of easyApplySelectors) {
      try {
        easyApplyButton = await page.$(selector);
        if (easyApplyButton) {
          const buttonText = await easyApplyButton.evaluate(el => el.textContent);
          if (buttonText.toLowerCase().includes('easy apply')) {
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
      throw new Error('Easy Apply button not found - job may not support Easy Apply');
    }

    // Click Easy Apply
    await easyApplyButton.click();
    await page.waitForTimeout(3000);

    console.log('📝 Starting comprehensive form filling process...');

    // Step 4: Handle application form with simplified approach for Railway
    const formResult = await fillApplicationFormSimplified(page, COMPLETE_APPLICANT_PROFILE);
    
    result.success = formResult.completed;
    result.message = formResult.completed ? 
      'Application submitted successfully via Railway-optimized automation' : 
      'Application process completed but submission status unclear';
    result.details = {
      stepsProcessed: formResult.stepsProcessed,
      formStatus: formResult.status,
      environment: 'railway-optimized'
    };

  } catch (error) {
    console.error('❌ LinkedIn application error:', error.message);
    result.success = false;
    result.message = `Application failed: ${error.message}`;
    result.details.error = error.message;
    result.details.environment = 'railway-optimized';
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Simplified form filling optimized for Railway
async function fillApplicationFormSimplified(page, applicantData, maxSteps = 8) {
  let currentStep = 1;
  let applicationCompleted = false;
  
  console.log('📝 Starting Railway-optimized form filling...');
  
  while (currentStep <= maxSteps && !applicationCompleted) {
    console.log(`📄 Processing step ${currentStep}...`);
    
    try {
      await page.waitForTimeout(2000);
      
      // Fill basic fields
      await fillBasicFieldsSimplified(page, applicantData);
      
      // Handle work authorization
      await handleWorkAuthSimplified(page, applicantData);
      
      // Fill text areas
      await fillTextAreasSimplified(page, applicantData);
      
      // Handle dropdowns
      await handleDropdownsSimplified(page, applicantData);
      
      console.log(`✅ Completed step ${currentStep}`);
      
      // Check for navigation
      const hasSubmit = await page.$('button[aria-label*="Submit"], button:has-text("Submit")');
      const hasNext = await page.$('button[aria-label*="Continue"], button:has-text("Next")');
      
      if (hasSubmit) {
        console.log('🎯 Submitting application...');
        await hasSubmit.click();
        await page.waitForTimeout(3000);
        
        // Simple success check
        const success = await page.evaluate(() => {
          return document.body.textContent.toLowerCase().includes('submitted') ||
                 document.body.textContent.toLowerCase().includes('success') ||
                 window.location.href.includes('success');
        });
        
        if (success) {
          applicationCompleted = true;
          console.log('🎉 Application submitted successfully!');
        }
        break;
      } else if (hasNext) {
        console.log('➡️ Continuing to next step...');
        await hasNext.click();
        await page.waitForTimeout(2000);
        currentStep++;
      } else {
        throw new Error(`No navigation found on step ${currentStep}`);
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

// Simplified helper functions
async function fillBasicFieldsSimplified(page, data) {
  const fields = [
    { selector: 'input[name*="first"], input[id*="first"]', value: data.firstName },
    { selector: 'input[name*="last"], input[id*="last"]', value: data.lastName },
    { selector: 'input[type="email"]', value: data.email },
    { selector: 'input[type="tel"], input[name*="phone"]', value: data.phone },
    { selector: 'input[name*="city"]', value: data.city },
  ];
  
  for (const field of fields) {
    try {
      const element = await page.$(field.selector);
      if (element && field.value) {
        await element.click({ clickCount: 3 });
        await element.type(field.value);
        console.log(`✅ Filled: ${field.selector}`);
      }
    } catch (e) {
      continue;
    }
  }
}

async function handleWorkAuthSimplified(page, data) {
  try {
    const sections = await page.$$('fieldset, .fb-dash-form-element');
    for (const section of sections) {
      const text = await section.evaluate(el => el.textContent.toLowerCase());
      if (text.includes('authorized') || text.includes('sponsorship')) {
        const yesButton = await section.$('input[value*="yes"], input[value*="Yes"]');
        if (yesButton) {
          await yesButton.click();
          console.log('✅ Answered work authorization question');
        }
      }
    }
  } catch (e) {
    console.log('⚠️ Could not handle work auth questions');
  }
}

async function fillTextAreasSimplified(page, data) {
  try {
    const textAreas = await page.$$('textarea');
    for (const textArea of textAreas) {
      const context = await textArea.evaluate(el => 
        (el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').toLowerCase()
      );
      
      if (context.includes('cover')) {
        await textArea.click();
        await textArea.type(data.coverLetter);
        console.log('✅ Filled cover letter');
        break;
      }
    }
  } catch (e) {
    console.log('⚠️ Could not fill text areas');
  }
}

async function handleDropdownsSimplified(page, data) {
  try {
    const selects = await page.$$('select');
    for (const select of selects) {
      const options = await select.$$('option');
      if (options.length > 1) {
        await select.selectValue(options[1].evaluate(el => el.value));
        console.log('✅ Selected dropdown option');
      }
    }
  } catch (e) {
    console.log('⚠️ Could not handle dropdowns');
  }
}

// API endpoint
app.post('/apply-job', async (req, res) => {
  const { job_data, applicant_data } = req.body;
  
  console.log('📋 New Railway-Optimized LinkedIn Application:');
  console.log('Job:', job_data?.title);
  console.log('URL:', job_data?.url);
  console.log('Applicant:', applicant_data?.firstName, applicant_data?.lastName);
  
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

    const result = await processLinkedInApplication(job_data, applicant_data);
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
    service: 'Railway-Optimized LinkedIn Auto-Applier',
    version: '3.1.0',
    environment: process.env.RAILWAY_ENVIRONMENT || 'local',
    puppeteer: chromium ? 'chromium' : 'standard',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Railway-Optimized LinkedIn Auto-Apply Server is ready!',
    applicant: 'Vamsidhar Reddy M',
    email: 'vdr1800@gmail.com',
    status: 'ready_for_railway_applications',
    environment: process.env.RAILWAY_ENVIRONMENT || 'local',
    puppeteer_setup: chromium ? 'railway-optimized' : 'local-development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Railway-Optimized LinkedIn Auto-Apply Server running on port ${PORT}`);
  console.log(`📧 Ready for: ${LINKEDIN_EMAIL}`);
  console.log(`🤖 Puppeteer setup: ${chromium ? 'Railway-optimized' : 'Local development'}`);
});
