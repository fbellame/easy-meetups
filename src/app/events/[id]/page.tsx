import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  UserGroupIcon,
  MicrophoneIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { requireAuth } from '@/lib/auth'
import { getEventWithDetails } from '@/lib/database'
import type { EventWithDetails } from '@/types/database'

const statusColors = {
  planned: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800'
}

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventWithDetails(params.id)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="mt-2 text-gray-600">{event.description}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/events/${event.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Event
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[event.status as keyof typeof statusColors]}`}>
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date & Time */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Date & Time</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <CalendarDaysIcon className="h-5 w-5 mr-3" />
                <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              {event.start_time && (
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-3" />
                  <span>
                    {event.start_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </span>
                </div>
              )}
              {event.registration_deadline && (
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-3" />
                  <span>Registration deadline: {new Date(event.registration_deadline).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Venue Information */}
          {(event.venue_name || event.venue_address) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Venue</h3>
              <div className="space-y-2">
                {event.venue_name && (
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{event.venue_name}</span>
                  </div>
                )}
                {event.venue_address && (
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3 mt-0.5" />
                    <span>{event.venue_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Capacity */}
          {event.max_capacity && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity</h3>
              <div className="flex items-center text-gray-600">
                <UserGroupIcon className="h-5 w-5 mr-3" />
                <span>Maximum {event.max_capacity} attendees</span>
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Speakers</h3>
              <div className="space-y-4">
                {event.speakers.map((eventSpeaker, index) => (
                  <div key={eventSpeaker.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{eventSpeaker.speaker.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{eventSpeaker.speaker.bio}</p>
                      {eventSpeaker.speaker.expertise && eventSpeaker.speaker.expertise.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {eventSpeaker.speaker.expertise.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Host Information */}
          {event.host && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Host</h3>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">{event.host.name}</h4>
                {event.host.company && (
                  <p className="text-sm text-gray-600">{event.host.company}</p>
                )}
                <p className="text-sm text-gray-600">{event.host.email}</p>
                {event.host.venue_name && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Venue</p>
                    <p className="text-sm text-gray-600">{event.host.venue_name}</p>
                    {event.host.venue_address && (
                      <p className="text-sm text-gray-600">{event.host.venue_address}</p>
                    )}
                    {event.host.capacity && (
                      <p className="text-sm text-gray-600">Capacity: {event.host.capacity}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Links */}
          {(event.meetup_url || event.luma_url || event.linkedin_url) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Event Links</h3>
              <div className="space-y-3">
                {event.meetup_url && (
                  <a
                    href={event.meetup_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View on Meetup →
                  </a>
                )}
                {event.luma_url && (
                  <a
                    href={event.luma_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View on Luma →
                  </a>
                )}
                {event.linkedin_url && (
                  <a
                    href={event.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View on LinkedIn →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Event Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/events/${event.id}/edit`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Event
              </Link>
              <button
                className="block w-full text-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this event?')) {
                    // TODO: Implement delete functionality
                    console.log('Delete event:', event.id)
                  }
                }}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
