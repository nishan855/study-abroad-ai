// TC-002: ChatMessage

import { StudentProfile } from './student'

export type ConversationStage =
  | 'GREETING'
  | 'STUDY_LEVEL'
  | 'FIELD'
  | 'EDUCATION'
  | 'PERCENTAGE'
  | 'WORK_EXPERIENCE'
  | 'TESTS'
  | 'TEST_SCORES'
  | 'CAREER_GOAL'
  | 'BUDGET'
  | 'LOAN_WILLINGNESS'
  | 'COUNTRIES'
  | 'TIMELINE'
  | 'COMPLETE'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  options?: string[] // Quick reply buttons
  timestamp: string // ISO date string
  metadata?: {
    stage?: ConversationStage
    extractedData?: Partial<StudentProfile>
  }
}

export interface Conversation {
  id: string
  sessionId: string
  stage: ConversationStage
  isComplete: boolean
  messages: ChatMessage[]
  extractedProfile: Partial<StudentProfile> | null
  createdAt: string
  updatedAt: string
}
