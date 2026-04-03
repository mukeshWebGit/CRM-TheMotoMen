import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { User } from './models/User.js'
import { Inquiry } from './models/Inquiry.js'
import { authRoutes } from './routes/authRoutes.js'
import { meRoutes } from './routes/meRoutes.js'
import { inquiryRoutes } from './routes/inquiryRoutes.js'

export function createApp() {
  const app = express()

  app.use(morgan('dev'))
  app.use(
    cors({
      origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use('/uploads', express.static('uploads'))

  app.get('/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api', meRoutes)
  app.use('/api', inquiryRoutes)

  // debug route (dev only): list users without sensitive fields
  app.get('/api/debug/users', async (_req, res, next) => {
    try {
      const users = await User.find().select('name email role createdAt')
      res.json({ users })
    } catch (err) {
      next(err)
    }
  })

  app.use((_req, res) => res.status(404).json({ message: 'Not found' }))

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err)
    const status = err?.statusCode || 500
    res.status(status).json({ message: err?.message || 'Server error' })
  })

  return app
}

