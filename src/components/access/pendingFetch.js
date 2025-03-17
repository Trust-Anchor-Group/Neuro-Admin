

export async function pendingAction(userId,clickedState){
    console.log("User ID:", userId);  // Ensure this is correct and being passed
    console.log("Clicked State:", clickedState); 
    try {
        const res = await fetch(`http://localhost:3000/api/legalIdStatus`, {
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
          if(res.status === 200){
            
          }

    } catch (error) {
        throw new Error(`Could not post fetch state ${error}`)
    }
    
}