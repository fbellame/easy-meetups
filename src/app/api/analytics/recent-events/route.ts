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
    const rangeParam = (searchParams.get('range') as RangeKey) || '90d'
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const { from, to } = getRangeDates(rangeParam)

    // Get recent events in range
    let eventsQuery = supabase
      .from('events')
      .select('id, title, event_date')
      .order('event_date', { ascending: false })
    if (from) eventsQuery = eventsQuery.gte('event_date', from)
    eventsQuery = eventsQuery.lte('event_date', to)
    eventsQuery = eventsQuery.limit(limit)
    const { data: events, error: eventsError } = await eventsQuery
    if (eventsError) throw eventsError

    const eventIds = (events || []).map((e: any) => e.id)
    if (eventIds.length === 0) return NextResponse.json({ range: rangeParam, events: [] })

    // Fetch attendance rows for these events
    const { data: attendance, error: attendanceError } = await supabase
      .from('org_attendance_facts_v')
      .select('event_id, member_id')
      .in('event_id', eventIds)
    if (attendanceError) throw attendanceError

    const counts = new Map<string, Set<string>>()
    for (const row of (attendance as any[])) {
      if (!counts.has(row.event_id)) counts.set(row.event_id, new Set<string>())
      counts.get(row.event_id)!.add(row.member_id)
    }

    const enriched = (events as any[]).map((e) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      attendees: (counts.get(e.id)?.size || 0),
    }))

    return NextResponse.json({ range: rangeParam, events: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


