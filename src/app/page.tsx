'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  MicrophoneIcon,
  MegaphoneIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Mock data for now since we're client-side
  const statsData = {
    totalEvents: 12,
    totalHosts: 8,
    totalSpeakers: 24,
    totalMembers: 156
  }
  
  const events = []

  const stats = [
    { name: 'Upcoming Events', value: statsData.totalEvents.toString(), icon: CalendarDaysIcon, href: '/events' },
    { name: 'Active Hosts', value: statsData.totalHosts.toString(), icon: UserGroupIcon, href: '/hosts' },
    { name: 'Speakers', value: statsData.totalSpeakers.toString(), icon: MicrophoneIcon, href: '/speakers' },
    { name: 'Community Members', value: statsData.totalMembers.toString(), icon: UserGroupIcon, href: '/community' },
  ]

  // Get recent events (last 3)
  const recentEvents = events.slice(0, 3).map(event => ({
    id: event.id,
    title: event.title,
    date: event.event_date,
    host: 'TBD', // You'll need to join with hosts table
    speakers: 0, // You'll need to join with speakers table
    registrations: 0, // You'll need to join with registrations table
    status: event.status
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your meetup management platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            <Link 
              href="/events" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y">
          {recentEvents.map((event) => (
            <div key={event.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()} • {event.host}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{event.speakers} speakers</span>
                  <span>{event.registrations} registrations</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/events/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create Event</h3>
              <p className="text-sm text-gray-600">Plan a new meetup</p>
            </div>
          </Link>
          
          <Link
            href="/hosts/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Add Host</h3>
              <p className="text-sm text-gray-600">Register a new host</p>
            </div>
          </Link>
          
          <Link
            href="/speakers/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MicrophoneIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Add Speaker</h3>
              <p className="text-sm text-gray-600">Register a new speaker</p>
            </div>
          </Link>
          
          <Link
            href="/announcements/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MegaphoneIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create Announcement</h3>
              <p className="text-sm text-gray-600">Send updates to community</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}