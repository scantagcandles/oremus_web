# Email Preview Tool Documentation

## Overview

The Email Preview Tool is a powerful administrative utility for previewing, testing, and managing all system email templates. It allows administrators to:

1. Browse all email templates by category and language
2. Customize template variables
3. Preview how emails will appear in different formats (HTML, plain text, mobile)
4. Send test emails to verify appearance and content
5. Copy HTML for sharing or debugging

## Features

### Template Organization

- **Search:** Find templates by name or description
- **Category Filtering:** Filter templates by their functional category (Payment, Account, Mass, etc.)
- **Language Filtering:** Filter templates by language (EN, PL, etc.)

### Template Variables

- **JSON Editor:** Edit template variables in JSON format
- **Format:** Automatically format JSON for better readability
- **Validate:** Check if JSON is valid
- **Reset:** Reset variables to their default values

### Preview Options

- **HTML View:** See the full HTML email as it will be rendered
- **Plain Text:** View the plain text version of the email
- **Mobile View:** Preview how the email will appear on mobile devices
- **Metadata:** View subject, to, and from fields

### Actions

- **Send Test Email:** Send the current template to any email address for testing
- **Copy HTML:** Copy the rendered HTML to clipboard

## Usage Instructions

1. **Select a Template:**

   - Use the search box to find a specific template
   - Use category and language filters to narrow down options
   - Select a template from the dropdown list

2. **Customize Variables:**

   - Edit the JSON in the variables editor
   - Use the Format button to improve readability
   - Use the Validate button to check for errors
   - Use the Reset button to revert to default values

3. **Preview the Email:**

   - Switch between HTML, Plain Text, and Mobile views
   - Check how the email will appear with current variables

4. **Send Test Email:**
   - Enter a test email address
   - Click Send to deliver a test email

## Technical Details

The Email Preview Tool uses:

- **TemplateEngine:** Renders templates with variable placeholders
- **EmailService:** Sends emails via the configured mail provider
- **Template Format:** Templates use `{{variableName}}` syntax for variable insertion
- **Variables:** Support nested objects with dot notation like `{{user.name}}`

## Adding New Templates

When adding new email templates to the system:

1. Add the template to `emailTemplates.ts`
2. Add the template to the `templateOptions` array in `EmailPreviewTool.tsx`
3. Include proper category and language metadata
4. Define default variables for testing

## Troubleshooting

- **Template Not Rendering:** Check that variables match the placeholders in the template
- **JSON Errors:** Use the Validate button to check for proper JSON formatting
- **Test Email Not Sending:** Verify SMTP settings in the environment configuration
- **Variable Errors:** Make sure all required variables are provided in the JSON editor
