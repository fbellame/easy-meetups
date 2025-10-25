'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  UserGroupIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import type { Event } from '@/types/database'

const statusColors = {
  planned: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800'
}

interface EventsListProps {
  events: Event[]
}

export default function EventsList({ events }: EventsListProps) {
  const [filter, setFilter] = useState('all')

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.status === filter
  )

  return (
    <>
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'planned', label: 'Planned' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status as keyof typeof statusColors]}`}>
                  {event.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  {new Date(event.event_date).toLocaleDateString()} at {event.start_time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {event.venue_name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {event.max_capacity ? `0/${event.max_capacity} registered` : 'No capacity limit'}
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/events/${event.id}`}
                  className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'Get started by creating your first event.'
              : `No ${filter} events found.`
            }
          </p>
          <div className="mt-6">
            <Link
              href="/events/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
