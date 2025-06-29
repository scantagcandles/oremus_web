import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/services/email/EmailService";
import { TemplateEngine } from "@/services/email/TemplateEngine";
import * as EmailTemplates from "@/services/email/templates/emailTemplates";

/**
 * API endpoint for previewing and sending test emails
 * Used by the admin email preview tool
 */
export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, variables } = await request.json();

    // Validate required fields
    if (!to || !template || !variables) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: to, template, and variables are required",
        },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Verify template exists
    const templateContent =
      EmailTemplates[template as keyof typeof EmailTemplates];
    if (!templateContent) {
      return NextResponse.json(
        { error: `Template "${template}" not found` },
        { status: 404 }
      );
    }

    // Validate variables are properly formatted
    if (typeof variables !== "object") {
      return NextResponse.json(
        { error: "Variables must be a valid JSON object" },
        { status: 400 }
      );
    }

    // Render the email HTML
    let html: string;
    try {
      html = TemplateEngine.renderEmail(templateContent, variables);
    } catch (error) {
      console.error("Template rendering error:", error);
      return NextResponse.json(
        {
          error:
            "Error rendering template: " +
            (error instanceof Error ? error.message : "Unknown error"),
        },
        { status: 500 }
      );
    }

    // Create plain text version
    const text = html
      .replace(/<style[^>]*>.*?<\/style>/gs, "")
      .replace(/<script[^>]*>.*?<\/script>/gs, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Send the email
    try {
      const emailService = EmailService.getInstance();
      await emailService.sendEmail({
        to,
        subject: subject || `[TEST] Email Template Preview`,
        html,
        text,
      });
    } catch (error) {
      console.error("Email sending error:", error);
      return NextResponse.json(
        {
          error:
            "Error sending email: " +
            (error instanceof Error ? error.message : "Unknown error"),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
    });
  } catch (error) {
    console.error("Error in email preview API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
