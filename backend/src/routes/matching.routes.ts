// backend/src/routes/matching.routes.ts
//
// API endpoints for university matching (OpenAI version)
//

import { Router, Request, Response } from 'express';
import { DynamicMatchingService, StudentProfile } from '../services/dynamic-matching.service';

const router = Router();

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Matching routes loaded!' });
});

let matchingService: DynamicMatchingService;
try {
  matchingService = new DynamicMatchingService();
  console.log('[MATCHING] Service initialized successfully');
} catch (error) {
  console.error('[MATCHING] Failed to initialize service:', error);
  throw error;
}

/**
 * POST /api/matching/find
 *
 * Full matching with web verification
 * Takes 5-10 seconds, most accurate
 *
 * Cost: ~$0.007 per request
 */
router.post('/find', async (req: Request, res: Response) => {
  try {
    const profile: StudentProfile = normalizeProfile(req.body);

    const startTime = Date.now();
    const result = await matchingService.findMatches(profile);
    const duration = Date.now() - startTime;

    console.log(`[API] Match completed in ${duration}ms, ${result.matches.length} matches`);

    res.json({
      success: true,
      data: result,
      meta: {
        processingTimeMs: duration,
        matchCount: result.matches.length,
        searchesUsed: result.searchesUsed,
        cached: duration < 500
      }
    });

  } catch (error: any) {
    console.error('[API] Matching error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MATCHING_ERROR',
        message: 'Failed to find matching universities. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

/**
 * POST /api/matching/quick
 *
 * Quick matching - GPT knowledge only, no web verification
 * Takes 2-3 seconds, good for previews
 *
 * Cost: ~$0.002 per request
 */
router.post('/quick', async (req: Request, res: Response) => {
  try {
    const profile: StudentProfile = normalizeProfile(req.body);

    const startTime = Date.now();
    const result = await matchingService.findMatchesQuick(profile);
    const duration = Date.now() - startTime;

    console.log(`[API] Quick match in ${duration}ms`);

    res.json({
      success: true,
      data: result,
      meta: {
        processingTimeMs: duration,
        matchCount: result.matches.length,
        verified: false,
        note: 'Quick results. Use POST /api/matching/find for verified data.'
      }
    });

  } catch (error: any) {
    console.error('[API] Quick match error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MATCHING_ERROR',
        message: 'Failed to find matches.'
      }
    });
  }
});

/**
 * GET /api/matching/:conversationId
 *
 * Get matches for a specific conversation using AI search
 */
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    console.log('[ROUTE] Matching request received for conversation:', req.params.conversationId);
    const { conversationId } = req.params;

    // Extract filter parameters from query
    const { maxBudget, currency, state } = req.query;
    console.log('[ROUTE] Filters:', { maxBudget, currency, state });

    // Get conversation with profile
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    console.log('[ROUTE] Fetching conversation from database...');
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      console.log('[ROUTE] Conversation not found');
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (!conversation.extractedProfile) {
      console.log('[ROUTE] Profile not complete');
      return res.status(400).json({
        success: false,
        error: 'Profile not complete'
      });
    }

    console.log('[ROUTE] Profile found:', conversation.extractedProfile);

    // Convert chat profile format to matching profile
    const profile: StudentProfile = normalizeProfile(conversation.extractedProfile);

    // APPLY FILTERS TO PROFILE - Modify profile with user's filter constraints
    if (maxBudget && Number(maxBudget) > 0 && currency) {
      // Store budget in NPR for internal comparison
      const currencyRates: Record<string, number> = {
        USD: 134, CAD: 100, AUD: 88, GBP: 168, EUR: 145, NZD: 88
      };
      profile.budgetNPR = Number(maxBudget) * (currencyRates[currency as string] || 134);

      // Store original budget and currency for AI prompt
      (profile as any).budgetAmount = Number(maxBudget);
      (profile as any).budgetCurrency = currency as string;
      console.log('[ROUTE] Budget constraint applied:', maxBudget, currency);
    }

    if (state && typeof state === 'string' && state.trim()) {
      profile.preferredState = state.trim();
      console.log('[ROUTE] State constraint applied:', state);
    }

    console.log('[ROUTE] Profile ready with filters applied');

    // Query AI with modified profile to get fresh TOP 5 results
    console.log('[ROUTE] Calling AI matching service with updated constraints...');
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        matchingService.findMatches(profile),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI matching timeout after 30 seconds')), 30000)
        )
      ]) as any;

      const duration = Date.now() - startTime;
      console.log('[ROUTE] Matching complete in', duration, 'ms, found', result.matches.length, 'matches');

      res.json({
        success: true,
        data: result,
        meta: {
          conversationId,
          duration,
          filtersApplied: { maxBudget, state },
          matchCount: result.matches.length
        }
      });
    } catch (matchError: any) {
      console.error('[ROUTE] Matching failed:', matchError.message);

      // Return empty result with error message
      res.json({
        success: true,
        data: {
          matches: [],
          profileSummary: conversation.extractedProfile,
          insights: ['AI matching is currently unavailable: ' + matchError.message],
          disclaimer: 'Please try again later or contact support if the issue persists.',
          generatedAt: new Date().toISOString()
        },
        meta: { conversationId, error: matchError.message }
      });
    }

  } catch (error: any) {
    console.error('[API] From-conversation error:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        code: 'MATCHING_ERROR',
        message: 'Failed to match from conversation.',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/matching/stats/cache
 *
 * Get cache statistics for monitoring
 */
router.get('/stats/cache', (req: Request, res: Response) => {
  const stats = matchingService.getCacheStats();
  res.json({ success: true, data: stats });
});

/**
 * POST /api/matching/config
 *
 * Configure matching behavior (admin only)
 */
router.post('/config', (req: Request, res: Response) => {
  const { enableVerification } = req.body;

  if (typeof enableVerification === 'boolean') {
    matchingService.setVerificationEnabled(enableVerification);
  }

  res.json({
    success: true,
    message: 'Configuration updated',
    config: {
      verificationEnabled: enableVerification
    }
  });
});

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

function normalizeProfile(input: any): StudentProfile {
  // Handle both chat profile format and direct API calls
  return {
    studyLevel: input.studyLevel || input.degreeLevel || 'MASTERS',
    fieldOfStudy: input.fieldOfStudy || input.field || null,
    currentDegree: input.currentDegree || input.currentEducation || null,
    university: input.university || null,
    percentage: input.percentage ? Number(input.percentage.toString().replace('%', '')) : null,
    gpa: input.gpa || input.gpaScore ? parseFloat(input.gpaScore?.split('/')[0] || input.gpa) : null,
    graduationYear: input.graduationYear ? Number(input.graduationYear) : null,
    workExperienceYears: input.workExperienceYears ?? input.workExp ?? 0,
    workExperienceField: input.workExperienceField || null,
    tests: input.tests || (input.languageTest ? {
      type: input.languageTest,
      overallScore: parseFloat(input.languageScore)
    } : null),
    gmat: input.gmat ? Number(input.gmat) : null,
    gre: input.gre ? Number(input.gre) : null,
    careerGoal: input.careerGoal || 'FLEXIBLE',
    preferredCountries: input.preferredCountries || (input.country ? [input.country.toUpperCase()] : ['CANADA', 'AUSTRALIA', 'UK']),
    targetIntake: input.targetIntake || input.timeline || '2026',
    budgetNPR: input.budgetNPR || input.budget || 3000000,
    willingToLoan: input.willingToLoan ?? true,
    needsScholarship: input.needsScholarship ?? false
  };
}

export default router;
