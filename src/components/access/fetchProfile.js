import config from '@/config/config';
import { cookies } from 'next/headers'


   export async function fetchProfile(id) {
      try {
        const clientCookies = await cookies();
         
          const url = `${config.protocol}://${config.origin}/api/legalIdentity`;
          const res = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Cookie':clientCookies.toString()
              },
              cache:'no-store',
              credentials: 'include',
              body: JSON.stringify({  legalIdentity: id })
          })
          
          if (!res.ok) {
              const errorText = await res.text()
              console.error('Fetch error details:', errorText)
              throw new Error('Failed to fetch user')
          }
          
          let data = await res.json()
          console.log('DATA',data)

          return data

      } catch (error) {
          console.error('Error fetching user:', error)

      } 
  }
