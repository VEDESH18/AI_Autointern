const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({
    user: { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User' },
    accessToken: 'test-token',
    refreshToken: 'test-refresh'
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  res.status(201).json({
    user: { id: 1, email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName },
    accessToken: 'test-token',
    refreshToken: 'test-refresh'
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('Get profile request');
  res.json({
    id: 1,
    email: 'vedeshridhvi@gmail.com',
    firstName: 'Vedesh',
    lastName: 'Ridhvi',
    phone: '1234567890'
  });
});

app.get('/api/apply', (req, res) => {
  console.log('Get applications request');
  res.json([
    {
      id: 1,
      jobId: 1,
      jobTitle: 'Software Engineer',
      company: 'Google',
      status: 'success',
      appliedAt: new Date().toISOString()
    },
    {
      id: 2,
      jobId: 2,
      jobTitle: 'Frontend Developer',
      company: 'Meta',
      status: 'pending',
      appliedAt: new Date().toISOString()
    },
    {
      id: 3,
      jobId: 3,
      jobTitle: 'Full Stack Developer',
      company: 'Amazon',
      status: 'failed',
      appliedAt: new Date().toISOString()
    }
  ]);
});

app.get('/api/apply/stats', (req, res) => {
  console.log('Get stats request');
  res.json({
    total: 15,
    success: 8,
    pending: 5,
    failed: 2,
    successRate: 53,
    recentApplications: [
      {
        id: 1,
        jobTitle: 'Software Engineer',
        company: 'Google',
        status: 'success'
      },
      {
        id: 2,
        jobTitle: 'Frontend Developer',
        company: 'Meta',
        status: 'pending'
      },
      {
        id: 3,
        jobTitle: 'Full Stack Developer',
        company: 'Amazon',
        status: 'failed'
      },
      {
        id: 4,
        jobTitle: 'Backend Developer',
        company: 'Microsoft',
        status: 'success'
      },
      {
        id: 5,
        jobTitle: 'DevOps Engineer',
        company: 'Netflix',
        status: 'pending'
      }
    ]
  });
});

const PORT = 5000;
const server = app.listen(PORT, () => {
  console.log(`✓ Test server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
