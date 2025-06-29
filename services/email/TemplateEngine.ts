export interface TemplateVariables {
  [key: string]: string | number | boolean | Date | null | undefined | TemplateVariables | Array<any>;
}

export class TemplateEngine {
  /**
   * Renders a template string by replacing placeholders with actual values
   * 
   * @param template Template string with {{variable}} placeholders
   * @param variables Object containing variables to replace
   * @returns Rendered template string
   */
  static render(template: string, variables: TemplateVariables): string {
    return template.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
      // Handle nested properties using dot notation (e.g., user.name)
      const props = key.trim().split('.');
      let value: any = variables;
      
      for (const prop of props) {
        if (value === undefined || value === null) {
          return '';
        }
        value = value[prop];
      }

      // Format dates if the value is a Date object
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      
      // Return empty string for undefined/null values
      if (value === undefined || value === null) {
        return '';
      }
      
      return String(value);
    });
  }

  /**
   * Loads and renders an email template
   * 
   * @param template Template HTML string
   * @param variables Variables to replace in the template
   * @returns Rendered HTML
   */
  static renderEmail(template: string, variables: TemplateVariables): string {
    // First render the content
    const renderedContent = this.render(template, variables);
    
    // Then wrap it in the base template if it doesn't already contain the doctype
    if (!renderedContent.includes('<!DOCTYPE html>')) {
      return this.wrapInBaseTemplate(renderedContent, variables);
    }
    
    return renderedContent;
  }

  /**
   * Wraps content in a base email template
   * 
   * @param content Email content
   * @param variables Variables for the base template
   * @returns Complete HTML email
   */
  private static wrapInBaseTemplate(content: string, variables: TemplateVariables): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{title}}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          .logo {
            max-width: 150px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #4a6cf7;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://oremus.app/logo.png" alt="Oremus Logo" class="logo">
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Oremus. All rights reserved.</p>
          <p>If you have any questions, please contact <a href="mailto:support@oremus.app">support@oremus.app</a></p>
        </div>
      </body>
      </html>
    `;
    
    return this.render(baseTemplate, {
      title: variables.title || 'Oremus',
      ...variables
    });
  }
}
