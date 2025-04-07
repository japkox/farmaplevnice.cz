import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metoda není podporována' })
  }

  const { from, subject, content} = req.body
  
  try {

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESEND_TO_EMAIL,
      subject: `Nová zpráva v systému`,
      html: `
        <h4>Do systému byla zadána nová zpráva!</h4>

        <p>Email: <strong>${from}</strong></p>
        <p>Předmět: <strong>${subject}</strong></p>
        <p>Obsah: <strong>${content}</strong></p>
      `,
    })

    return res.status(200).json({ success: true, data: response })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error })
  }
}
