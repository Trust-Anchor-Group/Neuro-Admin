import config from '@/config/config';
export default function LegalIdButton() {
  const handleFetch = async () => {
    try {
      const { protocol, origin } = config;
      const url = `${protocol}://${origin}/api/mockdata/legalIdentities`;

      const handleFetch = async () => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });


      if (!response.ok) {
        console.error('Response not ok ', response.statusText);
      }

      const responseData = await response.json();

      console.log('Response Data:', responseData);
    } catch (err) {
      console.error('Fetch error', err);
    }
  };

  return <button onClick={() => handleFetch()}>Fetch legal identities</button>;
}
