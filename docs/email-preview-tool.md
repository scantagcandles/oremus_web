# Email Preview Tool

This document provides screenshots and usage instructions for the enhanced Email Preview Tool.

## Features Added

1. **Template Search & Filtering**
   - Search by template name or description
   - Filter the template dropdown to quickly find specific templates
2. **Enhanced Mobile Preview**
   - Realistic mobile device frame
   - Better visualization of how emails appear on mobile devices
3. **Copy HTML Button**
   - One-click to copy the rendered HTML
   - Useful for debugging or sharing template designs
4. **Improved Error Handling**
   - Better validation of template variables
   - More descriptive error messages
5. **Loading Indicators**
   - Visual feedback during template rendering
   - Visual feedback during test email sending

## Usage Instructions

1. Select an email template from the dropdown or search for a specific template
2. Edit the JSON variables in the editor to customize the template
3. Use the tabs to switch between HTML, Text, and Mobile preview modes
4. Send a test email to verify the appearance in an actual email client
5. Use the "Copy HTML" button to copy the rendered template for sharing or debugging

## API Endpoint

The Email Preview Tool uses the `/api/email/preview` endpoint to send test emails:

```typescript
// Example POST request
fetch("/api/email/preview", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: "test@example.com",
    subject: "[TEST] Template Name",
    template: "TEMPLATE_ID",
    variables: {
      /* template variables */
    },
  }),
});
```

## Future Enhancements

Potential future improvements for the Email Preview Tool:

1. **Template Editor**: Allow editing the actual template HTML/code
2. **A/B Testing**: Compare multiple variations of the same template
3. **Analytics Integration**: Track email open rates directly from the preview tool
4. **Visual Builder**: WYSIWYG editor for building email templates
5. **Scheduling**: Schedule test emails for specific times
