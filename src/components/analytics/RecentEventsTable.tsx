type EventRow = { id: string; title: string; event_date: string; attendees: number }

export function RecentEventsTable({ events }: { events: EventRow[] }) {
  return (
    <div className="border rounded bg-white">
      <div className="px-4 py-3 border-b font-medium text-gray-900">Recent Events</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-700 bg-gray-50">
            <th className="px-4 py-2 font-semibold">Date</th>
            <th className="px-4 py-2 font-semibold">Title</th>
            <th className="px-4 py-2 font-semibold">Attendees</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-900">{new Date(e.event_date).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-gray-900">{e.title}</td>
              <td className="px-4 py-2 text-gray-900">{e.attendees}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


