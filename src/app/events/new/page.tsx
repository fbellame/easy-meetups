import EventFormServer from '@/components/EventFormServer'

export default async function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-gray-600">Set up a new meetup event with hosts and speakers</p>
      </div>

      <EventFormServer />
    </div>
  )
}
