import { EmailService } from "@/services/email/EmailService";

// Test to verify the updated EmailService is properly integrated into the project
describe("EmailService Integration", () => {
  it("EmailService has all required email methods", () => {
    const emailService = EmailService.getInstance();

    // Verify that all the template-based email methods exist
    expect(typeof emailService.sendEmail).toBe("function");
    expect(typeof emailService.sendPaymentConfirmation).toBe("function");
    expect(typeof emailService.sendPaymentFailure).toBe("function");
    expect(typeof emailService.sendRefundConfirmation).toBe("function");
    expect(typeof emailService.sendIntentionReminder).toBe("function");
    expect(typeof emailService.sendCourseEnrollment).toBe("function");
    expect(typeof emailService.sendCourseCompletion).toBe("function");
    expect(typeof emailService.sendPasswordReset).toBe("function");
    expect(typeof emailService.sendWelcome).toBe("function");
    expect(typeof emailService.sendEmailVerification).toBe("function");
    expect(typeof emailService.sendParishRegistration).toBe("function");
    expect(typeof emailService.sendWebhookFailureAlert).toBe("function");
    expect(typeof emailService.sendNewAnnouncement).toBe("function");
    expect(typeof emailService.sendReportReady).toBe("function");
  });
});
