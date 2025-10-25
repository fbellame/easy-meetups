import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { requireAuth } from '@/lib/auth'
import { getAnnouncements } from '@/lib/database'
import AnnouncementsList from '@/components/AnnouncementsList'

export default async function AnnouncementsPage() {
  // Require authentication to access announcements page
  await requireAuth()
  
  // Fetch real data from Supabase
  const announcements = await getAnnouncements()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-2 text-gray-600">Manage your event communications</p>
        </div>
        <Link
          href="/announcements/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Announcement
        </Link>
      </div>

      <AnnouncementsList announcements={announcements} />
    </div>
  )
}
