import Link from 'next/link'
import { PlusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { getUser } from '@/lib/auth'
import { getEvents } from '@/lib/database'
import EventsList from '@/components/EventsList'

export default async function EventsPage() {
  // Check authentication but don't redirect
  const user = await getUser()
  const events = await getEvents()

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-xl border border-orange-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-orange-600 p-3 rounded-xl shadow-lg">
                <CalendarDaysIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Events</h1>
              <p className="mt-2 text-lg text-gray-600">Manage your meetup events</p>
              {!user && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> You're not signed in. Some features may be limited. 
                    <Link href="/auth/login" className="ml-1 text-orange-600 hover:text-orange-800 underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/events/new"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Event
          </Link>
        </div>
      </div>

      <EventsList events={events} />
    </div>
  )
}
