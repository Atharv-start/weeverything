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
export class CashfreePaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(CashfreePaymentProvider.name);

  private get appId(): string {
    return process.env.CASHFREE_APP_ID || '';
  }

  private get secretKey(): string {
    return process.env.CASHFREE_SECRET_KEY || '';
  }

  private get webhookSecret(): string {
    return process.env.CASHFREE_WEBHOOK_SECRET || this.secretKey;
  }

  private get baseUrl(): string {
    return process.env.PAYMENT_MODE === 'live'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  async createPaymentOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    if (!this.appId || !this.secretKey) {
      throw new BadRequestException('Cashfree credentials not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
    }

    const orderId = `cf_${Date.now()}_${params.idempotencyKey.slice(0, 8)}`;
    const payload = {
      order_id: orderId,
      order_amount: params.amount / 100, // Cashfree expects rupees float
      order_currency: params.currency || 'INR',
      customer_details: {
        customer_id: params.userId,
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `${process.env.WEB_URL || 'http://localhost:3000'}/wallet?cf_order_id={order_id}`,
      },
      order_note: params.note || 'WeEverything Wallet Topup',
    };

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Cashfree order creation failed: ${errText}`);
      throw new BadRequestException(`Cashfree API Error: ${response.statusText}`);
    }

    const orderData = (await response.json()) as any;
    const payeeVpa = params.upiVpa || 'merchant@cashfree';
    const amountInRupees = (params.amount / 100).toFixed(2);
    const payeeName = 'WeEverything Super App';

    const upiIntentUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(orderId)}&tr=${orderId}`;

    return {
      providerOrderId: orderData.order_id,
      provider: 'CASHFREE',
      amount: params.amount,
      currency: params.currency || 'INR',
      upiIntentUri,
      qrPayload: orderData.payment_session_id || upiIntentUri,
      status: 'INITIATED',
      rawPayload: orderData,
    };
  }

  async verifyPaymentSignature(params: VerifyPaymentParams): Promise<boolean> {
    const status = await this.getPaymentStatus(params.providerOrderId);
    return status === 'SUCCESS';
  }

  async parseWebhook(body: any, headers: Record<string, any>): Promise<WebhookVerificationResult> {
    const signature = headers['x-webhook-signature'];
    const timestamp = headers['x-webhook-timestamp'];
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);

    if (this.webhookSecret && signature && timestamp) {
      const expectedSig = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(`${timestamp}${rawBody}`)
        .digest('hex');

      if (expectedSig !== signature) {
        return { isValid: false, eventType: body.type || 'unknown', failureReason: 'Invalid Cashfree webhook signature' };
      }
    }

    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const orderId = parsed.data?.order?.order_id;
    const paymentId = parsed.data?.payment?.cf_payment_id;
    const amount = parsed.data?.order?.order_amount ? Math.round(parsed.data.order.order_amount * 100) : undefined;
    const status = parsed.data?.payment?.payment_status;

    const isValid = status === 'SUCCESS';

    return {
      isValid,
      eventType: parsed.type || 'PAYMENT_SUCCESS',
      providerOrderId: orderId,
      providerPaymentId: String(paymentId),
      amount,
      currency: 'INR',
      rawPayload: parsed,
    };
  }

  async getPaymentStatus(providerOrderId: string): Promise<string> {
    if (!this.appId || !this.secretKey) return 'PENDING';

    const res = await fetch(`${this.baseUrl}/orders/${providerOrderId}`, {
      headers: {
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    if (!res.ok) return 'PENDING';
    const data = (await res.json()) as any;
    return data.order_status === 'PAID' ? 'SUCCESS' : String(data.order_status);
  }
}
