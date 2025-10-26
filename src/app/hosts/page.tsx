import Link from 'next/link'
import { PlusIcon, ArrowDownTrayIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
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
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Hosts</h1>
              <p className="mt-2 text-lg text-gray-600">Manage your event hosts and venues</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <a
              href="/api/hosts/export"
              className="inline-flex items-center px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export CSV
            </a>
            <Link
              href="/hosts/new"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Host
            </Link>
          </div>
        </div>
      </div>

      <HostsList hosts={hosts} />
    </div>
  )
}
