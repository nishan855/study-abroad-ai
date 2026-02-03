'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  options?: string[]
  createdAt?: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    startConversation()
  }, [])

  const startConversation = async () => {
    try {
      setIsLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (data.success) {
        setConversationId(data.data.conversationId)
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: data.data.message,
            options: data.data.options || []
          }
        ])
      } else {
        setError('Failed to start conversation. Please refresh the page.')
      }
    } catch (err) {
      console.error('Error starting conversation:', err)
      setError('Failed to connect to the server. Please check if the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !conversationId || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)
    setShowOptions(false)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          message: messageText
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: data.data.assistantMessageId,
          role: 'assistant',
          content: data.data.assistantMessage,
          options: data.data.options || []
        }

        setMessages(prev => [...prev, assistantMessage])
        setShowOptions(true)

        // Check if conversation is complete
        if (data.data.isComplete) {
          // Redirect to results page after a short delay
          setTimeout(() => {
            router.push(`/results?conversationId=${conversationId}`)
          }, 2000)
        }
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionClick = (option: string) => {
    handleSendMessage(option)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputMessage)
  }

  const currentOptions = messages[messages.length - 1]?.options || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Find Your Match
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-600 font-medium">AI Counselor</span>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-180px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.id}>
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🤖</span>
                      <span className="text-xs font-semibold text-emerald-600">AI Counselor</span>
                    </div>
                  )}
                  <p className="text-base leading-relaxed">{message.content}</p>
                </div>
              </div>

              {/* Option Buttons - Show only for last assistant message */}
              {message.role === 'assistant' &&
               message.options &&
               message.options.length > 0 &&
               index === messages.length - 1 &&
               showOptions &&
               !isLoading && (
                <div className="mt-4 flex flex-wrap gap-2 max-w-[85%]">
                  {message.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className="px-5 py-3 bg-white border-2 border-emerald-500 text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 hover:shadow-md transition-all text-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span className="text-sm text-gray-600 font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Or type your answer... (Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none outline-none px-4 py-3 text-gray-900 placeholder-gray-400 max-h-32 min-h-[48px]"
              rows={1}
              disabled={isLoading || !conversationId}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !conversationId}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
