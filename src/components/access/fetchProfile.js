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
          
          const data = await res.json()
         
          console.log('NEW ID PROFILE',data)
          console.log('GET EMAIL',data?.properties?.EMAIL)

          const attachments = data.attachments && data.attachments.length > 0 ? data.attachments[0].data : null;

        //   const filteredData = {
        //     account:data.account,
        //     email:data.properties?.EMAIL,
        //     phone:data.properties.PHONE,
        //     firstName:data.properties.FIRST,
        //     lastName:data.properties.LAST,
        //     PNR:data.properties.PNR,
        //     country:data.properties.COUNTRY,
        //     attachments:attachments
        //   }

        //   console.log('Data Filtered ProilePage',filteredData)

          return data

      } catch (error) {
          console.error('Error fetching user:', error)

      } 
  }
