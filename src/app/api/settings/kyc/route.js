import ResponseModel from "@/models/ResponseModel";
import AgentAPI from "agent-api"; 

export async function GET() {
  try {
    console.log("🚀 Fetching KYC Settings using AgentAPI.Legal.GetApplicationAttributes");

    const data = await AgentAPI.Legal.GetApplicationAttributes();

    console.log("✅ KYC Settings Fetched:", data);

    return new Response(
      JSON.stringify(new ResponseModel(200, "Successfully fetched KYC settings", data)),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching KYC settings:", error);
    return new Response(
      JSON.stringify(new ResponseModel(500, error.message || "Internal Server Error")),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
