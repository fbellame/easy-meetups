import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { KpiGrid } from '@/components/analytics/KpiGrid'
import { TimeRangePicker } from '@/components/analytics/TimeRangePicker'
import { TopCitiesTable } from '@/components/analytics/TopCitiesTable'
import { RecentEventsTable } from '@/components/analytics/RecentEventsTable'
import { TrendTable } from '@/components/analytics/TrendTable'

export const revalidate = 60

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

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ range?: string }> | { range?: string } 
}) {
  // Align auth handling with Speakers page: read user but do not redirect (middleware protects route)
  await getUser()
  
  // Next.js 16: searchParams is a Promise, need to unwrap it
  const resolvedParams = searchParams instanceof Promise 
    ? await searchParams 
    : (searchParams || {})
  const range = (resolvedParams.range as 'all' | '90d' | '12m') || 'all'

  // Call Supabase directly (same pattern as Speakers page - no API route calls needed)
  const supabase = await createClient()
  const { from, to } = getRangeDates(range)
  const trendRange = range === 'all' ? '12m' : range
  const { from: trendFrom, to: trendTo } = getRangeDates(trendRange)

  // Get KPIs from Edge Function (works and returns HTTP 200)
  let kpis: any
  try {
    const { data, error } = await supabase.functions.invoke('analytics-kpis', {
      body: { range },
    })
    if (error || !data) throw error || new Error('No data from Edge Function')
    kpis = data
  } catch (error: any) {
    console.error('Edge Function error, computing locally:', error?.message)
    // Fallback: compute KPIs directly
    const { count: totalMembers } = await supabase.from('community_members').select('*', { count: 'exact', head: true })
    let eventsQuery = supabase.from('events').select('*', { count: 'exact', head: true })
    if (from) eventsQuery = eventsQuery.gte('event_date', from)
    const { count: totalEvents } = await eventsQuery.lte('event_date', to)
    let attendeesQuery = supabase.from('org_attendance_facts_v').select('member_id', { count: 'exact', head: true })
    if (from) attendeesQuery = attendeesQuery.gte('attended_at', from)
    const { count: attendeesDistinct } = await attendeesQuery.lte('attended_at', to)
    let attendanceRowsQuery = supabase.from('org_attendance_facts_v').select('*', { count: 'exact', head: true })
    if (from) attendanceRowsQuery = attendanceRowsQuery.gte('attended_at', from)
    const { count: totalAttendanceRows } = await attendanceRowsQuery.lte('attended_at', to)
    const activeMembers = attendeesDistinct || 0
    kpis = {
      totals: { members: totalMembers || 0, events: totalEvents || 0, attendanceRows: totalAttendanceRows || 0 },
      activeMembers,
      pctMembersAttended: totalMembers ? (activeMembers / totalMembers) * 100 : 0,
      avgAttendancePerEvent: totalEvents ? (Number(totalAttendanceRows || 0) / totalEvents) : 0,
    }
  }

  // Get attendance trend data directly from Supabase
  let attendanceTrendQuery = supabase.from('org_attendance_facts_v').select('event_month, member_id, event_id')
  if (trendFrom) attendanceTrendQuery = attendanceTrendQuery.gte('attended_at', trendFrom)
  const { data: attendanceData } = await attendanceTrendQuery.lte('attended_at', trendTo)
  const byMonth = new Map<string, { attendees: Set<string>; events: Set<string> }>()
  for (const row of (attendanceData || [])) {
    const month = row.event_month
    if (!byMonth.has(month)) byMonth.set(month, { attendees: new Set(), events: new Set() })
    const entry = byMonth.get(month)!
    if (row.member_id) entry.attendees.add(row.member_id)
    if (row.event_id) entry.events.add(row.event_id)
  }
  const attendanceTrend = {
    range: trendRange,
    series: Array.from(byMonth.entries())
      .map(([month, v]) => ({ month, attendees: v.attendees.size, events: v.events.size }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }

  // Get member growth data directly from Supabase
  let memberGrowthQuery = supabase.from('org_member_facts_v').select('joined_month')
  if (trendFrom) memberGrowthQuery = memberGrowthQuery.gte('joined_at', trendFrom)
  const { data: memberData } = await memberGrowthQuery.lte('joined_at', trendTo)
  const monthly = new Map<string, number>()
  for (const row of (memberData || [])) {
    const month = row.joined_month
    monthly.set(month, (monthly.get(month) || 0) + 1)
  }
  const memberSeries = Array.from(monthly.entries())
    .map(([month, new_members]) => ({ month, new_members }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  let running = 0
  const memberGrowth = {
    range: trendRange,
    series: memberSeries.map((p) => {
      running += p.new_members
      return { month: p.month, cumulative_members: running, new_members: p.new_members }
    })
  }

  // Get top cities data directly from Supabase
  const { data: members } = await supabase.from('community_members').select('city')
  const memberCityCounts = new Map<string, number>()
  for (const row of (members || [])) {
    const city = (row.city || 'Unknown') as string
    memberCityCounts.set(city, (memberCityCounts.get(city) || 0) + 1)
  }
  const topMemberCities = Array.from(memberCityCounts.entries())
    .map(([city, members]) => ({ city, members }))
    .sort((a, b) => b.members - a.members)
    .slice(0, 5)

  let attendeesCityQuery = supabase.from('org_attendance_facts_v').select('member_city, member_id')
  if (from) attendeesCityQuery = attendeesCityQuery.gte('attended_at', from)
  const { data: attendeesData } = await attendeesCityQuery.lte('attended_at', to)
  const byCity = new Map<string, Set<string>>()
  for (const row of (attendeesData || [])) {
    const city = (row.member_city || 'Unknown') as string
    if (!byCity.has(city)) byCity.set(city, new Set<string>())
    byCity.get(city)!.add(row.member_id)
  }
  const topAttendeeCities = Array.from(byCity.entries())
    .map(([city, set]) => ({ city, attendees: set.size }))
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 5)

  const topCities = { topMemberCities, topAttendeeCities }

  // Get recent events directly from Supabase
  let eventsQuery = supabase.from('events').select('id, title, event_date').order('event_date', { ascending: false })
  if (from) eventsQuery = eventsQuery.gte('event_date', from)
  const { data: events } = await eventsQuery.lte('event_date', to).limit(10)
  const eventIds = (events || []).map((e: any) => e.id)
  let attendanceEventsQuery = supabase.from('org_attendance_facts_v').select('event_id, member_id')
  if (eventIds.length > 0) {
    attendanceEventsQuery = attendanceEventsQuery.in('event_id', eventIds)
  }
  const { data: attendanceEvents } = await attendanceEventsQuery
  const counts = new Map<string, Set<string>>()
  for (const row of (attendanceEvents || [])) {
    if (!counts.has(row.event_id)) counts.set(row.event_id, new Set<string>())
    counts.get(row.event_id)!.add(row.member_id)
  }
  const recentEvents = {
    range,
    events: (events || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      attendees: (counts.get(e.id)?.size || 0),
    }))
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Organization Dashboard</h1>
        {/* client-side range picker pushes URL param */}
        <TimeRangePicker initialRange={range} />
      </div>

      <KpiGrid
        items={[
          { label: 'Total Members', value: kpis.totals.members },
          { label: 'Total Events', value: kpis.totals.events },
          { label: 'Active Members', value: kpis.activeMembers },
          { label: '% Members Attended', value: kpis.pctMembersAttended, format: 'percent' },
          { label: 'Avg Attendance / Event', value: kpis.avgAttendancePerEvent, format: 'number' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendTable title="Attendance Trend" series={attendanceTrend.series} columns={[{ key: 'attendees', label: 'Attendees' }, { key: 'events', label: 'Events' }]} />
        <TrendTable title="Member Growth" series={memberGrowth.series} columns={[{ key: 'new_members', label: 'New Members' }, { key: 'cumulative_members', label: 'Cumulative' }]} />
      </div>

      <TopCitiesTable memberCities={topCities.topMemberCities} attendeeCities={topCities.topAttendeeCities} />

      <RecentEventsTable events={recentEvents.events} />
    </div>
  )
}


