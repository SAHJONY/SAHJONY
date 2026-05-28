'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TopNav } from '@/components/layout/top-nav'
import { Sidebar } from '@/components/layout/sidebar'

// Routes that don't require authentication
const publicRoutes = ['/landing', '/pricing']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Check if current route is public (exact match)
  const isPublicRoute = publicRoutes.includes(pathname || '')

  useEffect(() => {
    // If supabase is null, skip auth check (for demo/development)
    if (!supabase) {
      setLoading(false)
      return
    }

    // Skip auth check for public routes
    if (isPublicRoute) {
      setLoading(false)
      return
    }

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
        }
      } catch (e) {
        console.error('Auth error:', e)
        router.push('/login')
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase, isPublicRoute])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <TopNav />
      <div className="flex">
        <Sidebar agents={[]} />
        <main className="flex-1 p-6 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}