type KpiItem = {
  label: string
  value: number
  format?: 'number' | 'percent'
}

function formatValue(value: number, format: KpiItem['format']) {
  if (format === 'percent') return `${(value).toFixed(1)}%`
  if (format === 'number') return new Intl.NumberFormat().format(value)
  return new Intl.NumberFormat().format(value)
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded border p-4 bg-white">
          <div className="text-sm text-gray-700 font-medium">{item.label}</div>
          <div className="text-2xl font-semibold text-gray-900">
            {formatValue(item.value, item.format)}
          </div>
        </div>
      ))}
    </div>
  )
}


