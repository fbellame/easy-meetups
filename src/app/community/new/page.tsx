import { requireAuth } from '@/lib/auth'
import CommunityMemberForm from '@/components/CommunityMemberForm'

export default async function NewCommunityMemberPage() {
  // Require authentication to access this page
  await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Community Member</h1>
        <p className="mt-2 text-gray-600">Add a new member to your community</p>
      </div>

      <CommunityMemberForm />
    </div>
  )
}
