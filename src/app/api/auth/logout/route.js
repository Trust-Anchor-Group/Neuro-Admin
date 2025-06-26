import { NextResponse } from 'next/server';

export async function GET() {
    const response = NextResponse.redirect('/');

    response.cookies.set('HttpSessionID', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0), 
    });

    return response;
}
