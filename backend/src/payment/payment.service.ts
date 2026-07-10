import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AnnonceStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

const paidOrderStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(secretKey);
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
  }

  async createOrder(buyerUserId: string, dto: CreateOrderDto) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id: dto.annonceId },
    });

    if (!annonce) throw new NotFoundException('Annonce not found');

    if (dto.quantity !== 1) {
      throw new BadRequestException('Direct purchase is only available for the full lot');
    }

    if (annonce.creatorUserId === buyerUserId) {
      throw new ForbiddenException('You cannot buy your own annonce');
    }

    if (annonce.price == null || annonce.price <= 0) {
      throw new BadRequestException('This annonce has no price set');
    }

    if (annonce.status !== AnnonceStatus.PUBLISHED) {
      throw new ForbiddenException('This annonce is not available for purchase');
    }

    // Le buyer a-t-il déjà payé cette annonce ?
    const myPaidOrder = await this.prisma.order.findFirst({
      where: { annonceId: dto.annonceId, buyerUserId, status: { in: paidOrderStatuses } },
    });
    if (myPaidOrder) {
      return {
        orderId: myPaidOrder.id,
        clientSecret: null,
        amount: myPaidOrder.totalAmount,
        currency: myPaidOrder.currency,
        status: myPaidOrder.status,
        alreadyPaid: true,
      };
    }

    // Bloquer si un autre acheteur a déjà payé (évite la double vente)
    const paidByAnyone = await this.prisma.order.findFirst({
      where: { annonceId: dto.annonceId, status: { in: paidOrderStatuses } },
    });
    if (paidByAnyone) {
      throw new ForbiddenException('This annonce has already been sold');
    }

    const pendingByAnotherBuyer = await this.prisma.order.findFirst({
      where: {
        annonceId: dto.annonceId,
        status: OrderStatus.PENDING,
        NOT: { buyerUserId },
      },
    });
    if (pendingByAnotherBuyer) {
      throw new ForbiddenException('This annonce is already being purchased');
    }

    const quantity = 1;
    const unitPrice = annonce.price;
    const totalAmount = Math.round(unitPrice * quantity * 100); // cents
    if (totalAmount < 1) {
      throw new BadRequestException('Order total is too low');
    }

    // Reprise : si une commande PENDING existe déjà, réutiliser son PaymentIntent
    const pending = await this.prisma.order.findFirst({
      where: { annonceId: dto.annonceId, buyerUserId, status: OrderStatus.PENDING },
    });

    if (pending?.stripePaymentIntentId) {
      const reused = await this.tryReusePendingOrder(pending, quantity, unitPrice, totalAmount);
      if (reused) return reused;
      // PaymentIntent inutilisable → on annule l'ancienne commande et on en recrée une
      await this.prisma.order.update({
        where: { id: pending.id },
        data: { status: OrderStatus.CANCELED },
      });
    }

    return this.createFreshOrder(annonce.id, buyerUserId, quantity, unitPrice, totalAmount);
  }

  private async tryReusePendingOrder(
    pending: { id: string; stripePaymentIntentId: string | null },
    quantity: number,
    unitPrice: number,
    totalAmount: number,
  ) {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(
        pending.stripePaymentIntentId!,
      );

      if (intent.status === 'succeeded') {
        // Webhook en retard : on réconcilie et on signale que c'est déjà payé.
        await this.markOrderPaid(intent);
        return {
          orderId: pending.id,
          clientSecret: null,
          amount: totalAmount,
          currency: intent.currency,
          status: OrderStatus.PAID,
          alreadyPaid: true,
        };
      }

      if (intent.status === 'canceled') {
        return null; // non réutilisable
      }

      // Réutilisable : mettre à jour le montant si la quantité a changé
      let clientSecret = intent.client_secret;
      if (intent.amount !== totalAmount) {
        const updated = await this.stripe.paymentIntents.update(intent.id, {
          amount: totalAmount,
        });
        clientSecret = updated.client_secret;
        await this.prisma.order.update({
          where: { id: pending.id },
          data: { quantity, unitPrice, totalAmount },
        });
      }

      return {
        orderId: pending.id,
        clientSecret,
        amount: totalAmount,
        currency: 'eur',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.warn(`Could not reuse pending intent: ${(err as Error).message}`);
      return null;
    }
  }

  private async createFreshOrder(
    annonceId: string,
    buyerUserId: string,
    quantity: number,
    unitPrice: number,
    totalAmount: number,
  ) {
    // Create the order first so the webhook has something to reconcile against.
    const order = await this.prisma.order.create({
      data: {
        annonceId,
        buyerUserId,
        quantity,
        unitPrice,
        totalAmount,
        currency: 'eur',
        status: OrderStatus.PENDING,
      },
    });

    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.id, annonceId, buyerUserId },
      });
    } catch (err) {
      this.logger.error('Stripe paymentIntent creation failed', err as Error);
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      });
      throw new InternalServerErrorException('Payment initialization failed');
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      currency: 'eur',
    };
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerUserId !== userId) throw new ForbiddenException('Access denied');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    if (order.stripePaymentIntentId) {
      try {
        await this.stripe.paymentIntents.cancel(order.stripePaymentIntentId);
      } catch (err) {
        this.logger.warn(`Could not cancel intent: ${(err as Error).message}`);
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED },
    });
  }

  async confirmDelivery(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerUserId !== userId) throw new ForbiddenException('Access denied');

    if (order.status === OrderStatus.DELIVERED) {
      return this.findOrder(orderId, userId);
    }

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('Only paid orders can be marked as delivered');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DELIVERED },
    });

    return this.findOrder(orderId, userId);
  }

  async syncOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerUserId !== userId) throw new ForbiddenException('Access denied');

    if (!order.stripePaymentIntentId) {
      return this.findOrder(orderId, userId);
    }

    const intent = await this.stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

    if (intent.status === 'succeeded') {
      await this.markOrderPaid(intent);
    } else if (intent.status === 'canceled') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELED },
      });
    }

    return this.findOrder(orderId, userId);
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.webhookSecret) {
      throw new InternalServerErrorException('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.markOrderPaid(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.markOrderFailed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private async markOrderPaid(intent: Stripe.PaymentIntent) {
    const order = await this.prisma.order.findUnique({
      where: { stripePaymentIntentId: intent.id },
      include: {
        buyer: { select: { email: true, username: true } },
        annonce: {
          select: {
            title: true,
            creator: { select: { email: true, username: true } },
          },
        },
      },
    });
    if (!order) {
      this.logger.warn(`No order found for paymentIntent ${intent.id}`);
      return;
    }

    const wasAlreadyPaid = paidOrderStatuses.includes(order.status);

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: wasAlreadyPaid ? order.status : OrderStatus.PAID },
      }),
      this.prisma.annonce.update({
        where: { id: order.annonceId },
        data: { status: AnnonceStatus.SOLD },
      }),
      this.prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          stripePaymentId: intent.id,
          amount: intent.amount_received ?? order.totalAmount,
          currency: intent.currency,
          status: PaymentStatus.SUCCEEDED,
        },
        update: {
          status: PaymentStatus.SUCCEEDED,
          amount: intent.amount_received ?? order.totalAmount,
        },
      }),
    ]);

    this.logger.log(`Order ${order.id} marked as PAID`);

    if (wasAlreadyPaid) return;

    // Emails après la transaction — les erreurs mail ne doivent pas bloquer le paiement.
    const mailData = {
      orderId: order.id,
      annonceTitle: order.annonce.title,
      quantity: order.quantity,
      totalAmount: intent.amount_received ?? order.totalAmount,
      currency: intent.currency,
      buyerUsername: order.buyer.username,
      buyerEmail: order.buyer.email,
      sellerUsername: order.annonce.creator.username,
      sellerEmail: order.annonce.creator.email,
    };

    await Promise.all([
      this.mail.sendOrderConfirmationBuyer(mailData),
      this.mail.sendOrderNotificationSeller(mailData),
    ]);
  }

  private async markOrderFailed(intent: Stripe.PaymentIntent) {
    const order = await this.prisma.order.findUnique({
      where: { stripePaymentIntentId: intent.id },
    });
    if (!order) return;

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      }),
      this.prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          stripePaymentId: intent.id,
          amount: order.totalAmount,
          currency: intent.currency,
          status: PaymentStatus.FAILED,
        },
        update: { status: PaymentStatus.FAILED },
      }),
    ]);

    this.logger.warn(`Order ${order.id} marked as FAILED`);
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [
          { buyerUserId: userId },
          { annonce: { creatorUserId: userId } },
        ],
      },
      include: {
        annonce: {
          select: {
            id: true,
            title: true,
            images: true,
            creatorUserId: true,
            price: true,
            volume: true,
            volumeUnit: true,
            location: true,
            city: true,
            region: true,
            productType: true,
            status: true,
            entreprise: { select: { id: true, name: true } },
          },
        },
        buyer: { select: { id: true, username: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        annonce: {
          select: {
            id: true,
            title: true,
            images: true,
            creatorUserId: true,
            price: true,
            volume: true,
            volumeUnit: true,
            location: true,
            city: true,
            region: true,
            productType: true,
            status: true,
            entreprise: { select: { id: true, name: true } },
          },
        },
        buyer: { select: { id: true, username: true } },
        payment: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isParticipant =
      order.buyerUserId === userId || order.annonce.creatorUserId === userId;
    if (!isParticipant) throw new ForbiddenException('Access denied');

    return order;
  }
}
