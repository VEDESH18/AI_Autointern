-- PostgreSQL Schema for AutoApply+Prep

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    phone VARCHAR(20),
    "googleId" VARCHAR(255) UNIQUE,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS "Resume" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    "personalInfo" JSONB NOT NULL,
    experience JSONB NOT NULL,
    education JSONB NOT NULL,
    skills JSONB NOT NULL,
    projects JSONB,
    certifications JSONB,
    "pdfUrl" TEXT,
    version INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resume_userId ON "Resume"("userId");

-- Applications table
CREATE TABLE IF NOT EXISTS "Application" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "resumeId" UUID NOT NULL REFERENCES "Resume"(id),
    "jobId" VARCHAR(255) NOT NULL,
    "jobTitle" VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    "appliedAt" TIMESTAMP,
    "screenshotUrl" TEXT,
    "coverLetter" TEXT,
    logs JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_application_userId ON "Application"("userId");
CREATE INDEX idx_application_status ON "Application"(status);

-- Interviews table
CREATE TABLE IF NOT EXISTS "Interview" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "jobTitle" VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    questions JSONB NOT NULL,
    answers JSONB,
    score FLOAT,
    feedback JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interview_userId ON "Interview"("userId");

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resume_updated_at BEFORE UPDATE ON "Resume"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_application_updated_at BEFORE UPDATE ON "Application"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interview_updated_at BEFORE UPDATE ON "Interview"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
