import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getHost } from '@/lib/database'
import { notFound } from 'next/navigation'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface HostDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function HostDetailPage({ params }: HostDetailPageProps) {
  // Check authentication but don't redirect
  const user = await getUser()

  const { id } = await params
  const host = await getHost(id)
  
  if (!host) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{host.name}</h1>
          <p className="mt-2 text-gray-600">Host Profile Details</p>
        </div>
        <Link
          href={`/hosts/${host.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Host
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{host.email}</span>
              </div>
              {host.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{host.phone}</span>
                </div>
              )}
              {host.company && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{host.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Venue Information */}
          {(host.venue_name || host.venue_address) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Information</h3>
              <div className="space-y-4">
                {host.venue_name && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">{host.venue_name}</div>
                      {host.venue_address && (
                        <div className="text-gray-600 mt-1">{host.venue_address}</div>
                      )}
                    </div>
                  </div>
                )}
                {host.capacity && (
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Capacity: {host.capacity} people</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities */}
          {host.amenities && host.amenities.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {host.amenities.map((amenity, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {host.preferences && Object.keys(host.preferences).length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Event Preferences</h3>
              <div className="space-y-4">
                {host.preferences.tech_stack && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Tech Stack</h4>
                    <p className="text-gray-900">{host.preferences.tech_stack}</p>
                  </div>
                )}
                {host.preferences.event_types && host.preferences.event_types.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Event Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {host.preferences.event_types.map((type, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {host.preferences.time_preferences && host.preferences.time_preferences.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Times</h4>
                    <div className="flex flex-wrap gap-2">
                      {host.preferences.time_preferences.map((time, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/hosts/${host.id}/edit`}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Host
              </Link>
              <Link
                href="/events/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Create Event
              </Link>
            </div>
          </div>

          {/* Host Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Host Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">
                  {new Date(host.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">
                  {new Date(host.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
