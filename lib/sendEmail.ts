import 'server-only';
import PocketBase from 'pocketbase';
import nodemailer from 'nodemailer';

/* Sends an email through the mail server stored in the PocketBase "smtp"
   collection (host / email / password). PocketBase only stores the
   settings; the email itself goes straight to that SMTP server.
   Server-side only — never import this in a client component. */

const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? 'https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com';
const SMTP_RECORD_ID = process.env.SMTP_RECORD_ID ?? 's8p4ck3nvlxee1i';

export type EmailOptions = {
  /** Defaults to the RESEVER address of the smtp record */
  to?: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
};

/* PocketBase client for server code. Logs in as superuser when
   PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD are set (needed once the
   smtp collection is locked). */
export async function serverPocketBase() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  const email = process.env.PB_SUPERUSER_EMAIL;
  const password = process.env.PB_SUPERUSER_PASSWORD;
  if (email && password) {
    await pb.collection('_superusers').authWithPassword(email, password);
  }
  return pb;
}

/* "mail.host.dz" → port 465 (SSL); "mail.host.dz:587" → STARTTLS.
   A pasted URL such as "https://mail.host.dz/" is reduced to its hostname. */
function parseHost(host: string) {
  const cleaned = host.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '');
  const [hostname, rawPort] = cleaned.split(':');
  const port = Number(rawPort) || 465;
  return { hostname, port };
}

export async function sendEmail(options: EmailOptions) {
  const pb = await serverPocketBase();
  const smtp = await pb.collection('smtp').getOne(SMTP_RECORD_ID);

  if (!smtp.host || !smtp.email || !smtp.password) {
    throw new Error('smtp record is missing host, email or password');
  }

  const to = options.to ?? smtp.RESEVER;
  if (!to) throw new Error('No recipient: pass `to` or fill RESEVER in the smtp record');

  const { hostname, port } = parseHost(smtp.host);
  const transporter = nodemailer.createTransport({
    host: hostname,
    port,
    secure: port === 465,
    auth: { user: smtp.email, pass: smtp.password },
  });

  return transporter.sendMail({
    from: `SIPA 2025 <${smtp.email}>`,
    to,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
}
