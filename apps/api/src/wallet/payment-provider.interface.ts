export interface CreateOrderParams {
  amount: number; // Minor units (paise)
  currency: string;
  userId: string;
  idempotencyKey: string;
  note?: string;
  upiVpa?: string;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  provider: 'RAZORPAY' | 'CASHFREE' | 'SANDBOX';
  amount: number;
  currency: string;
  upiIntentUri: string;
  qrPayload: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  rawPayload?: Record<string, any>;
}

export interface VerifyPaymentParams {
  providerOrderId: string;
  providerPaymentId?: string;
  providerSignature?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventType: string; // e.g. 'payment.captured', 'order.paid', 'payment.failed'
  providerOrderId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  failureReason?: string;
  rawPayload?: Record<string, any>;
}

export interface IPaymentProvider {
  createPaymentOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(params: VerifyPaymentParams): Promise<boolean>;
  parseWebhook(body: any, headers: Record<string, any>): Promise<WebhookVerificationResult>;
  getPaymentStatus(providerOrderId: string): Promise<string>;
}
