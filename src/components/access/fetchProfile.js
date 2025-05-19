import config from '@/config/config';
import { cookies } from 'next/headers'


   export async function fetchProfile(id) {
      try {
        const clientCookies = await cookies();
            const { host } = config.api.agent;

            const urlAccount = `https://${host}/account.ws`;
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
          
          const userName = await data.data.account

          const payload={
            'userName':userName
          }
                console.log('PAYLOAD',payload)
          
                
        const response = await fetch(urlAccount, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookies ,
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        const dataResponse = await response.json()
 
  

        const password = dataResponse.account.password
        data = {...data,password}
        console.log('Data',data)
          return data

      } catch (error) {
          console.error('Error fetching user:', error)

      } 
  }
