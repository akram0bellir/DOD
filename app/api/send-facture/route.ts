import { NextResponse } from 'next/server';
import { sendEmail, serverPocketBase } from '@/lib/sendEmail';

/* Emails a stored invoice (FACTURE record) to the RESEVER address of the
   "smtp" collection, through that collection's SMTP server. */

export const runtime = 'nodejs';

/* Exhibitor collections the client may reference (anything else is refused). */
const EXPOSANT_COLLECTIONS = new Set(['Exposant_national', 'Exposant_International']);

const PB_ID = /^[a-z0-9]{15}$/;

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function POST(request: Request) {
  let body: { factureId?: string; exposantCollection?: string; exposantId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { factureId, exposantCollection, exposantId } = body;
  if (!factureId || !PB_ID.test(factureId)) {
    return NextResponse.json({ error: 'Invalid factureId' }, { status: 400 });
  }

  try {
    const pb = await serverPocketBase();

    /* Invoice PDF (must already exist in FACTURE) */
    const facture = await pb.collection('FACTURE').getOne(factureId);
    const fileName = Array.isArray(facture.FACTURE) ? facture.FACTURE[0] : facture.FACTURE;
    if (!fileName) {
      return NextResponse.json({ error: 'FACTURE has no file' }, { status: 404 });
    }
    const pdfResponse = await fetch(pb.files.getURL(facture, fileName));
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: 'Cannot download invoice' }, { status: 502 });
    }
    const pdf = Buffer.from(await pdfResponse.arrayBuffer());

    /* Exhibitor details for the email body (optional) */
    let exposant: Record<string, any> | null = null;
    if (exposantCollection && exposantId && EXPOSANT_COLLECTIONS.has(exposantCollection) && PB_ID.test(exposantId)) {
      exposant = await pb.collection(exposantCollection).getOne(exposantId).catch(() => null);
    }

    const company = exposant?.company_name ?? 'Exposant';
    const currency = exposant?.currency ?? 'DA';
    const rows = exposant
      ? [
          ['Société', exposant.company_name],
          ['Type', exposantCollection === 'Exposant_International' ? 'Exposant international' : 'Exposant national'],
          ['Pays / Ville', [exposant.country, exposant.city].filter(Boolean).join(' / ')],
          ['Contact', exposant.contact_person],
          ['Email', exposant.email],
          ['Téléphone', exposant.phone || exposant.mobile],
          ['Total TTC', exposant.total_ttc != null ? `${exposant.total_ttc} ${currency}` : ''],
          ['Référence', exposant.id],
        ].filter(([, value]) => value)
      : [];

    await sendEmail({
      subject: `Facture SIPA 2025 — ${company}`,
      replyTo: exposant?.email || undefined,
      html: `
        <p>Nouvelle facture SIPA 2025${exposant ? ` pour <strong>${escapeHtml(company)}</strong>` : ''}.</p>
        ${rows.length ? `<table cellpadding="4" style="border-collapse:collapse">${rows
          .map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`)
          .join('')}</table>` : ''}
        <p>La facture est jointe en PDF.</p>`,
      attachments: [{ filename: fileName, content: pdf, contentType: 'application/pdf' }],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('send-facture failed:', error);
    return NextResponse.json({ error: 'Email not sent' }, { status: 500 });
  }
}
