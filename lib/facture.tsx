'use client';

import { pdf } from '@react-pdf/renderer';
import type { RecordModel } from 'pocketbase';
import { pb } from '@/lib/pocketbase';
import FacturePDF from '@/components/FacturePDF';

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
   Uses the record returned by create() so amounts are the server's. */
export async function storeFacture(record: RecordModel): Promise<RecordModel> {
  const invoiceNumber = await nextInvoiceNumber(record);
  const blob = await pdf(<FacturePDF record={record} invoiceNumber={invoiceNumber} />).toBlob();

  const file = new File([blob], `facture_${invoiceNumber}_${new Date().getFullYear()}.pdf`, {
    type: 'application/pdf',
  });

  return pb.collection('FACTURE').create({ FACTURE: file });
}
