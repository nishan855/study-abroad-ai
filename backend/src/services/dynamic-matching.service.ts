// backend/src/services/dynamic-matching.service.ts
//
// FULLY DYNAMIC AI-POWERED UNIVERSITY MATCHING
// Using OpenAI (GPT-4o / GPT-4o-mini) + Free Web Search
//
// NO DATABASE REQUIRED - Works for any university worldwide
//

import OpenAI from 'openai';
import { WebSearchService, SearchResult } from './web-search.service';

// =============================================================================
// TYPES
// =============================================================================

export interface StudentProfile {
  studyLevel: 'BACHELORS' | 'MASTERS' | 'MBA' | 'PHD' | 'DIPLOMA' | null;
  fieldOfStudy: 'IT' | 'BUSINESS' | 'ENGINEERING' | 'HEALTHCARE' | 'SCIENCE' | 'ARTS' | 'OTHER' | null;
  currentDegree: string | null;
  university: string | null;
  percentage: number | null;
  gpa: number | null;
  graduationYear: number | null;
  workExperienceYears: number | null;
  workExperienceField: string | null;
  tests: {
    type: 'IELTS' | 'PTE' | 'TOEFL' | 'DUOLINGO' | null;
    overallScore: number | null;
  } | null;
  gmat: number | null;
  gre: number | null;
  careerGoal: 'PR_PATHWAY' | 'WORK_RETURN' | 'DEGREE_ONLY' | 'FLEXIBLE' | null;
  preferredCountries: string[];
  preferredState?: string | null;
  targetIntake: string | null;
  budgetNPR: number | null;
  willingToLoan: boolean | null;
  needsScholarship: boolean | null;
}

export interface UniversityMatch {
  rank: number;
  university: string;
  country: string;
  city: string;
  program: string;
  level: string;
  duration: string;

  tuition: {
    amount: number;
    currency: string;
    inNPR: number;
    source?: string;
    verified: boolean;
  };

  requirements: {
    minPercentage?: number;
    minGPA?: number;
    ieltsMin?: number;
    pteMin?: number;
    gmatRequired: boolean;
    gmatMin?: number;
    workExpYears: number;
    source?: string;
    verified: boolean;
  };

  matchScore: number;
  category: 'SAFETY' | 'TARGET' | 'REACH' | 'DREAM';
  admissionChance: number;

  prPathway: {
    strength: number; // 0-100 percentage
    details: string;
    postStudyWork: string;
  };

  scholarships: {
    available: boolean;
    topScholarships: string[];
  };

  analysis?: {
    strengths: string[];
    concerns: string[];
    budgetFit: string;
    recommendation: string;
  };

  officialUrl?: string;
  deadline?: string;
  lastVerified?: string;
}

export interface MatchResult {
  matches: UniversityMatch[];
  profileSummary: object;
  insights: string[];
  disclaimer: string;
  generatedAt: string;
  searchesUsed?: number;
}

interface CachedResult {
  result: MatchResult;
  timestamp: number;
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

export class DynamicMatchingService {
  private openai: OpenAI;
  private webSearch: WebSearchService;
  private cache: Map<string, CachedResult> = new Map();

  // Configuration
  private CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private MAX_CACHE_SIZE = 10000;
  private USE_VERIFICATION = false; // Set to false to skip web search (faster, cheaper)

  // Models
  private FAST_MODEL = 'gpt-4o-mini';        // Fastest, cheapest - perfect for matching
  private SMART_MODEL = 'gpt-4o';           // Better, for verification analysis

  constructor() {
    // Lazy initialization - don't create OpenAI client until first use
    this.webSearch = new WebSearchService();
    console.log('[MATCHING] DynamicMatchingService constructed (OpenAI will init on first use)');
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      console.log('[MATCHING] Initializing OpenAI client...');
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not found in environment variables');
      }
      console.log('[MATCHING] API key found, length:', apiKey.length);
      this.openai = new OpenAI({
        apiKey: apiKey,
        timeout: 30000, // 30 second timeout
        maxRetries: 2
      });
      console.log('[MATCHING] OpenAI client initialized');
    }
    return this.openai;
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Find matching universities - full process with web verification
   * Takes 4-8 seconds, most accurate
   */
  async findMatches(profile: StudentProfile): Promise<MatchResult> {
    // Check cache first
    const cacheKey = this.generateCacheKey(profile);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('[MATCH] ⚡ Cache HIT - Instant response!');
      return cached;
    }

    console.log('[MATCH] Cache MISS - Generating new matches (will cache for future)...');

