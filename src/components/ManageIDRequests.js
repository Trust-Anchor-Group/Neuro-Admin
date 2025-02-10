"use server";

export default function ManageIDRequests() { 

  // Hämtar data från ett test-API (JSONPlaceholder)
  async function fetch() {
    fetch("http://localhost:3000/api/requests")
      .then((res) => res.json())
      .then((data) =>
        setRequests(data.map(user => ({
          id: user.id,
          user: user.name,
          requestedDate: "2025-01-30", // Fake datum
          accessLevel: "Admin" // Fake access level
        })))
    
      )}
    

  // Uppdaterar status (Simulerad PUT-förfrågan)
  const updateStatus = (id, status) => {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).then(() => {
      setRequests(requests.filter(req => req.id !== id));
      setStatusMessage(`✅ Request ${id} marked as ${status}`);
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Manage ID Requests</h1>
      {statusMessage && <p className="text-green-600 text-center mb-2">{statusMessage}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-lg">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="p-3">User Name</th>
              <th className="p-3">Requested Date</th>
              <th className="p-3">Access Level</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-100 border-b">
                <td className="p-3">{req.user}</td>
                <td className="p-3">{req.requestedDate}</td>
                <td className="p-3">{req.accessLevel}</td>
                <td className="p-3">
                  <button  
                    className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-green-700 transition">
                    ✅ Approve
                  </button>
                  <button  
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    ❌ Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
