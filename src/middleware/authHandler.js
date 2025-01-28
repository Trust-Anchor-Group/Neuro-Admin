"use server";

import { cookies } from 'next/headers';

const cookieName = 'access-token';

export const loginHandler = async (data) => {
    console.log('Login Handler fired...', data);

    const sessionId = data.sessionId;

    console.log('the session id is...', sessionId);

    if(sessionId){

    }


    const jwt = {
        message: "Hello World!"
    };

    const cookieStore = await cookies();
    cookieStore.set({
        name: cookieName,
        value: JSON.stringify(jwt),
        httpOnly: true,
        path: '/',
        sameSite: true
    });

}