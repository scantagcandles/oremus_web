import nodemailer from 'nodemailer';
import { MassIntention } from '@/types/mass-intention';
import { TemplateEngine, TemplateVariables } from './TemplateEngine';
import * as EmailTemplates from './templates/emailTemplates';

interface PaymentConfirmationData {
  email: string;
  intentionDetails: MassIntention;
  paymentAmount: number;
  currency: string;
  receiptUrl: string;
}

interface PaymentFailureData {
  email: string;
  intentionId: string;
  amount: number;
  currency: string;
  error?: string;
}

interface RefundConfirmationData {
  email: string;
  intentionDetails: MassIntention;
  amount: number;
  currency: string;
}

interface ReminderData {
  intention_for: string;
  mass_date: string;
  parish_name: string;
  type: string;
}

interface CourseEnrollmentData {
  email: string;
  courseName: string;
  instructorName: string;
  courseLevel: string;
  courseDuration: number;
  courseId: string;
}

interface CourseCompletionData {
  email: string;
  courseName: string;
  completionDate: Date;
  grade?: string;
  certificateId: string;
}

interface PasswordResetData {
  email: string;
  resetLink: string;
}

interface EmailVerificationData {
  email: string;
  verificationLink: string;
}

interface ParishRegistrationData {
  email: string;
  parishName: string;
  parishAddress: string;
  adminEmail: string;
}

interface WebhookFailureData {
  email: string;
  provider: string;
  eventType: string;
  failureTime: Date;
  retryCount: number;
  errorMessage?: string;
}

interface AnnouncementData {
  email: string;
  title: string;
  content: string;
  postedDate: Date;
  parishId: string;
}

interface ReportReadyData {
  email: string;
  reportName: string;
  generatedDate: Date;
  reportFormat: string;
  downloadUrl: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: any;

