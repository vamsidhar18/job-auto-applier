// Enhanced LinkedIn Form Handler - Handles ALL possible application questions

// Complete applicant profile with all possible data
const COMPLETE_APPLICANT_PROFILE = {
  // Basic Info
  firstName: "Vamsidhar Reddy",
  lastName: "M",
  email: "vdr1800@gmail.com",
  phone: "+16692928219",
  
  // Location
  address: "754 The Alameda",
  city: "San Jose",
  state: "CA",
  country: "US",
  zipCode: "95126",
  
  // Professional
  linkedinProfile: "https://www.linkedin.com/in/vamsidhar1800/",
  portfolioWebsite: "https://www.linkedin.com/in/vamsidhar1800/",
  
  // Work Authorization
  workAuthorization: "Yes",
  requiresSponsorship: "Yes",
  visaStatus: "F1 STEM OPT",
  
  // Experience
  yearsOfExperience: "3",
  currentJobTitle: "Software Engineer",
  currentCompany: "Genpact Global INC ",
  
  // Education
  university: "San Jose State University",
  degree: "Master of Science",
  major: "Software Engineer",
  graduationYear: "2023",
  
  
  // Skills & Preferences
  preferredSalary: "90000",
  availableStartDate: "Immediately",
  willingToRelocate: "Yes",
  remoteWork: "Yes",
  
  // Cover Letter
  coverLetter: `Dear Hiring Manager,

I am excited to apply for this Software Engineer position. As a recent MS Computer Science graduate from San Jose State University with hands-on experience in full-stack development, I am eager to contribute to your team.

My technical expertise includes JavaScript, Python, React, Node.js, and cloud technologies. I have successfully built and deployed web applications, worked with databases, and implemented automated systems like the job application system I'm currently using.

As an F1 STEM OPT holder, I am authorized to work and seeking sponsorship opportunities. I am passionate about creating efficient, scalable solutions and would love to bring my skills to your organization.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
Vamsidhar Reddy M`,

  // Resume file path (you'll need to upload this to your server)
  resumePath: "/app/resume.pdf" // We'll handle file upload
};

// Advanced form filling function that handles ALL question types
async function fillAdvancedApplicationForm(page, applicantData, maxSteps = 10) {
  let currentStep = 1;
  let applicationCompleted = false;
  
  console.log('📝 Starting advanced LinkedIn application form filling...');
  
  while (currentStep <= maxSteps && !applicationCompleted) {
    console.log(`📄 Processing application step ${currentStep}...`);
    
    try {
      await page.waitForTimeout(3000); // Wait for form to load
      
      // 1. BASIC INFORMATION FIELDS
      await fillBasicFields(page, applicantData);
      
      // 2. DROPDOWN SELECTIONS
      await handleDropdowns(page, applicantData);
      
      // 3. RESUME UPLOAD
      await handleResumeUpload(page, applicantData);
      
      // 4. WORK AUTHORIZATION QUESTIONS
      await handleWorkAuthQuestions(page, applicantData);
      
      // 5. EXPERIENCE QUESTIONS
      await handleExperienceQuestions(page, applicantData);
      
      // 6. EDUCATION QUESTIONS
      await handleEducationQuestions(page, applicantData);
      
      // 7. SALARY & PREFERENCES
      await handleSalaryQuestions(page, applicantData);
      
      // 8. COVER LETTER
      await handleCoverLetter(page, applicantData);
      
      // 9. CUSTOM TEXT QUESTIONS
      await handleCustomQuestions(page, applicantData);
      
      // 10. MULTIPLE CHOICE QUESTIONS
      await handleMultipleChoice(page, applicantData);
      
      console.log(`✅ Completed filling form fields for step ${currentStep}`);
      
      // Look for navigation buttons
      const { hasNext, hasSubmit, hasReview } = await checkNavigationButtons(page);
      
      if (hasSubmit) {
        console.log('🎯 Found Submit button - submitting application...');
        await clickSubmitButton(page);
        applicationCompleted = await verifySubmission(page);
        break;
      } else if (hasReview) {
        console.log('👀 Found Review button - going to review step...');
        await clickReviewButton(page);
        currentStep++;
      } else if (hasNext) {
        console.log('➡️ Found Next button - continuing to next step...');
        await clickNextButton(page);
        currentStep++;
      } else {
        console.log('❓ No clear navigation found, attempting to find any submit button...');
        const submitted = await attemptSubmission(page);
        if (submitted) {
          applicationCompleted = true;
          break;
        } else {
          throw new Error(`No navigation buttons found on step ${currentStep}`);
        }
      }
      
    } catch (stepError) {
      console.error(`❌ Error on step ${currentStep}:`, stepError.message);
      
      // Try to continue anyway
      const continueAnyway = await attemptToContinue(page);
      if (continueAnyway) {
        currentStep++;
        continue;
      } else {
        throw new Error(`Failed on step ${currentStep}: ${stepError.message}`);
      }
    }
  }
  
  return {
    completed: applicationCompleted,
    stepsProcessed: currentStep,
    status: applicationCompleted ? 'submitted' : 'incomplete'
  };
}

