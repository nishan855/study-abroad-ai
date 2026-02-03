import Link from 'next/link'
import { ArrowRight, CheckCircle, MapPin, Target, Zap, FileText, Award, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const countries = [
    { name: 'Canada', flag: '🇨🇦', unis: '150+' },
    { name: 'Australia', flag: '🇦🇺', unis: '120+' },
    { name: 'UK', flag: '🇬🇧', unis: '100+' },
    { name: 'USA', flag: '🇺🇸', unis: '80+' },
    { name: 'Germany', flag: '🇩🇪', unis: '50+' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">🎓</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                StudyYatra
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#countries" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Countries
              </Link>
              <Link href="#how" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                How it Works
              </Link>
              <Link
                href="/chat"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Find My Match
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-60"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-md border border-gray-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-semibold text-gray-700">No Consultancy Required • You Can Do It Yourself</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight">
              Discover Universities
              <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                That Match Your Profile
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Answer a few questions about your grades, skills, and goals.
              <span className="block mt-3 text-gray-900 font-semibold">
                Get personalized university recommendations and complete application guidance.
              </span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/chat"
                className="group px-12 py-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-full font-bold text-xl hover:shadow-2xl transition-all flex items-center gap-3 transform hover:scale-105 animate-pulse hover:animate-none"
              >
                <Target className="w-7 h-7" />
                Discover My University Matches
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              ✓ Based on YOUR grades &amp; skills &nbsp;•&nbsp; ✓ Takes 5 minutes &nbsp;•&nbsp; ✓ 100% Personalized
            </p>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section id="countries" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Choose Your Destination
            </h2>
            <p className="text-lg text-gray-600">
              500+ universities across 8 countries waiting for you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {countries.map((country) => (
              <div
                key={country.name}
                className="group p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer text-center"
              >
                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                  {country.flag}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{country.name}</h3>
                <p className="text-sm text-gray-600">{country.unis} universities</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Works Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Our Matching Works
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              We analyze your complete profile to find universities where you'll actually qualify and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Profile-Based Matching</h3>
              <p className="text-emerald-100 leading-relaxed">
                Your GPA, test scores, work experience, and goals create a unique profile for perfect matches.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Verified Requirements</h3>
              <p className="text-emerald-100 leading-relaxed">
                Every requirement pulled directly from official university websites. No guesswork.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Complete Transparency</h3>
              <p className="text-emerald-100 leading-relaxed">
                See exactly why each university matches your profile. Understand your options clearly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your DIY Roadmap
            </h2>
            <p className="text-lg text-gray-600">
              We guide you. You execute. You succeed.
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Discover Your Matches
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Chat with our AI. Tell us your grades, test scores, and goals. Get personalized university matches in 5 minutes.
                  <span className="block mt-2 text-blue-600 font-medium">→ You find universities that actually fit YOU</span>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  📋 Get Your Requirements Checklist
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  See exactly what each university needs: GPA, IELTS score, documents, deadlines, and scholarships.
                  <span className="block mt-2 text-purple-600 font-medium">→ You know exactly what to prepare</span>
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ✅ Apply Yourself
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Follow our step-by-step guide. Fill applications. Upload documents. Submit. Track deadlines.
                  <span className="block mt-2 text-pink-600 font-medium">→ You apply directly (no middleman!)</span>
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🎓 Get Accepted
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Receive your offer letter. Prepare visa documents. Book flights. Start your journey abroad.
                  <span className="block mt-2 text-green-600 font-medium">→ You did it yourself! 🎉</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              We Provide the Tools. You Take Action.
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to apply yourself
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">University Requirements</h3>
                  <p className="text-gray-600">
                    Minimum GPA, IELTS/PTE scores, work experience, documents needed - all verified from official sources
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Program Details</h3>
                  <p className="text-gray-600">
                    Course duration, curriculum details, specializations, and program structure for informed decisions
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Scholarship Information</h3>
                  <p className="text-gray-600">
                    Available scholarships, eligibility criteria, how to apply - directly from university websites
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">PR Pathway Details</h3>
                  <p className="text-gray-600">
                    Post-study work visa options, PR pathways, settlement opportunities for each country
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Deadlines</h3>
                  <p className="text-gray-600">
                    Intake dates, application windows, scholarship deadlines - stay on track
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Direct University Links</h3>
                  <p className="text-gray-600">
                    Official application portals, requirement pages, contact emails - apply directly yourself
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 text-white">
          <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur rounded-full font-semibold mb-4">
            🎯 Ready to Find Your Match?
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            500+ Universities.
            <span className="block mt-2">Which Ones Match You?</span>
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Your grades. Your skills. Your goals. Your dreams.
            <span className="block mt-3 text-white font-bold">Get universities that actually want students like YOU.</span>
          </p>

          <Link
            href="/chat"
            className="inline-flex items-center gap-3 px-14 py-7 bg-white text-purple-600 rounded-full font-black text-2xl hover:shadow-2xl transition-all transform hover:scale-110 group animate-pulse hover:animate-none"
          >
            <Zap className="w-8 h-8 animate-bounce group-hover:animate-none" />
            Unlock My University Matches
            <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </Link>

          <p className="text-lg text-blue-100 font-semibold">
            ⚡ Personalized results in 5 minutes • Based on YOUR unique profile
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl">🎓</span>
            <span className="text-2xl font-bold text-white">StudyYatra</span>
          </div>
          <p className="text-lg">Empowering Nepali students to find their perfect university match</p>
          <p className="text-sm">&copy; 2026 StudyYatra. Your grades. Your match. Your future.</p>
        </div>
      </footer>
    </div>
  )
}
