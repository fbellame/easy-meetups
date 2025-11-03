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

    // Pull joined_month for members and aggregate in-memory
    let query = supabase
      .from('org_member_facts_v')
      .select('joined_month')
    if (from) query = query.gte('joined_at', from)
    query = query.lte('joined_at', to)

    const { data, error } = await query
    if (error) throw error

    const monthly = new Map<string, number>()
    for (const row of (data as any[])) {
      const month = row.joined_month
      monthly.set(month, (monthly.get(month) || 0) + 1)
    }
    const series = Array.from(monthly.entries())
      .map(([month, new_members]) => ({ month, new_members }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    // Compute cumulative
    let running = 0
    const cumulative = series.map((p) => {
      running += p.new_members
      return { month: p.month, cumulative_members: running, new_members: p.new_members }
    })

    return NextResponse.json({ range: rangeParam, series: cumulative })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