// 1. Basic information fields
async function fillBasicFields(page, data) {
  const basicFields = [
    { selectors: ['input[name*="firstName"]', 'input[id*="first"]', 'input[placeholder*="First name" i]'], value: data.firstName },
    { selectors: ['input[name*="lastName"]', 'input[id*="last"]', 'input[placeholder*="Last name" i]'], value: data.lastName },
    { selectors: ['input[name*="email"]', 'input[type="email"]'], value: data.email },
    { selectors: ['input[name*="phone"]', 'input[type="tel"]'], value: data.phone },
    { selectors: ['input[name*="address"]', 'input[placeholder*="address" i]'], value: data.address },
    { selectors: ['input[name*="city"]', 'input[placeholder*="city" i]'], value: data.city },
    { selectors: ['input[name*="state"]', 'input[placeholder*="state" i]'], value: data.state },
    { selectors: ['input[name*="zip"]', 'input[placeholder*="zip" i]'], value: data.zipCode },
    { selectors: ['input[name*="linkedin"]', 'input[placeholder*="linkedin" i]'], value: data.linkedinProfile },
    { selectors: ['input[name*="website"]', 'input[placeholder*="portfolio" i]'], value: data.portfolioWebsite }
  ];
  
  for (const field of basicFields) {
    await fillFieldBySelectors(page, field.selectors, field.value);
  }
}

// 2. Handle dropdown selections
async function handleDropdowns(page, data) {
  const dropdowns = await page.$$('select, [role="combobox"], .artdeco-dropdown');
  
  for (const dropdown of dropdowns) {
    try {
      const label = await getFieldLabel(page, dropdown);
      const labelText = label.toLowerCase();
      
      if (labelText.includes('country')) {
        await selectDropdownOption(page, dropdown, ['United States', 'US', 'USA']);
      } else if (labelText.includes('state') || labelText.includes('province')) {
        await selectDropdownOption(page, dropdown, ['California', 'CA']);
      } else if (labelText.includes('experience') || labelText.includes('years')) {
        await selectDropdownOption(page, dropdown, ['2', '1-3 years', '2 years', '3 years'], '3', '3.5+');
      } else if (labelText.includes('education') || labelText.includes('degree')) {
        await selectDropdownOption(page, dropdown, ['Master', 'Masters', 'MS', 'Graduate']);
      }
    } catch (e) {
      console.log('⚠️ Could not handle dropdown:', e.message);
    }
  }
}

// 3. Handle resume upload
async function handleResumeUpload(page, data) {
  const uploadSelectors = [
    'input[type="file"]',
    'input[accept*="pdf"]',
    'input[accept*="doc"]',
    '[data-test-file-upload-input]'
  ];
  
  for (const selector of uploadSelectors) {
    try {
      const uploadField = await page.$(selector);
      if (uploadField) {
        // Check if we have a resume file available
        if (data.resumePath && require('fs').existsSync(data.resumePath)) {
          await uploadField.uploadFile(data.resumePath);
          console.log('✅ Resume uploaded successfully');
        } else {
          console.log('⚠️ Resume file not found, skipping upload');
        }
        break;
      }
    } catch (e) {
      continue;
    }
  }
}

