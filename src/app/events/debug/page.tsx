import { getUser } from '@/lib/auth'
import { getEvents } from '@/lib/database'

export default async function EventsDebugPage() {
  // Check authentication without redirecting
  const user = await getUser()
  const events = await getEvents()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events Debug</h1>
        <p className="mt-2 text-gray-600">Debug information for events page</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication Status</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify({
            isAuthenticated: !!user,
            userId: user?.id || 'Not authenticated',
            email: user?.email || 'Not authenticated'
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Events Data</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(events, null, 2)}
        </pre>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation Test</h3>
        <div className="space-y-2">
          <a href="/events" className="block text-blue-600 hover:text-blue-800">Go to Events Page</a>
          <a href="/events/new" className="block text-blue-600 hover:text-blue-800">Go to Create Event Page</a>
          <a href="/" className="block text-blue-600 hover:text-blue-800">Go to Dashboard</a>
        </div>
      </div>
    </div>
  )
}
