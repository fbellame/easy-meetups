import { requireAuth } from '@/lib/auth'
import { getHost } from '@/lib/database'
import HostForm from '@/components/HostForm'
import { notFound } from 'next/navigation'

interface EditHostPageProps {
  params: {
    id: string
  }
}

export default async function EditHostPage({ params }: EditHostPageProps) {
  // Require authentication to access this page
  await requireAuth()

  const host = await getHost(params.id)
  
  if (!host) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Host</h1>
        <p className="mt-2 text-gray-600">
          Update host information and preferences
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
          capacity: host.capacity || 0,
          amenities: host.amenities || [],
          preferences: host.preferences || {}
        }}
        isEditing={true}
      />
    </div>
  )
}
