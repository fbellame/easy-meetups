import { notFound } from 'next/navigation'
import { getEvent, getEventSpeakers } from '@/lib/database'
import EventFormServer from '@/components/EventFormServer'

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await getEvent(params.id)
  
  if (!event) {
    notFound()
  }

  // Get selected speakers for this event
  const eventSpeakers = await getEventSpeakers(params.id)
  const selectedSpeakerIds = eventSpeakers.map(es => es.speaker_id)

  // Convert event data to form format
  const initialData = {
    id: event.id,
    title: event.title,
    description: event.description || '',
    host_id: event.host_id || '',
    venue_name: event.venue_name || '',
    venue_address: event.venue_address || '',
    event_date: event.event_date,
    start_time: event.start_time || '',
    end_time: event.end_time || '',
    max_capacity: event.max_capacity?.toString() || '',
    registration_deadline: event.registration_deadline || '',
    status: event.status,
    meetup_url: event.meetup_url || '',
    luma_url: event.luma_url || '',
    linkedin_url: event.linkedin_url || '',
    selected_speakers: selectedSpeakerIds
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-2 text-gray-600">Update event details, hosts, and speakers</p>
      </div>

      <EventFormServer initialData={initialData} isEditing={true} />
    </div>
  )
}
