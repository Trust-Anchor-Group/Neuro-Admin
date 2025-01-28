import ResponseModel from "@/models/ResponseModel";
import {cookies} from "next/headers";
import {jwtSign} from "@/utils/jwt";


export async function POST(request) {
    try {
        const response = await request.json();
        const {SessionId, Id} = response;

        const payload = {
            SessionId,
            Id
        }

        const jwt = jwtSign(payload, {expiresIn: '1h'})

        const cookieStore = await cookies();
            cookieStore.set({
                name: "access-token",
                value: jwt, 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production", 
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                path: "/", 
                maxAge: 3600,
                });


            console.log('SET CALLBACK COOKIESTORE: ', cookieStore);

        return new Response(JSON.stringify(new ResponseModel(200, 'Callback recieved')), {
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error){
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(
      JSON.stringify({ message, statusCode }),
      { status: statusCode, headers: { "Content-Type": "application/json" } }
    );
    }
}
