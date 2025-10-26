import EventFormClient from './EventFormClient'
import { getHosts, getSpeakers } from '@/lib/database'
import type { Host, Speaker } from '@/types/database'

interface EventFormServerProps {
  initialData?: any
  isEditing?: boolean
}

export default async function EventFormServer({ initialData, isEditing = false }: EventFormServerProps) {
  // Load hosts and speakers server-side
  const [hosts, speakers] = await Promise.all([
    getHosts(),
    getSpeakers()
  ])

  return (
    <EventFormClient 
      initialData={initialData}
      isEditing={isEditing}
      hosts={hosts}
      speakers={speakers}
    />
  )
}
