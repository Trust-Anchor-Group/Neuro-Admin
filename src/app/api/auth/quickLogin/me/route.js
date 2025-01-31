import ResponseModel from "@/models/ResponseModel";
import { cookies } from "next/headers";
import { jwtVerify } from "@/utils/jwt";
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access-token")?.value;

    if (!token) {
      return new Response(JSON.stringify(new ResponseModel(401, 'Unauthorized')), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    const decoded = jwtVerify(token, process.env.JWT_SECRET);
    console.log('GET DECODED TOKEN: ', decoded);
    console.log('GET RESPONSE TOKEN: ', token);
   return new Response(JSON.stringify({ identity: decoded }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }  catch (error) {
    console.log('error res token:', error);
    return new Response(JSON.stringify(new ResponseModel(500, 'Internal Server Error')), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}