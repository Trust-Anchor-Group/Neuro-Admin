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
            name: 'access-token',
            value: JSON.stringify(jwt),
            httpOnly: true,
            path: '/',
            sameSite: true
        });

        return new Response(JSON.stringify(new ResponseModel(200, 'Callback recieved')), {
            headers: {
                'Set-Cookie': cookieStore,
                'Content-Type': 'application/json'
            }
        });

    } catch (error){
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)));
    }
}