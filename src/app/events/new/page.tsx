import EventFormServer from '@/components/EventFormServer'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'

export default async function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-xl border border-orange-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-orange-600 p-3 rounded-lg shadow-sm">
              <CalendarDaysIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Create New Event</h1>
            <p className="mt-2 text-lg text-gray-600">Set up a new GenAI Montreal meetup event with hosts and speakers</p>
          </div>
        </div>
      </div>

      <EventFormServer />
    </div>
  )
}
