import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { createHash } from 'crypto'
import { User } from '../models/User.js'

function signToken(userId) {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({}, secret, { subject: String(userId), expiresIn })
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''))
}

export async function login(req, res) {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' })
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select(
    '+password name email role createdAt',
  )
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' })

  const ok = await user.comparePassword(String(password))
  if (!ok) return res.status(401).json({ message: 'Invalid email or password.' })

  const token = signToken(user._id)
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  })
}

async function maybeSendResetEmail({ to, resetUrl }) {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.MAIL_FROM || 'no-reply@themotomen.local'

  if (!host || !port || !user || !pass) return { sent: false }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your CRM password',
    text: `Reset your password using this link: ${resetUrl}`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  })

  return { sent: true }
}

export async function forgotPassword(req, res) {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ message: 'Email is required.' })
  if (!isEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' })

  const normalized = String(email).toLowerCase()
  const user = await User.findOne({ email: normalized }).select(
    'email name role resetPasswordTokenHash resetPasswordExpiresAt',
  )

  // Always return a generic message to avoid user enumeration
  const genericMessage =
    'If the account exists, a password reset link will be sent.'

  if (!user) return res.json({ message: genericMessage })

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
  const resetUrl = `${frontendOrigin}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalized)}`

  const { sent } = await maybeSendResetEmail({ to: normalized, resetUrl })

  if (!sent) {
    return res.json({
      message: genericMessage,
      mock: true,
      resetUrl,
      resetToken,
    })
  }

  return res.json({ message: genericMessage })
}

export async function updateProfile(req, res) {
  const { name, email, mobile, password } = req.body || {}
  const profileImage = req.file

  console.log('Update profile request:', { name, email, mobile, password: password ? '[HIDDEN]' : undefined, hasImage: !!profileImage, userId: req.user?._id })

  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      console.log('User not found:', req.user._id)
      return res.status(404).json({ message: 'User not found' })
    }

    console.log('Current user:', { id: user._id, name: user.name, email: user.email })

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        console.log('Email already exists:', email)
        return res.status(400).json({ message: 'Email already exists' })
      }
      user.email = email.toLowerCase()
    }

    // Update other fields
    if (name) user.name = name
    if (mobile) user.mobile = mobile
    if (password) user.password = password // Will be hashed by pre-save hook

    // Handle profile image
    if (profileImage) {
      user.profileImage = `/uploads/${profileImage.filename}`
    }

    console.log('Saving user with updates:', { name: user.name, email: user.email, mobile: user.mobile, hasPassword: !!user.password, profileImage: user.profileImage })

    await user.save()

    // Return updated user (exclude password)
    const updatedUser = await User.findById(req.user._id).select('-password -resetPasswordTokenHash -resetPasswordExpiresAt')

    console.log('Profile updated successfully')
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
}

export async function resetPassword(req, res) {
  const { token, email, password } = req.body || {}
  if (!token || !email || !password) {
    return res.status(400).json({ message: 'Token, email, and new password are required.' })
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  const normalized = String(email).toLowerCase()
  const user = await User.findOne({
    email: normalized,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+resetPasswordTokenHash')

  if (!user || !user.resetPasswordTokenHash) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' })
  }

  const hash = createHash('sha256').update(token).digest('hex')
  if (hash !== user.resetPasswordTokenHash) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' })
  }

  user.password = password
  user.resetPasswordTokenHash = undefined
  user.resetPasswordExpiresAt = undefined
  await user.save()

  const newToken = signToken(user._id)
  return res.json({
    message: 'Password reset successfully.',
    token: newToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  })
}

