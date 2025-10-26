import { getUser } from '@/lib/auth'
import HostForm from '@/components/HostForm'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

export default async function NewHostPage() {
  // Check authentication but don't redirect
  const user = await getUser()

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-purple-600 p-3 rounded-lg shadow-sm">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Host</h1>
            <p className="mt-2 text-lg text-gray-600">
              Create a new host profile with company contact and venue information for GenAI Montreal
            </p>
          </div>
        </div>
      </div>

      <HostForm />
    </div>
  )
}
