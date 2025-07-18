"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function PendingApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
   
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const pathnameWithFilter = `${pathname}?${params}`
  const router = useRouter()

function handleNavigate(id) {
  const encodedRef = encodeURIComponent(pathnameWithFilter);
  router.push(`/neuro-access/detailpage/${id}?ref=${encodedRef}&tab=identity`);
}


  useEffect(() => {
    async function fetchPendingApplications() {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      try {
        const requestBody = {
          offset: 0,
          maxCount: 10,
          state: "Created",
           filter: {}, 
        };

        const response = await fetch("/api/legal-identities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pending applications");
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data.data)) {
          throw new Error("Invalid data format received");
        }

        // Extract relevant data & keep the last 6
        const formattedApps = data.data.slice(0, 6).map((app) => ({
          id: app.id,
          name: app.name || "Unknown User",
          submittedAt: `${app.createdDate} ${app.createdTime}`, // Combining date and time
          status: app.state,
        }));

        setApplications(formattedApps);
      } catch (error) {
        console.error("Error fetching pending applications:", error);
      } finally {
        setLoading(false);
        isFetchingRef.current = false
      }
    }

    fetchPendingApplications();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Pending Applications</h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500 text-center">No pending applications.</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {applications.map((app) => (
            <li onClick={() => handleNavigate(app.id)} key={app.id} className="py-4 flex cursor-pointer justify-between items-center hover:bg-gray-100 p-3 rounded-lg transition-all">
              <div>
                <p className="text-gray-800 font-semibold">{app.name}</p>
                <p className="text-gray-500 text-sm">{app.submittedAt}</p>
              </div>
              <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm shadow-md">
                {app.status}
              </span>
            </li>
          ))}
        </ul>
      )}      
    </div>
  );
}
