"use server"; 

export async function fetchRequests() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();

  return users.map(user => ({
    id: user.id,
    user: user.name,
    requestedDate: "2025-01-30",
    accessLevel: "Admin"
  }));
}

export async function updateRequestStatus(formData) {
  const id = formData.get("id");
  const status = formData.get("status");

  console.log(`Updating request ${id} to status: ${status}`);

  // Simulating a database update (Replace this with actual DB logic)
  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true, message: `Request ${id} updated to ${status}` };
}
