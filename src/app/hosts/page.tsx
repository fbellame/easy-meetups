import Link from 'next/link'
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { getUser } from '@/lib/auth'
import { getHosts } from '@/lib/database'
import HostsList from '@/components/HostsList'

export default async function HostsPage() {
  // Check authentication but don't redirect
  const user = await getUser()
  
  // Fetch real data from Supabase
  const hosts = await getHosts()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hosts</h1>
          <p className="mt-2 text-gray-600">Manage your event hosts and venues</p>
        </div>
        <div className="flex space-x-3">
          <a
            href="/api/hosts/export"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </a>
          <Link
            href="/hosts/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Host
          </Link>
        </div>
      </div>

      <HostsList hosts={hosts} />
    </div>
  )
}
