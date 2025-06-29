import { NotificationService } from "@/services/notifications/NotificationService";
import { EmailService } from "@/services/email/EmailService";

// Mock dependencies
jest.mock("@/configs/supabase", () => {
  const mockSupabase = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            single: jest.fn(),
          }),
          single: jest.fn(),
          order: jest.fn().mockReturnThis(),
        }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn(),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn(),
      }),
    }),
  };

  return {
    supabase: mockSupabase,
  };
});

// Mock EmailService
vi.mock("@/services/email/EmailService", () => {
  const mockEmailService = {
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
  };

  return {
    EmailService: {
      getInstance: vi.fn().mockReturnValue(mockEmailService),
    },
  };
});

// Import supabase after mocking
import { supabase } from "@/configs/supabase";

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockEmailService: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock responses
    const mockFrom = supabase.from as jest.Mock;
    const mockSelect = { select: vi.fn().mockReturnThis() };
    const mockInsert = { insert: vi.fn().mockReturnThis() };
    const mockUpdate = { update: vi.fn().mockReturnThis() };
    const mockEq = { eq: vi.fn().mockReturnThis() };

    mockFrom.mockImplementation((table: string) => {
      if (table === "notifications") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [
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
                ],
                error: null,
              }),
              order: vi.fn().mockReturnThis(),
            }),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "notification-123" },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        };
      } else if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { email: "user@example.com" },
                error: null,
              }),
            }),
          }),
        };
      } else if (table === "notification_templates") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "template-123",
                    type: "payment_confirmation",
                    name: "default",
                    subject: "Payment Confirmed",
                    template: "Your payment has been confirmed.",
                  },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    // Get the email service mock
    mockEmailService = EmailService.getInstance();

    // Reset singleton instance for testing
    // @ts-ignore - Private field access for testing
    NotificationService.instance = undefined;
    notificationService = NotificationService.getInstance();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should create a notification", async () => {
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "notification-123" },
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "notifications") {
        return {
          insert: insertMock,
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

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
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        type: "payment_confirmation",
        title: "Payment Confirmed",
        message: "Your payment has been confirmed.",
        status: "pending",
      })
    );
  });

  it("should process pending notifications", async () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        lte: vi.fn().mockResolvedValue({
          data: [
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
          ],
          error: null,
        }),
      }),
    });

    const userSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { email: "user@example.com" },
          error: null,
        }),
      }),
    });

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "notifications") {
        return {
          select: selectMock,
          update: updateMock,
        };
      } else if (table === "users") {
        return {
          select: userSelectMock,
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    // Spy on the sendNotificationEmail method
    const sendNotificationEmailSpy = vi.spyOn(
      NotificationService.prototype as any,
      "sendNotificationEmail"
    );

    await notificationService.processPendingNotifications();

    // Check that the user email was retrieved
    expect(supabase.from).toHaveBeenCalledWith("users");
    expect(userSelectMock).toHaveBeenCalled();

    // Check that sendNotificationEmail was called
    expect(sendNotificationEmailSpy).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({
        type: "payment_confirmation",
        metadata: expect.objectContaining({
          intentionDetails: expect.any(Object),
          paymentAmount: 50,
          currency: "USD",
        }),
      })
    );

    // Check that the notification status was updated
    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(updateMock).toHaveBeenCalled();
  });
});
