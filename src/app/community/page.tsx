import { getUser } from '@/lib/auth'
import { getCommunityMembers, getCommunityMembersCount } from '@/lib/database'
import CommunityPageClient from '@/components/CommunityPageClient'

interface CommunityPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
  }>
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  // Check authentication but don't redirect
  const user = await getUser()
  
  // Await searchParams as it's now a Promise in Next.js 15+
  const resolvedSearchParams = await searchParams
  
  // Get pagination and search parameters
  const page = parseInt(resolvedSearchParams.page || '1', 10)
  const searchTerm = resolvedSearchParams.search || ''
  const filterStatus = resolvedSearchParams.status || 'all'
  const limit = 100
  const offset = (page - 1) * limit
  
  // Fetch real data from Supabase with pagination and search
  const [members, totalCount] = await Promise.all([
    getCommunityMembers(limit, offset, searchTerm, filterStatus),
    getCommunityMembersCount(searchTerm, filterStatus)
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <CommunityPageClient 
      members={members} 
      user={user} 
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      searchTerm={searchTerm}
      filterStatus={filterStatus}
    />
  )
}

