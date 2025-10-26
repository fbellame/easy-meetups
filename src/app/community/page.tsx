import { requireAuth } from '@/lib/auth'
import { getCommunityMembers } from '@/lib/database'
import CommunityPageClient from '@/components/CommunityPageClient'

export default async function CommunityPage() {
  // Require authentication to access community page
  await requireAuth()
  
  // Fetch real data from Supabase
  const members = await getCommunityMembers()

  return <CommunityPageClient members={members} />
}

