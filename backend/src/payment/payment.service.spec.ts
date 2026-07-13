import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AnnonceStatus, OrderStatus } from '@prisma/client';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: any;
  let stripe: any;

  beforeEach(() => {
    prisma = {
      annonce: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      payment: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const config = {
      get: jest.fn((key: string) => {
        if (key === 'STRIPE_SECRET_KEY') return 'sk_test_fake';
        if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_fake';
        return '';
      }),
    };

    const mail = {
      sendOrderConfirmationBuyer: jest.fn(),
      sendOrderNotificationSeller: jest.fn(),
    };

    stripe = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    service = new PaymentService(prisma, config as any, mail as any);
    (service as any).stripe = stripe;
  });

  it('rejects partial direct purchases', async () => {
    prisma.annonce.findUnique.mockResolvedValue({
      id: 'annonce-1',
      creatorUserId: 'seller-1',
      price: 1500,
      status: AnnonceStatus.PUBLISHED,
    });

    await expect(
      service.createOrder('buyer-1', { annonceId: 'annonce-1', quantity: 2 }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it('creates a Stripe payment intent for one full lot', async () => {
    prisma.annonce.findUnique.mockResolvedValue({
      id: 'annonce-1',
      creatorUserId: 'seller-1',
      price: 1500,
      status: AnnonceStatus.PUBLISHED,
    });
    prisma.order.findFirst.mockResolvedValue(null);
    prisma.order.create.mockResolvedValue({
      id: 'order-1',
      annonceId: 'annonce-1',
      buyerUserId: 'buyer-1',
      quantity: 1,
      unitPrice: 1500,
      totalAmount: 150000,
      status: OrderStatus.PENDING,
    });
    prisma.order.update.mockResolvedValue({});
    stripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_1',
      client_secret: 'secret_1',
    });

    const result = await service.createOrder('buyer-1', {
      annonceId: 'annonce-1',
      quantity: 1,
    });

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          quantity: 1,
          unitPrice: 1500,
          totalAmount: 150000,
        }),
      }),
    );
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 150000,
        currency: 'eur',
        metadata: expect.objectContaining({ orderId: 'order-1' }),
      }),
    );
    expect(result).toMatchObject({
      orderId: 'order-1',
      clientSecret: 'secret_1',
      amount: 150000,
      currency: 'eur',
    });
  });

  it('blocks another buyer while the annonce is being purchased', async () => {
    prisma.annonce.findUnique.mockResolvedValue({
      id: 'annonce-1',
      creatorUserId: 'seller-1',
      price: 1500,
      status: AnnonceStatus.PUBLISHED,
    });
    prisma.order.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'order-pending', buyerUserId: 'buyer-2' });

    await expect(
      service.createOrder('buyer-1', { annonceId: 'annonce-1', quantity: 1 }),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it('reconciles a pending order when Stripe already succeeded', async () => {
    prisma.annonce.findUnique.mockResolvedValue({
      id: 'annonce-1',
      creatorUserId: 'seller-1',
      price: 1500,
      status: AnnonceStatus.PUBLISHED,
    });
    prisma.order.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'order-1',
        stripePaymentIntentId: 'pi_1',
      });
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      annonceId: 'annonce-1',
      buyerUserId: 'buyer-1',
      quantity: 1,
      totalAmount: 150000,
      status: OrderStatus.PENDING,
      buyer: { email: 'buyer@example.test', username: 'buyer' },
      annonce: {
        title: 'Lot test',
        creator: { email: 'seller@example.test', username: 'seller' },
      },
    });
    prisma.$transaction.mockResolvedValue([]);
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
      amount_received: 150000,
      currency: 'eur',
    });

    const result = await service.createOrder('buyer-1', {
      annonceId: 'annonce-1',
      quantity: 1,
    });

    expect(result).toMatchObject({
      orderId: 'order-1',
      clientSecret: null,
      status: OrderStatus.PAID,
      alreadyPaid: true,
    });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it('syncs a paid Stripe payment intent into a paid order', async () => {
    prisma.order.findUnique
      .mockResolvedValueOnce({
        id: 'order-1',
        buyerUserId: 'buyer-1',
        stripePaymentIntentId: 'pi_1',
        status: OrderStatus.PENDING,
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        annonceId: 'annonce-1',
        buyerUserId: 'buyer-1',
        quantity: 1,
        totalAmount: 150000,
        status: OrderStatus.PENDING,
        buyer: { email: 'buyer@example.test', username: 'buyer' },
        annonce: {
          title: 'Lot test',
          creator: { email: 'seller@example.test', username: 'seller' },
        },
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        buyerUserId: 'buyer-1',
        status: OrderStatus.PAID,
        annonce: { creatorUserId: 'seller-1' },
      });
    prisma.$transaction.mockResolvedValue([]);
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
      amount_received: 150000,
      currency: 'eur',
    });

    const result = await service.syncOrder('order-1', 'buyer-1');

    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_1');
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'order-1', status: OrderStatus.PAID });
  });

  it('marks a paid order as delivered for the buyer', async () => {
    prisma.order.findUnique
      .mockResolvedValueOnce({
        id: 'order-1',
        buyerUserId: 'buyer-1',
        status: OrderStatus.PAID,
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        buyerUserId: 'buyer-1',
        status: OrderStatus.DELIVERED,
        annonce: { creatorUserId: 'seller-1' },
      });
    prisma.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
    });

    const result = await service.confirmDelivery('order-1', 'buyer-1');

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: OrderStatus.DELIVERED },
    });
    expect(result).toMatchObject({ id: 'order-1', status: OrderStatus.DELIVERED });
  });

  it('rejects delivery confirmation before payment', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      buyerUserId: 'buyer-1',
      status: OrderStatus.PENDING,
    });

    await expect(service.confirmDelivery('order-1', 'buyer-1')).rejects.toThrow(
      BadRequestException,
    );

    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it('does not regress delivered orders when Stripe sync runs late', async () => {
    prisma.order.findUnique
      .mockResolvedValueOnce({
        id: 'order-1',
        buyerUserId: 'buyer-1',
        stripePaymentIntentId: 'pi_1',
        status: OrderStatus.DELIVERED,
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        annonceId: 'annonce-1',
        buyerUserId: 'buyer-1',
        quantity: 1,
        totalAmount: 150000,
        status: OrderStatus.DELIVERED,
        buyer: { email: 'buyer@example.test', username: 'buyer' },
        annonce: {
          title: 'Lot test',
          creator: { email: 'seller@example.test', username: 'seller' },
        },
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        buyerUserId: 'buyer-1',
        status: OrderStatus.DELIVERED,
        annonce: { creatorUserId: 'seller-1' },
      });
    prisma.$transaction.mockResolvedValue([]);
    stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
      amount_received: 150000,
      currency: 'eur',
    });

    const result = await service.syncOrder('order-1', 'buyer-1');

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: OrderStatus.DELIVERED },
      }),
    );
    expect(result).toMatchObject({ id: 'order-1', status: OrderStatus.DELIVERED });
  });
});
