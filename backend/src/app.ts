import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler } from './middleware/error.middleware'
import { logger } from './utils/logger'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://studyyatra.loca.lt'],
  credentials: true
}))

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api', routes)

// Error handling
app.use(errorHandler)

export default app
