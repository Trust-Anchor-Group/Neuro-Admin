export async function POST(request) {
  const { to_email, name, title, message } = await request.json()

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://localhost',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email,
          name,
          title,
          message,
        },
      }),
    })

    const text = await response.text()

    if (!response.ok) {
      throw new Error(text || 'Unknown EmailJS error')
    }

    return new Response(JSON.stringify({ success: true, message: text }), { status: 200 })
  } catch (error) {
    console.error('EmailJS error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 })
  }
}