    try {
      // Step 1: Generate matches from GPT knowledge (fast)
      const knowledgeMatches = await this.generateFromKnowledge(profile);

      if (knowledgeMatches.length === 0) {
        return this.createEmptyResult(profile, 'No universities found matching your criteria.');
      }

      let finalMatches = knowledgeMatches;
      let searchesUsed = 0;

      // Step 2: Verify top 5 with web search (optional, for accuracy)
      if (this.USE_VERIFICATION) {
        const { matches, searches } = await this.verifyTopMatches(profile, knowledgeMatches);
        finalMatches = matches;
        searchesUsed = searches;
      }

      // Create result
      const result: MatchResult = {
        matches: finalMatches.slice(0, 3),
        profileSummary: this.createProfileSummary(profile),
        insights: this.extractInsights(finalMatches, profile),
        disclaimer: this.USE_VERIFICATION
          ? 'Data verified from web search where possible. Always confirm on official university website.'
          : 'Data based on AI knowledge. Verify current fees and requirements on official websites.',
        generatedAt: new Date().toISOString(),
        searchesUsed
      };

      // Cache result
      this.setCache(cacheKey, result);

      return result;

    } catch (error) {
      console.error('[MATCH] Error:', error);
      throw error;
    }
  }

  /**
   * Quick matching - GPT knowledge only, no web verification
   * Takes 2-3 seconds, cheaper
   */
  async findMatchesQuick(profile: StudentProfile): Promise<MatchResult> {
    const cacheKey = this.generateCacheKey(profile) + ':quick';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const matches = await this.generateFromKnowledge(profile);

    const result: MatchResult = {
      matches: matches.slice(0, 3),
      profileSummary: this.createProfileSummary(profile),
      insights: ['Quick results based on AI knowledge. Use full matching for verified data.'],
      disclaimer: 'Preliminary matches. Verify all information on official university websites.',
      generatedAt: new Date().toISOString(),
      searchesUsed: 0
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ===========================================================================
  // STEP 1: GENERATE FROM GPT KNOWLEDGE
  // ===========================================================================

  private async generateFromKnowledge(profile: StudentProfile): Promise<UniversityMatch[]> {
    const systemPrompt = this.getKnowledgeSystemPrompt();
    const userPrompt = this.buildProfilePrompt(profile);

    console.log('[MATCHING] Calling OpenAI for knowledge-based matching...');
    const openai = this.getOpenAI();

    const response = await openai.chat.completions.create({
      model: this.FAST_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500, // Minimal - no analysis section
      response_format: { type: 'json_object' }
    });

    console.log('[MATCHING] OpenAI response received');
    return this.parseKnowledgeResponse(response);
  }

  private getKnowledgeSystemPrompt(): string {
    return `Expert counselor. Return TOP 3 best universities for student.

RULES:
1. ⚠️ LOCATION: If "STRICT LOCATION" → ONLY that location
2. ⚠️ BUDGET: Tuition ≤ max budget
3. Use native currency (USA=USD, Canada=CAD, UK=GBP, AUD=AUD)
4. Exactly 3 universities
5. Categories: SAFETY(75-100), TARGET(50-74), REACH(30-49)

Scholarships: Top 2 with amounts. Ex: ["Merit $10k/yr","Intl $5-15k"]

Rates: CAD=100NPR, USD=134NPR, AUD=88NPR, GBP=168NPR

JSON: {"matches":[{rank,university,country,city,program,level,duration,tuition:{amount,currency,inNPR,verified:false},requirements:{minGPA,ieltsMin,gmatRequired,workExpYears,verified:false},matchScore,category,admissionChance:0-100,prPathway:{strength:0-100,details,postStudyWork},scholarships:{available,topScholarships[]}}],"insights":[2]}

Real universities. TOP 3 only. Conservative costs.`;
  }

  // ===========================================================================
  // STEP 2: VERIFY WITH WEB SEARCH
  // ===========================================================================

  private async verifyTopMatches(
    profile: StudentProfile,
    matches: UniversityMatch[]
  ): Promise<{ matches: UniversityMatch[]; searches: number }> {

    const top5 = matches.slice(0, 3);
    let totalSearches = 0;
    const verifiedMatches: UniversityMatch[] = [];

    for (const match of top5) {
      try {
        // Search for tuition info
        const tuitionResults = await this.webSearch.searchUniversityInfo(
          match.university,
          match.program,
          'tuition'
        );
        totalSearches++;

        // Search for requirements
        const reqResults = await this.webSearch.searchUniversityInfo(
          match.university,
          match.program,
          'requirements'
        );
        totalSearches++;

        // Analyze search results with GPT
        const verifiedMatch = await this.analyzeSearchResults(
          match,
          profile,
          tuitionResults,
          reqResults
        );

        verifiedMatches.push(verifiedMatch);

        // Small delay to avoid overwhelming search
        await this.delay(300);

      } catch (error) {
        console.error(`[VERIFY] Failed for ${match.university}:`, error);
        // Keep original match if verification fails
        verifiedMatches.push(match);
      }
    }

    return { matches: verifiedMatches, searches: totalSearches };
  }

  private async analyzeSearchResults(
    match: UniversityMatch,
    profile: StudentProfile,
    tuitionResults: SearchResult[],
    reqResults: SearchResult[]
  ): Promise<UniversityMatch> {

    const prompt = `Analyze these search results to verify/update university information.

ORIGINAL DATA:
University: ${match.university}
Program: ${match.program}
Tuition: ${match.tuition.currency} ${match.tuition.amount}
IELTS Required: ${match.requirements.ieltsMin}
GMAT Required: ${match.requirements.gmatRequired}

SEARCH RESULTS FOR TUITION:
${tuitionResults.map(r => `- ${r.title}\n  URL: ${r.url}\n  ${r.snippet}`).join('\n\n')}

SEARCH RESULTS FOR REQUIREMENTS:
${reqResults.map(r => `- ${r.title}\n  URL: ${r.url}\n  ${r.snippet}`).join('\n\n')}

STUDENT BUDGET: NPR ${((profile.budgetNPR || 3000000) / 100000).toFixed(0)} Lakhs

Based on the search results:
1. Update tuition if you find more recent/accurate data
2. Update requirements if found
3. Extract official URL if available
4. Update analysis based on verified data

Return JSON:
{
  "tuition": {
    "amount": number,
    "currency": "CAD/AUD/GBP/USD",
    "inNPR": number,
    "source": "official URL if found",
    "verified": true/false,
    "note": "any relevant note"
  },
  "requirements": {
    "minPercentage": number or null,
    "ieltsMin": number or null,
    "gmatRequired": boolean,
    "workExpYears": number,
    "source": "official URL if found",
    "verified": true/false
  },
  "officialUrl": "program page URL if found",
  "deadline": "deadline if found",
  "updatedAnalysis": {
    "strengths": ["updated strengths"],
    "concerns": ["updated concerns"],
    "budgetFit": "updated budget analysis",
    "recommendation": "updated recommendation"
  }
}`;

    try {
      const openai = this.getOpenAI();

      const response = await openai.chat.completions.create({
        model: this.FAST_MODEL, // Use cheaper model for this
        messages: [
          { role: 'system', content: 'You are analyzing search results to verify university data. Extract factual information from official sources only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return match;

      const verified = JSON.parse(content);

      // Merge verified data with original match
      return {
        ...match,
        tuition: {
          ...match.tuition,
          ...verified.tuition
        },
        requirements: {
          ...match.requirements,
          ...verified.requirements
        },
        officialUrl: verified.officialUrl || match.officialUrl,
        deadline: verified.deadline,
        analysis: verified.updatedAnalysis || match.analysis,
        lastVerified: new Date().toISOString().split('T')[0]
      };

    } catch (error) {
      console.error('[ANALYZE] Failed to analyze search results:', error);
      return match;
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private buildProfilePrompt(profile: StudentProfile): string {
    const budget = profile.budgetNPR || 3000000;
    const budgetInLakhs = (budget / 100000).toFixed(1);
    const budgetUSD = Math.round(budget / 134000);

    // Check if filtered budget with specific currency
    const budgetAmount = (profile as any).budgetAmount;
    const budgetCurrency = (profile as any).budgetCurrency;

    let budgetDisplay = `NPR ${budgetInLakhs} Lakhs (~USD ${budgetUSD.toLocaleString()})`;
    if (budgetAmount && budgetCurrency) {
      budgetDisplay = `${budgetCurrency} ${budgetAmount.toLocaleString()} MAXIMUM (user-specified constraint)`;
    }

    return `Level: ${profile.studyLevel || 'Masters'} | Field: ${profile.fieldOfStudy || 'Any'}
Countries: ${profile.preferredCountries?.join(',') || 'Canada,Australia,UK'}${profile.preferredState ? `\n⚠️ ${profile.preferredState} ONLY!` : ''}
Score: ${profile.percentage ? `${profile.percentage}%` : profile.gpa ? `${profile.gpa}GPA` : 'N/A'} | ${profile.tests?.type || 'No'} ${profile.tests?.overallScore || ''}
Work: ${profile.workExperienceYears || 0}yr${profile.gmat ? ` | GMAT:${profile.gmat}` : ''}
⚠️ BUDGET: ${budgetDisplay}${profile.preferredState ? `\n⚠️⚠️ ONLY ${profile.preferredState}!\n` : ''}
Return 3 matches JSON.`;
  }

  private parseKnowledgeResponse(response: OpenAI.Chat.Completions.ChatCompletion): UniversityMatch[] {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('[PARSE] No content in response');
        return [];
      }

      const parsed = JSON.parse(content);

      if (!parsed.matches || !Array.isArray(parsed.matches)) {
        console.error('[PARSE] No matches array');
        return [];
      }

      return parsed.matches;

    } catch (error) {
      console.error('[PARSE] Failed to parse response:', error);
      return [];
    }
  }

  private createProfileSummary(profile: StudentProfile): object {
    return {
      studyLevel: profile.studyLevel,
      field: profile.fieldOfStudy,
      countries: profile.preferredCountries,
      academicScore: profile.percentage
        ? `${profile.percentage}%`
        : profile.gpa
        ? `${profile.gpa} GPA`
        : 'Not specified',
      englishTest: profile.tests
        ? `${profile.tests.type} ${profile.tests.overallScore}`
        : 'Not taken',
      workExperience: `${profile.workExperienceYears || 0} years`,
      budget: `NPR ${((profile.budgetNPR || 0) / 100000).toFixed(1)} Lakhs`,
      careerGoal: profile.careerGoal
    };
  }

  private extractInsights(matches: UniversityMatch[], profile: StudentProfile): string[] {
    const insights: string[] = [];

    if (matches.length === 0) {
      return ['No matches found. Consider expanding country preferences or adjusting budget.'];
    }

    // Category distribution
    const safetyCount = matches.filter(m => m.category === 'SAFETY').length;
    const reachCount = matches.filter(m => m.category === 'REACH' || m.category === 'DREAM').length;

    if (safetyCount >= 2) {
      insights.push(`✅ You have ${safetyCount} SAFETY schools with high admission chances.`);
    }

    if (reachCount > safetyCount) {
      insights.push('📈 Many competitive matches. Consider improving test scores for better chances.');
    }

    // Budget insights
    const withinBudget = matches.filter(m => {
      return m.tuition.inNPR <= (profile.budgetNPR || 0);
    }).length;

    if (withinBudget < matches.length / 2 && profile.budgetNPR) {
      insights.push('💰 Most programs exceed tuition budget. Education loans are common and have good terms.');
    }

    // PR insights
    if (profile.careerGoal === 'PR_PATHWAY') {
      const strongPR = matches.filter(m => m.prPathway.strength >= 80).length;
      if (strongPR >= 2) {
        insights.push('🎯 Good PR pathway options available. Canada and Australia have best outcomes.');
      }
    }

    return insights;
  }

  private createEmptyResult(profile: StudentProfile, message: string): MatchResult {
    return {
      matches: [],
      profileSummary: this.createProfileSummary(profile),
      insights: [message],
      disclaimer: 'Try adjusting preferences for more options.',
      generatedAt: new Date().toISOString()
    };
  }

  // ===========================================================================
  // CACHING
  // ===========================================================================

  private generateCacheKey(profile: StudentProfile): string {
    return [
      profile.studyLevel || 'MASTERS',
      profile.fieldOfStudy || 'ANY',
      (profile.preferredCountries || []).sort().join(',') || 'ALL',
      profile.preferredState || 'ANY', // Include state filter
      Math.round((profile.budgetNPR || 3000000) / 500000) * 500000,
      Math.round((profile.percentage || 60) / 5) * 5,
      profile.tests?.type || 'NONE',
      Math.round((profile.tests?.overallScore || 6) * 2) / 2,
      profile.careerGoal || 'FLEXIBLE'
    ].join('|');
  }

  private getFromCache(key: string): MatchResult | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    if (cached) this.cache.delete(key);
    return null;
  }

  private setCache(key: string, result: MatchResult): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = [...this.cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, Math.ceil(entries.length * 0.1))
        .forEach(([k]) => this.cache.delete(k));
    }
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttlDays: this.CACHE_TTL / (24 * 60 * 60 * 1000)
    };
  }

  // Configuration methods
  setVerificationEnabled(enabled: boolean) {
    this.USE_VERIFICATION = enabled;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const dynamicMatchingService = new DynamicMatchingService();
