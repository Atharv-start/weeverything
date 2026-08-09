import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  WebhookVerificationResult,
} from './payment-provider.interface';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';

@Injectable()
export class SandboxPaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(SandboxPaymentProvider.name);
  private readonly sandboxSecret = process.env.SANDBOX_WEBHOOK_SECRET || 'sandbox_webhook_secret_key_32chars';

  async createPaymentOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const orderId = `order_sb_${nanoid(12)}`;
    const amountInRupees = (params.amount / 100).toFixed(2);
    const payeeVpa = params.upiVpa || 'merchant.weeverything@upi';
    const payeeName = 'WeEverything Super App Sandbox';
    const note = params.note || `Wallet Topup ${params.idempotencyKey}`;

    const upiIntentUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}`;

    this.logger.log(`Created Sandbox payment order ${orderId} for ₹${amountInRupees}`);

    return {
      providerOrderId: orderId,
      provider: 'SANDBOX',
      amount: params.amount,
      currency: params.currency || 'INR',
      upiIntentUri,
      qrPayload: upiIntentUri,
      status: 'INITIATED',
      rawPayload: { mode: 'sandbox', created: true },
    };
  }

  async verifyPaymentSignature(params: VerifyPaymentParams): Promise<boolean> {
    if (!params.providerOrderId || !params.providerPaymentId) return false;
    const expectedSig = crypto
      .createHmac('sha256', this.sandboxSecret)
      .update(`${params.providerOrderId}|${params.providerPaymentId}`)
      .digest('hex');

    return params.providerSignature === expectedSig || params.providerPaymentId.startsWith('pay_sb_');
  }

  async parseWebhook(body: any, headers: Record<string, any>): Promise<WebhookVerificationResult> {
    const signature = headers['x-sandbox-signature'] || headers['x-signature'];
    const event = body.event || 'payment.captured';
    const orderId = body.orderId || body.payload?.orderId;
    const paymentId = body.paymentId || body.payload?.paymentId || `pay_sb_${nanoid(10)}`;
    const amount = body.amount || body.payload?.amount;
    const currency = body.currency || body.payload?.currency || 'INR';

    if (signature) {
      const expectedSig = crypto
        .createHmac('sha256', this.sandboxSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSig && signature !== 'sandbox_test_sig') {
        return { isValid: false, eventType: event, failureReason: 'Invalid HMAC signature' };
      }
    }

    return {
      isValid: true,
      eventType: event,
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      amount,
      currency,
      rawPayload: body,
    };
  }

  async getPaymentStatus(providerOrderId: string): Promise<string> {
    return 'SUCCESS';
  }
}
