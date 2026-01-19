import { newMessageEmail, newReviewEmail, welcomeEmail } from "./templates";

export async function sendNewMessageNotification(
  agencyEmail: string,
  agencyName: string,
  senderName: string,
  messagePreview: string,
  messageUrl: string
) {
  const template = newMessageEmail(agencyName, senderName, messagePreview, messageUrl);
  
  const response = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: agencyEmail,
      ...template,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to send email");
  }

  return response.json();
}

export async function sendNewReviewNotification(
  agencyEmail: string,
  agencyName: string,
  reviewerName: string,
  rating: number,
  reviewPreview: string,
  reviewUrl: string
) {
  const template = newReviewEmail(agencyName, reviewerName, rating, reviewPreview, reviewUrl);
  
  const response = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: agencyEmail,
      ...template,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to send email");
  }

  return response.json();
}

export async function sendWelcomeEmail(
  agencyEmail: string,
  agencyName: string,
  dashboardUrl: string
) {
  const template = welcomeEmail(agencyName, dashboardUrl);
  
  const response = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: agencyEmail,
      ...template,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to send email");
  }

  return response.json();
}
