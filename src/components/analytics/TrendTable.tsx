type Point = { month: string; attendees?: number; events?: number; new_members?: number; cumulative_members?: number }

export function TrendTable({ title, series, columns }: { title: string; series: Point[]; columns: { key: keyof Point; label: string }[] }) {
  return (
    <div className="border rounded bg-white">
      <div className="px-4 py-3 border-b font-medium text-gray-900">{title}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-700 bg-gray-50">
            <th className="px-4 py-2 font-semibold">Month</th>
            {columns.map((c) => (
              <th key={c.key as string} className="px-4 py-2 font-semibold">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.month} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-900">{new Date(p.month).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</td>
              {columns.map((c) => (
                <td key={c.key as string} className="px-4 py-2 text-gray-900">{(p[c.key] as number) ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


