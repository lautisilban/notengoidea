import type React from "react"

interface ResultsTableProps {
  data: any[]
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (data.length === 0) return null

  const headers = Object.keys(data[0])

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              {headers.map((header) => (
                <td key={`${index}-${header}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-b">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResultsTable

