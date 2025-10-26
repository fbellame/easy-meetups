import SpeakerForm from '@/components/SpeakerForm'
import { MicrophoneIcon } from '@heroicons/react/24/outline'

export default async function NewSpeakerPage() {

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-green-600 p-3 rounded-lg shadow-sm">
              <MicrophoneIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Speaker</h1>
            <p className="mt-2 text-lg text-gray-600">Add a new speaker to your GenAI Montreal community</p>
          </div>
        </div>
      </div>

      <SpeakerForm />
    </div>
  )
}
