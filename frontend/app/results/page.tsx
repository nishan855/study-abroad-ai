'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Award,
  MapPin,
  CheckCircle,
  Target,
  Sparkles,
  Globe,
  BookOpen,
  BarChart3,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'

interface University {
  rank: number
  university: string
  country: string
  city: string
  program: string
  level: string
  duration: string
  tuition: {
    amount: number
    currency: string
    inNPR: number
    verified: boolean
  }
  requirements: {
    minPercentage?: string | number
    minGPA?: number
    ieltsMin?: string | number
    pteMin?: string | number
    gmatRequired: boolean
    workExpYears: number
  }
  matchScore: number
  category: 'SAFETY' | 'TARGET' | 'REACH' | 'DREAM'
  admissionChance: number
  prPathway: {
    strength: number
    details: string
    postStudyWork: string
  }
  scholarships: {
    available: boolean
    topScholarships: string[]
  }
  analysis?: {
    strengths: string[]
    concerns: string[]
    budgetFit: string
    recommendation: string
  }
}

interface MatchData {
  matches: University[]
  profileSummary: any
  insights: string[]
  disclaimer: string
  generatedAt: string
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = searchParams.get('conversationId')

  const [isLoading, setIsLoading] = useState(true)
  const [allMatches, setAllMatches] = useState<University[]>([]) // Original matches from API
  const [filteredMatches, setFilteredMatches] = useState<University[]>([]) // Client-side filtered
  const [profileSummary, setProfileSummary] = useState<any>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filter states for client-side filtering
  const [maxBudget, setMaxBudget] = useState<number>(100000) // In native currency (e.g., USD, CAD)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [isRefetching, setIsRefetching] = useState(false)

  // Determine budget range based on currency
  const getBudgetRange = () => {
    const ranges: Record<string, { min: number; max: number; step: number }> = {
      USD: { min: 0, max: 100000, step: 5000 },
      CAD: { min: 0, max: 100000, step: 5000 },
      AUD: { min: 0, max: 100000, step: 5000 },
      GBP: { min: 0, max: 80000, step: 5000 },
      EUR: { min: 0, max: 80000, step: 5000 },
      NZD: { min: 0, max: 100000, step: 5000 }
    }
    return ranges[selectedCurrency] || { min: 0, max: 100000, step: 5000 }
  }

  // Color coding for percentages
  const getPercentageColor = (value: number) => {
    if (value >= 80) return { text: 'text-green-600', bg: 'bg-green-500', gradient: 'from-green-500 to-emerald-500', border: 'border-green-200', bgLight: 'from-green-50 to-emerald-50' }
    if (value >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500', border: 'border-blue-200', bgLight: 'from-blue-50 to-cyan-50' }
    if (value >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', gradient: 'from-amber-500 to-yellow-500', border: 'border-amber-200', bgLight: 'from-amber-50 to-yellow-50' }
    return { text: 'text-gray-600', bg: 'bg-gray-500', gradient: 'from-gray-500 to-slate-500', border: 'border-gray-200', bgLight: 'from-gray-50 to-slate-50' }
  }

  useEffect(() => {
    if (!conversationId) {
      router.push('/chat')
      return
    }

    fetchMatches()
  }, [conversationId])

  const fetchMatches = async (filters?: {
    maxBudget?: number
    currency?: string
    country?: string
    state?: string
  }) => {
    try {
      setIsRefetching(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      // Build query params (for backend re-analysis only)
      const params = new URLSearchParams()
      if (filters?.maxBudget) params.append('maxBudget', filters.maxBudget.toString())
      if (filters?.currency) params.append('currency', filters.currency)
      if (filters?.country) params.append('country', filters.country)
      if (filters?.state) params.append('state', filters.state)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const url = `${apiUrl}/api/matching/${conversationId}${params.toString() ? '?' + params.toString() : ''}`

      const response = await fetch(url, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const data = await response.json()

      if (data.success && data.data) {
        setAllMatches(data.data.matches)
        setFilteredMatches(data.data.matches)
        setProfileSummary(data.data.profileSummary)
        setInsights(data.data.insights)
        setError(null)

        // Set default currency from first match (only on initial load)
        if (data.data.matches.length > 0 && !filters) {
          setSelectedCurrency(data.data.matches[0].tuition.currency)
          setMaxBudget(getBudgetRange().max)
        }
      } else {
        setError(data.error || 'Failed to load matches')
      }
    } catch (err: any) {
      console.error('Error fetching matches:', err)
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError('Failed to load results. Please try again.')
      }
    } finally {
      setIsLoading(false)
      setIsRefetching(false)
    }
  }

  // Apply filters - calls backend with filter parameters
  const applyFilters = () => {
    // Build filters object - send budget in original currency, not NPR
    const filters: { maxBudget?: number; currency?: string; state?: string } = {}

    // Only send budget if it's been adjusted from max
    if (maxBudget > 0 && maxBudget < getBudgetRange().max) {
      filters.maxBudget = maxBudget
      filters.currency = selectedCurrency
    }

    if (selectedState && selectedState.trim()) {
      filters.state = selectedState.trim()
    }

    // Call backend with filters (budget in original currency)
    fetchMatches(filters)
  }

  // Reset filters and fetch original matches (without filter constraints)
  const resetFilters = () => {
    setMaxBudget(getBudgetRange().max)
    setSelectedCountry('')
    setSelectedState('')
    // Fetch matches without filters - gets fresh TOP 5 from original profile
    fetchMatches()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      SAFETY: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: 'text-green-500' },
      TARGET: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-500' },
      REACH: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', icon: 'text-amber-500' },
      DREAM: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', icon: 'text-purple-500' }
    }
    return colors[category as keyof typeof colors] || colors.TARGET
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Finding your perfect matches...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing universities worldwide</p>
        </div>
      </div>
    )
  }

