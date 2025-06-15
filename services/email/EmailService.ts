import nodemailer from 'nodemailer';
import { Payment } from '@/types/payment';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendPaymentConfirmation(
    payment: Payment,
    order: any,
    recipient: string
  ) {
    const emailContent = this.getPaymentConfirmationTemplate(payment, order);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: 'Potwierdzenie płatności - Oremus',
      html: emailContent,
    });
  }

  async sendPaymentFailure(
    payment: Payment,
    order: any,
    recipient: string,
    error?: string
  ) {
    const emailContent = this.getPaymentFailureTemplate(payment, order, error);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: 'Problem z płatnością - Oremus',
      html: emailContent,
    });
  }

  async sendPaymentRefunded(
    payment: Payment,
    order: any,
    recipient: string
  ) {
    const emailContent = this.getPaymentRefundTemplate(payment, order);

    await this.transporter.sendMail({
      from: `"Oremus" <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: 'Zwrot płatności - Oremus',
      html: emailContent,
    });
  }

  private getPaymentConfirmationTemplate(payment: Payment, order: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Potwierdzenie płatności</h1>
        
        <p>Dziękujemy za złożenie zamówienia w serwisie Oremus. Twoja płatność została zrealizowana pomyślnie.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Szczegóły zamówienia:</h3>
          <p><strong>Numer zamówienia:</strong> #${order.id}</p>
          <p><strong>Data:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
          <p><strong>Kwota:</strong> ${payment.amount} zł</p>
          <p><strong>Metoda płatności:</strong> ${this.getPaymentMethodName(payment.method)}</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">Szczegóły intencji mszalnej:</h3>
          <p><strong>Rodzaj Mszy:</strong> ${order.mass_type}</p>
          <p><strong>Data:</strong> ${new Date(order.preferred_date).toLocaleDateString()}</p>
          <p><strong>Kościół:</strong> ${order.church_name}</p>
        </div>

        <p style="margin-top: 20px;">
          W razie jakichkolwiek pytań, prosimy o kontakt pod adresem
          <a href="mailto:contact@oremus.app">contact@oremus.app</a>
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <small>Oremus - Łączymy w modlitwie</small>
        </div>
      </div>
    `;
  }

  private getPaymentFailureTemplate(payment: Payment, order: any, error?: string): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Problem z płatnością</h1>
        
        <p>Wystąpił problem z realizacją płatności w serwisie Oremus.</p>
        
        <div style="background: #fff0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #cc0000;">Szczegóły błędu:</h3>
          <p>${error || 'Płatność nie mogła zostać zrealizowana.'}</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">Szczegóły zamówienia:</h3>
          <p><strong>Numer zamówienia:</strong> #${order.id}</p>
          <p><strong>Kwota:</strong> ${payment.amount} zł</p>
        </div>

        <p style="margin-top: 20px;">
          Możesz spróbować ponownie dokonać płatności klikając poniższy przycisk:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/order-mass?resume=${order.id}"
             style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Spróbuj ponownie
          </a>
        </div>

        <p>
          Jeśli problem będzie się powtarzał, prosimy o kontakt z naszym zespołem:
          <a href="mailto:contact@oremus.app">contact@oremus.app</a>
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <small>Oremus - Łączymy w modlitwie</small>
        </div>
      </div>
    `;
  }

  private getPaymentRefundTemplate(payment: Payment, order: any): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Potwierdzenie zwrotu płatności</h1>
        
        <p>Informujemy, że dokonaliśmy zwrotu płatności za zamówienie w serwisie Oremus.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Szczegóły zwrotu:</h3>
          <p><strong>Numer zamówienia:</strong> #${order.id}</p>
          <p><strong>Data zwrotu:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Kwota zwrotu:</strong> ${payment.amount} zł</p>
        </div>

        <p>
          Środki powinny pojawić się na Twoim koncie w ciągu 3-5 dni roboczych, 
          w zależności od Twojego banku.
        </p>

        <p style="margin-top: 20px;">
          W razie jakichkolwiek pytań, prosimy o kontakt pod adresem
          <a href="mailto:contact@oremus.app">contact@oremus.app</a>
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <small>Oremus - Łączymy w modlitwie</small>
        </div>
      </div>
    `;
  }

  private getPaymentMethodName(method: string): string {
    const methods: Record<string, string> = {
      card: 'Karta płatnicza',
      blik: 'BLIK',
      p24: 'Przelewy24',
      transfer: 'Przelew bankowy',
      cash: 'Gotówka'
    };
    return methods[method] || method;
  }
}
