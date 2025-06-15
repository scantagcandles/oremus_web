import { formatDate } from '@/lib/utils/date'
import type { PaymentFailureNotification } from '@/types/notifications'

export function getPaymentFailureTemplate(data: PaymentFailureNotification) {
  return {
    subject: 'Problem z płatnością za intencję mszalną',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Problem z płatnością</h1>
          <p>Wystąpił problem z płatnością za intencję mszalną:</p>
          
          <div style="padding: 20px; background: #f5f5f5; margin: 20px 0;">
            <p><strong>Kościół:</strong> ${data.intention.church.name}</p>
            <p><strong>Data mszy:</strong> ${formatDate(data.intention.date)}</p>
            <p><strong>Godzina:</strong> ${data.intention.time}</p>
            <p><strong>Powód błędu:</strong> ${data.error.message}</p>
          </div>

          <p>Możesz ponowić płatność klikając w poniższy link:</p>
          <a href="${data.retryUrl}" style="display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
            Ponów płatność
          </a>
        </body>
      </html>
    `
  }
}