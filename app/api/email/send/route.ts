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
      return NextResponse.json(
        { error: result.error },
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
