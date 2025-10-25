import SpeakerForm from '@/components/SpeakerForm'

export default async function NewSpeakerPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Speaker</h1>
        <p className="mt-2 text-gray-600">Add a new speaker to your community</p>
      </div>

      <SpeakerForm />
    </div>
  )
}
