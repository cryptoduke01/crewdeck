import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, from } = body;

    if (!to || !subject || !html || !text) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html, text" },
        { status: 400 }
      );
    }

    const result = await sendEmail({ to, subject, html, text, from });

    if (!result.success) {
      // Extract error message properly - handle both string and object errors
      let errorMessage = "Failed to send email";
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error && typeof result.error === 'object') {
        // Handle Resend error objects
        if (result.error.message) {
          errorMessage = result.error.message;
        } else if (result.error.name) {
          errorMessage = `${result.error.name}: ${result.error.message || 'Unknown error'}`;
        } else {
          try {
            errorMessage = JSON.stringify(result.error);
          } catch {
            errorMessage = "Email service error";
          }
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Error in email API route:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
