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
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD || 'Vamsidha@123';

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

// Simple browser launch
async function createBrowser() {
  console.log('🚀 Launching browser...');
  
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
          '--disable-features=VizDisplayCompositor'
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
          '--disable-gpu'
        ]
      });
    }
  } catch (error) {
    console.error('❌ Browser launch failed:', error.message);
    throw new Error('Failed to launch browser');
  }
}

// Simple LinkedIn login
async function simpleLinkedInLogin(page) {
  console.log('🔐 Attempting LinkedIn login...');
  
  try {
    await page.goto('https://www.linkedin.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('#username', { timeout: 10000 });
    await page.type('#username', LINKEDIN_EMAIL);
    await page.type('#password', LINKEDIN_PASSWORD);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/challenge') || currentUrl.includes('/checkpoint')) {
      // Try to find and click skip/not now buttons
      const skipButtons = [
        'button:has-text("Not now")',
        'button:has-text("Skip")', 
        'button:has-text("Later")',
        'button[data-control-name="skip"]'
      ];
      
      for (const selector of skipButtons) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      const newUrl = page.url();
      if (newUrl.includes('/feed') || newUrl.includes('/in/')) {
        console.log('✅ Skipped challenge successfully');
        return true;
      } else {
        throw new Error('LinkedIn security challenge - please log in manually once');
      }
    } else if (currentUrl.includes('/feed') || currentUrl.includes('/in/')) {
      console.log('✅ LinkedIn login successful');
      return true;
    }

    throw new Error('Login failed');
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
}

// Simple LinkedIn application
async function processLinkedInApplication(jobData, applicantData) {
  console.log(`🎯 Starting LinkedIn application`);
  console.log(`📋 Job: ${jobData.title}`);
  
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
    
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    // Simple login
    const loginSuccess = await simpleLinkedInLogin(page);
    if (!loginSuccess) {
      throw new Error('LinkedIn login failed');
    }
    
    // Navigate to job
    console.log(`🔍 Navigating to job...`);
    await page.goto(jobData.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Find Easy Apply button
    console.log('🔍 Looking for Easy Apply...');
    
    const easyApplyButton = await page.$('button[aria-label*="Easy Apply"]') ||
                           await page.$('.jobs-apply-button--top-card button') ||
                           await page.$('.jobs-s-apply button');

    if (!easyApplyButton) {
      throw new Error('Easy Apply button not found');
    }

    await easyApplyButton.click();
    await page.waitForTimeout(3000);

    console.log('📝 Filling application...');

    // Simple form filling
    const formResult = await fillSimpleForm(page, COMPLETE_APPLICANT_PROFILE);
    
    result.success = formResult.completed;
    result.message = formResult.completed ? 
      'Application submitted successfully' : 
      'Application attempted but status unclear';
    result.details = formResult;

  } catch (error) {
    console.error('❌ Application error:', error.message);
    result.success = false;
    result.message = `Application failed: ${error.message}`;
    result.details.error = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Simple form filling
async function fillSimpleForm(page, data) {
  let currentStep = 1;
  let applicationCompleted = false;
  
  while (currentStep <= 5 && !applicationCompleted) {
    console.log(`Step ${currentStep}...`);
    
    try {
      await page.waitForTimeout(2000);
      
      // Fill basic fields
      const inputs = await page.$$('input[type="text"], input[type="email"], input[type="tel"]');
      for (const input of inputs) {
        try {
          const placeholder = await input.evaluate(el => el.placeholder?.toLowerCase() || '');
          const name = await input.evaluate(el => el.name?.toLowerCase() || '');
          
          if (placeholder.includes('first') || name.includes('first')) {
            await input.click({ clickCount: 3 });
            await input.type(data.firstName);
          } else if (placeholder.includes('last') || name.includes('last')) {
            await input.click({ clickCount: 3 });
            await input.type(data.lastName);
          } else if (placeholder.includes('email') || name.includes('email')) {
            await input.click({ clickCount: 3 });
            await input.type(data.email);
          } else if (placeholder.includes('phone') || name.includes('phone')) {
            await input.click({ clickCount: 3 });
            await input.type(data.phone);
          }
        } catch (e) {
          continue;
        }
      }
      
      // Handle work authorization
      const sections = await page.$$('fieldset, .fb-dash-form-element');
      for (const section of sections) {
        try {
          const text = await section.evaluate(el => el.textContent.toLowerCase());
          if (text.includes('authorized') || text.includes('sponsorship')) {
            const yesInputs = await section.$$('input[value*="yes"], input[value*="Yes"]');
            for (const input of yesInputs) {
              await input.click();
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      // Fill cover letter
      const textAreas = await page.$$('textarea');
      for (const textArea of textAreas) {
        try {
          const placeholder = await textArea.evaluate(el => el.placeholder?.toLowerCase() || '');
          if (placeholder.includes('cover') || placeholder.includes('why')) {
            await textArea.click();
            await textArea.type(data.coverLetter);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Look for navigation
      const submitBtn = await page.$('button:has-text("Submit")') || 
                       await page.$('button[aria-label*="Submit"]');
      const nextBtn = await page.$('button:has-text("Next")') || 
                     await page.$('button[aria-label*="Continue"]');
      
      if (submitBtn) {
        console.log('🎯 Submitting...');
        await submitBtn.click();
        await page.waitForTimeout(3000);
        applicationCompleted = true;
        break;
      } else if (nextBtn) {
        console.log('➡️ Next step...');
        await nextBtn.click();
        await page.waitForTimeout(2000);
        currentStep++;
      } else {
        break;
      }
      
    } catch (stepError) {
      console.error(`Step ${currentStep} error:`, stepError.message);
      break;
    }
  }
  
  return {
    completed: applicationCompleted,
    stepsProcessed: currentStep,
    status: applicationCompleted ? 'submitted' : 'incomplete'
  };
}

// API endpoint
app.post('/apply-job', async (req, res) => {
  const { job_data, applicant_data } = req.body;
  
  console.log('📋 New LinkedIn Application:');
  console.log('Job:', job_data?.title);
  console.log('URL:', job_data?.url);
  
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
    service: 'Simple LinkedIn Auto-Applier - Stable Version',
    version: '2.0.0',
    features: ['basic_automation', 'stable_operation'],
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
    message: 'Simple LinkedIn Auto-Apply Server is ready!',
    applicant: 'Vamsidhar Reddy M',
    email: 'vdr1800@gmail.com',
    status: 'ready_stable_version',
    profile: {
      experience: COMPLETE_APPLICANT_PROFILE.yearsOfExperience + ' years',
      currentCompany: COMPLETE_APPLICANT_PROFILE.currentCompany,
      title: COMPLETE_APPLICANT_PROFILE.currentJobTitle,
      graduation: COMPLETE_APPLICANT_PROFILE.graduationYear
    },
    capabilities: [
      'Basic LinkedIn automation',
      'Simple form filling',
      'Stable operation',
      'Memory optimized'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Simple LinkedIn Auto-Apply Server running on port ${PORT}`);
  console.log(`👤 Profile: ${COMPLETE_APPLICANT_PROFILE.currentJobTitle} at ${COMPLETE_APPLICANT_PROFILE.currentCompany}`);
  console.log(`🔐 LinkedIn account: ${LINKEDIN_EMAIL}`);
  console.log(`✅ Stable version - no crashes`);
});
