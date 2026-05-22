import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('Warning: RESEND_API_KEY is not defined. Email dispatch will fail.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded string
}

export interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

/**
 * Sends a newsletter email to a list of subscribers.
 * Resend free accounts allow sending from 'onboarding@resend.dev' only to verified emails,
 * but in production it will send to all. We batch recipients to send efficiently.
 */
export async function sendNewsletterEmail({
  to,
  subject,
  html,
  attachments,
}: SendEmailParams) {
  if (!resend) {
    throw new Error('Resend is not initialized. Please configure RESEND_API_KEY.');
  }

  // Resend batch API limit is 100 emails per request.
  // Since we want to send individual emails to each recipient (so they don't see other recipients),
  // we use resend.batches.send or loop through the recipients.
  const batchSize = 100;
  const results = [];

  // Format attachments for Resend
  const formattedAttachments = attachments?.map(att => ({
    filename: att.filename,
    content: Buffer.from(att.content, 'base64'),
  }));

  const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL || 'onboarding@resend.dev';

  for (let i = 0; i < to.length; i += batchSize) {
    const chunk = to.slice(i, i + batchSize);
    
    // Create batch requests
    const batchRequests = chunk.map(email => {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
      const personalizedHtml = html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
      
      return {
        from: fromEmail,
        to: email,
        subject,
        html: personalizedHtml,
        attachments: formattedAttachments,
      };
    });

    try {
      const response = await resend.batch.send(batchRequests);
      results.push(response);
    } catch (error) {
      console.error(`Failed to send batch starting at index ${i}:`, error);
      throw error;
    }
  }

  return results;
}
