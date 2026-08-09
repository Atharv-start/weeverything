import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  IPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  WebhookVerificationResult,
} from './payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayPaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(RazorpayPaymentProvider.name);

  private get keyId(): string {
    return process.env.RAZORPAY_KEY_ID || '';
  }

  private get keySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || '';
  }

  private get webhookSecret(): string {
    return process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  async createPaymentOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    if (!this.keyId || !this.keySecret) {
      throw new BadRequestException('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }

    const payload = {
      amount: params.amount, // in paise
      currency: params.currency || 'INR',
      receipt: params.idempotencyKey,
      notes: {
        userId: params.userId,
        note: params.note || 'WeEverything Wallet Topup',
      },
    };

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Razorpay order creation failed: ${errText}`);
      throw new BadRequestException(`Razorpay API Error: ${response.statusText}`);
    }

    const orderData = (await response.json()) as any;
    const orderId = orderData.id;
    const amountInRupees = (params.amount / 100).toFixed(2);
    const payeeVpa = params.upiVpa || 'merchant@razorpay';
    const payeeName = 'WeEverything Super App';

    // Standard NPCI UPI Intent URI for Razorpay Order
    const upiIntentUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(orderId)}&tr=${orderId}`;

    return {
      providerOrderId: orderId,
      provider: 'RAZORPAY',
      amount: orderData.amount,
      currency: orderData.currency,
      upiIntentUri,
      qrPayload: upiIntentUri,
      status: 'INITIATED',
      rawPayload: orderData,
    };
  }

  async verifyPaymentSignature(params: VerifyPaymentParams): Promise<boolean> {
    if (!params.providerOrderId || !params.providerPaymentId || !params.providerSignature) {
      return false;
    }

    const text = `${params.providerOrderId}|${params.providerPaymentId}`;
    const generatedSig = crypto
      .createHmac('sha256', this.keySecret)
      .update(text)
      .digest('hex');

    return generatedSig === params.providerSignature;
  }

  async parseWebhook(body: any, headers: Record<string, any>): Promise<WebhookVerificationResult> {
    const signature = headers['x-razorpay-signature'];
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);

    if (this.webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        this.logger.warn('Razorpay webhook HMAC signature mismatch');
        return { isValid: false, eventType: body.event || 'unknown', failureReason: 'Invalid webhook signature' };
      }
    }

    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    const event = parsedBody.event || '';
    const paymentEntity = parsedBody.payload?.payment?.entity;
    const orderEntity = parsedBody.payload?.order?.entity;

    const providerOrderId = paymentEntity?.order_id || orderEntity?.id;
    const providerPaymentId = paymentEntity?.id;
    const amount = paymentEntity?.amount || orderEntity?.amount;
    const currency = paymentEntity?.currency || orderEntity?.currency || 'INR';

    const isValid = event === 'payment.captured' || event === 'order.paid';

    return {
      isValid,
      eventType: event,
      providerOrderId,
      providerPaymentId,
      amount,
      currency,
      failureReason: isValid ? undefined : `Unhandled webhook event: ${event}`,
      rawPayload: parsedBody,
    };
  }

  async getPaymentStatus(providerOrderId: string): Promise<string> {
    if (!this.keyId || !this.keySecret) return 'PENDING';
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/orders/${providerOrderId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) return 'PENDING';
    const data = (await res.json()) as any;
    return data.status === 'paid' ? 'SUCCESS' : String(data.status).toUpperCase();
  }
}
