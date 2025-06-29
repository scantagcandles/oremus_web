import { EmailService } from "@/services/email/EmailService";
import { TemplateEngine } from "@/services/email/TemplateEngine";
import * as EmailTemplates from "@/services/email/templates/emailTemplates";
import nodemailer from "nodemailer";
import { MassIntention, MassIntentionStatus } from "@/types/mass-intention";

jest.mock("nodemailer");
jest.mock("@/services/email/TemplateEngine");

describe("EmailService", () => {
  let emailService: EmailService;
  let mockTransporter: jest.Mocked<any>;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({}),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Clear singleton instance for testing
    // @ts-ignore - Private field access for testing
    EmailService.instance = undefined;
    emailService = EmailService.getInstance();

    // Mock the TemplateEngine.renderEmail method
    (TemplateEngine.renderEmail as jest.Mock).mockImplementation(
      (template, vars) => {
        return `<html><body>Mocked email content for ${
          vars.title || "Untitled"
        }</body></html>`;
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send a basic email", async () => {
    const emailData = {
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test message",
    };

    await emailService.sendEmail(emailData);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(String),
        to: "test@example.com",
        subject: "Test Subject",
        text: "Test message",
      })
    );
  });

  it("should send a payment confirmation email", async () => {
    const massIntention: MassIntention = {
      id: "intention-123",
      parish_id: "parish-456",
      intention_for: "John Smith",
      mass_date: "2025-07-15",
      mass_type: "regular",
      status: MassIntentionStatus.PAID,
      payment_id: "payment-789",
      payment_status: "succeeded",
      is_paid: true,
      email: "john@example.com",
      created_at: "2025-06-20",
      updated_at: "2025-06-20",
    };

    const paymentData = {
      email: "john@example.com",
      intentionDetails: massIntention,
      paymentAmount: 50,
      currency: "USD",
      receiptUrl: "https://example.com/receipt/123",
    };

    await emailService.sendPaymentConfirmation(paymentData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.PAYMENT_CONFIRMATION,
      expect.objectContaining({
        paymentAmount: 50,
        currency: "USD",
        receiptUrl: "https://example.com/receipt/123",
        intentionDetails: expect.objectContaining({
          massDate: expect.any(String),
          massType: "regular",
          intentionFor: "John Smith",
        }),
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        subject: "Payment Confirmation - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a payment failure email", async () => {
    const paymentFailureData = {
      email: "john@example.com",
      intentionId: "intention-123",
      amount: 50,
      currency: "USD",
      error: "Card declined",
    };

    await emailService.sendPaymentFailure(paymentFailureData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.PAYMENT_FAILURE,
      expect.objectContaining({
        amount: 50,
        currency: "USD",
        error: "Card declined",
        intentionId: "intention-123",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        subject: "Payment Failed - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a refund confirmation email", async () => {
    const massIntention: MassIntention = {
      id: "intention-123",
      parish_id: "parish-456",
      intention_for: "John Smith",
      mass_date: "2025-07-15",
      mass_type: "regular",
      status: MassIntentionStatus.REFUNDED,
      payment_id: "payment-789",
      payment_status: "refunded",
      is_paid: false,
      email: "john@example.com",
      created_at: "2025-06-20",
      updated_at: "2025-06-20",
    };

    const refundData = {
      email: "john@example.com",
      intentionDetails: massIntention,
      amount: 50,
      currency: "USD",
    };

    await emailService.sendRefundConfirmation(refundData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.REFUND_CONFIRMATION,
      expect.objectContaining({
        amount: 50,
        currency: "USD",
        intentionDetails: expect.objectContaining({
          massDate: expect.any(String),
          intentionFor: "John Smith",
        }),
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        subject: "Refund Confirmation - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a mass intention reminder", async () => {
    const reminderData = {
      intention_for: "John Smith",
      mass_date: "2025-07-15",
      parish_name: "St. Mary's Church",
      type: "day_before",
    };

    await emailService.sendIntentionReminder(
      "john@example.com",
      reminderData,
      "en"
    );

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.MASS_INTENTION_REMINDER,
      expect.objectContaining({
        intention_for: "John Smith",
        mass_date: expect.any(String),
        parish_name: "St. Mary's Church",
        type: "day_before",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        subject: "Your Mass Intention Tomorrow",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a Polish mass intention reminder", async () => {
    const reminderData = {
      intention_for: "Jan Kowalski",
      mass_date: "2025-07-15",
      parish_name: "Kościół św. Marii",
      type: "day_before",
    };

    await emailService.sendIntentionReminder(
      "jan@example.com",
      reminderData,
      "pl"
    );

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.MASS_INTENTION_REMINDER_PL,
      expect.objectContaining({
        intention_for: "Jan Kowalski",
        mass_date: expect.any(String),
        parish_name: "Kościół św. Marii",
        type: "day_before",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jan@example.com",
        subject: "Msza święta jutro",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a course enrollment email", async () => {
    const courseData = {
      email: "student@example.com",
      courseName: "Introduction to Catholic Spirituality",
      instructorName: "Father James",
      courseLevel: "Beginner",
      courseDuration: 120,
      courseId: "course-123",
    };

    await emailService.sendCourseEnrollment(courseData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.COURSE_ENROLLMENT,
      expect.objectContaining({
        courseName: "Introduction to Catholic Spirituality",
        instructorName: "Father James",
        courseLevel: "Beginner",
        courseDuration: 120,
        courseId: "course-123",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: expect.stringContaining(
          "Welcome to Introduction to Catholic Spirituality"
        ),
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a course completion email", async () => {
    const completionData = {
      email: "student@example.com",
      courseName: "Introduction to Catholic Spirituality",
      completionDate: new Date("2025-06-20"),
      grade: "A",
      certificateId: "cert-456",
    };

    await emailService.sendCourseCompletion(completionData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.COURSE_COMPLETION,
      expect.objectContaining({
        courseName: "Introduction to Catholic Spirituality",
        completionDate: expect.any(Date),
        grade: "A",
        certificateId: "cert-456",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: expect.stringContaining("Congratulations on Completing"),
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a password reset email", async () => {
    const resetData = {
      email: "user@example.com",
      resetLink: "https://oremus.app/reset-password?token=abc123",
    };

    await emailService.sendPasswordReset(resetData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.PASSWORD_RESET,
      expect.objectContaining({
        resetLink: "https://oremus.app/reset-password?token=abc123",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Reset Your Oremus Password",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a welcome email", async () => {
    await emailService.sendWelcome("newuser@example.com");

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.WELCOME,
      expect.objectContaining({
        title: "Welcome to Oremus",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "newuser@example.com",
        subject: "Welcome to Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send an email verification email", async () => {
    const verificationData = {
      email: "newuser@example.com",
      verificationLink: "https://oremus.app/verify-email?token=xyz789",
    };

    await emailService.sendEmailVerification(verificationData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.EMAIL_VERIFICATION,
      expect.objectContaining({
        verificationLink: "https://oremus.app/verify-email?token=xyz789",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "newuser@example.com",
        subject: "Verify Your Email Address - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a parish registration confirmation email", async () => {
    const parishData = {
      email: "parish@example.com",
      parishName: "St. Joseph Parish",
      parishAddress: "123 Main St, Anytown, USA",
      adminEmail: "admin@stjoseph.org",
    };

    await emailService.sendParishRegistration(parishData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.PARISH_REGISTRATION,
      expect.objectContaining({
        parishName: "St. Joseph Parish",
        parishAddress: "123 Main St, Anytown, USA",
        adminEmail: "admin@stjoseph.org",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "parish@example.com",
        subject: "Parish Registration Confirmation - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a webhook failure alert", async () => {
    const webhookData = {
      email: "devops@oremus.app",
      provider: "Stripe",
      eventType: "payment.succeeded",
      failureTime: new Date("2025-06-21T10:30:00Z"),
      retryCount: 3,
      errorMessage: "Connection timeout",
    };

    await emailService.sendWebhookFailureAlert(webhookData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.WEBHOOK_FAILURE_ALERT,
      expect.objectContaining({
        provider: "Stripe",
        eventType: "payment.succeeded",
        failureTime: expect.any(Date),
        retryCount: 3,
        errorMessage: "Connection timeout",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "devops@oremus.app",
        subject: "Webhook Failure Alert - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a new announcement notification", async () => {
    const announcementData = {
      email: "parishioner@example.com",
      title: "Christmas Mass Schedule",
      content: "Join us for our special Christmas mass schedule...",
      postedDate: new Date("2025-12-15"),
      parishId: "parish-456",
    };

    await emailService.sendNewAnnouncement(announcementData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.NEW_ANNOUNCEMENT,
      expect.objectContaining({
        title: "Christmas Mass Schedule",
        content: "Join us for our special Christmas mass schedule...",
        postedDate: expect.any(Date),
        parishId: "parish-456",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "parishioner@example.com",
        subject: "New Parish Announcement - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it("should send a report ready notification", async () => {
    const reportData = {
      email: "admin@example.com",
      reportName: "Monthly Mass Intentions Summary",
      generatedDate: new Date("2025-06-21"),
      reportFormat: "Excel",
      downloadUrl: "https://oremus.app/reports/download/report-123",
    };

    await emailService.sendReportReady(reportData);

    // Verify template engine was called with correct template
    expect(TemplateEngine.renderEmail).toHaveBeenCalledWith(
      EmailTemplates.REPORT_READY,
      expect.objectContaining({
        reportName: "Monthly Mass Intentions Summary",
        generatedDate: expect.any(Date),
        reportFormat: "Excel",
        downloadUrl: "https://oremus.app/reports/download/report-123",
      })
    );

    // Verify email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@example.com",
        subject: "Your Report is Ready - Oremus",
        html: expect.any(String),
        text: expect.any(String),
      })
    );
  });
});
