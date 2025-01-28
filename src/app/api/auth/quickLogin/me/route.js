import ResponseModel from "@/models/ResponseModel";
import { cookies } from "next/headers";

export async function GET(req) {
  try {

      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;

      console.log('222 COOKIESTORE', cookieStore);
      console.log('THE TOKEN', token);

      if(!token){
          return new Response(JSON.stringify(new ResponseModel(401, 'Not Authorized')), {
              headers: {
                  'Content-Type': 'application/json',
                  "Access-Control-Allow-Origin": "http://localhost:3000",
                  "Access-Control-Allow-Credentials": "true"
              }
          })
      }
      console.log('GET RESPONSE TOKEN: ', token);
      return new Response(JSON.stringify(new ResponseModel(200, 'Token')), {
          headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": "http://localhost:3000",
              "Access-Control-Allow-Credentials": "true"
          }
      });

  }   catch (error){
      console.log('error res token:', error);
  }
}