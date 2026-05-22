import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { sendNewsletterEmail } from "@/lib/email/resend";

export const maxDuration = 60; // Allow enough time for Resend API batches to process (up to 60 seconds)

export async function POST(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("validation_error", "Invalid multipart form data.", 400);
  }

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const file = formData.get("file") as File | null;

  if (!subject || !subject.trim()) {
    return jsonError("validation_error", "Subject is required.", 400);
  }

  if (!message || !message.trim()) {
    return jsonError("validation_error", "Message is required.", 400);
  }

  // 10MB Attachment size limit (Resend default limit is 10MB)
  if (file && file.size > 10 * 1024 * 1024) {
    return jsonError("validation_error", "File size exceeds the 10MB limit.", 400);
  }

  // Fetch all subscribers
  const { data: subscribers, error: subsError } = await supabase
    .from("newsletter_subscribers")
    .select("email");

  if (subsError) {
    return responseFromPostgrestError(subsError);
  }

  const emails = subscribers?.map(s => s.email) || [];

  if (emails.length === 0) {
    return jsonError("no_subscribers", "There are no active subscribers to send this newsletter to.", 400);
  }

  // Format the message with basic HTML paragraphs
  const htmlContent = message
    .split('\n')
    .filter(p => p.trim() !== '')
    .map(p => `<p style="margin-bottom: 16px; color: #334155; font-size: 16px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${escapeHtml(p)}</p>`)
    .join('');

  // Premium email template
  const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0;-webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #00263e; padding: 40px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Hope Aviation</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 32px;">
              ${htmlContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f1f5f9; padding: 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; font-weight: 500;">© 2026 Hope Aviation. All rights reserved.</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; font-weight: 500;">You received this email because you subscribed to our newsletter list.</p>
              <p style="margin: 0; font-size: 12px; font-weight: 600;"><a href="{{UNSUBSCRIBE_URL}}" style="color: #1749ff; text-decoration: none;">Unsubscribe from this newsletter</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Process file attachment if exists
  let attachments = undefined;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");
    attachments = [{
      filename: file.name,
      content: base64Content,
    }];
  }

  try {
    await sendNewsletterEmail({
      to: emails,
      subject,
      html: emailTemplate,
      attachments,
    });

    return jsonOk({ 
      message: `Newsletter sent successfully.`, 
      recipientCount: emails.length 
    });
  } catch (error) {
    console.error("Failed to send newsletter via Resend wrapper:", error);
    return jsonError("email_send_error", "An error occurred while dispatching emails.", 500);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
