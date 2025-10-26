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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    totalEvents: 0,
    totalHosts: 0,
    totalSpeakers: 0,
    totalMembers: 0
  })
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Fetch real data from database
        const [eventsResult, hostsResult, speakersResult] = await Promise.all([
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('hosts').select('*'),
          supabase.from('speakers').select('*')
        ])

        const events = eventsResult.data || []
        const hosts = hostsResult.data || []
        const speakers = speakersResult.data || []

        // Calculate real stats
        setStatsData({
          totalEvents: events.length,
          totalHosts: hosts.length,
          totalSpeakers: speakers.length,
          totalMembers: 0 // We don't have a members table yet
        })

        // Get recent events (last 3) with host information
        const recentEventsData = events.slice(0, 3).map((event: any) => {
          const host = hosts.find((h: any) => h.id === event.host_id)
          return {
            id: event.id,
            title: event.title,
            date: event.event_date,
            host: host?.name || 'TBD',
            speakers: 0, // We'll need to join with event_speakers table for this
            registrations: 0, // We don't have registrations table yet
            status: event.status
          }
        })
        setRecentEvents(recentEventsData)
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    
    checkUserAndFetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const stats = [
    { name: 'All Events', value: statsData.totalEvents.toString(), icon: CalendarDaysIcon, href: '/events' },
    { name: 'Active Hosts', value: statsData.totalHosts.toString(), icon: UserGroupIcon, href: '/hosts' },
    { name: 'Speakers', value: statsData.totalSpeakers.toString(), icon: MicrophoneIcon, href: '/speakers' },
    { name: 'Community Members', value: statsData.totalMembers.toString(), icon: UserGroupIcon, href: '/community' },
  ]

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
          {recentEvents.length > 0 ? (
            recentEvents.map((event: any) => (
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
                        : event.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
              <div className="mt-6">
                <Link
                  href="/events/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Add Everything Loop - Multiple Add Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Everything</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/community/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-center">
              <UserGroupIcon className="h-8 w-8 text-blue-400 group-hover:text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Add Member</h3>
              <p className="text-sm text-gray-600">Community</p>
            </div>
          </Link>
          
          <Link
            href="/speakers/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <div className="text-center">
              <MicrophoneIcon className="h-8 w-8 text-green-400 group-hover:text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-green-600">Add Speaker</h3>
              <p className="text-sm text-gray-600">Expert</p>
            </div>
          </Link>
          
          <Link
            href="/hosts/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <div className="text-center">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-purple-600">Add Host</h3>
              <p className="text-sm text-gray-600">Venue</p>
            </div>
          </Link>
          
          <Link
            href="/events/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <div className="text-center">
              <CalendarDaysIcon className="h-8 w-8 text-orange-400 group-hover:text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 group-hover:text-orange-600">Create Event</h3>
              <p className="text-sm text-gray-600">Meetup</p>
            </div>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Click any button above to quickly add new content</p>
      </div>
    </div>
  )
}