import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Headers,
  UseGuards,
  HttpCode,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('order')
  createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    return this.paymentService.createOrder(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  findMine(@Req() req) {
    return this.paymentService.findMyOrders(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.paymentService.findOrder(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/cancel')
  cancel(@Param('id') id: string, @Req() req) {
    return this.paymentService.cancelOrder(id, req.user.userId);
  }

  // Public — called by Stripe. Signature is verified with the raw body.
  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for webhook');
    }
    return this.paymentService.handleWebhook(req.rawBody, signature);
  }
}
