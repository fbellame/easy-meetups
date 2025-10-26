import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, TagIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { requireAuth } from '@/lib/auth'
import { getCommunityMember } from '@/lib/database'
import DeleteCommunityMemberButton from '@/components/DeleteCommunityMemberButton'

interface CommunityMemberPageProps {
  params: {
    id: string
  }
}

export default async function CommunityMemberPage({ params }: CommunityMemberPageProps) {
  // Require authentication to access this page
  await requireAuth()
  
  const member = await getCommunityMember(params.id)
  
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
        <div className="flex space-x-3">
          <Link
            href={`/community/${member.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Member
          </Link>
          <DeleteCommunityMemberButton memberId={member.id} memberName={member.name} />
        </div>
      </div>

      {/* Member Details */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-blue-600">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-600">{member.email}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                
                {member.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{member.phone}</p>
                    </div>
                  </div>
                )}
                
                {member.company && (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Company</p>
                      <p className="text-sm text-gray-600">{member.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Community Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Community Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Join Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(member.join_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Active</p>
                    <p className="text-sm text-gray-600">
                      {member.last_active 
                        ? new Date(member.last_active).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          {member.interests && member.interests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {member.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
