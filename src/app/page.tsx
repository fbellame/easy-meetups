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
  BuildingOfficeIcon,
  HomeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

// LinkedIn Icon Component
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

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
        const [eventsResult, hostsResult, speakersResult, membersResult] = await Promise.all([
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('hosts').select('*'),
          supabase.from('speakers').select('*'),
          supabase.from('community_members').select('*')
        ])

        const events = eventsResult.data || []
        const hosts = hostsResult.data || []
        const speakers = speakersResult.data || []
        const members = membersResult.data || []

        // Calculate real stats
        setStatsData({
          totalEvents: events.length,
          totalHosts: hosts.length,
          totalSpeakers: speakers.length,
          totalMembers: members.length
        })

        // Get recent events (last 3) with host information and speaker counts
        const recentEventsData = await Promise.all(
          events.slice(0, 3).map(async (event: any) => {
            const host = hosts.find((h: any) => h.id === event.host_id)
            
            // Get speaker count for this event
            const { count: speakerCount } = await supabase
              .from('event_speakers')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id)
            
            return {
              id: event.id,
              title: event.title,
              date: event.event_date,
              host: host?.name || 'TBD',
              speakers: speakerCount || 0,
              registrations: 0, // We don't have registrations table yet
              status: event.status
            }
          })
        )
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
    { name: 'All Events', value: statsData.totalEvents.toString(), icon: CalendarDaysIcon, href: '/events', color: 'orange' },
    { name: 'Active Hosts', value: statsData.totalHosts.toString(), icon: BuildingOfficeIcon, href: '/hosts', color: 'purple' },
    { name: 'Speakers', value: statsData.totalSpeakers.toString(), icon: MicrophoneIcon, href: '/speakers', color: 'green' },
    { name: 'Community Members', value: statsData.totalMembers.toString(), icon: UsersIcon, href: '/community', color: 'blue' },
  ]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src="/genai-mtl.jpeg"
                    alt="GenAI Montreal"
                    width={48}
                    height={48}
                    className="rounded object-contain"
                    unoptimized={true}
                  />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-lg text-gray-600">Welcome to GenAI Montreal's meetup management platform</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <a
              href="https://www.linkedin.com/company/genai-montreal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <LinkedInIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Follow on LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const colorClasses = {
            blue: {
              bg: 'bg-blue-50',
              bgHover: 'group-hover:bg-blue-100',
              text: 'text-blue-600',
              border: 'border-blue-200',
              borderHover: 'hover:border-blue-300'
            },
            green: {
              bg: 'bg-green-50',
              bgHover: 'group-hover:bg-green-100',
              text: 'text-green-600',
              border: 'border-green-200',
              borderHover: 'hover:border-green-300'
            },
            purple: {
              bg: 'bg-purple-50',
              bgHover: 'group-hover:bg-purple-100',
              text: 'text-purple-600',
              border: 'border-purple-200',
              borderHover: 'hover:border-purple-300'
            },
            orange: {
              bg: 'bg-orange-50',
              bgHover: 'group-hover:bg-orange-100',
              text: 'text-orange-600',
              border: 'border-orange-200',
              borderHover: 'hover:border-orange-300'
            }
          }
          
          const colors = colorClasses[stat.color as keyof typeof colorClasses]
          
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className={`bg-white p-6 rounded-xl shadow-sm border ${colors.border} hover:shadow-lg hover:scale-105 transition-all duration-200 group ${colors.borderHover}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${colors.bg} p-3 rounded-lg ${colors.bgHover} transition-colors`}>
                    <stat.icon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            </div>
            <Link 
              href="/events" 
              className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline"
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
                        ? 'bg-orange-100 text-orange-800'
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
              <div className="bg-orange-100 p-4 rounded-lg mx-auto w-fit mb-4">
                <CalendarDaysIcon className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
              <div className="mt-6">
                <Link
                  href="/events/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Create Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Add Everything Loop - Multiple Add Buttons */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Quick Add Everything</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/events/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 hover:scale-105 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-orange-100 p-3 rounded-lg mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <CalendarDaysIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-orange-600">Create Event</h3>
              <p className="text-sm text-gray-600">Meetup</p>
            </div>
          </Link>
          
          <Link
            href="/hosts/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 hover:scale-105 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-lg mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-purple-600">Add Host</h3>
              <p className="text-sm text-gray-600">Venue</p>
            </div>
          </Link>
          
          <Link
            href="/speakers/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 hover:scale-105 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-lg mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                <MicrophoneIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-green-600">Add Speaker</h3>
              <p className="text-sm text-gray-600">Expert</p>
            </div>
          </Link>
          
          <Link
            href="/community/new"
            className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:scale-105 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-lg mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Add Member</h3>
              <p className="text-sm text-gray-600">Community</p>
            </div>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Click any button above to quickly add new content</p>
      </div>
    </div>
  )
}