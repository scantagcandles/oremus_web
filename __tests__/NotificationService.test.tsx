import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { NotificationService } from "@/services/notifications/NotificationService";
import { EmailService } from "@/services/email/EmailService";
import { supabase } from "@/configs/supabase";

// Mock dependencies
vi.mock("@/configs/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          lte: vi.fn(() => ({
            single: vi
              .fn()
              .mockResolvedValue({
                data: { email: "test@example.com" },
                error: null,
              }),
          })),
          single: vi
            .fn()
            .mockResolvedValue({
              data: { email: "test@example.com" },
              error: null,
            }),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "notification-123" },
              error: null,
            }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

vi.mock("@/services/email/EmailService", () => ({
  EmailService: {
    getInstance: vi.fn().mockReturnValue({
      sendEmail: vi.fn().mockResolvedValue({}),
      sendPaymentConfirmation: vi.fn().mockResolvedValue({}),
      sendPaymentFailure: vi.fn().mockResolvedValue({}),
      sendRefundConfirmation: vi.fn().mockResolvedValue({}),
      sendIntentionReminder: vi.fn().mockResolvedValue({}),
      sendCourseEnrollment: vi.fn().mockResolvedValue({}),
      sendCourseCompletion: vi.fn().mockResolvedValue({}),
      sendNewAnnouncement: vi.fn().mockResolvedValue({}),
      sendReportReady: vi.fn().mockResolvedValue({}),
      sendWebhookFailureAlert: vi.fn().mockResolvedValue({}),
    }),
  },
}));

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockEmailService: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock return values
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.insert as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "notification-123" }, error: null }),
    });
    (supabase.update as any).mockResolvedValue({ error: null });

    // Get the email service mock
    mockEmailService = EmailService.getInstance();

    // Get the singleton instance
    // @ts-ignore - Private field access for testing
    NotificationService.instance = undefined;
    notificationService = NotificationService.getInstance();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should create a notification", async () => {
    const notificationPayload = {
      userId: "user-123",
      type: "payment_confirmation" as any,
      title: "Payment Confirmed",
      message: "Your payment has been confirmed.",
      scheduledFor: new Date().toISOString(),
      metadata: {
        intentionDetails: { id: "intention-123", mass_date: "2025-07-15" },
        paymentAmount: 50,
      },
    };

    await notificationService.createNotification(notificationPayload);

    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        type: "payment_confirmation",
        title: "Payment Confirmed",
        message: "Your payment has been confirmed.",
        status: "pending",
      })
    );
  });

  it("should process a payment confirmation notification", async () => {
    // Mock supabase response for pending notifications
    const mockNotifications = [
      {
        id: "notification-123",
        user_id: "user-123",
        type: "payment_confirmation",
        title: "Payment Confirmed",
        message: "Your payment has been confirmed.",
        status: "pending",
        scheduled_for: new Date().toISOString(),
        metadata: {
          intentionDetails: {
            id: "intention-123",
            intention_for: "John Smith",
            mass_date: "2025-07-15",
            mass_type: "regular",
          },
          paymentAmount: 50,
          currency: "USD",
          receiptUrl: "https://example.com/receipt",
        },
      },
    ];

    (supabase.select as any).mockResolvedValue({
      data: mockNotifications,
      error: null,
    });
    (supabase.from as any).mockImplementation((table) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({
              data: { email: "user@example.com" },
              error: null,
            }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    await notificationService.processPendingNotifications();

    // Check that the correct email method was called
    expect(mockEmailService.sendPaymentConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        intentionDetails: expect.objectContaining({
          id: "intention-123",
          intention_for: "John Smith",
        }),
        paymentAmount: 50,
        currency: "USD",
        receiptUrl: "https://example.com/receipt",
      })
    );

    // Check that the notification status was updated
    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "sent",
        sent_at: expect.any(String),
      })
    );
  });

  it("should process a mass intention reminder notification", async () => {
    // Mock supabase response for pending notifications
    const mockNotifications = [
      {
        id: "notification-124",
        user_id: "user-123",
        type: "mass_intention_reminder",
        title: "Mass Intention Reminder",
        message: "Your mass intention is tomorrow.",
        status: "pending",
        scheduled_for: new Date().toISOString(),
        metadata: {
          intention_for: "John Smith",
          mass_date: "2025-07-15",
          parish_name: "St. Mary's Church",
          reminder_type: "day_before",
          language: "en",
        },
      },
    ];

    (supabase.select as any).mockResolvedValue({
      data: mockNotifications,
      error: null,
    });
    (supabase.from as any).mockImplementation((table) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({
              data: { email: "user@example.com" },
              error: null,
            }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    await notificationService.processPendingNotifications();

    // Check that the correct email method was called
    expect(mockEmailService.sendIntentionReminder).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({
        intention_for: "John Smith",
        mass_date: "2025-07-15",
        parish_name: "St. Mary's Church",
        type: "day_before",
      }),
      "en"
    );

    // Check that the notification status was updated
    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "sent",
        sent_at: expect.any(String),
      })
    );
  });
});
