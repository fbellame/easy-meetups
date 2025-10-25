import { requireAuth } from '@/lib/auth'
import HostForm from '@/components/HostForm'

export default async function NewHostPage() {
  // Require authentication to access this page
  await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Host</h1>
        <p className="mt-2 text-gray-600">
          Create a new host profile with venue and preference information
        </p>
      </div>

      <HostForm />
    </div>
  )
}
