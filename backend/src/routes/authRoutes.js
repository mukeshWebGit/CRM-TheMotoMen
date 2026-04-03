import { Router } from 'express'
import { forgotPassword, login, resetPassword } from '../controllers/authController.js'

export const authRoutes = Router()

authRoutes.post('/login', login)
authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password', resetPassword)

