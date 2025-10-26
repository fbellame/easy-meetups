import { getUser } from '@/lib/auth'
import CommunityMemberForm from '@/components/CommunityMemberForm'
import { UsersIcon } from '@heroicons/react/24/outline'

export default async function NewCommunityMemberPage() {
  // Check authentication but don't redirect
  const user = await getUser()

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-blue-600 p-3 rounded-lg shadow-sm">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Community Member</h1>
            <p className="mt-2 text-lg text-gray-600">Add a new member to your GenAI Montreal community</p>
            {!user && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> You're not signed in. Some features may be limited. 
                  <a href="/auth/login" className="ml-1 text-blue-600 hover:text-blue-800 underline">
                    Sign in here
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CommunityMemberForm />
    </div>
  )
}
