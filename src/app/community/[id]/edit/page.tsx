import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import { getCommunityMember } from '@/lib/database'
import CommunityMemberForm from '@/components/CommunityMemberForm'

interface EditCommunityMemberPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCommunityMemberPage({ params }: EditCommunityMemberPageProps) {
  // Await the params Promise
  const { id } = await params
  
  const member = await getCommunityMember(id)
  
  if (!member) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/community"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Community
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Community Member</h1>
            <p className="text-gray-600">Update {member.name}'s information</p>
          </div>
        </div>
      </div>

      <CommunityMemberForm 
        initialData={{
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone || undefined,
          company: member.company || undefined,
          city: member.city || undefined,
          bio: member.bio || undefined,
          meetup_url: member.meetup_url || undefined,
          linkedin_url: member.linkedin_url || undefined,
          twitter_url: member.twitter_url || undefined,
          github_url: member.github_url || undefined,
          website_url: member.website_url || undefined,
          interests: member.interests || []
        }}
        isEditing={true}
      />
    </div>
  )
}
