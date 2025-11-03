import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuthForAPI } from '@/lib/auth'

type RangeKey = 'all' | '90d' | '12m'

function getRangeDates(range: RangeKey): { from?: string; to: string } {
  const to = new Date()
  if (range === 'all') return { to: to.toISOString() }
  const from = new Date()
  if (range === '90d') {
    from.setDate(from.getDate() - 90)
  } else if (range === '12m') {
    from.setMonth(from.getMonth() - 12)
  }
  return { from: from.toISOString(), to: to.toISOString() }
}

export const revalidate = 60

export async function GET(request: Request) {
  try {
    await requireAuthForAPI()
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const rangeParam = (searchParams.get('range') as RangeKey) || '12m'
    const topN = parseInt(searchParams.get('limit') || '5', 10)
    const { from, to } = getRangeDates(rangeParam)

    // Members by city (all-time)
    const { data: members, error: membersError } = await supabase
      .from('community_members')
      .select('city')
    if (membersError) throw membersError
    const memberCityCounts = new Map<string, number>()
    for (const row of (members as any[])) {
      const city = (row.city || 'Unknown') as string
      memberCityCounts.set(city, (memberCityCounts.get(city) || 0) + 1)
    }
    const topMemberCities = Array.from(memberCityCounts.entries())
      .map(([city, members]) => ({ city, members }))
      .sort((a, b) => b.members - a.members)
      .slice(0, topN)

    // Attendees by city in range
    let attendeesQuery = supabase
      .from('org_attendance_facts_v')
      .select('member_city, member_id')
    if (from) attendeesQuery = attendeesQuery.gte('attended_at', from)
    attendeesQuery = attendeesQuery.lte('attended_at', to)
    const { data: attendees, error: attendeesError } = await attendeesQuery
    if (attendeesError) throw attendeesError
    const byCity = new Map<string, Set<string>>()
    for (const row of (attendees as any[])) {
      const city = (row.member_city || 'Unknown') as string
      if (!byCity.has(city)) byCity.set(city, new Set<string>())
      byCity.get(city)!.add(row.member_id)
    }
    const topAttendeeCities = Array.from(byCity.entries())
      .map(([city, set]) => ({ city, attendees: set.size }))
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, topN)

    return NextResponse.json({ range: rangeParam, topMemberCities, topAttendeeCities })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


