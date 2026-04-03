import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createInquiry } from '../controllers/inquiryController.js'

export const inquiryRoutes = Router()

inquiryRoutes.post('/inquiries', requireAuth, createInquiry)