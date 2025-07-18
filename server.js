const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Auto-Apply Function (Simulation for now)
async function processJobApplication(jobData, applicantData) {
  console.log(`Processing application for: ${applicantData.firstName} ${applicantData.lastName}`);
  console.log(`Job: ${jobData.title} at ${jobData.url}`);
  
  // Simulate successful application
  return {
    success: true,
    message: 'Application processed successfully',
    applicant: `${applicantData.firstName} ${applicantData.lastName}`,
    job: jobData.title,
    platform: jobData.platform,
    timestamp: new Date().toISOString(),
    next_step: 'Browser automation will be added next'
  };
}

// API Endpoint for n8n
app.post('/apply-job', async (req, res) => {
  const { job_data, applicant_data } = req.body;
  
  console.log('📋 New Application Request:');
  console.log('Job:', job_data?.title);
  console.log('Applicant:', applicant_data?.firstName, applicant_data?.lastName);
  
  try {
    const result = await processJobApplication(job_data, applicant_data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Vamsidhar Job Auto-Applier',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working perfectly!',
    applicant: 'Vamsidhar Reddy M',
    email: 'vdr1800@gmail.com',
    status: 'ready_for_applications'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Vamsidhar's Auto-Apply Server running on port ${PORT}`);
  console.log(`📧 Ready to process applications for: vdr1800@gmail.com`);
});
