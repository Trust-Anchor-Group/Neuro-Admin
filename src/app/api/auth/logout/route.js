import { cookies } from 'next/headers';
import ResponseModel from "@/models/ResponseModel";

export async function GET(){

    const cookieStore = await cookies();
    cookieStore.delete('token');

    return new Response(JSON.stringify(new ResponseModel(200, 'Logout successfull')), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'token=; max-age=0; Path=/;'
        }
    });

}