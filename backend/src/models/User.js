import bcrypt from 'bcryptjs'
import { randomBytes, createHash } from 'crypto'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    mobile: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
    profileImage: { type: String },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
)

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const raw = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(raw).digest('hex')
  this.resetPasswordTokenHash = hash
  this.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 min
  return raw
}

export const User = mongoose.model('User', userSchema)

