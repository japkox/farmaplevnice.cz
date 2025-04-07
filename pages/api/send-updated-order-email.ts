import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metoda není podporována' })
  }

  const { to, orderId, newStatus } = req.body

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: `Objednávka č. ${orderId} byla aktualizována`,
      html: `Vaše objednávka č. <strong>${orderId}</strong> byla aktualizována.<br>
        Nový status objednávky: <strong>${newStatus}</strong><br>
      `,
    })

    return res.status(200).json({ success: true, data: response })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error })
  }
}
