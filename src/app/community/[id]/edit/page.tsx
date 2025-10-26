import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getCommunityMember } from '@/lib/database'
import CommunityMemberForm from '@/components/CommunityMemberForm'

interface EditCommunityMemberPageProps {
  params: {
    id: string
  }
}

export default async function EditCommunityMemberPage({ params }: EditCommunityMemberPageProps) {
  // Require authentication to access this page
  await requireAuth()
  
  const member = await getCommunityMember(params.id)
  
  if (!member) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Community Member</h1>
        <p className="mt-2 text-gray-600">Update {member.name}'s information</p>
      </div>

      <CommunityMemberForm 
        initialData={{
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone || undefined,
          company: member.company || undefined,
          interests: member.interests || []
        }}
        isEditing={true}
      />
    </div>
  )
}
