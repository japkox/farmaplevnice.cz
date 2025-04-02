import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { to, orderId, items, price, customer_name, delivery_method, address, city, state, zip} = req.body

  try {
    console.log(items)

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: `Potvrzení objednávky č. ${orderId}`,
      html: `
        <h4>Děkujeme za vaši objednávku!</h4>
        <p>Číslo objednávky: <strong>${orderId}</strong></p> <br>

        <p>Jméno zákazníka: <strong>${customer_name}</strong></p> <br>
        <p>Způsob dopravy: ${delivery_method === 'pickup' ? 'Osobní odběr' : 'DPD (99 Kč)'}</p> <br>
        ${delivery_method !== 'pickup' ? `
          <p>Adresa: ${address}</p>
          <p>Město: ${city}</p>
          <p>Stát: ${state}</p>
          <p>PSČ: ${zip}</p>
        ` : ''}
        
        <h4>Objednané položky:</h4>
        <ul style="list-style-type: none; padding: 4px 10px;">
          ${items.map((item: any) => `
            <li>
              ${item.name} (${item.quantity} ${item.unit}) - ${item.price * item.quantity} Kč
            </li>
          `).join('')}
        </ul>
        <p><strong>Celkem:</strong> ${price} Kč</p> <br>
        <p>Brzy vás budeme kontaktovat s potvrzením o doručení.</p>
      `,
    })

    return res.status(200).json({ success: true, data: response })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error })
  }
}
