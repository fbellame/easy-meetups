'use client'

import { useRouter } from 'next/navigation'

interface DeleteEventButtonProps {
  eventId: string
}

export default function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events?id=${eventId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete event')
        }

        // Redirect to events list after successful deletion
        router.push('/events')
        router.refresh()
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Please try again.')
      }
    }
  }

  return (
    <button
      className="block w-full text-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
      onClick={handleDelete}
    >
      Delete Event
    </button>
  )
}
