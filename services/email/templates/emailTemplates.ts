export const PAYMENT_CONFIRMATION = `
<h2>Payment Confirmation</h2>
<p>Thank you for your payment. Your mass intention has been confirmed.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Intention Details:</h3>
  <p><strong>Date:</strong> {{intentionDetails.massDate}}</p>
  <p><strong>Type:</strong> {{intentionDetails.massType}}</p>
  <p><strong>For:</strong> {{intentionDetails.intentionFor}}</p>
  <p><strong>Amount:</strong> {{paymentAmount}} {{currency}}</p>
</div>

<p>You can view your receipt here:</p>
<a href="{{receiptUrl}}" class="button">View Receipt</a>

<p>Thank you for your devotion and support.</p>
`;

export const PAYMENT_FAILURE = `
<h2>Payment Failed</h2>
<p>We were unable to process your payment for the mass intention.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <p><strong>Amount:</strong> {{amount}} {{currency}}</p>
  {{#if error}}
  <p><strong>Error:</strong> {{error}}</p>
  {{/if}}
</div>

<p>Please try again or contact support if you continue to experience issues.</p>
<a href="https://oremus.app/mass/intentions/{{intentionId}}" class="button">Try Again</a>
`;

export const REFUND_CONFIRMATION = `
<h2>Refund Confirmation</h2>
<p>Your refund has been processed successfully.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Refund Details:</h3>
  <p><strong>Date:</strong> {{intentionDetails.massDate}}</p>
  <p><strong>Amount:</strong> {{amount}} {{currency}}</p>
</div>

<p>The refunded amount should appear in your account within 5-7 business days.</p>
`;

export const MASS_INTENTION_REMINDER = `
<h2>Mass Intention Reminder</h2>
<p>This is a reminder about your mass intention at {{parish_name}}.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Intention Details:</h3>
  <p><strong>Date:</strong> {{mass_date}}</p>
  <p><strong>Type:</strong> {{type}}</p>
  <p><strong>For:</strong> {{intention_for}}</p>
</div>

<p>May God bless you and your intentions.</p>
`;

export const MASS_INTENTION_REMINDER_PL = `
<h2>Przypomnienie o intencji mszalnej</h2>
<p>Przypominamy o zamówionej intencji mszalnej w parafii {{parish_name}}.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Szczegóły intencji:</h3>
  <p><strong>Data:</strong> {{mass_date}}</p>
  <p><strong>Typ:</strong> {{type}}</p>
  <p><strong>W intencji:</strong> {{intention_for}}</p>
</div>

<p>Niech Bóg błogosławi Tobie i Twoim intencjom.</p>
`;

export const COURSE_ENROLLMENT = `
<h2>Welcome to {{courseName}}!</h2>
<p>Thank you for enrolling in our course. We're excited to have you join us on this learning journey.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Course Details:</h3>
  <p><strong>Course:</strong> {{courseName}}</p>
  <p><strong>Instructor:</strong> {{instructorName}}</p>
  <p><strong>Level:</strong> {{courseLevel}}</p>
  <p><strong>Duration:</strong> {{courseDuration}} minutes</p>
</div>

<p>You can start your course now:</p>
<a href="https://oremus.app/academy/courses/{{courseId}}" class="button">Start Learning</a>

<p>We hope you enjoy the course and deepen your spiritual journey with us.</p>
`;

export const COURSE_COMPLETION = `
<h2>Congratulations on Completing {{courseName}}!</h2>
<p>We're thrilled to inform you that you have successfully completed the course.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Your Achievement:</h3>
  <p><strong>Course:</strong> {{courseName}}</p>
  <p><strong>Completion Date:</strong> {{completionDate}}</p>
  {{#if grade}}
  <p><strong>Grade:</strong> {{grade}}</p>
  {{/if}}
</div>

<p>Your certificate is ready:</p>
<a href="https://oremus.app/academy/certificates/{{certificateId}}" class="button">View Certificate</a>

<p>We hope this course has been valuable for your spiritual growth.</p>
`;

export const PASSWORD_RESET = `
<h2>Password Reset Request</h2>
<p>We received a request to reset your password for your Oremus account.</p>

<p>Click the button below to reset your password. This link will expire in 24 hours.</p>

<a href="{{resetLink}}" class="button">Reset Password</a>

<p>If you didn't request a password reset, you can safely ignore this email.</p>
`;

export const WELCOME = `
<h2>Welcome to Oremus!</h2>
<p>Thank you for creating an account with us. We're excited to have you join our community.</p>

<p>Oremus is your companion for spiritual growth and connection with your parish community.</p>

<a href="https://oremus.app/profile" class="button">Complete Your Profile</a>

<p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
`;

export const EMAIL_VERIFICATION = `
<h2>Verify Your Email Address</h2>
<p>Thank you for registering with Oremus. Please verify your email address by clicking the button below:</p>

<a href="{{verificationLink}}" class="button">Verify Email</a>

<p>This link will expire in 24 hours. If you didn't create an account with Oremus, you can safely ignore this email.</p>
`;

export const PARISH_REGISTRATION = `
<h2>Parish Registration Confirmation</h2>
<p>Your parish has been successfully registered with Oremus.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Parish Details:</h3>
  <p><strong>Name:</strong> {{parishName}}</p>
  <p><strong>Address:</strong> {{parishAddress}}</p>
  <p><strong>Admin Email:</strong> {{adminEmail}}</p>
</div>

<p>You can now access your parish dashboard to manage masses, intentions, and more:</p>
<a href="https://oremus.app/admin/dashboard" class="button">Go to Dashboard</a>

<p>Thank you for joining the Oremus community. We look forward to supporting your parish's spiritual journey.</p>
`;

export const WEBHOOK_FAILURE_ALERT = `
<h2>Webhook Failure Alert</h2>
<p>This is an automated alert to inform you that a webhook has failed to process correctly.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Webhook Details:</h3>
  <p><strong>Provider:</strong> {{provider}}</p>
  <p><strong>Event Type:</strong> {{eventType}}</p>
  <p><strong>Failure Time:</strong> {{failureTime}}</p>
  <p><strong>Retry Count:</strong> {{retryCount}}</p>
  {{#if errorMessage}}
  <p><strong>Error Message:</strong> {{errorMessage}}</p>
  {{/if}}
</div>

<p>Please check the webhook monitoring dashboard for more details:</p>
<a href="https://oremus.app/admin/monitoring" class="button">View Monitoring Dashboard</a>

<p>This requires your immediate attention to ensure system functionality.</p>
`;

export const NEW_ANNOUNCEMENT = `
<h2>New Parish Announcement</h2>
<p>A new announcement has been posted for your parish:</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>{{title}}</h3>
  <p>{{content}}</p>
  <p><strong>Posted:</strong> {{postedDate}}</p>
</div>

<p>Visit the parish page to see all announcements:</p>
<a href="https://oremus.app/parish/{{parishId}}/announcements" class="button">View All Announcements</a>
`;

export const REPORT_READY = `
<h2>Your Report is Ready</h2>
<p>The report you requested has been generated and is now available for download.</p>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h3>Report Details:</h3>
  <p><strong>Name:</strong> {{reportName}}</p>
  <p><strong>Generated On:</strong> {{generatedDate}}</p>
  <p><strong>Format:</strong> {{reportFormat}}</p>
</div>

<p>Download your report now:</p>
<a href="{{downloadUrl}}" class="button">Download Report</a>

<p>This report will be available for download for 30 days.</p>
`;
