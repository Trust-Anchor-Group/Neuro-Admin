'use server'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function navigateToDetail(userId,routeHref){
    //You set the user ID as a cookie so that it can be retrieved later
    
    if(!userId){
        throw new Error('User ID is required')
    }

    (await cookies()).set('selectedUserId',userId,{httpOnly:true,secure:true})

    redirect(routeHref)

}