/*
import { NextResponse, NextRequest} from "next/server";
import {loginHandler} from "@/middleware/authHandler";

const routeHandlers = {
    '/api/auth/quickLogin/initiate': ''//loginHandler,
}

export async function middleware(request) {

    const pathName = request.nextUrl.pathname;
    const data =  await request.json();

    for(const route in routeHandlers){
        if(pathName.startsWith(route)){
            return routeHandlers[route](data);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/auth/quickLogin/initiate']
};*/
