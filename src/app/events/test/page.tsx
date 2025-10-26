import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function EventsTestPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Test Page</h1>
          <p className="mt-2 text-gray-600">This is a test page without authentication</p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation Test</h3>
        <div className="space-y-2">
          <Link href="/events" className="block text-blue-600 hover:text-blue-800">Go to Main Events Page</Link>
          <Link href="/events/new" className="block text-blue-600 hover:text-blue-800">Go to Create Event Page</Link>
          <Link href="/" className="block text-blue-600 hover:text-blue-800">Go to Dashboard</Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Events</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Event 1</h3>
              <p className="text-gray-600 text-sm mb-4">This is a sample event for testing purposes.</p>
              <div className="flex space-x-2">
                <Link
                  href="/events/1"
                  className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href="/events/1/edit"
                  className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
