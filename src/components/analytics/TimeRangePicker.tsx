"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type RangeKey = 'all' | '90d' | '12m'

export function TimeRangePicker({ initialRange }: { initialRange: RangeKey }) {
  const router = useRouter()
  const params = useSearchParams()
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as RangeKey
      const next = new URLSearchParams(params.toString())
      next.set('range', value)
      router.push(`/dashboard?${next.toString()}`)
    },
    [params, router]
  )

  return (
    <select
      className="border rounded px-3 py-2 text-sm"
      defaultValue={initialRange}
      onChange={onChange}
    >
      <option value="all">All time</option>
      <option value="90d">Last 90 days</option>
      <option value="12m">Last 12 months</option>
    </select>
  )
}


