import OpenAI from 'openai'
import { PrismaClient, MessageRole, ConversationStage } from '@prisma/client'

const prisma = new PrismaClient()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Question flow structure
const QUESTION_FLOW = {
  COUNTRY: {
    question: "Which country would you like to study in?",
    options: ["🇨🇦 Canada", "🇦🇺 Australia", "🇬🇧 UK", "🇺🇸 USA", "🇩🇪 Germany", "🇳🇿 New Zealand", "🌍 Other Country"]
  },
  DEGREE_LEVEL: {
    question: "What degree level are you applying for?",
    options: ["Bachelor's", "Master's", "PhD", "Diploma/Certificate"]
  },
  CURRENT_EDUCATION: {
    question: "What is your current/highest education level?",
    options: ["High School (12th)", "Bachelor's Degree", "Master's Degree", "Other"]
  },
  LANGUAGE_TEST: {
    question: "Have you taken any language proficiency test?",
    options: ["IELTS", "TOEFL", "PTE", "Duolingo", "German (TestDaF/Goethe)", "Japanese (JLPT)", "Other", "Not yet"]
  }
}

// System prompt for structured conversation
const SYSTEM_PROMPT = `You are StudyYatra's AI counselor. Your role is to collect information through a structured conversation.

IMPORTANT RULES:
1. Ask ONE question at a time
2. Keep responses SHORT (1-2 sentences max)
3. Don't provide options in text - they're shown as buttons
4. After each answer, acknowledge briefly and move to next question
5. Extract and store all information accurately
6. When all questions are answered, say "Great! Let me analyze your profile..." and set stage to COMPLETE

Current question flow:
1. Country preference
2. Degree level
3. Current education
4. GPA/Percentage
5. English test score
6. Other test scores
7. Any additional info

Be friendly but concise.`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  options?: string[]
}

export class ChatService {
  /**
   * Start a new conversation
   */
  async startConversation(userId?: string): Promise<{
    conversationId: string
    message: string
    options?: string[]
  }> {
    const conversation = await prisma.conversation.create({
      data: {
        userId: userId || null,
        stage: ConversationStage.GREETING,
        extractedProfile: {
          step: 'COUNTRY'
        }
      }
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        content: QUESTION_FLOW.COUNTRY.question,
        metadata: {
          options: QUESTION_FLOW.COUNTRY.options
        }
      }
    })

