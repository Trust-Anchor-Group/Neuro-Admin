import { NextResponse } from "next/server";


export async function pendingAction(userId,clickedState){
    console.log("User ID:", userId);  // Ensure this is correct and being passed
    console.log("Clicked State:", clickedState); 
    try {
        const res = await fetch(`/api/legalIdStatus`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials:'include',
            body: JSON.stringify({
              id: userId,
              state: clickedState,
            }),
          });

          const data = await res.json()
          console.log(data)
     
          return NextResponse.json({messsage:data.message},{status:data.stateCode})

    } catch (error) {
        throw new Error(`Could not post fetch state ${error}`)
    }
    
}