  private constructor() {
    this.initializeTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Generic method to send an email
   */
  public async sendEmail(payload: { to: string; subject: string; text: string; html?: string }): Promise<void> {
    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      ...payload,
    });
  }

  /**
   * Send payment confirmation email
   */
  public async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<void> {
    // Prepare template variables
    const templateVars: TemplateVariables = {
      intentionDetails: {
        massDate: new Date(data.intentionDetails.mass_date).toLocaleDateString(),
        massType: data.intentionDetails.mass_type,
        intentionFor: data.intentionDetails.intention_for
      },
      paymentAmount: data.paymentAmount,
      currency: data.currency,
      receiptUrl: data.receiptUrl,
      title: 'Payment Confirmation - Oremus'
    };

    // Render the email
    const html = TemplateEngine.renderEmail(EmailTemplates.PAYMENT_CONFIRMATION, templateVars);
    
    // Convert HTML to plain text for fallback
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Payment Confirmation - Oremus',
      html,
      text
    });
  }

  /**
   * Send payment failure notification
   */
  public async sendPaymentFailure(data: PaymentFailureData): Promise<void> {
    const templateVars: TemplateVariables = {
      amount: data.amount,
      currency: data.currency,
      error: data.error,
      intentionId: data.intentionId,
      title: 'Payment Failed - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.PAYMENT_FAILURE, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Payment Failed - Oremus',
      html,
      text
    });
  }

  /**
   * Send refund confirmation
   */
  public async sendRefundConfirmation(data: RefundConfirmationData): Promise<void> {
    const templateVars: TemplateVariables = {
      intentionDetails: {
        massDate: new Date(data.intentionDetails.mass_date).toLocaleDateString(),
        intentionFor: data.intentionDetails.intention_for
      },
      amount: data.amount,
      currency: data.currency,
      title: 'Refund Confirmation - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.REFUND_CONFIRMATION, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Refund Confirmation - Oremus',
      html,
      text
    });
  }

  /**
   * Send mass intention reminder
   */
  public async sendIntentionReminder(email: string, data: ReminderData, language: string = 'en'): Promise<void> {
    const templateKey = language === 'pl' ? 'MASS_INTENTION_REMINDER_PL' : 'MASS_INTENTION_REMINDER';
    const template = EmailTemplates[templateKey];
    
    const templateVars: TemplateVariables = {
      parish_name: data.parish_name,
      mass_date: new Date(data.mass_date).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US'),
      type: data.type,
      intention_for: data.intention_for,
      title: this.getReminderSubject(data.type, language)
    };

    const html = TemplateEngine.renderEmail(template, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: this.getReminderSubject(data.type, language),
      html,
      text
    });
  }

  /**
   * Send course enrollment notification
   */
  public async sendCourseEnrollment(data: CourseEnrollmentData): Promise<void> {
    const templateVars: TemplateVariables = {
      courseName: data.courseName,
      instructorName: data.instructorName,
      courseLevel: data.courseLevel,
      courseDuration: data.courseDuration,
      courseId: data.courseId,
      title: `Welcome to ${data.courseName} - Oremus Academy`
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.COURSE_ENROLLMENT, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus Academy" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: `Welcome to ${data.courseName} - Oremus Academy`,
      html,
      text
    });
  }

  /**
   * Send course completion notification
   */
  public async sendCourseCompletion(data: CourseCompletionData): Promise<void> {
    const templateVars: TemplateVariables = {
      courseName: data.courseName,
      completionDate: data.completionDate,
      grade: data.grade,
      certificateId: data.certificateId,
      title: `Congratulations on Completing ${data.courseName}!`
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.COURSE_COMPLETION, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus Academy" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: `Congratulations on Completing ${data.courseName}!`,
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  public async sendPasswordReset(data: PasswordResetData): Promise<void> {
    const templateVars: TemplateVariables = {
      resetLink: data.resetLink,
      title: 'Reset Your Oremus Password'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.PASSWORD_RESET, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Reset Your Oremus Password',
      html,
      text
    });
  }

  /**
   * Send welcome email
   */
  public async sendWelcome(email: string): Promise<void> {
    const templateVars: TemplateVariables = {
      title: 'Welcome to Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.WELCOME, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Oremus',
      html,
      text
    });
  }

  /**
   * Send email verification
   */
  public async sendEmailVerification(data: EmailVerificationData): Promise<void> {
    const templateVars: TemplateVariables = {
      verificationLink: data.verificationLink,
      title: 'Verify Your Email Address - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.EMAIL_VERIFICATION, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Verify Your Email Address - Oremus',
      html,
      text
    });
  }

  /**
   * Send parish registration confirmation
   */
  public async sendParishRegistration(data: ParishRegistrationData): Promise<void> {
    const templateVars: TemplateVariables = {
      parishName: data.parishName,
      parishAddress: data.parishAddress,
      adminEmail: data.adminEmail,
      title: 'Parish Registration Confirmation - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.PARISH_REGISTRATION, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Parish Registration Confirmation - Oremus',
      html,
      text
    });
  }

  /**
   * Send webhook failure alert
   */
  public async sendWebhookFailureAlert(data: WebhookFailureData): Promise<void> {
    const templateVars: TemplateVariables = {
      provider: data.provider,
      eventType: data.eventType,
      failureTime: data.failureTime,
      retryCount: data.retryCount,
      errorMessage: data.errorMessage,
      title: 'Webhook Failure Alert - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.WEBHOOK_FAILURE_ALERT, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus System" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Webhook Failure Alert - Oremus',
      html,
      text
    });
  }
  /**
   * Send new announcement notification
   */
  public async sendNewAnnouncement(data: AnnouncementData): Promise<void> {
    const templateVars: TemplateVariables = {
      title: data.title,
      content: data.content,
      postedDate: data.postedDate,
      parishId: data.parishId,
      subject: 'New Parish Announcement - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.NEW_ANNOUNCEMENT, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'New Parish Announcement - Oremus',
      html,
      text
    });
  }

  /**
   * Send report ready notification
   */
  public async sendReportReady(data: ReportReadyData): Promise<void> {
    const templateVars: TemplateVariables = {
      reportName: data.reportName,
      generatedDate: data.generatedDate,
      reportFormat: data.reportFormat,
      downloadUrl: data.downloadUrl,
      title: 'Your Report is Ready - Oremus'
    };

    const html = TemplateEngine.renderEmail(EmailTemplates.REPORT_READY, templateVars);
    const text = this.htmlToPlainText(html);

    await this.transporter.sendMail({
      from: `"Oremus Reports" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: 'Your Report is Ready - Oremus',
      html,
      text
    });
  }

  /**
   * Helper method to get reminder subject
   */
  private getReminderSubject(type: string, language: string): string {
    return language === 'pl' 
      ? this.getReminderTitlePL(type)
      : this.getReminderTitle(type);
  }

  /**
   * Helper method to get English reminder title
   */
  private getReminderTitle(type: string): string {
    switch (type) {
      case 'week_before':
        return 'Your Mass Intention Next Week';
      case 'day_before':
        return 'Your Mass Intention Tomorrow';
      case 'hour_before':
        return 'Your Mass Intention in One Hour';
      default:
        return 'Mass Intention Reminder';
    }
  }

  /**
   * Helper method to get Polish reminder title
   */
  private getReminderTitlePL(type: string): string {
    switch (type) {
      case 'week_before':
        return 'Msza święta w przyszłym tygodniu';
      case 'day_before':
        return 'Msza święta jutro';
      case 'hour_before':
        return 'Msza święta za godzinę';
      default:
        return 'Przypomnienie o Mszy świętej';
    }
  }

  /**
   * Helper to convert HTML to plain text
   */
  private htmlToPlainText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '') // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Trim leading/trailing spaces
  }
}
