import 'dotenv/config'
import { createApp } from './app.js'
import { connectDb } from './utils/db.js'
import { User } from './models/User.js'

const port = Number(process.env.PORT || 5000)

async function ensureAdminSeed() {
  const seedEmail = process.env.SEED_ADMIN_EMAIL
  const seedPassword = process.env.SEED_ADMIN_PASSWORD
  const seedName = process.env.SEED_ADMIN_NAME || 'Admin'
  if (!seedEmail || !seedPassword) return

  const exists = await User.findOne({ email: String(seedEmail).toLowerCase() })
  if (exists) return

  await User.create({
    name: seedName,
    email: String(seedEmail).toLowerCase(),
    password: String(seedPassword),
    role: 'admin',
  })
  console.log(`Seeded admin user: ${seedEmail}`)
}

async function start() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/motomen'
  if (!process.env.MONGO_URI) {
    console.warn('Warning: MONGO_URI is not set, using fallback local URI:', mongoUri)
  }
  await connectDb(mongoUri)
  await ensureAdminSeed()
  const app = createApp()
  app.listen(port, () => console.log(`API listening on :${port}`))
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})

