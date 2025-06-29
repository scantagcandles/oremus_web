import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import EmailPreviewTool from "@/components/admin/email/EmailPreviewTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Preview Tool - Oremus Admin",
  description:
    "Preview, test, and manage email templates for the Oremus platform",
};

export default function EmailPreviewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Email Template Management
        </h1>
        <p className="mt-2 text-gray-600">
          Preview, test, and manage all system email templates from one place.
          Select a template, customize the variables, and send test emails to
          verify appearance and content.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Templates are rendered using the TemplateEngine with variable
                placeholders in the format
                <code className="mx-1 px-1 py-0.5 bg-blue-100 rounded">
                  {"{{variableName}}"}
                </code>
                and support nested objects like
                <code className="mx-1 px-1 py-0.5 bg-blue-100 rounded">
                  {"{{user.name}}"}
                </code>
                . All templates are automatically wrapped in the base layout
                with standard styling.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-lg text-gray-700">
              Loading email preview tool...
            </span>
          </div>
        }
      >
        <EmailPreviewTool />
      </Suspense>
    </div>
  );
}
