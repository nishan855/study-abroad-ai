// TC-003: SendMessageRequest / SendMessageResponse
// TC-005: MatchUniversitiesRequest / MatchUniversitiesResponse
// TC-006: UniversityDetailResponse

import { ChatMessage, ConversationStage } from './chat'
import { StudentProfile } from './student'
import { UniversityProgram, Country } from './university'

// ============================================================================
// Chat API Types
// ============================================================================

export interface SendMessageRequest {
  conversationId?: string // Null for new conversation
  sessionId?: string // For anonymous users
  message: string
}

export interface SendMessageResponse {
  success: boolean
  data: {
    conversationId: string
    sessionId: string
    messages: ChatMessage[] // New messages (user + assistant response)
    stage: ConversationStage
    isComplete: boolean
    extractedProfile?: Partial<StudentProfile>
  }
  error?: {
    code: string
    message: string
  }
}

export interface StartConversationRequest {
  sessionId?: string // Optional, generated if not provided
}

export interface StartConversationResponse {
  success: true
  data: {
    conversationId: string
    sessionId: string
    message: ChatMessage // Initial greeting
    stage: 'GREETING'
  }
}

// ============================================================================
// University Match API Types
// ============================================================================

export interface UniversityFilters {
  countries?: Country[]
  maxBudgetNPR?: number
  scholarshipOnly?: boolean
  noGMAT?: boolean
  noGRE?: boolean
  strongPROnly?: boolean
  minIELTS?: number
}

export interface MatchUniversitiesRequest {
  profile: StudentProfile
  filters?: UniversityFilters
  limit?: number // Default 5, max 20
}

export interface MatchUniversitiesResponse {
  success: boolean
  data: {
    universities: UniversityProgram[]
    totalMatches: number
    appliedFilters: UniversityFilters
    profileSummary: {
      studyLevel: string
      field: string
      budget: string
      countries: string[]
    }
  }
  error?: {
    code: string
    message: string
  }
}

// ============================================================================
// University Detail API Types
// ============================================================================

export interface UniversityDetailResponse {
  success: boolean
  data: {
    program: UniversityProgram

    // Extended Details
    fullRequirements: {
      academic: {
        minPercentage: number | null
        minGPA: number | null
        requiredDegree: string | null
      }
      english: {
        ieltsMin: number | null
        ieltsMinComponent: number | null
        pteMin: number | null
        toeflMin: number | null
      }
      standardizedTests: {
        gmatRequired: boolean
        gmatMin: number | null
        greRequired: boolean
        greMin: number | null
        waiverPossible: boolean
        waiverCondition: string | null
      }
      workExperience: {
        required: number
        preferred: number | null
      }
      documents: string[]
      interview: boolean
      portfolio: boolean
      other: string | null
    }

    // All Scholarships
    scholarships: {
      id: string
      name: string
      type: string
      amount: string
      eligibility: string | null
      autoConsidered: boolean
      deadline: string | null
      officialUrl: string | null
    }[]

    // Budget Breakdown
    budgetBreakdown: {
      tuition: number
      livingCostYearly: number
      healthInsurance: number
      books: number
      total: number
      currency: string
      totalNPR: number
    }

    // All Intakes
    intakes: {
      semester: string
      year: number
      deadline: string | null
      startDate: string | null
      isOpen: boolean
    }[]

    // PR & Work Info
    workAndPR: {
      workRightsDuringStudy: string | null
      postStudyWorkVisa: string | null
      prPathway: string
      prDetails: string | null
    }

    // Official Sources
    sources: {
      programUrl: string
      requirementsUrl: string | null
      scholarshipUrl: string | null
      lastVerified: string
    }
  }
  error?: {
    code: string
    message: string
  }
}