// 4. Work authorization questions
async function handleWorkAuthQuestions(page, data) {
  const questions = await page.$$('fieldset, .jobs-easy-apply-form-section, .fb-dash-form-element');
  
  for (const question of questions) {
    try {
      const questionText = await question.evaluate(el => el.textContent.toLowerCase());
      
      if (questionText.includes('authorized to work') || questionText.includes('work authorization')) {
        await selectAnswer(page, question, 'yes', data.workAuthorization);
      } else if (questionText.includes('sponsorship') || questionText.includes('visa sponsor')) {
        await selectAnswer(page, question, 'yes', data.requiresSponsorship);
      } else if (questionText.includes('visa status') || questionText.includes('current visa')) {
        await fillTextInSection(page, question, data.visaStatus);
      }
    } catch (e) {
      continue;
    }
  }
}

// 5. Experience questions
async function handleExperienceQuestions(page, data) {
  const experienceFields = [
    { keywords: ['years of experience', 'experience in'], value: data.yearsOfExperience },
    { keywords: ['current title', 'job title'], value: data.currentJobTitle },
    { keywords: ['current company', 'employer'], value: data.currentCompany },
    { keywords: ['notice period', 'start date'], value: data.availableStartDate }
  ];
  
  for (const field of experienceFields) {
    await fillFieldByKeywords(page, field.keywords, field.value);
  }
}

// 6. Education questions
async function handleEducationQuestions(page, data) {
  const educationFields = [
    { keywords: ['university', 'school', 'college'], value: data.university },
    { keywords: ['degree', 'education level'], value: data.degree },
    { keywords: ['major', 'field of study'], value: data.major },
    { keywords: ['graduation', 'graduation year'], value: data.graduationYear },
    { keywords: ['gpa', 'grade point'], value: data.gpa }
  ];
  
  for (const field of educationFields) {
    await fillFieldByKeywords(page, field.keywords, field.value);
  }
}

// 7. Salary and preferences
async function handleSalaryQuestions(page, data) {
  const salaryFields = [
    { keywords: ['salary', 'compensation', 'expected salary'], value: data.preferredSalary },
    { keywords: ['relocate', 'relocation'], value: data.willingToRelocate },
    { keywords: ['remote', 'work from home'], value: data.remoteWork }
  ];
  
  for (const field of salaryFields) {
    await fillFieldByKeywords(page, field.keywords, field.value);
  }
}

// 8. Cover letter
async function handleCoverLetter(page, data) {
  const coverLetterSelectors = [
    'textarea[name*="cover"]',
    'textarea[placeholder*="cover" i]',
    'textarea[aria-label*="cover" i]',
    '.jobs-easy-apply-form-section textarea'
  ];
  
  for (const selector of coverLetterSelectors) {
    const field = await page.$(selector);
    if (field) {
      await field.click();
      await field.type(data.coverLetter);
      console.log('✅ Cover letter filled');
      break;
    }
  }
}

// 9. Custom text questions
async function handleCustomQuestions(page, data) {
  const textAreas = await page.$$('textarea:not([name*="cover"])');
  const textInputs = await page.$$('input[type="text"]:not([name*="firstName"]):not([name*="lastName"]):not([name*="email"])');
  
  const genericAnswers = {
    'why interested': `I am excited about this opportunity because it aligns perfectly with my technical skills and career goals. Your company's innovative approach and growth potential make it an ideal place for me to contribute and develop professionally.`,
    'why should we hire': `You should hire me because I bring a unique combination of technical expertise, fresh perspective, and strong problem-solving skills. My recent education in Computer Science and hands-on project experience make me well-equipped to contribute immediately to your team.`,
    'additional information': `I am passionate about software development and continuously learning new technologies. I am particularly interested in full-stack development, cloud technologies, and building scalable applications. I am eager to bring my enthusiasm and technical skills to your organization.`
  };
  
  // Handle remaining text fields with intelligent responses
  for (const field of [...textAreas, ...textInputs]) {
    try {
      const label = await getFieldLabel(page, field);
      const labelLower = label.toLowerCase();
      
      if (labelLower.includes('why') && labelLower.includes('interest')) {
        await field.type(genericAnswers['why interested']);
      } else if (labelLower.includes('why') && (labelLower.includes('hire') || labelLower.includes('choose'))) {
        await field.type(genericAnswers['why should we hire']);
      } else if (labelLower.includes('additional') || labelLower.includes('anything else')) {
        await field.type(genericAnswers['additional information']);
      } else if (labelLower.includes('motivation') || labelLower.includes('passion')) {
        await field.type('I am passionate about creating innovative software solutions and contributing to meaningful projects that make a positive impact.');
      }
    } catch (e) {
      continue;
    }
  }
}

