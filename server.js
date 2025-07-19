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
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD || 'your_password';

// Gmail credentials for email verification
const GMAIL_EMAIL = process.env.GMAIL_EMAIL || 'vdr1800@gmail.com';
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD || 'your_gmail_app_password';

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
  major: "Software Engineer",
  startYear: "2022",
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

// Email verification function for LinkedIn codes
async function checkGmailForLinkedInCode() {
  console.log('📧 Checking Gmail for LinkedIn verification code...');
  
  let browser;
  try {
    browser = await createBrowser();
    const page = await browser.newPage();
    
    // Go to Gmail
    await page.goto('https://accounts.google.com/signin', { waitUntil: 'networkidle2' });
    
    // Login to Gmail
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', GMAIL_EMAIL);
    await page.click('#identifierNext');
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.type('input[type="password"]', GMAIL_PASSWORD);
    await page.click('#passwordNext');
    
    // Wait for Gmail to load
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(3000);
    
    // Search for LinkedIn verification emails
    const searchBox = await page.$('input[aria-label="Search mail"]');
    if (searchBox) {
      await searchBox.click();
      await searchBox.type('from:security-noreply@linkedin.com subject:verification');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }
    
    // Find the most recent email
    const emailLinks = await page.$$('tr[role="row"]');
    if (emailLinks.length > 0) {
      await emailLinks[0].click();
      await page.waitForTimeout(2000);
      
      // Extract verification code from email content
      const emailContent = await page.evaluate(() => {
        return document.body.innerText;
      });
      
      // Look for verification code patterns
      const codePatterns = [
        /(\d{6})/g,
        /verification code[:\s]*(\d{4,8})/i,
        /security code[:\s]*(\d{4,8})/i,
        /confirm[:\s]*(\d{4,8})/i
      ];
      
      for (const pattern of codePatterns) {
        const matches = emailContent.match(pattern);
        if (matches) {
          const code = matches[matches.length - 1].replace(/\D/g, '');
          if (code.length >= 4 && code.length <= 8) {
            console.log(`✅ Found verification code: ${code}`);
            await browser.close();
            return code;
          }
        }
      }
    }
    
    await browser.close();
    return null;
    
  } catch (error) {
    console.error('❌ Error checking Gmail:', error.message);
    if (browser) await browser.close();
    return null;
  }
}

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

