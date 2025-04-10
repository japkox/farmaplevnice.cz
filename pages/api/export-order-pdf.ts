import { NextApiRequest, NextApiResponse } from 'next';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { AdminOrder } from '../../lib/types';

import arialNormal from '../../fonts/arial-normal.js';
import arialBold from '../../fonts/arial-bold.js';

function formatDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metoda není podporována' });
    }

    const order: AdminOrder = req.body;

    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

    const doc = new jsPDF();

    doc.addFileToVFS('arial.ttf', arialNormal);
    doc.addFont('arial.ttf', 'arial', 'normal');
    doc.addFileToVFS('arial-bold.ttf', arialBold);
    doc.addFont('arial-bold.ttf', 'arial', 'bold');
    doc.setFont('arial', 'normal');

    const marginLeft = 15;
    let y = 20;

    doc.addImage(logoBase64, 'PNG', marginLeft, 10, 40, 20);
    doc.setFontSize(16);
    doc.setFont('arial', 'bold');
    doc.text(`Objednávka #${order.order_number}`, marginLeft, y + 20);

    doc.setDrawColor(200);
    doc.line(marginLeft, y + 23, 195, y + 23);

    y += 30;
    doc.setFontSize(12);
    doc.setFont('arial', 'normal');

    doc.text(`Zákazník: ${order.customer_name || 'Neznámý'}`, marginLeft, y);
    doc.text(`Datum vytvoření: ${formatDate(order.created_at)}`, marginLeft, y + 10);
    doc.text(`Celková cena: ${order.total_amount.toFixed(2)} Kč`, marginLeft, y + 20);

    y += 45;
    doc.line(marginLeft, y + 3, 195, y + 3);
    doc.setFont('arial', 'bold');
    doc.text('📍 Doručovací údaje:', marginLeft, y);
    doc.setFont('arial', 'normal');

    if (order.delivery_method === 'pickup') {
        doc.text('Osobní odběr', marginLeft, y + 10);
    } else {
        doc.text(`${order.shipping_address}`, marginLeft, y + 10);
        doc.text(`${order.shipping_zip} ${order.shipping_city}, ${order.shipping_state}`, marginLeft, y + 20);
    }

    y += 35;
    doc.setFont('arial', 'bold');
    doc.line(marginLeft, y + 3, 195, y + 3);
    doc.text('🛒 Položky objednávky:', marginLeft, y);
    doc.setFont('arial', 'normal');

    const tableData = order.order_items.map((item) => [
        item.product.name,
        item.quantity.toString(),
        item.product.unit,
        `${item.unit_price.toFixed(2)} Kč`,
        `${(item.quantity * item.unit_price).toFixed(2)} Kč`,
    ]);

    autoTable(doc, {
        head: [['Produkt', 'Počet', 'MJ', 'Cena/mj', 'Celkem']],
        body: tableData,
        startY: y + 5,
        margin: { left: marginLeft, right: 15 },
        styles: { fontSize: 10, cellPadding: 3, font: 'arial' },
        headStyles: { fillColor: [35, 139, 63], textColor: 255 },
        theme: 'striped',
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order_${order.order_number}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.status(200).send(pdfBuffer);
}