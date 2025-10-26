import Link from 'next/link'

export default function TestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Test Page</h1>
      <p className="text-gray-600">This is a simple test page to verify routing works.</p>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
        <div className="space-y-2">
          <Link href="/" className="block text-blue-600 hover:text-blue-800">Dashboard</Link>
          <Link href="/events" className="block text-blue-600 hover:text-blue-800">Events (requires auth)</Link>
          <Link href="/events/public" className="block text-blue-600 hover:text-blue-800">Events (public)</Link>
          <Link href="/events/test" className="block text-blue-600 hover:text-blue-800">Events Test</Link>
          <Link href="/events/debug" className="block text-blue-600 hover:text-blue-800">Events Debug</Link>
          <Link href="/events/new" className="block text-blue-600 hover:text-blue-800">Create Event</Link>
          <Link href="/hosts" className="block text-blue-600 hover:text-blue-800">Hosts</Link>
          <Link href="/speakers" className="block text-blue-600 hover:text-blue-800">Speakers</Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Status</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Server should be running on port 3001</li>
          <li>✅ Events system implemented</li>
          <li>✅ Host and speaker integration</li>
          <li>⚠️ Authentication required for main events page</li>
        </ul>
      </div>
    </div>
  )
}
