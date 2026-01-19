import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resendInstance;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, text, from = "crewdeck <noreply@crewdeck.com>" }: SendEmailOptions) {
  const resend = getResend();
  
  if (!resend) {
    console.warn("RESEND_API_KEY not set, email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error sending email:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}
