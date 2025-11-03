type CityRow = { city: string; members?: number; attendees?: number }

export function TopCitiesTable({
  memberCities,
  attendeeCities,
}: {
  memberCities: CityRow[]
  attendeeCities: CityRow[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border rounded bg-white">
        <div className="px-4 py-3 border-b font-medium text-gray-900">Top Cities by Members</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 bg-gray-50">
              <th className="px-4 py-2 font-semibold">City</th>
              <th className="px-4 py-2 font-semibold">Members</th>
            </tr>
          </thead>
          <tbody>
            {memberCities.map((r) => (
              <tr key={`m-${r.city}`} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-900">{r.city}</td>
                <td className="px-4 py-2 text-gray-900">{r.members ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border rounded bg-white">
        <div className="px-4 py-3 border-b font-medium text-gray-900">Top Cities by Attendees</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 bg-gray-50">
              <th className="px-4 py-2 font-semibold">City</th>
              <th className="px-4 py-2 font-semibold">Attendees</th>
            </tr>
          </thead>
          <tbody>
            {attendeeCities.map((r) => (
              <tr key={`a-${r.city}`} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-900">{r.city}</td>
                <td className="px-4 py-2 text-gray-900">{r.attendees ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


