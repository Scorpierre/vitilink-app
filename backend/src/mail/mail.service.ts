import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface OrderMailData {
  annonceTitle: string;
  quantity: number;
  totalAmount: number; // cents
  currency: string;
  orderId: string;
  buyerUsername: string;
  buyerEmail: string;
  sellerUsername: string;
  sellerEmail: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private config: ConfigService) {
    this.from = config.get<string>('MAIL_FROM') ?? 'VitiLink <noreply@vitilink.app>';

    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST') ?? 'sandbox.smtp.mailtrap.io',
      port: parseInt(config.get<string>('SMTP_PORT') ?? '2525', 10),
      auth: {
        user: config.get<string>('SMTP_USER') ?? '',
        pass: config.get<string>('SMTP_PASS') ?? '',
      },
    });
  }

  async sendOrderConfirmationBuyer(data: OrderMailData) {
    const amount = (data.totalAmount / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: data.currency.toUpperCase(),
    });

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: data.buyerEmail,
        subject: `Commande confirmée — ${data.annonceTitle}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
            <h2 style="color:#3f1d6e;margin-bottom:8px">Votre commande est confirmée</h2>
            <p style="color:#555">Bonjour ${data.buyerUsername},</p>
            <p style="color:#555">Votre paiement a bien été reçu. Voici le récapitulatif de votre commande.</p>

            <div style="background:#f8f4ff;border-radius:12px;padding:20px;margin:24px 0">
              <div style="font-weight:600;color:#3f1d6e;font-size:16px;margin-bottom:12px">${data.annonceTitle}</div>
              <table style="width:100%;color:#555;font-size:14px">
                <tr><td style="padding:4px 0">Quantité</td><td style="text-align:right">${data.quantity}</td></tr>
                <tr><td style="padding:4px 0">Montant total</td><td style="text-align:right;font-weight:700;color:#3f1d6e">${amount}</td></tr>
                <tr><td style="padding:4px 0;color:#888">Référence</td><td style="text-align:right;color:#888;font-size:12px">${data.orderId}</td></tr>
              </table>
            </div>

            <p style="color:#555">Le vendeur <strong>${data.sellerUsername}</strong> a été notifié et prendra contact avec vous pour organiser la livraison.</p>
            <p style="color:#888;font-size:13px;margin-top:32px">— L'équipe VitiLink</p>
          </div>
        `,
      });
      this.logger.log(`Buyer confirmation mail sent to ${data.buyerEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send buyer mail: ${(err as Error).message}`);
    }
  }

  async sendOrderNotificationSeller(data: OrderMailData) {
    const amount = (data.totalAmount / 100).toLocaleString('fr-FR', {
      style: 'currency',
      currency: data.currency.toUpperCase(),
    });

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: data.sellerEmail,
        subject: `Nouvelle commande reçue — ${data.annonceTitle}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
            <h2 style="color:#3f1d6e;margin-bottom:8px">Vous avez reçu une commande</h2>
            <p style="color:#555">Bonjour ${data.sellerUsername},</p>
            <p style="color:#555">Un acheteur vient d'effectuer un paiement sur l'une de vos annonces.</p>

            <div style="background:#f8f4ff;border-radius:12px;padding:20px;margin:24px 0">
              <div style="font-weight:600;color:#3f1d6e;font-size:16px;margin-bottom:12px">${data.annonceTitle}</div>
              <table style="width:100%;color:#555;font-size:14px">
                <tr><td style="padding:4px 0">Acheteur</td><td style="text-align:right"><strong>${data.buyerUsername}</strong></td></tr>
                <tr><td style="padding:4px 0">Quantité</td><td style="text-align:right">${data.quantity}</td></tr>
                <tr><td style="padding:4px 0">Montant reçu</td><td style="text-align:right;font-weight:700;color:#3f1d6e">${amount}</td></tr>
                <tr><td style="padding:4px 0;color:#888">Référence</td><td style="text-align:right;color:#888;font-size:12px">${data.orderId}</td></tr>
              </table>
            </div>

            <p style="color:#555">Prenez contact avec l'acheteur <strong>${data.buyerUsername}</strong> via la messagerie VitiLink pour organiser la livraison.</p>
            <p style="color:#888;font-size:13px;margin-top:32px">— L'équipe VitiLink</p>
          </div>
        `,
      });
      this.logger.log(`Seller notification mail sent to ${data.sellerEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send seller mail: ${(err as Error).message}`);
    }
  }
}
