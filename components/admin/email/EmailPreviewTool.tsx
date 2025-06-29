"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { TemplateEngine } from "@/services/email/TemplateEngine";
import * as EmailTemplates from "@/services/email/templates/emailTemplates";
import { toast } from "react-hot-toast";

// Email template types
type TemplateType = keyof typeof EmailTemplates;

interface TemplateOption {
  value: TemplateType;
  label: string;
  defaultVariables: Record<string, any>;
  description: string;
  category: string;
  language?: string;
}

// Template options with default variables
const templateOptions: TemplateOption[] = [
  {
    value: "PAYMENT_CONFIRMATION",
    label: "Payment Confirmation",
    description: "Sent when a payment for a mass intention is confirmed",
    category: "Payment",
    language: "EN",
    defaultVariables: {
      intentionDetails: {
        massDate: new Date().toLocaleDateString(),
        massType: "regular",
        intentionFor: "John Smith",
      },
      paymentAmount: 50,
      currency: "USD",
      receiptUrl: "https://example.com/receipt/123",
    },
  },
  {
    value: "PAYMENT_FAILURE",
    label: "Payment Failure",
    description: "Sent when a payment fails to process",
    category: "Payment",
    language: "EN",
    defaultVariables: {
      amount: 50,
      currency: "USD",
      error: "Card declined",
      intentionId: "intention-123",
    },
  },
  {
    value: "REFUND_CONFIRMATION",
    label: "Refund Confirmation",
    description: "Sent when a refund is processed",
    category: "Payment",
    language: "EN",
    defaultVariables: {
      intentionDetails: {
        massDate: new Date().toLocaleDateString(),
        intentionFor: "John Smith",
      },
      amount: 50,
      currency: "USD",
    },
  },
  {
    value: "MASS_INTENTION_REMINDER",
    label: "Mass Intention Reminder",
    description: "Reminder about upcoming mass intention",
    category: "Mass",
    language: "EN",
    defaultVariables: {
      intention_for: "John Smith",
      mass_date: new Date().toLocaleDateString(),
      parish_name: "St. Mary's Church",
      type: "day_before",
      title: "Mass Intention Reminder",
    },
  },
  {
    value: "MASS_INTENTION_REMINDER_PL",
    label: "Mass Intention Reminder",
    description: "Reminder about upcoming mass intention",
    category: "Mass",
    language: "PL",
    defaultVariables: {
      intention_for: "Jan Kowalski",
      mass_date: new Date().toLocaleDateString("pl-PL"),
      parish_name: "Kościół św. Marii",
      type: "day_before",
      title: "Przypomnienie o intencji mszalnej",
    },
  },
  {
    value: "COURSE_ENROLLMENT",
    label: "Course Enrollment",
    description: "Sent when a user enrolls in a course",
    category: "Education",
    language: "EN",
    defaultVariables: {
      courseName: "Introduction to Catholic Spirituality",
      instructorName: "Father James",
      courseLevel: "Beginner",
      courseDuration: 120,
      courseId: "course-123",
      title: "Welcome to Your New Course",
    },
  },
  {
    value: "COURSE_COMPLETION",
    label: "Course Completion",
    description: "Sent when a user completes a course",
    category: "Education",
    language: "EN",
    defaultVariables: {
      courseName: "Introduction to Catholic Spirituality",
      completionDate: new Date().toLocaleDateString(),
      grade: "A",
      certificateId: "cert-456",
      title: "Congratulations on Completing Your Course",
    },
  },
  {
    value: "PASSWORD_RESET",
    label: "Password Reset",
    description: "Sent when a user requests a password reset",
    category: "Account",
    language: "EN",
    defaultVariables: {
      resetLink: "https://oremus.app/reset-password?token=abc123",
      title: "Reset Your Password",
    },
  },
  {
    value: "WELCOME",
    label: "Welcome Email",
    description: "Sent when a new user registers",
    category: "Account",
    language: "EN",
    defaultVariables: {
      title: "Welcome to Oremus",
    },
  },
  {
    value: "EMAIL_VERIFICATION",
    label: "Email Verification",
    description: "Sent to verify a user's email address",
    category: "Account",
    language: "EN",
    defaultVariables: {
      verificationLink: "https://oremus.app/verify-email?token=xyz789",
      title: "Verify Your Email Address",
    },
  },
  {
    value: "PARISH_REGISTRATION",
    label: "Parish Registration",
    description: "Sent when a new parish is registered",
    category: "Parish",
    language: "EN",
    defaultVariables: {
      parishName: "St. Joseph Parish",
      parishAddress: "123 Main St, Anytown, USA",
      adminEmail: "admin@stjoseph.org",
      title: "Parish Registration Confirmation",
    },
  },
  {
    value: "WEBHOOK_FAILURE_ALERT",
    label: "Webhook Failure Alert",
    description: "Sent when a webhook fails to process",
    category: "System",
    language: "EN",
    defaultVariables: {
      provider: "Stripe",
      eventType: "payment.succeeded",
      failureTime: new Date().toLocaleString(),
      retryCount: 3,
      errorMessage: "Connection timeout",
      title: "Webhook Failure Alert",
    },
  },
  {
    value: "NEW_ANNOUNCEMENT",
    label: "New Announcement",
    description: "Sent when a new parish announcement is published",
    category: "Parish",
    language: "EN",
    defaultVariables: {
      title: "Christmas Mass Schedule",
      content:
        "Join us for our special Christmas mass schedule. We will have masses at 5pm on Christmas Eve, and at 8am, 10am, and 12pm on Christmas Day.",
      postedDate: new Date().toLocaleDateString(),
      parishId: "parish-456",
      subject: "New Parish Announcement",
    },
  },
  {
    value: "REPORT_READY",
    label: "Report Ready",
    description: "Sent when a report is ready for download",
    category: "System",
    language: "EN",
    defaultVariables: {
      reportName: "Monthly Mass Intentions Summary",
      generatedDate: new Date().toLocaleDateString(),
      reportFormat: "Excel",
      downloadUrl: "https://oremus.app/reports/download/report-123",
      title: "Your Report is Ready",
    },
  },
];

