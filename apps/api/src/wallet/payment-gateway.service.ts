import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  IPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  WebhookVerificationResult,
} from './payment-provider.interface';
import { SandboxPaymentProvider } from './sandbox-provider.service';
import { RazorpayPaymentProvider } from './razorpay-provider.service';
import { CashfreePaymentProvider } from './cashfree-provider.service';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private readonly sandboxProvider: SandboxPaymentProvider,
    private readonly razorpayProvider: RazorpayPaymentProvider,
    private readonly cashfreeProvider: CashfreePaymentProvider,
  ) {}

  getProvider(): IPaymentProvider {
    const providerName = (process.env.PAYMENT_PROVIDER || 'sandbox').toLowerCase();
    switch (providerName) {
      case 'razorpay':
        return this.razorpayProvider;
      case 'cashfree':
        return this.cashfreeProvider;
      case 'sandbox':
      default:
        return this.sandboxProvider;
    }
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const provider = this.getProvider();
    return provider.createPaymentOrder(params);
  }

  async verifySignature(params: VerifyPaymentParams): Promise<boolean> {
    const provider = this.getProvider();
    return provider.verifyPaymentSignature(params);
  }

  async parseWebhook(body: any, headers: Record<string, any>): Promise<WebhookVerificationResult> {
    const provider = this.getProvider();
    return provider.parseWebhook(body, headers);
  }

  async getStatus(providerOrderId: string): Promise<string> {
    const provider = this.getProvider();
    return provider.getPaymentStatus(providerOrderId);
  }
}
