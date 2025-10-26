import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  MicrophoneIcon,
  MegaphoneIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export default async function Dashboard() {
  const user = await getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view the dashboard</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

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
  const statsData = {
    totalEvents: events.length,
    totalHosts: hosts.length,
    totalSpeakers: speakers.length,
    totalMembers: 0 // We don't have a members table yet
  }

  const stats = [
    { name: 'All Events', value: statsData.totalEvents.toString(), icon: CalendarDaysIcon, href: '/events' },
    { name: 'Active Hosts', value: statsData.totalHosts.toString(), icon: UserGroupIcon, href: '/hosts' },
    { name: 'Speakers', value: statsData.totalSpeakers.toString(), icon: MicrophoneIcon, href: '/speakers' },
    { name: 'Community Members', value: statsData.totalMembers.toString(), icon: UserGroupIcon, href: '/community' },
  ]

  // Get recent events (last 3) with host information
  const recentEvents = events.slice(0, 3).map((event: any) => {
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