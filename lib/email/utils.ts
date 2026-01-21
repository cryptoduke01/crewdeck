import { newMessageEmail, newReviewEmail, welcomeEmail, verificationEmail } from "./templates";

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
    let errorMessage = `Failed to send email (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        // Try to extract error message from common error object formats
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = typeof errorData.details === 'string'
            ? errorData.details
            : JSON.stringify(errorData.details);
        } else {
          // Try to stringify the whole object, but handle circular references
          try {
            errorMessage = JSON.stringify(errorData, null, 2);
          } catch {
            errorMessage = `Email API error: ${response.status} ${response.statusText}`;
          }
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
    throw new Error(errorMessage);
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
    let errorMessage = `Failed to send email (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        // Try to extract error message from common error object formats
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = typeof errorData.details === 'string'
            ? errorData.details
            : JSON.stringify(errorData.details);
        } else {
          // Try to stringify the whole object, but handle circular references
          try {
            errorMessage = JSON.stringify(errorData, null, 2);
          } catch {
            errorMessage = `Email API error: ${response.status} ${response.statusText}`;
          }
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
    throw new Error(errorMessage);
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
    let errorMessage = `Failed to send email (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        // Try to extract error message from common error object formats
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = typeof errorData.details === 'string'
            ? errorData.details
            : JSON.stringify(errorData.details);
        } else {
          // Try to stringify the whole object, but handle circular references
          try {
            errorMessage = JSON.stringify(errorData, null, 2);
          } catch {
            errorMessage = `Email API error: ${response.status} ${response.statusText || 'Unknown error'}`;
          }
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function sendVerificationEmail(
  profileEmail: string,
  profileName: string,
  profileType: "agency" | "kol",
  profileUrl: string
) {
  const template = verificationEmail(profileName, profileType, profileUrl);
  
  const response = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: profileEmail,
      ...template,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to send email (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = typeof errorData.details === 'string'
            ? errorData.details
            : JSON.stringify(errorData.details);
        } else {
          try {
            errorMessage = JSON.stringify(errorData, null, 2);
          } catch {
            errorMessage = `Email API error: ${response.status} ${response.statusText || 'Unknown error'}`;
          }
        }
      }
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
