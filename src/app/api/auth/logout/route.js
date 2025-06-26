import { NextResponse } from 'next/server';
import config from '@/config/config';

export async function GET() {

    const { protocol, origin } = config;
    const nextRes = NextResponse.redirect(new URL('/', ));

    nextRes.cookies.set('HttpSessionID', "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0),
    });

    return nextRes;
}