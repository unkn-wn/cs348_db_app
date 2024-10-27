import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {

  const dummyData = [
    { id: 1, name: "Cookout", type: "Food", date: "2023-07-01" },
    { id: 2, name: "Concert", type: "Music", date: "2023-07-15" },
    { id: 3, name: "Art Gallery", type: "Art", date: "2023-08-01" },
  ]

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col gap-12 px-4 py-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Main View</h1>

          {/* Table for SQL */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4 text-left">Event Name</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map((event) => (
                  <tr key={event.id} className="border-b">
                    <td className="p-4">{event.name}</td>
                    <td className="p-4">{event.type}</td>
                    <td className="p-4">{event.date}</td>
                  </tr>
                )
                )}
              </tbody>
            </table>

          </div>

        </div>
      </main>
    </HydrateClient>
  );
}
