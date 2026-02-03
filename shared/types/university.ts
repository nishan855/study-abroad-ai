// TC-004: UniversityProgram

export type Country = 'CANADA' | 'AUSTRALIA' | 'UK' | 'USA' | 'GERMANY'
export type StudyLevel = 'BACHELORS' | 'MASTERS' | 'MBA' | 'PHD' | 'DIPLOMA'
export type FieldOfStudy = 'IT' | 'BUSINESS' | 'ENGINEERING' | 'HEALTHCARE' | 'ARTS' | 'SCIENCE' | 'OTHER'
export type PRPathwayStrength = 'STRONG' | 'GOOD' | 'MODERATE' | 'LIMITED'

export interface UniversityProgram {
  id: string

  // University Info
  university: {
    id: string
    name: string
    slug: string
    country: Country
    city: string
    isRegional: boolean
    logoUrl?: string
  }

  // Program Info
  name: string
  slug: string
  level: StudyLevel
  field: FieldOfStudy
  duration: string
  durationMonths: number

  // Fees
  tuitionFee: number
  currency: string
  tuitionNPR: number
  totalCostNPR: number // Tuition + estimated living

  // Requirements Summary
  requirements: {
    minPercentage: number | null
    ieltsMin: number | null
    pteMin: number | null
    gmatRequired: boolean
    greRequired: boolean
    workExpRequired: number
    gmatWaiverPossible: boolean
  }

  // Scholarships Summary
  scholarshipAvailable: boolean
  scholarshipAmount: string | null // e.g., "CAD 5,000 - 10,000"

  // PR Pathway
  prPathway: PRPathwayStrength
  prDetails: string | null
  postStudyWorkVisa: string | null

  // Deadlines
  nextDeadline: string | null
  intakes: string[] // e.g., ["Fall", "Winter"]

  // Verification
  officialUrl: string
  lastVerified: string

  // Matching (only in search results)
  matchScore?: number
  matchReasons?: string[]
}
