import { NextResponse } from 'next/server'

// Server-side admin credentials - these are NEVER exposed to the client
// Set these environment variables in Vercel (not NEXT_PUBLIC_ prefix)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request: Request) {
  // Fail securely if env vars not configured
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Admin authentication not configured - missing environment variables')
    return NextResponse.json({ 
      success: false, 
      message: 'Server misconfigured' 
    }, { status: 500 })
  }

  try {
    const { email, password } = await request.json()

    // Validate credentials server-side
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Return success - in production, you might want to return a token
      return NextResponse.json({ 
        success: true, 
        message: 'Admin authenticated successfully' 
      })
    }

    // Invalid credentials
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid admin credentials' 
    }, { status: 401 })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication error' 
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Admin API is running'
  })
}