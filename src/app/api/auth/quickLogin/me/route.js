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
       status: 200,
       headers: { "Content-Type": "application/json" },
    });
  }  catch (error) {
    console.log('error res token:', error);
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      return new Response(JSON.stringify(new ResponseModel(statusCode, message)),{
              status: statusCode,
              headers: {
                  "Content-Type": "application/json"
              }
          }
      );
  }
}