  const matches = (error || allMatches.length === 0) ? [] : filteredMatches

  const allCountries = Array.from(new Set(allMatches.map(m => m.country)))
  const allStates = Array.from(new Set(allMatches.map(m => m.city)))
  const allCurrencies = Array.from(new Set(allMatches.map(m => m.tuition.currency)))

  const categoryCount = {
    SAFETY: matches.filter(m => m.category === 'SAFETY').length,
    TARGET: matches.filter(m => m.category === 'TARGET').length,
    REACH: matches.filter(m => m.category === 'REACH').length,
    DREAM: matches.filter(m => m.category === 'DREAM').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Your University Matches
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-900">{matches.length} Perfect Matches</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters - Always Visible */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-gray-900">Refine Your Search</span>
            {isRefetching && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          </div>

          <div className="space-y-4 mb-4">
            {/* Budget Filter with Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Max Tuition Budget
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => {
                      setSelectedCurrency(e.target.value)
                      // Reset budget when currency changes
                      setMaxBudget(getBudgetRange().max)
                    }}
                    className="px-2 py-1 border-2 border-gray-300 rounded-lg text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {allCurrencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  <span className="text-lg font-black text-emerald-600 min-w-[120px] text-right">
                    {selectedCurrency} {maxBudget.toLocaleString()}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={getBudgetRange().min}
                max={getBudgetRange().max}
                step={getBudgetRange().step}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                style={{
                  background: `linear-gradient(to right, #059669 0%, #059669 ${(maxBudget / getBudgetRange().max) * 100}%, #e5e7eb ${(maxBudget / getBudgetRange().max) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{selectedCurrency} 0</span>
                <span>{selectedCurrency} {getBudgetRange().max.toLocaleString()}</span>
              </div>
            </div>

            {/* State / Province Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                State / Province (Optional)
              </label>
              <input
                type="text"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                placeholder="e.g., Texas, Ontario, NSW"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={applyFilters}
              disabled={isRefetching}
              className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRefetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying Filters...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Apply Filters
                </>
              )}
            </button>
            <button
              onClick={resetFilters}
              disabled={isRefetching}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
          </div>

          {/* No matches warning */}
          {(error || allMatches.length === 0 || (filteredMatches.length === 0 && allMatches.length > 0)) && (
            <div className="mt-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-semibold">
                  {error || allMatches.length === 0
                    ? (error || insights?.[0] || 'No universities match your profile yet.')
                    : 'No universities match your current filters.'}
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                {allMatches.length > 0 ? (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-amber-700 font-bold underline hover:text-amber-900"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.back()}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Go Back
                    </button>
                    <Link
                      href="/chat"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all"
                    >
                      Start New Chat
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Success Banner - Only show if we have matches */}
        {matches.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-3xl font-black mb-2">Top {matches.length} Universities for You 🎉</h2>
              <p className="text-emerald-100 text-lg mb-4">
                Hand-picked matches based on your profile and preferences
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">
                    {profileSummary.academicScore?.includes('%')
                      ? profileSummary.academicScore.replace('%', '')
                      : profileSummary.academicScore}
                  </div>
                  <div className="text-sm text-emerald-100">
                    {profileSummary.academicScore?.includes('%') ? 'Percentage' :
                     profileSummary.academicScore?.includes('GPA') ? 'GPA Score' : 'Academic Score'}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{profileSummary.englishTest?.split(' ')[1] || 'N/A'}</div>
                  <div className="text-sm text-emerald-100">{profileSummary.englishTest?.split(' ')[0] || 'English Test'}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{matches.length}</div>
                  <div className="text-sm text-emerald-100">Universities</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">
                    {matches.length > 0
                      ? Math.round(matches.reduce((acc, m) => acc + m.admissionChance, 0) / matches.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-emerald-100">Avg Chance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Insights & Category Breakdown - Only show if we have matches */}
        {matches.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Match Categories</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(categoryCount).map(([category, count]) => {
                const colors = getCategoryColor(category)
                return count > 0 ? (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors.icon.replace('text-', 'bg-')}`}></div>
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Key Insights</h3>
            </div>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        {/* University Matches - Only show if we have matches */}
        {matches.length > 0 && (
        <div className="space-y-6">
          {matches.map((match) => {
            const colors = getCategoryColor(match.category)

            return (
              <div
                key={match.rank}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${colors.border} hover:shadow-2xl transition-all`}
              >
                {/* Header */}
                <div className={`${colors.bg} p-6 border-b-2 ${colors.border}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-black text-gray-900">#{match.rank}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {match.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700 border-2 border-gray-300">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-1">{match.university}</h3>
                      <p className="text-lg font-semibold text-gray-700">{match.program}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{match.city}, {match.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{match.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Admission Chance */}
                      <div className={`bg-gradient-to-br ${getPercentageColor(match.admissionChance).bgLight} rounded-xl p-4 border-2 ${getPercentageColor(match.admissionChance).border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-700">Admission Chance</span>
                          <TrendingUp className={`w-5 h-5 ${getPercentageColor(match.admissionChance).text}`} />
                        </div>
                        <div className="flex items-end gap-2">
                          <span className={`text-4xl font-black ${getPercentageColor(match.admissionChance).text}`}>{match.admissionChance}%</span>
                          <span className="text-sm text-gray-600 pb-1">probability</span>
                        </div>
                        <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getPercentageColor(match.admissionChance).gradient}`}
                            style={{ width: `${match.admissionChance}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Requirements
                        </h4>
                        <div className="space-y-2 text-sm">
                          {match.requirements.minGPA && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Min GPA:</span>
                              <span className="font-bold text-gray-900">{match.requirements.minGPA}/4.0</span>
                            </div>
                          )}
                          {match.requirements.ieltsMin && match.requirements.ieltsMin !== 'N/A' && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">IELTS:</span>
                              <span className="font-bold text-gray-900">{match.requirements.ieltsMin}</span>
                            </div>
                          )}
                          {match.requirements.gmatRequired && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">GMAT:</span>
                              <span className="font-bold text-red-600">Required</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PR Pathway */}
                      <div className={`bg-gradient-to-br ${getPercentageColor(match.prPathway.strength).bgLight} rounded-xl p-4 border-2 ${getPercentageColor(match.prPathway.strength).border}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className={`w-4 h-4 ${getPercentageColor(match.prPathway.strength).text}`} />
                          <h4 className="font-bold text-gray-900 text-sm">PR Pathway</h4>
                        </div>
                        <p className={`text-2xl font-black ${getPercentageColor(match.prPathway.strength).text} mb-1`}>{match.prPathway.strength}%</p>
                        <p className="text-xs text-gray-600">{match.prPathway.details}</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Cost Breakdown */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-gray-900">Annual Costs</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-semibold">Annual Tuition:</span>
                            <div className="text-right">
                              <div className="font-black text-amber-600 text-lg">
                                {match.tuition.currency} {match.tuition.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ≈ NPR {(match.tuition.inNPR / 100000).toFixed(1)} Lakhs/year
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scholarships */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <h4 className="font-bold text-gray-900 text-sm">Top Scholarships for International Students</h4>
                          {match.scholarships.available && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="space-y-1 mb-2">
                          {match.scholarships.topScholarships.map((scholarship, i) => (
                            <p key={i} className="text-sm text-gray-700">• {scholarship}</p>
                          ))}
                        </div>
                        <button className="mt-2 text-xs text-purple-700 font-semibold hover:underline">
                          Run full analysis for all details →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}

        {/* Footer Actions - Only show if we have matches */}
        {matches.length > 0 && (
        <div className="mt-12 flex gap-4 justify-center pb-8">
          <Link
            href="/chat"
            className="px-8 py-4 bg-white border-2 border-emerald-500 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
          >
            Start New Search
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all shadow-lg"
          >
            Back to Home
          </Link>
        </div>
        )}
      </div>
    </div>
  )
}
