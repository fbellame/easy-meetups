import { getSpeaker } from '@/lib/database'
import SpeakerForm from '@/components/SpeakerForm'
import { notFound } from 'next/navigation'

interface EditSpeakerPageProps {
  params: {
    id: string
  }
}

export default async function EditSpeakerPage({ params }: EditSpeakerPageProps) {

  // Fetch speaker data
  const speaker = await getSpeaker(params.id)

  if (!speaker) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Speaker</h1>
        <p className="mt-2 text-gray-600">Update speaker information</p>
      </div>

      <SpeakerForm 
        initialData={speaker} 
        isEditing={true} 
      />
    </div>
  )
}
