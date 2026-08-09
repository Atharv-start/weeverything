import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { SandboxPaymentProvider } from './sandbox-provider.service';
import { RazorpayPaymentProvider } from './razorpay-provider.service';
import { CashfreePaymentProvider } from './cashfree-provider.service';
import { PaymentGatewayService } from './payment-gateway.service';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    SandboxPaymentProvider,
    RazorpayPaymentProvider,
    CashfreePaymentProvider,
    PaymentGatewayService,
  ],
  exports: [WalletService, PaymentGatewayService],
})
export class WalletModule {}
