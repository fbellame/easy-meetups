import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getEvents } from '@/lib/database'
import EventsList from '@/components/EventsList'

export default async function PublicEventsPage() {
  // This version doesn't require authentication
  const events = await getEvents()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events (Public Access)</h1>
          <p className="mt-2 text-gray-600">Manage your meetup events - No authentication required</p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      <EventsList events={events} />
    </div>
  )
}
