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
    const rangeParam = (searchParams.get('range') as RangeKey) || 'all'
    const { from, to } = getRangeDates(rangeParam)

    // Total members (all-time)
    const { count: totalMembers, error: totalMembersError } = await supabase
      .from('community_members')
      .select('*', { count: 'exact', head: true })

    if (totalMembersError) throw totalMembersError

    // Total events (respect range if provided)
    let eventsQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
    if (from) eventsQuery = eventsQuery.gte('event_date', from)
    eventsQuery = eventsQuery.lte('event_date', to)
    const { count: totalEvents, error: totalEventsError } = await eventsQuery
    if (totalEventsError) throw totalEventsError

    // Distinct attendees in range from attendance facts
    let attendeesQuery = supabase
      .from('org_attendance_facts_v')
      .select('member_id', { count: 'exact', head: true })
    if (from) attendeesQuery = attendeesQuery.gte('attended_at', from)
    attendeesQuery = attendeesQuery.lte('attended_at', to)
    const { count: attendeesDistinct, error: attendeesError } = await attendeesQuery
    if (attendeesError) throw attendeesError

    // Total attendance rows in range for avg per event
    let attendanceRowsQuery = supabase
      .from('org_attendance_facts_v')
      .select('*', { count: 'exact', head: true })
    if (from) attendanceRowsQuery = attendanceRowsQuery.gte('attended_at', from)
    attendanceRowsQuery = attendanceRowsQuery.lte('attended_at', to)
    const { count: totalAttendanceRows, error: attendanceRowsError } = await attendanceRowsQuery
    if (attendanceRowsError) throw attendanceRowsError

    const activeMembers = attendeesDistinct || 0
    const pctMembersAttended = totalMembers
      ? (activeMembers / totalMembers) * 100
      : 0
    const avgAttendancePerEvent = totalEvents
      ? (Number(totalAttendanceRows || 0) / totalEvents)
      : 0

    return NextResponse.json({
      range: rangeParam,
      totals: {
        members: totalMembers || 0,
        events: totalEvents || 0,
        attendanceRows: totalAttendanceRows || 0,
      },
      activeMembers,
      pctMembersAttended,
      avgAttendancePerEvent,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