    return {
      conversationId: conversation.id,
      message: QUESTION_FLOW.COUNTRY.question,
      options: QUESTION_FLOW.COUNTRY.options
    }
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    conversationId: string,
    userMessage: string
  ): Promise<{
    userMessageId: string
    assistantMessageId: string
    assistantMessage: string
    options?: string[]
    isComplete?: boolean
  }> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Save user message
    const userMsg = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.USER,
        content: userMessage,
        metadata: {}
      }
    })

    // Get current profile data
    const profile = (conversation.extractedProfile as any) || {}
    const currentStep = profile.step || 'COUNTRY'

    // Update profile with user's answer
    const { updatedProfile, nextStep } = this.processAnswer(profile, currentStep, userMessage)

    // Determine next question
    let assistantMessage = ''
    let options: string[] | undefined = undefined
    let isComplete = false

    if (nextStep === 'COMPLETE') {
      assistantMessage = "Perfect! I have all the information I need. Let me analyze your profile and find the best university matches for you..."
      isComplete = true

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          stage: ConversationStage.COMPLETE,
          extractedProfile: updatedProfile,
          isComplete: true
        }
      })
    } else if (nextStep === 'COUNTRY_OTHER') {
      // Ask which other country
      assistantMessage = "Which country would you like to study in? (Please type the country name)"

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          extractedProfile: { ...updatedProfile, step: 'COUNTRY_OTHER' }
        }
      })
    } else if (nextStep === 'GPA_SCORE') {
      // Ask for GPA/CGPA/Percentage in simple format
      assistantMessage = "What is your GPA/CGPA or Percentage? (e.g., 3.5/4.0 or 85% or 7.5/10)"

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          extractedProfile: { ...updatedProfile, step: 'GPA_SCORE' }
        }
      })
    } else if (nextStep === 'LANGUAGE_SCORE') {
      // Ask for language test score
      const testName = updatedProfile.languageTest
      if (testName === 'Not yet') {
        // Skip to standardized tests
        assistantMessage = "Have you taken any standardized tests? (e.g., GRE 320, GMAT 680, SAT 1400, or type 'None')"

        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            extractedProfile: { ...updatedProfile, step: 'STANDARDIZED_TESTS' }
          }
        })
      } else if (testName === 'Other') {
        assistantMessage = "Please specify the test name and your score (e.g., French DELF B2)"

        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            extractedProfile: { ...updatedProfile, step: 'LANGUAGE_SCORE' }
          }
        })
      } else {
        assistantMessage = `What is your ${testName} score?`

        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            extractedProfile: { ...updatedProfile, step: 'LANGUAGE_SCORE' }
          }
        })
      }
    } else if (nextStep === 'STANDARDIZED_TESTS') {
      // Ask for standardized tests with scores
      assistantMessage = "Have you taken any standardized tests? (e.g., GRE 320, GMAT 680, SAT 1400, or type 'None')"

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          extractedProfile: { ...updatedProfile, step: 'STANDARDIZED_TESTS' }
        }
      })
    } else if (nextStep === 'ADDITIONAL_INFO') {
      assistantMessage = "Is there anything else you'd like to mention about your academic background, work experience, or goals? (Or type 'No' to finish)"

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          extractedProfile: { ...updatedProfile, step: 'ADDITIONAL_INFO' }
        }
      })
    } else {
      // Regular question from flow
      const questionData = QUESTION_FLOW[nextStep as keyof typeof QUESTION_FLOW]
      if (questionData) {
        assistantMessage = questionData.question
        options = questionData.options
      }

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          extractedProfile: { ...updatedProfile, step: nextStep }
        }
      })
    }

    // Save assistant message
    const assistantMsg = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.ASSISTANT,
        content: assistantMessage,
        metadata: {
          options: options || [],
          isComplete
        }
      }
    })

    return {
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      assistantMessage,
      options,
      isComplete
    }
  }

  /**
   * Process user's answer and update profile
   */
  private processAnswer(
    profile: any,
    currentStep: string,
    answer: string
  ): { updatedProfile: any, nextStep: string } {
    const updatedProfile = { ...profile }

    switch (currentStep) {
      case 'COUNTRY':
        const countryAnswer = answer.replace(/[🇨🇦🇦🇺🇬🇧🇺🇸🇩🇪🇳🇿🌍]/g, '').trim()
        if (countryAnswer === 'Other Country') {
          return { updatedProfile, nextStep: 'COUNTRY_OTHER' }
        }
        updatedProfile.country = countryAnswer
        return { updatedProfile, nextStep: 'DEGREE_LEVEL' }

      case 'COUNTRY_OTHER':
        updatedProfile.country = answer
        return { updatedProfile, nextStep: 'DEGREE_LEVEL' }

      case 'DEGREE_LEVEL':
        updatedProfile.degreeLevel = answer
        return { updatedProfile, nextStep: 'CURRENT_EDUCATION' }

      case 'CURRENT_EDUCATION':
        updatedProfile.currentEducation = answer
        return { updatedProfile, nextStep: 'GPA_SCORE' }

      case 'GPA_SCORE':
        updatedProfile.gpaScore = answer
        return { updatedProfile, nextStep: 'LANGUAGE_TEST' }

      case 'LANGUAGE_TEST':
        updatedProfile.languageTest = answer
        return { updatedProfile, nextStep: 'LANGUAGE_SCORE' }

      case 'LANGUAGE_SCORE':
        updatedProfile.languageScore = answer
        return { updatedProfile, nextStep: 'STANDARDIZED_TESTS' }

      case 'STANDARDIZED_TESTS':
        if (answer.toLowerCase() !== 'none') {
          updatedProfile.standardizedTests = answer
        }
        return { updatedProfile, nextStep: 'ADDITIONAL_INFO' }

      case 'ADDITIONAL_INFO':
        if (answer.toLowerCase() !== 'no') {
          updatedProfile.additionalInfo = answer
        }
        return { updatedProfile, nextStep: 'COMPLETE' }

      default:
        return { updatedProfile, nextStep: 'COUNTRY' }
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    return {
      id: conversation.id,
      stage: conversation.stage,
      extractedProfile: conversation.extractedProfile,
      isComplete: conversation.isComplete,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        options: (msg.metadata as any)?.options || [],
        createdAt: msg.createdAt
      }))
    }
  }
}

export default new ChatService()
