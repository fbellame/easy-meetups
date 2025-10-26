import Link from 'next/link'
import { PlusIcon, ArrowDownTrayIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { getSpeakers } from '@/lib/database'
import SpeakersList from '@/components/SpeakersList'

export default async function SpeakersPage() {
  // Fetch real data from Supabase
  const speakers = await getSpeakers()

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-green-600 p-3 rounded-xl shadow-lg">
                <MicrophoneIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Speakers</h1>
              <p className="mt-2 text-lg text-gray-600">Manage your event speakers and their expertise</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <a
              href="/api/speakers/export"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              download
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export CSV
            </a>
            <Link
              href="/speakers/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Speaker
            </Link>
          </div>
        </div>
      </div>

      <SpeakersList speakers={speakers} />
    </div>
  )
}
