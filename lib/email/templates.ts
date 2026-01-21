export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Get website URL from env or default to crewdeck.xyz
const WEBSITE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://crewdeck.xyz";
const LOGO_URL = `${WEBSITE_URL}/crewdeck/svgs/logos-with-texts/crewdeck-logo-text-black.svg`;

export function newMessageEmail(agencyName: string, senderName: string, messagePreview: string, messageUrl: string): EmailTemplate {
  const subject = `New message from ${senderName} on crewdeck`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${LOGO_URL}" alt="crewdeck" style="height: 40px; margin-bottom: 10px;" />
        </div>
        <div style="background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #000;">New Message on crewdeck</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">You have received a new inquiry</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            <strong>${senderName}</strong> sent you a message about your agency <strong>${agencyName}</strong>.
          </p>
          
          <div style="background: #f8f9fa; border-left: 3px solid #000; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-style: italic; color: #666; font-size: 14px;">
              "${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}"
            </p>
          </div>
          
          <a href="${messageUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px;">
            View Message
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          This email was sent from <a href="${WEBSITE_URL}" style="color: #000;">crewdeck</a>
        </p>
      </body>
    </html>
  `;
  
  const text = `
New Message on crewdeck

${senderName} sent you a message about your agency ${agencyName}.

Message preview:
"${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}"

View the full message: ${messageUrl}

---
This email was sent from crewdeck
  `.trim();
  
  return { subject, html, text };
}

export function newReviewEmail(agencyName: string, reviewerName: string, rating: number, reviewPreview: string, reviewUrl: string): EmailTemplate {
  const subject = `New ${rating}-star review for ${agencyName} on crewdeck`;
  
  const stars = '⭐'.repeat(rating);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${LOGO_URL}" alt="crewdeck" style="height: 40px; margin-bottom: 10px;" />
        </div>
        <div style="background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #000;">New Review on crewdeck</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Someone left a review for your agency</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            <strong>${reviewerName || 'Anonymous'}</strong> left a <strong>${rating}-star</strong> review for <strong>${agencyName}</strong>.
          </p>
          
          <div style="font-size: 20px; margin: 16px 0;">
            ${stars}
          </div>
          
          <div style="background: #f8f9fa; border-left: 3px solid #000; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-style: italic; color: #666; font-size: 14px;">
              "${reviewPreview.substring(0, 150)}${reviewPreview.length > 150 ? '...' : ''}"
            </p>
          </div>
          
          <a href="${reviewUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px;">
            View Review
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          This email was sent from <a href="${WEBSITE_URL}" style="color: #000;">crewdeck</a>
        </p>
      </body>
    </html>
  `;
  
  const text = `
New Review on crewdeck

${reviewerName || 'Anonymous'} left a ${rating}-star review for ${agencyName}.

${stars}

Review:
"${reviewPreview.substring(0, 150)}${reviewPreview.length > 150 ? '...' : ''}"

View the full review: ${reviewUrl}

---
This email was sent from crewdeck
  `.trim();
  
  return { subject, html, text };
}

export function welcomeEmail(agencyName: string, dashboardUrl: string): EmailTemplate {
  const subject = `Welcome to crewdeck, ${agencyName}!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${LOGO_URL}" alt="crewdeck" style="height: 40px; margin-bottom: 10px;" />
        </div>
        <div style="background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #000;">Welcome to crewdeck!</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Your agency profile is ready</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hi <strong>${agencyName}</strong>,
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Welcome to crewdeck! Your agency profile has been created and you're all set to start receiving inquiries from potential clients.
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Here's what you can do next:
          </p>
          
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Complete your agency profile with services and portfolio</li>
            <li style="margin-bottom: 8px;">Add your pricing information</li>
            <li style="margin-bottom: 8px;">Upload portfolio items to showcase your work</li>
            <li>Start receiving inquiries from potential clients</li>
          </ul>
          
          <a href="${dashboardUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px;">
            Go to Dashboard
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          This email was sent from <a href="${WEBSITE_URL}" style="color: #000;">crewdeck</a>
        </p>
      </body>
    </html>
  `;
  
  const text = `
Welcome to crewdeck!

Hi ${agencyName},

Welcome to crewdeck! Your agency profile has been created and you're all set to start receiving inquiries from potential clients.

Here's what you can do next:
- Complete your agency profile with services and portfolio
- Add your pricing information
- Upload portfolio items to showcase your work
- Start receiving inquiries from potential clients

Go to your dashboard: ${dashboardUrl}

---
This email was sent from crewdeck
  `.trim();
  
  return { subject, html, text };
}

export function verificationEmail(profileName: string, profileType: "agency" | "kol", profileUrl: string): EmailTemplate {
  const subject = `🎉 Congratulations! Your ${profileType === "kol" ? "KOL" : "Agency"} profile has been verified on crewdeck`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${LOGO_URL}" alt="crewdeck" style="height: 40px; margin-bottom: 10px;" />
        </div>
        <div style="background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #000;">🎉 Congratulations!</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Your profile has been verified</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Hi <strong>${profileName}</strong>,
          </p>
          
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            Great news! Your ${profileType === "kol" ? "KOL" : "agency"} profile has been verified and is now live on crewdeck. You're all set to start connecting with Web3 projects and growing your business.
          </p>
          
          <div style="background: #f0fdf4; border-left: 3px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              <strong>✓ Verified Status:</strong> Your profile now displays a verification badge, building trust with potential clients.
            </p>
          </div>
          
          <p style="margin: 0 0 16px 0; font-size: 16px;">
            What's next?
          </p>
          
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Your profile is now visible to all visitors</li>
            <li style="margin-bottom: 8px;">Start receiving inquiries from potential clients</li>
            <li style="margin-bottom: 8px;">Build your reputation with reviews and portfolio items</li>
            <li>Connect with Web3 projects looking for marketing talent</li>
          </ul>
          
          <a href="${profileUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px;">
            View Your Profile
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          This email was sent from <a href="${WEBSITE_URL}" style="color: #000;">crewdeck</a>
        </p>
      </body>
    </html>
  `;
  
  const text = `
🎉 Congratulations! Your profile has been verified on crewdeck

Hi ${profileName},

Great news! Your ${profileType === "kol" ? "KOL" : "agency"} profile has been verified and is now live on crewdeck. You're all set to start connecting with Web3 projects and growing your business.

✓ Verified Status: Your profile now displays a verification badge, building trust with potential clients.

What's next?
- Your profile is now visible to all visitors
- Start receiving inquiries from potential clients
- Build your reputation with reviews and portfolio items
- Connect with Web3 projects looking for marketing talent

View your profile: ${profileUrl}

---
This email was sent from crewdeck
  `.trim();
  
  return { subject, html, text };
}
