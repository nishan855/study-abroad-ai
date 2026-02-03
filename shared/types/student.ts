// TC-001: StudentProfile

export interface StudentProfile {
  // Academic
  studyLevel: 'BACHELORS' | 'MASTERS' | 'MBA' | 'PHD' | 'DIPLOMA' | null
  fieldOfStudy: 'IT' | 'BUSINESS' | 'ENGINEERING' | 'HEALTHCARE' | 'ARTS' | 'SCIENCE' | 'OTHER' | null
  currentDegree: string | null // e.g., "BBA", "BSc CSIT"
  university: string | null // e.g., "Tribhuvan University"
  graduationYear: number | null
  percentage: number | null // 0-100

  // Work Experience
  workExperienceYears: number | null
  workExperienceField: string | null

  // Test Scores
  tests: {
    type: 'IELTS' | 'PTE' | 'TOEFL' | 'DUOLINGO' | 'NONE'
    overallScore: number | null
    components?: {
      listening?: number
      reading?: number
      writing?: number
      speaking?: number
    }
  }

  // Standardized Tests
  gmat: number | null
  gre: number | null

  // Goals
  careerGoal: 'PR_PATHWAY' | 'WORK_RETURN' | 'DEGREE_ONLY' | 'FLEXIBLE' | null

  // Preferences
  preferredCountries: ('CANADA' | 'AUSTRALIA' | 'UK' | 'USA' | 'GERMANY')[]
  cityPreference: 'large' | 'medium' | 'small' | 'any' | null
  targetIntake: string | null // e.g., "2026-09"

  // Budget
  budgetNPR: number | null // Total budget in NPR
  willingToLoan: boolean | null
  needsScholarship: boolean | null
}

// Profile completion status
export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}
