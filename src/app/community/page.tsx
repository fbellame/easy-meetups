import { getUser } from '@/lib/auth'
import { getCommunityMembers } from '@/lib/database'
import CommunityPageClient from '@/components/CommunityPageClient'

export default async function CommunityPage() {
  // Check authentication but don't redirect
  const user = await getUser()
  
  // Fetch real data from Supabase
  const members = await getCommunityMembers()

  return <CommunityPageClient members={members} user={user} />
}