// Enhanced LinkedIn login with email verification support
async function linkedInLoginWithEmailVerification(page) {
  console.log('🔐 Attempting LinkedIn login with email verification support...');
  
  try {
    // Go to LinkedIn login
    await page.goto('https://www.linkedin.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Enter credentials
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.type('#username', LINKEDIN_EMAIL);
    await page.type('#password', LINKEDIN_PASSWORD);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);

    const currentUrl = page.url();
    console.log(`🔍 Current URL after login: ${currentUrl}`);

    // Check if we need email verification
    if (currentUrl.includes('/challenge') || currentUrl.includes('/checkpoint')) {
      console.log('🚨 Email verification required, checking Gmail...');
      
      // Look for verification code input
      const codeInputSelectors = [
        'input[name="pin"]',
        'input[name="challengeId"]',
        'input[id*="verification"]',
        'input[placeholder*="code"]',
        'input[type="text"]'
      ];
      
      let codeInput = null;
      for (const selector of codeInputSelectors) {
        try {
          codeInput = await page.$(selector);
          if (codeInput) {
            console.log(`✅ Found code input field: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (codeInput) {
        // Get verification code from Gmail
        const verificationCode = await checkGmailForLinkedInCode();
        
        if (verificationCode) {
          console.log(`🔑 Entering verification code: ${verificationCode}`);
          await codeInput.click();
          await codeInput.type(verificationCode);
          
          // Submit the code
          const submitButton = await page.$('button[type="submit"], button[data-id="verification-challenge-submit-btn"], .primary-action-new');
          if (submitButton) {
            await submitButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
          }
          
          // Check if login successful
          const finalUrl = page.url();
          if (finalUrl.includes('/feed') || finalUrl.includes('/in/') || !finalUrl.includes('/challenge')) {
            console.log('✅ LinkedIn login successful with email verification!');
            return true;
          }
        } else {
          throw new Error('Could not retrieve verification code from Gmail');
        }
      } else {
        throw new Error('Email verification required but could not find code input field');
      }
    } else if (currentUrl.includes('/feed') || currentUrl.includes('/in/')) {
      console.log('✅ LinkedIn login successful without verification!');
      return true;
    }

    throw new Error('LinkedIn login failed - unknown state');
    
  } catch (error) {
    console.error('❌ LinkedIn login error:', error.message);
    throw error;
  }
}

// Enhanced LinkedIn Auto-Apply with your updated details
async function processLinkedInApplication(jobData, applicantData) {
  console.log(`🎯 Starting LinkedIn application for: ${applicantData.firstName} ${applicantData.lastName}`);
  console.log(`📋 Job: ${jobData.title} at ${jobData.url}`);
  console.log(`👤 Applicant: ${COMPLETE_APPLICANT_PROFILE.currentJobTitle} at ${COMPLETE_APPLICANT_PROFILE.currentCompany}`);
  
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
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    // Login with email verification support
    const loginSuccess = await linkedInLoginWithEmailVerification(page);
    if (!loginSuccess) {
      throw new Error('LinkedIn login failed');
    }
    
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

    console.log('📝 Starting comprehensive form filling with updated profile...');

    // Step 4: Handle application form with your updated details
    const formResult = await fillApplicationFormSimplified(page, COMPLETE_APPLICANT_PROFILE);
    
    result.success = formResult.completed;
    result.message = formResult.completed ? 
      'Application submitted successfully with updated profile and email verification' : 
      'Application process completed but submission status unclear';
    result.details = {
      stepsProcessed: formResult.stepsProcessed,
      formStatus: formResult.status,
      environment: 'railway-optimized',
      emailVerificationSupported: true,
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
    result.details.environment = 'railway-optimized';
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Enhanced form filling with your updated details
async function fillApplicationFormSimplified(page, applicantData, maxSteps = 8) {
  let currentStep = 1;
  let applicationCompleted = false;
  
  console.log('📝 Starting form filling with updated Vamsidhar profile...');
  console.log(`👤 Profile: ${applicantData.yearsOfExperience} years exp, ${applicantData.currentCompany}, ${applicantData.graduationYear} grad`);
  
  while (currentStep <= maxSteps && !applicationCompleted) {
    console.log(`📄 Processing step ${currentStep}...`);
    
    try {
      await page.waitForTimeout(2000);
      
      // Fill basic fields with updated info
      await fillBasicFieldsSimplified(page, applicantData);
      
      // Handle work authorization
      await handleWorkAuthSimplified(page, applicantData);
      
      // Fill text areas with updated cover letter
      await fillTextAreasSimplified(page, applicantData);
      
      // Handle dropdowns with updated experience level
      await handleDropdownsSimplified(page, applicantData);
      
      console.log(`✅ Completed step ${currentStep} with updated profile`);
      
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

// Enhanced helper functions with your updated details
async function fillBasicFieldsSimplified(page, data) {
  const fields = [
    { selector: 'input[name*="first"], input[id*="first"]', value: data.firstName },
    { selector: 'input[name*="last"], input[id*="last"]', value: data.lastName },
    { selector: 'input[type="email"]', value: data.email },
    { selector: 'input[type="tel"], input[name*="phone"]', value: data.phone },
    { selector: 'input[name*="city"]', value: data.city },
    // Add fields for your experience and company
    { selector: 'input[name*="company"], input[placeholder*="company"]', value: data.currentCompany },
    { selector: 'input[name*="title"], input[placeholder*="title"]', value: data.currentJobTitle },
    { selector: 'input[name*="experience"], input[placeholder*="years"]', value: data.yearsOfExperience },
  ];
  
  for (const field of fields) {
    try {
      const element = await page.$(field.selector);
      if (element && field.value) {
        await element.click({ clickCount: 3 });
        await element.type(field.value);
        console.log(`✅ Filled: ${field.selector} with ${field.value}`);
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
          console.log('✅ Answered work authorization question (F1 STEM OPT)');
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
        console.log('✅ Filled cover letter with Genpact experience');
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
        // Try to select experience level appropriate for 3 years
        let selectedValue = null;
        for (const option of options) {
          const text = await option.evaluate(el => el.textContent.toLowerCase());
          if (text.includes('3') || text.includes('mid') || text.includes('experienced')) {
            selectedValue = await option.evaluate(el => el.value);
            break;
          }
        }
        
        if (selectedValue) {
          await select.selectValue(selectedValue);
          console.log('✅ Selected experience-appropriate dropdown option');
        } else {
          await select.selectValue(await options[1].evaluate(el => el.value));
          console.log('✅ Selected fallback dropdown option');
        }
      }
    }
  } catch (e) {
    console.log('⚠️ Could not handle dropdowns');
  }
}

// API endpoint with updated profile
app.post('/apply-job', async (req, res) => {
  const { job_data, applicant_data } = req.body;
  
  console.log('📋 New LinkedIn Application with Updated Vamsidhar Profile:');
  console.log('Job:', job_data?.title);
  console.log('URL:', job_data?.url);
  console.log('Applicant:', applicant_data?.firstName, applicant_data?.lastName);
  console.log('Experience:', COMPLETE_APPLICANT_PROFILE.yearsOfExperience, 'years at', COMPLETE_APPLICANT_PROFILE.currentCompany);
  
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
    service: 'LinkedIn Auto-Applier with Email Verification - Vamsidhar Profile',
    version: '4.1.0',
    features: ['email_verification', 'gmail_integration', 'linkedin_automation', 'updated_profile'],
    environment: process.env.RAILWAY_ENVIRONMENT || 'local',
    puppeteer: chromium ? 'chromium' : 'standard',
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
    message: 'LinkedIn Auto-Apply with Email Verification is ready!',
    applicant: 'Vamsidhar Reddy M',
    email: 'vdr1800@gmail.com',
    status: 'ready_with_updated_profile_and_email_verification',
    profile: {
      experience: COMPLETE_APPLICANT_PROFILE.yearsOfExperience + ' years',
      currentCompany: COMPLETE_APPLICANT_PROFILE.currentCompany,
      title: COMPLETE_APPLICANT_PROFILE.currentJobTitle,
      graduation: COMPLETE_APPLICANT_PROFILE.graduationYear,
      visaStatus: COMPLETE_APPLICANT_PROFILE.visaStatus
    },
    capabilities: [
      'LinkedIn automation with email verification',
      'Gmail verification code retrieval',
      'Email challenge handling',
      'Form auto-filling with 3 years experience',
      'Genpact Global INC background',
      'F1 STEM OPT status handling',
      'Multi-step applications'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 LinkedIn Auto-Apply with Email Verification running on port ${PORT}`);
  console.log(`👤 Profile: ${COMPLETE_APPLICANT_PROFILE.currentJobTitle} at ${COMPLETE_APPLICANT_PROFILE.currentCompany}`);
  console.log(`🎓 Education: ${COMPLETE_APPLICANT_PROFILE.degree} ${COMPLETE_APPLICANT_PROFILE.graduationYear}`);
  console.log(`💼 Experience: ${COMPLETE_APPLICANT_PROFILE.yearsOfExperience} years`);
  console.log(`📧 Gmail integration: ${GMAIL_EMAIL}`);
  console.log(`🔐 LinkedIn account: ${LINKEDIN_EMAIL}`);
});
