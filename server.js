const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// LinkedIn Auto-Apply Function
async function applyToLinkedInJob(jobData, applicantData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log(`Applying to: ${jobData.title} at ${jobData.url}`);
    
    // Navigate to job URL
    await page.goto(jobData.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Look for Easy Apply button
    const easyApplyButton = await page.$('[data-test-apply-button], [aria-label*="Easy Apply"], .jobs-apply-button');
    
    if (easyApplyButton) {
      await easyApplyButton.click();
      await page.waitForTimeout(3000);
      
      // Fill application form
      await fillApplicationForm(page, applicantData);
      
      return { 
        success: true, 
        message: 'Application submitted successfully',
        applicant: `${applicantData.firstName} ${applicantData.lastName}`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Easy Apply button not found',
        action: 'manual_application_required'
      };
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

// Fill application form helper
async function fillApplicationForm(page, applicant) {
  try {
    // Personal Information
    const fields = [
      { selector: '#firstName, [name="firstName"]', value: applicant.firstName },
      { selector: '#lastName, [name="lastName"]', value: applicant.lastName },
      { selector: '#email, [name="email"]', value: applicant.email },
      { selector: '#phone, [name="phone"]', value: applicant.phone }
    ];
    
    for (const field of fields) {
      const element = await page.$(field.selector);
      if (element) {
        await element.clear();
        await element.type(field.value);
      }
    }
    
    // Work Authorization
    const workAuthYes = await page.$('[name="workAuth"][value="yes"], [value="true"]');
    if (workAuthYes) {
      await workAuthYes.click();
    }
    
    // Submit application
    const submitButton = await page.$('[data-test-submit-button], [type="submit"], .jobs-apply-form__submit-button');
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
    
  } catch (error) {
    console.log('Form filling error:', error.message);
  }
}

// API Endpoint for n8n
app.post('/apply-job', async (req, res) => {
  const { job_data, applicant_data } = req.body;
  
  console.log('Received application request:', {
    job: job_data?.title,
    applicant: applicant_data?.firstName
  });
  
  try {
    const result = await applyToLinkedInJob(job_data, applicant_data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Job Auto-Applier Server Running'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    applicant: 'Vamsidhar Reddy M',
    ready: true
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Auto-apply server running on port ${PORT}`);
});
