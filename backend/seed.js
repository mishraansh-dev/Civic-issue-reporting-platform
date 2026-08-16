/**
 * seed.js — Creates the authority account in the database.
 *
 * Run: npm run seed
 *
 * The public signup API CANNOT create authority accounts (role is hardcoded
 * to "user"). This script is the ONLY way to create an authority account.
 *
 * ⚠️  Change the password before deploying to production!
 */

require('dotenv').config()
const connectDB = require('./config/db')
const User = require('./models/User')

const AUTHORITY_EMAIL = 'authority@civic.gov'
const AUTHORITY_PASSWORD = 'Authority@123'

const seed = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Starting seed...\n')

    const existing = await User.findOne({ email: AUTHORITY_EMAIL })
    if (existing) {
      console.log('⚠️  Authority user already exists — skipping creation.\n')
      console.log(`   📧 Email:    ${AUTHORITY_EMAIL}`)
      console.log(`   🔑 Password: ${AUTHORITY_PASSWORD}\n`)
      process.exit(0)
    }

    // ⚠️  This bypasses the API signup route (which only creates "user" role)
    await User.create({
      email: AUTHORITY_EMAIL,
      password: AUTHORITY_PASSWORD, // pre-save hook will bcrypt-hash this
      role: 'authority',
    })

    console.log('✅ Seed complete!\n')
    console.log('📋 Authority account:')
    console.log(`   📧 Email:    ${AUTHORITY_EMAIL}`)
    console.log(`   🔑 Password: ${AUTHORITY_PASSWORD}`)
    console.log('\n⚠️  Change this password before going to production!\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
