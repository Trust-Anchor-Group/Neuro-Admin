export default function LegalIdButton() {

    const handleFetch = async () => {
        console.log('Fetching legal identities');
        try {
            const response = await fetch(`http://localhost:3000/api/mockdata/legalIdentities`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if(!response.ok){
                console.error('Response not ok ', response.statusText);
            }

            const responseData = await response.json();

            console.log('Response Data:', responseData);
        } catch (err) {
            console.error('Fetch error', err);
        }
    }

    return <button onClick={() => handleFetch()}>Fetch legal identities</button>
}
