import { getUser } from '@/lib/auth'
import { getCommunityMembers, getCommunityMembersCount } from '@/lib/database'
import CommunityPageClient from '@/components/CommunityPageClient'

interface CommunityPageProps {
  searchParams: {
    page?: string
  }
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  // Check authentication but don't redirect
  const user = await getUser()
  
  // Get pagination parameters
  const page = parseInt(searchParams.page || '1', 10)
  const limit = 100
  const offset = (page - 1) * limit
  
  // Fetch real data from Supabase with pagination
  const [members, totalCount] = await Promise.all([
    getCommunityMembers(limit, offset),
    getCommunityMembersCount()
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <CommunityPageClient 
      members={members} 
      user={user} 
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  )
}

