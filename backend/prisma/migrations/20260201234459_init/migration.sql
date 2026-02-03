-- CreateEnum
CREATE TYPE "StudyLevel" AS ENUM ('BACHELORS', 'MASTERS', 'MBA', 'PHD', 'DIPLOMA', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "FieldOfStudy" AS ENUM ('IT', 'BUSINESS', 'ENGINEERING', 'HEALTHCARE', 'ARTS', 'SCIENCE', 'LAW', 'OTHER');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('CANADA', 'AUSTRALIA', 'UK', 'USA', 'GERMANY', 'JAPAN', 'NEW_ZEALAND', 'IRELAND');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('IELTS', 'PTE', 'TOEFL', 'DUOLINGO', 'GMAT', 'GRE', 'JLPT', 'NONE');

-- CreateEnum
CREATE TYPE "CareerGoal" AS ENUM ('PR_PATHWAY', 'WORK_RETURN', 'DEGREE_ONLY', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "PRPathwayStrength" AS ENUM ('STRONG', 'GOOD', 'MODERATE', 'LIMITED');

-- CreateEnum
CREATE TYPE "ConversationStage" AS ENUM ('GREETING', 'STUDY_LEVEL', 'FIELD', 'EDUCATION', 'PERCENTAGE', 'WORK_EXPERIENCE', 'TESTS', 'TEST_SCORES', 'CAREER_GOAL', 'BUDGET', 'LOAN_WILLINGNESS', 'COUNTRIES', 'TIMELINE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "password" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyLevel" "StudyLevel",
    "fieldOfStudy" "FieldOfStudy",
    "currentDegree" TEXT,
    "university" TEXT,
    "graduationYear" INTEGER,
    "percentage" DOUBLE PRECISION,
    "gpa" DOUBLE PRECISION,
    "workExperienceYears" INTEGER,
    "workExperienceField" TEXT,
    "currentDesignation" TEXT,
    "careerGoal" "CareerGoal",
    "preferredCountries" "Country"[],
    "preferredCitySize" TEXT,
    "preferredClimate" TEXT,
    "targetIntake" TEXT,
    "budgetNPR" INTEGER,
    "willingToLoan" BOOLEAN,
    "maxLoanNPR" INTEGER,
    "needsScholarship" BOOLEAN,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestScore" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "testType" "TestType" NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "listeningScore" DOUBLE PRECISION,
    "readingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "testDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" "Country" NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "isRegional" BOOLEAN NOT NULL DEFAULT false,
    "qsRanking" INTEGER,
    "timesRanking" INTEGER,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "lastVerified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" "StudyLevel" NOT NULL,
    "field" "FieldOfStudy" NOT NULL,
    "specializations" TEXT[],
    "duration" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "tuitionFee" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "tuitionNPR" INTEGER NOT NULL,
    "prPathway" "PRPathwayStrength" NOT NULL,
    "prDetails" TEXT,
    "workRightsDuringStudy" TEXT,
    "postStudyWorkVisa" TEXT,
    "estimatedLivingCostYearly" INTEGER NOT NULL,
    "livingCostNPR" INTEGER NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "requirementsUrl" TEXT,
    "scholarshipUrl" TEXT,
    "lastVerified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramRequirements" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "minPercentage" DOUBLE PRECISION,
    "minGPA" DOUBLE PRECISION,
    "requiredDegree" TEXT,
    "ieltsMin" DOUBLE PRECISION,
    "ieltsMinComponent" DOUBLE PRECISION,
    "pteMin" DOUBLE PRECISION,
    "pteMinComponent" DOUBLE PRECISION,
    "toeflMin" DOUBLE PRECISION,
    "duolingoMin" DOUBLE PRECISION,
    "gmatRequired" BOOLEAN NOT NULL DEFAULT false,
    "gmatMin" INTEGER,
    "greRequired" BOOLEAN NOT NULL DEFAULT false,
    "greMin" INTEGER,
    "gmatWaiverPossible" BOOLEAN NOT NULL DEFAULT false,
    "gmatWaiverCondition" TEXT,
    "workExpRequired" INTEGER NOT NULL DEFAULT 0,
    "workExpPreferred" INTEGER,
    "documentsRequired" TEXT[],
    "interviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "portfolioRequired" BOOLEAN NOT NULL DEFAULT false,
    "otherRequirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "amountMin" INTEGER,
    "amountMax" INTEGER,
    "currency" TEXT NOT NULL,
    "eligibility" TEXT,
    "minPercentage" DOUBLE PRECISION,
    "minGPA" DOUBLE PRECISION,
    "autoConsidered" BOOLEAN NOT NULL DEFAULT false,
    "separateApplication" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TEXT,
    "officialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "applicationDeadline" TIMESTAMP(3),
    "applicationDeadlineText" TEXT,
    "classStartDate" TIMESTAMP(3),
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "stage" "ConversationStage" NOT NULL DEFAULT 'GREETING',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "extractedProfile" JSONB,
    "matchedProgramIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "options" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedUniversity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "notes" TEXT,
    "priority" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "plannedSubmitDate" TIMESTAMP(3),
    "submittedDate" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "documentsChecklist" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL DEFAULT 'NPR',
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryInfo" (
    "id" TEXT NOT NULL,
    "country" "Country" NOT NULL,
    "fullName" TEXT NOT NULL,
    "flagEmoji" TEXT NOT NULL,
    "studentVisaType" TEXT NOT NULL,
    "workRightsDuringStudy" TEXT NOT NULL,
    "postStudyWorkOptions" TEXT NOT NULL,
    "prPathwayDescription" TEXT NOT NULL,
    "averageLivingCostMonthly" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "generalRequirements" TEXT,
    "immigrationUrl" TEXT NOT NULL,
    "educationPortalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TestScore_profileId_testType_key" ON "TestScore"("profileId", "testType");

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE INDEX "University_country_idx" ON "University"("country");

-- CreateIndex
CREATE INDEX "University_name_idx" ON "University"("name");

-- CreateIndex
CREATE INDEX "Program_field_idx" ON "Program"("field");

-- CreateIndex
CREATE INDEX "Program_level_idx" ON "Program"("level");

-- CreateIndex
CREATE INDEX "Program_tuitionNPR_idx" ON "Program"("tuitionNPR");

-- CreateIndex
CREATE INDEX "Program_prPathway_idx" ON "Program"("prPathway");

-- CreateIndex
CREATE UNIQUE INDEX "Program_universityId_slug_key" ON "Program"("universityId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramRequirements_programId_key" ON "ProgramRequirements"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "Intake_programId_semester_year_key" ON "Intake"("programId", "semester", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_sessionId_idx" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedUniversity_userId_programId_key" ON "SavedUniversity"("userId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_programId_key" ON "Application"("userId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "CountryInfo_country_key" ON "CountryInfo"("country");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestScore" ADD CONSTRAINT "TestScore_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRequirements" ADD CONSTRAINT "ProgramRequirements_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedUniversity" ADD CONSTRAINT "SavedUniversity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedUniversity" ADD CONSTRAINT "SavedUniversity_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
