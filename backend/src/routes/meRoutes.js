import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/auth.js'
import { updateProfile } from '../controllers/authController.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const allowedExt = ['.jpg', '.jpeg', '.png', '.gif']
    const safeExt = allowedExt.includes(ext) ? ext : '.jpg'
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/gif']
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG/PNG/GIF images are allowed'), false)
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 } })

export const meRoutes = Router()

meRoutes.get('/me', requireAuth, (req, res) => {
  console.log('GET /api/me - User data:', req.user)
  res.json({ user: req.user })
})

meRoutes.put('/me', requireAuth, upload.single('profileImage'), updateProfile)

