import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getSpeakers } from '@/lib/database'
import SpeakersList from '@/components/SpeakersList'

export default async function SpeakersPage() {
  // Fetch real data from Supabase
  const speakers = await getSpeakers()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speakers</h1>
          <p className="mt-2 text-gray-600">Manage your event speakers and their expertise</p>
        </div>
        <Link
          href="/speakers/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Speaker
        </Link>
      </div>

      <SpeakersList speakers={speakers} />
    </div>
  )
}
