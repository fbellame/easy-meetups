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
    const { from, to } = getRangeDates(rangeParam)

    let query = supabase
      .from('org_attendance_facts_v')
      .select('event_month, member_id, event_id')
    if (from) query = query.gte('attended_at', from)
    query = query.lte('attended_at', to)

    const { data, error } = await query
    if (error) throw error

    // Aggregate on server since Supabase JS lacks group by on client
    const byMonth = new Map<string, { attendees: Set<string>; events: Set<string> }>()
    for (const row of (data as any[])) {
      const month = row.event_month
      if (!byMonth.has(month)) byMonth.set(month, { attendees: new Set(), events: new Set() })
      const entry = byMonth.get(month)!
      if (row.member_id) entry.attendees.add(row.member_id)
      if (row.event_id) entry.events.add(row.event_id)
    }

    const series = Array.from(byMonth.entries())
      .map(([month, v]) => ({ month, attendees: v.attendees.size, events: v.events.size }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    return NextResponse.json({ range: rangeParam, series })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


