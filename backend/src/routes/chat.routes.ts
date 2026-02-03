import { Router } from 'express'
import chatService from '../services/chat.service'
import { z } from 'zod'

const router = Router()

// Validation schemas
const startChatSchema = z.object({
  userId: z.string().optional()
})

const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(1000)
})

/**
 * POST /api/chat/start
 * Start a new conversation
 */
router.post('/start', async (req, res) => {
  try {
    const { userId } = startChatSchema.parse(req.body)

    const result = await chatService.startConversation(userId)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error starting conversation:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to start conversation'
    })
  }
})

/**
 * POST /api/chat/message
 * Send a message in an existing conversation
 */
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message } = sendMessageSchema.parse(req.body)

    const result = await chatService.sendMessage(conversationId, message)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error sending message:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
    }

    if (error instanceof Error && error.message === 'Conversation not found') {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    })
  }
})

/**
 * GET /api/chat/:conversationId
 * Get conversation history
 */
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params

    // Validate cuid format (basic validation)
    if (!conversationId || conversationId.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format'
      })
    }

    const conversation = await chatService.getConversation(conversationId)

    res.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Error getting conversation:', error)

    if (error instanceof Error && error.message === 'Conversation not found') {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get conversation'
    })
  }
})

export default router