// Function to format JSON with indentation for display
const formatJSON = (json: Record<string, any>): string => {
  return JSON.stringify(json, null, 2);
};

export default function EmailPreviewTool() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(
    templateOptions[0]
  );
  const [variables, setVariables] = useState<Record<string, any>>(
    templateOptions[0].defaultVariables
  );
  const [variablesJson, setVariablesJson] = useState<string>(
    formatJSON(templateOptions[0].defaultVariables)
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [testEmail, setTestEmail] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"html" | "text" | "mobile">(
    "html"
  );
  const [templateSearch, setTemplateSearch] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  // Get unique categories and languages
  const categories = [
    "",
    ...Array.from(new Set(templateOptions.map((t) => t.category))),
  ];
  const languages = [
    "",
    ...Array.from(
      new Set(templateOptions.map((t) => t.language).filter(Boolean))
    ),
  ];

  // Filter templates based on search input, category, and language
  const filteredTemplates = templateOptions.filter((template) => {
    const matchesSearch =
      !templateSearch ||
      template.label.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.description.toLowerCase().includes(templateSearch.toLowerCase());

    const matchesCategory =
      !selectedCategory || template.category === selectedCategory;
    const matchesLanguage =
      !selectedLanguage || template.language === selectedLanguage;

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Function to render preview
  const renderPreview = () => {
    try {
      setIsRendering(true);
      // Parse JSON if needed
      let parsedVariables = variables;
      if (typeof variables === "string") {
        parsedVariables = JSON.parse(variables as string);
      }

      // Render the template
      const template = EmailTemplates[selectedTemplate.value];
      const renderedHtml = TemplateEngine.renderEmail(
        template,
        parsedVariables
      );

      // Create plain text version
      const renderedText = renderedHtml
        .replace(/<style[^>]*>.*?<\/style>/gs, "")
        .replace(/<script[^>]*>.*?<\/script>/gs, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      setPreviewHtml(renderedHtml);
      setPreviewText(renderedText);
    } catch (error) {
      console.error("Error rendering preview:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unknown error rendering preview"
      );
    } finally {
      setIsRendering(false);
    }
  };

  // Update preview when template or variables change
  useEffect(() => {
    renderPreview();
  }, [selectedTemplate, variables]);

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    const template = templateOptions.find((t) => t.value === templateId);
    if (template) {
      setSelectedTemplate(template);
      setVariables(template.defaultVariables);
      setVariablesJson(formatJSON(template.defaultVariables));
    }
  };

  // Handle variables JSON change
  const handleVariablesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setVariablesJson(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setVariables(parsed);
    } catch (error) {
      // Don't update variables if JSON is invalid
      console.error("Invalid JSON:", error);
    }
  };

  // Reset variables to default
  const resetVariables = () => {
    setVariables(selectedTemplate.defaultVariables);
    setVariablesJson(formatJSON(selectedTemplate.defaultVariables));
    toast.success("Variables reset to default values");
  };

  // Format JSON to make it prettier
  const formatVariablesJson = () => {
    try {
      const parsed = JSON.parse(variablesJson);
      setVariablesJson(formatJSON(parsed));
      toast.success("JSON formatted");
    } catch (error) {
      toast.error("Invalid JSON: Cannot format");
    }
  };

  // Validate JSON
  const validateJson = () => {
    try {
      JSON.parse(variablesJson);
      toast.success("JSON is valid");
      return true;
    } catch (error) {
      toast.error(
        `Invalid JSON: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  // Copy HTML to clipboard
  const copyHtmlToClipboard = () => {
    navigator.clipboard
      .writeText(previewHtml)
      .then(() => {
        toast.success("HTML copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
        toast.error("Failed to copy HTML");
      });
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/email/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testEmail,
          subject: `[TEST] ${selectedTemplate.label}`,
          template: selectedTemplate.value,
          variables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send test email");
      }

      toast.success(`Email sent to ${testEmail}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Email Template Preview Tool</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left column - Controls */}
        <div className="lg:w-1/3">
          <div className="p-4 mb-4 bg-white rounded-lg shadow">
            <div className="mb-4">
              <label
                htmlFor="template-search"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Search Templates
              </label>
              <input
                id="template-search"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search by name or description..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
              />
            </div>

            <div className="flex mb-4 space-x-2">
              <div className="w-1/2">
                <label
                  htmlFor="category-select"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedCategory}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedCategory(e.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {categories
                    .filter((c) => c)
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div className="w-1/2">
                <label
                  htmlFor="language-select"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Language
                </label>
                <select
                  id="language-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedLanguage}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedLanguage(e.target.value)
                  }
                >
                  <option value="">All Languages</option>
                  {languages
                    .filter((l) => l)
                    .map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="template-select"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Select Template{" "}
                {filteredTemplates.length < templateOptions.length &&
                  `(${filteredTemplates.length} of ${templateOptions.length})`}
              </label>
              <select
                id="template-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedTemplate.value}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleTemplateChange(e.target.value)
                }
                aria-label="Select email template"
              >
                {filteredTemplates.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label}{" "}
                    {template.language && `(${template.language})`}
                  </option>
                ))}
              </select>

              <div className="flex items-center mt-2">
                <p className="flex-grow text-sm text-gray-600">
                  {selectedTemplate.description}
                </p>
                {selectedTemplate.language && (
                  <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    {selectedTemplate.language}
                  </span>
                )}
                <span className="px-2 py-1 ml-2 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                  {selectedTemplate.category}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="variables-json"
                  className="block text-sm font-medium text-gray-700"
                >
                  Template Variables (JSON)
                </label>
                <div className="flex space-x-1">
                  <button
                    onClick={formatVariablesJson}
                    type="button"
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    title="Format JSON"
                  >
                    Format
                  </button>
                  <button
                    onClick={validateJson}
                    type="button"
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    title="Validate JSON"
                  >
                    Validate
                  </button>
                  <button
                    onClick={resetVariables}
                    type="button"
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    title="Reset to defaults"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <textarea
                id="variables-json"
                value={variablesJson}
                onChange={handleVariablesChange}
                className="w-full h-64 p-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm resize-y focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="test-email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Send Test Email
              </label>
              <div className="flex">
                <input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTestEmail(e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 shadow-sm rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Email address for test email"
                />
                <button
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent shadow-sm rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  onClick={sendTestEmail}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="lg:w-2/3">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">Email Preview</h2>
                <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  {selectedTemplate.label}
                </span>
                {isRendering && (
                  <span className="px-2 py-1 ml-2 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full animate-pulse">
                    Rendering...
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyHtmlToClipboard}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  title="Copy HTML to clipboard"
                >
                  Copy HTML
                </button>
              </div>
            </div>

            <div className="px-3 py-2 mb-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-1/6">
                  Subject:
                </div>
                <div className="font-medium sm:w-5/6">
                  [TEST] {selectedTemplate.label}
                </div>
              </div>
              <div className="flex flex-col mt-1 sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-1/6">
                  To:
                </div>
                <div className="sm:w-5/6">
                  {testEmail || "test@example.com"}
                </div>
              </div>
              <div className="flex flex-col mt-1 sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-1/6">
                  From:
                </div>
                <div className="sm:w-5/6">
                  Oremus &lt;noreply@oremus.app&gt;
                </div>
              </div>
            </div>

            <div className="mb-4 border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`${
                    activeTab === "html"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab("html")}
                >
                  HTML View
                </button>
                <button
                  className={`${
                    activeTab === "text"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab("text")}
                >
                  Plain Text
                </button>
                <button
                  className={`${
                    activeTab === "mobile"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab("mobile")}
                >
                  Mobile View
                </button>
              </nav>
            </div>

            <div className="h-[600px]">
              {isRendering ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {activeTab === "html" && (
                    <div
                      className="h-full p-4 overflow-y-auto border border-gray-200 rounded-md"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  )}

                  {activeTab === "text" && (
                    <pre className="h-full p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap border border-gray-200 rounded-md">
                      {previewText}
                    </pre>
                  )}

                  {activeTab === "mobile" && (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-[375px] h-[600px] border-[14px] border-black rounded-[36px] overflow-hidden relative bg-black">
                        <div className="absolute top-0 left-0 right-0 flex items-start justify-center h-6 bg-black">
                          <div className="w-40 h-5 bg-black rounded-b-lg"></div>
                        </div>
                        <iframe
                          srcDoc={previewHtml}
                          className="w-full h-full bg-white border-0"
                          title="Mobile email preview"
                        />
                        <div className="absolute bottom-[10px] left-0 right-0 flex justify-center">
                          <div className="w-1/3 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
