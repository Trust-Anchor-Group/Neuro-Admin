import ResponseModel from "@/models/ResponseModel";

export async function GET(req) {
  try {
      const responseToken = req.headers.get('Cookie');
      if(!responseToken){
          return new Response(JSON.stringify(new ResponseModel(401, 'Not Authorized')))
      }
      console.log('GET RESPONSE TOKEN: ', responseToken);
      return new Response(JSON.stringify(new ResponseModel(200, 'Token')), { headers: {'Content-Type': 'application/json'}});

  }   catch (error){
      console.log('error res token:', error);
  }
}