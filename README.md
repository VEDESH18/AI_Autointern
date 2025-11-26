# AutoApply+Prep

Complete full-stack automation platform for job searching, application submission, resume building, cover letter generation, and interview preparation.

## 🚀 Features

- **Job Discovery & Scraping** - Automatically scrape job postings from LinkedIn, Indeed, Glassdoor
- **Resume Builder** - Create, edit, and tailor resumes with version history
- **Auto-Apply** - Automated job application submission using Playwright
- **Cover Letter Generator** - AI-powered cover letter creation
- **Interview Prep** - Generate role-specific questions and practice with feedback
- **Analytics Dashboard** - Track application success rates and progress
- **n8n Workflows** - Automated background workflows for notifications and processing

## 🛠 Tech Stack

### Frontend

- Next.js 14 (App Router)
- React
- TailwindCSS + ShadCN UI
- Zustand (State Management)
- Axios
- Recharts (Analytics)

### Backend

- Node.js + Express.js
- Prisma ORM (PostgreSQL)
- Mongoose (MongoDB)
- JWT Authentication
- Passport.js (Google OAuth)
- Zod Validation
- Swagger Documentation

### Automation

- Playwright (Job scraping & auto-apply)
- BullMQ + Redis (Background jobs)
- n8n (Workflow orchestration)

### Databases

- PostgreSQL (User data, resumes, applications)
- MongoDB (Scraped jobs)
- Redis (Queue management)

### DevOps

- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Vercel (Frontend deployment)
- Render/Railway (Backend deployment)

## 📦 Installation

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- MongoDB
- Redis

### Quick Start with Docker

```bash
# Clone repository
git clone <repo-url>
cd autoapply-prep

# Start all services
docker-compose up -d

# Run database migrations
cd backend
npm run migrate

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Swagger API Docs: http://localhost:5000/api-docs
# n8n: http://localhost:5678 (admin/admin)
```

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npx prisma migrate dev
npx prisma generate

# Start server
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local

# Start development server
npm run dev
```

#### Workers Setup

```bash
cd workers

# Start all workers
node scrape.worker.js &
node apply.worker.js &
node interview.worker.js &
```

## 📁 Project Structure

```
autoapply-prep/
├── frontend/           # Next.js frontend
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── store/         # Zustand stores
│   └── utils/         # Utilities
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   └── prisma/        # Prisma schema
├── workers/           # BullMQ workers
├── automation/        # Playwright scripts
├── n8n-workflows/     # n8n workflow JSON files
└── database/          # SQL schemas
```

## 🔑 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/autoapply
MONGODB_URI=mongodb://localhost:27017/autoapply
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-key
N8N_WEBHOOK_URL=http://localhost:5678/webhook
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth

### Jobs

- `POST /api/jobs/scrape` - Scrape job from URL
- `GET /api/jobs` - Get all scraped jobs
- `GET /api/jobs/:id` - Get job by ID

### Resume

- `POST /api/resume/save` - Save resume
- `GET /api/resume` - Get all resumes
- `POST /api/resume/:id/tailor` - Tailor resume for job
- `POST /api/resume/:id/pdf` - Generate PDF

### Cover Letter

- `POST /api/cover-letter/generate` - Generate cover letter
- `POST /api/cover-letter/pdf` - Generate PDF

### Auto Apply

- `POST /api/apply/start` - Start auto-apply
- `GET /api/apply/status/:id` - Get application status
- `GET /api/apply/logs` - Get application logs
- `GET /api/apply/stats` - Get statistics

### Interview

- `POST /api/interview/questions` - Generate questions
- `POST /api/interview/evaluate` - Evaluate answers
- `GET /api/interview/history` - Get interview history

## 🔄 n8n Workflows

Import workflows from `n8n-workflows/` folder:

1. **job_scrape.json** - Scheduled job scraping
2. **resume_tailor.json** - Auto resume tailoring
3. **cover_letter.json** - Cover letter generation
4. **auto_apply_trigger.json** - Application automation trigger
5. **interview_prep.json** - Interview preparation flow
6. **analytics_cron.json** - Weekly analytics report

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Render/Railway)

```bash
# Connect GitHub repository
# Set environment variables
# Deploy automatically on push
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using Node.js, Next.js, and Playwright**
