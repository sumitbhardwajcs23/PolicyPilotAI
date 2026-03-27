import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { authRouter } from './routes/auth'
import { policyRouter } from './routes/policies'
import { claimsRouter } from './routes/claims'
import { dashboardRouter } from './routes/dashboard'
import { adminRouter } from './routes/admin'
import { weatherRouter } from './routes/weather'
import { errorHandler } from './middleware/errorHandler'
import { connectDB } from './config/db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gigshield.in', 'https://www.gigshield.in', 'https://policypilotai.onrender.com', 'https://policy-pilot-ai.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // significantly higher limit for dev
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Stricter rate limit for auth endpoints (relaxed in dev)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 1000,
  skipSuccessfulRequests: true
})
app.use('/api/auth/', authLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Compression
app.use(compression())

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the PolicyPilotAI API',
    docs: 'https://policypilotai.onrender.com/health',
    status: 'Running'
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/policies', policyRouter)
app.use('/api/claims', claimsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/admin', adminRouter)
app.use('/api/weather', weatherRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})

const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`🚀 Policy Pilot AI API server running on port ${PORT} All thanks to Hanuman Ji`)
    console.log(`📊 Environment lets GO: ${process.env.NODE_ENV || 'development '}`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Kill the process holding it and restart.`)
      process.exit(1)
    } else {
      throw err
    }
  })
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})

export default app
