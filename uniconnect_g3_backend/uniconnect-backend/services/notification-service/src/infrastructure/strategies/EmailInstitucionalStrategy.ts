import sgMail from '@sendgrid/mail';
// @ts-ignore
import mjml2html from 'mjml';
import * as fs from 'fs';
import * as path from 'path';
import { INotificacionStrategy, StrategyResult } from '../../domain/strategies/INotificacionStrategy';
import { INotificacionDTO } from '../../domain/entities/INotificacion';

export class EmailInstitucionalStrategy implements INotificacionStrategy {
  public canal: string;

  constructor() {
    this.canal = 'email';
    
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  private async _renderTemplate(data: { userName?: string; title: string; body: string }): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '../templates/NotificationTemplate.mjml');
      let mjmlString = fs.readFileSync(templatePath, 'utf8');

      const renderedMjml = mjmlString
        .replace(/{{userName}}/g, data.userName || 'Estudiante')
        .replace(/{{title}}/g, data.title)
        .replace(/{{body}}/g, data.body);

      const htmlOutput = (mjml2html.default || mjml2html)(renderedMjml);

      return htmlOutput.html;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[EmailStrategy] Error rendering MJML template:', errMsg);
      throw new Error('TEMPLATE_RENDER_ERROR');
    }
  }

  async enviar(notification: INotificacionDTO): Promise<StrategyResult> {
    try {
      console.log(`[EmailStrategy] Preparing email for user ${notification.userId}`);

      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY_NOT_CONFIGURED');
      }

      const emailVal = notification.metadata?.email;
      const recipientEmail = typeof emailVal === 'string' ? emailVal : `${notification.userId}@unicaldas.edu.co`;

      const nameVal = notification.metadata?.userName;
      const userName = typeof nameVal === 'string' ? nameVal : undefined;

      const htmlContent = await this._renderTemplate({
        userName,
        title: notification.title,
        body: notification.body
      });

      const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@uniconnect.edu.co',
        subject: `UniConnect: ${notification.title}`,
        text: notification.body,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      
      console.log(`[EmailStrategy] Email dispatched successfully via SendGrid to ${recipientEmail}`);

      return {
        canal: 'email',
        enviado: true,
        messageId: response[0]?.headers['x-message-id'] || 'sent'
      };

    } catch (error: unknown) {
      const err = error as { response?: { body?: unknown }; message?: string };
      const errMsg = err.response?.body || err.message || String(error);
      console.error('[EmailStrategy] Failed to dispatch email:', errMsg);
      
      return {
        canal: 'email',
        enviado: false,
        error: err.message || 'SENDGRID_DISPATCH_FAILURE'
      };
    }
  }
}
