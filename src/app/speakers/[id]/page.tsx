import Link from 'next/link'
import { getSpeaker } from '@/lib/database'
import { notFound } from 'next/navigation'
import { 
  UserIcon, 
  EnvelopeIcon, 
  MicrophoneIcon,
  TagIcon,
  LinkIcon,
  CalendarIcon,
  PencilIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface SpeakerDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SpeakerDetailPage({ params }: SpeakerDetailPageProps) {
  // Await the params Promise
  const { id } = await params

  // Fetch speaker data
  const speaker = await getSpeaker(id)

  if (!speaker) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/speakers"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Speakers
          </Link>
        </div>
        <Link
          href={`/speakers/${speaker.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Speaker
        </Link>
      </div>

      {/* Speaker Information */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{speaker.name}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                {speaker.email}
              </div>
              <div className="mt-4">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {speaker.bio && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MicrophoneIcon className="h-5 w-5 mr-2" />
            Bio
          </h2>
          <p className="text-gray-700 leading-relaxed">{speaker.bio}</p>
        </div>
      )}

      {/* Expertise */}
      {speaker.expertise && speaker.expertise.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TagIcon className="h-5 w-5 mr-2" />
            Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {speaker.expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {speaker.social_links && Object.keys(speaker.social_links).length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            Social Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(speaker.social_links).map(([platform, url]) => (
              <div key={platform} className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-20 capitalize">
                  {platform}:
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm truncate"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {speaker.availability && Object.keys(speaker.availability).length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Availability & Preferences
          </h2>
          <div className="space-y-4">
            {speaker.availability.time_preferences && speaker.availability.time_preferences.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Times:</h3>
                <div className="flex flex-wrap gap-2">
                  {speaker.availability.time_preferences.map((time: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {speaker.availability.travel_willingness && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Travel Willingness:</h3>
                <span className="text-sm text-gray-600">{speaker.availability.travel_willingness}</span>
              </div>
            )}
            
            {speaker.availability.virtual_events !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Virtual Events:</h3>
                <span className="text-sm text-gray-600">
                  {speaker.availability.virtual_events ? 'Available' : 'Not available'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
