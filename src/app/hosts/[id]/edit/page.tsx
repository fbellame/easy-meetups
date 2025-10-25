import { getUser } from '@/lib/auth'
import { getHost } from '@/lib/database'
import HostForm from '@/components/HostForm'
import { notFound } from 'next/navigation'

interface EditHostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditHostPage({ params }: EditHostPageProps) {
  // Check authentication but don't redirect
  const user = await getUser()

  const { id } = await params
  const host = await getHost(id)
  
  if (!host) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Host</h1>
        <p className="mt-2 text-gray-600">
          Update company contact information and preferences
        </p>
      </div>

      <HostForm 
        initialData={{
          id: host.id,
          name: host.name,
          email: host.email,
          phone: host.phone || '',
          company: host.company || '',
          venue_name: host.venue_name || '',
          venue_address: host.venue_address || '',
          capacity: host.capacity?.toString() || '0',
          amenities: host.amenities || [],
          preferences: {
            tech_stack: host.preferences?.tech_stack || '',
            event_types: host.preferences?.event_types || [],
            time_preferences: host.preferences?.time_preferences || []
          }
        }}
        isEditing={true}
      />
    </div>
  )
}