// 10. Multiple choice questions
async function handleMultipleChoice(page, data) {
  const radioGroups = await page.$$('fieldset[role="radiogroup"], .fb-dash-form-element');
  
  for (const group of radioGroups) {
    try {
      const questionText = await group.evaluate(el => el.textContent.toLowerCase());
      
      // Default to positive answers for most questions
      if (questionText.includes('willing') || questionText.includes('able') || questionText.includes('comfortable')) {
        await selectAnswer(page, group, 'yes', 'Yes');
      } else if (questionText.includes('require') && questionText.includes('training')) {
        await selectAnswer(page, group, 'no', 'No');
      } else if (questionText.includes('notice period')) {
        await selectAnswer(page, group, '2 weeks', 'Immediately');
      }
    } catch (e) {
      continue;
    }
  }
}

// Helper functions for form interaction
async function fillFieldBySelectors(page, selectors, value) {
  for (const selector of selectors) {
    try {
      const field = await page.$(selector);
      if (field && value) {
        await field.click({ clickCount: 3 });
        await field.type(value);
        console.log(`✅ Filled field ${selector}`);
        return true;
      }
    } catch (e) {
      continue;
    }
  }
  return false;
}

async function fillFieldByKeywords(page, keywords, value) {
  for (const keyword of keywords) {
    const fields = await page.$$(`input, textarea, select`);
    for (const field of fields) {
      try {
        const label = await getFieldLabel(page, field);
        if (label.toLowerCase().includes(keyword) && value) {
          await field.click({ clickCount: 3 });
          await field.type(value);
          console.log(`✅ Filled field with keyword "${keyword}"`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
  }
  return false;
}

async function getFieldLabel(page, field) {
  try {
    // Try multiple ways to get the label
    const label = await field.evaluate(el => {
      // Check for aria-label
      if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
      
      // Check for placeholder
      if (el.getAttribute('placeholder')) return el.getAttribute('placeholder');
      
      // Check for associated label
      const id = el.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent;
      }
      
      // Check parent elements for text content
      let parent = el.parentElement;
      while (parent && parent.textContent.length < 200) {
        const text = parent.textContent.trim();
        if (text) return text;
        parent = parent.parentElement;
      }
      
      return '';
    });
    return label || '';
  } catch (e) {
    return '';
  }
}

async function selectAnswer(page, section, preferredValue, fallbackValue) {
  try {
    const inputs = await section.$$('input[type="radio"], input[type="checkbox"]');
    for (const input of inputs) {
      const value = await input.evaluate(el => el.value || el.getAttribute('aria-label') || '');
      if (value.toLowerCase().includes(preferredValue.toLowerCase())) {
        await input.click();
        console.log(`✅ Selected answer: ${value}`);
        return true;
      }
    }
    
    // Fallback to first available option
    if (inputs.length > 0) {
      await inputs[0].click();
      console.log('✅ Selected fallback answer');
      return true;
    }
  } catch (e) {
    console.log('⚠️ Could not select answer:', e.message);
  }
  return false;
}

// Export the enhanced form handler
module.exports = {
  fillAdvancedApplicationForm,
  COMPLETE_APPLICANT_PROFILE
};
