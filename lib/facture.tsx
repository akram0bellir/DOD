'use client';

import { pdf } from '@react-pdf/renderer';
import type { RecordModel } from 'pocketbase';
import { pb } from '@/lib/pocketbase';
import FacturePDF from '@/components/FacturePDF';
import type { Tariff } from '@/lib/tariff';

/* Next invoice number, "0001", "0002"… based on how many invoices exist.
   Needs a public List rule on FACTURE; otherwise falls back to the record id. */
async function nextInvoiceNumber(record: RecordModel): Promise<string> {
  try {
    const { totalItems } = await pb.collection('FACTURE').getList(1, 1, { fields: 'id', requestKey: null });
    return String(totalItems + 1).padStart(4, '0');
  } catch {
    return record.id.slice(0, 4).toUpperCase();
  }
}

/* Renders the invoice of an exhibitor record to a PDF and stores it in
   the PocketBase "FACTURE" collection (file field "FACTURE").
   Uses the record returned by create() so amounts are the server's,
   priced with the PocketBase tariff the form showed (`prices`). */
export async function storeFacture(record: RecordModel, prices?: Tariff): Promise<RecordModel> {
  const invoiceNumber = await nextInvoiceNumber(record);
  const blob = await pdf(<FacturePDF record={record} invoiceNumber={invoiceNumber} prices={prices} />).toBlob();

  const file = new File([blob], `facture_${invoiceNumber}_${new Date().getFullYear()}.pdf`, {
    type: 'application/pdf',
  });

  const facture = await pb.collection('FACTURE').create({ FACTURE: file });

  /* Email it to the RESEVER address of the "smtp" collection. Done by the
     server (app/api/send-facture) so SMTP credentials stay private.
     A failed email is logged but does not undo the stored invoice. */
  try {
    const response = await fetch('/api/send-facture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        factureId: facture.id,
        exposantCollection: record.collectionName,
        exposantId: record.id,
      }),
    });
    if (!response.ok) console.error('Facture email not sent:', await response.text());
  } catch (emailError) {
    console.error('Facture email not sent:', emailError);
  }

  return facture;
}
