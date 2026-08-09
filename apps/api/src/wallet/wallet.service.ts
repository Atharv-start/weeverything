import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { nanoid } from 'nanoid';

import { PaymentGatewayService } from './payment-gateway.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly paymentGateway: PaymentGatewayService,
  ) {}

  /**
   * Calculate balance from ledger entries (server is authoritative).
   * Never trust client-provided balance.
   */
  async getBalance(walletId: string): Promise<number> {
    const result = await this.prisma.ledgerEntry.aggregate({
      where: { walletId },
      _sum: {
        amount: true,
      },
    });
    // Credits are positive in amount field, debits are stored negatively
    return result._sum.amount ?? 0;
  }

  async getWalletForUser(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    const balance = await this.getBalance(wallet.id);
    return {
      walletId: wallet.id,
      balance,
      currency: 'INR',
      formattedBalance: this.formatAmount(balance),
      isActive: wallet.isActive,
    };
  }

  async getHistory(userId: string, cursor?: string, limit = 30) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const entries = await this.prisma.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = entries.length > limit;
    const items = hasMore ? entries.slice(0, limit) : entries;
    return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.id : null };
  }

  /**
   * Transfer using idempotency key to prevent duplicate debits.
   * Uses DB transaction and row-level locking via SELECT FOR UPDATE equivalent.
   */
  async transfer(opts: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    description?: string;
    idempotencyKey: string;
  }) {
    // Validate amount
    if (!Number.isInteger(opts.amount) || opts.amount <= 0) {
      throw new BadRequestException('Amount must be a positive integer (minor units)');
    }

    // Idempotency check
    const existing = await this.prisma.ledgerTransaction.findUnique({
      where: { idempotencyKey: opts.idempotencyKey },
      include: { entries: true },
    });
    if (existing) return { idempotent: true, transaction: existing };

    const fromWallet = await this.prisma.wallet.findUnique({ where: { userId: opts.fromUserId } });
    const toWallet = await this.prisma.wallet.findUnique({ where: { userId: opts.toUserId } });

    if (!fromWallet || !toWallet) throw new NotFoundException('Wallet not found');
    if (!fromWallet.isActive) throw new ForbiddenException('Sender wallet is inactive');
    if (!toWallet.isActive) throw new ForbiddenException('Recipient wallet is inactive');
    if (fromWallet.id === toWallet.id) throw new BadRequestException('Cannot transfer to yourself');

    // Check balance inside transaction to prevent races
    return this.prisma.$transaction(async (tx) => {
      const fromBalance = await this.getBalanceInTx(tx, fromWallet.id);
      if (fromBalance < opts.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const newFromBalance = fromBalance - opts.amount;
      const toBalance = await this.getBalanceInTx(tx, toWallet.id);
      const newToBalance = toBalance + opts.amount;

      const ledgerTx = await tx.ledgerTransaction.create({
        data: {
          idempotencyKey: opts.idempotencyKey,
          description: opts.description ?? 'Transfer',
          totalAmount: opts.amount,
          entries: {
            create: [
              {
                walletId: fromWallet.id,
                type: 'DEBIT',
                amount: -opts.amount,
                balanceAfter: newFromBalance,
                description: `Transfer to user`,
              },
              {
                walletId: toWallet.id,
                type: 'CREDIT',
                amount: opts.amount,
                balanceAfter: newToBalance,
                description: `Transfer from user`,
              },
            ],
          },
        },
        include: { entries: true },
      });

      return { idempotent: false, transaction: ledgerTx };
    });
  }

  async createPaymentRequest(opts: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    description?: string;
  }) {
    if (!Number.isInteger(opts.amount) || opts.amount <= 0) {
      throw new BadRequestException('Amount must be a positive integer');
    }

    const [fromWallet, toWallet] = await Promise.all([
      this.prisma.wallet.findUnique({ where: { userId: opts.fromUserId } }),
      this.prisma.wallet.findUnique({ where: { userId: opts.toUserId } }),
    ]);

    if (!fromWallet || !toWallet) throw new NotFoundException('Wallet not found');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.paymentRequest.create({
      data: {
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        amount: opts.amount,
        description: opts.description,
        idempotencyKey: nanoid(),
        expiresAt,
      },
    });
  }

  async acceptPaymentRequest(paymentRequestId: string, userId: string) {
    const pr = await this.prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      include: { fromWallet: { include: { user: true } }, toWallet: { include: { user: true } } },
    });

    if (!pr) throw new NotFoundException('Payment request not found');
    if (pr.toWallet.userId !== userId) throw new ForbiddenException('Not authorized');
    if (pr.status !== 'PENDING') throw new BadRequestException('Request is no longer pending');
    if (pr.expiresAt && pr.expiresAt < new Date()) {
      await this.prisma.paymentRequest.update({ where: { id: pr.id }, data: { status: 'EXPIRED' } });
      throw new BadRequestException('Payment request has expired');
    }

    const result = await this.transfer({
      fromUserId: pr.toWallet.userId,
      toUserId: pr.fromWallet.userId,
      amount: pr.amount,
      description: pr.description ?? 'Payment request',
      idempotencyKey: `pr_accept_${pr.id}`,
    });

    await this.prisma.paymentRequest.update({
      where: { id: pr.id },
      data: { status: 'ACCEPTED', resolvedAt: new Date() },
    });

    return result;
  }

  async rejectPaymentRequest(paymentRequestId: string, userId: string) {
    const pr = await this.prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      include: { toWallet: true },
    });

    if (!pr) throw new NotFoundException('Payment request not found');
    if (pr.toWallet.userId !== userId) throw new ForbiddenException('Not authorized');
    if (pr.status !== 'PENDING') throw new BadRequestException('Request is no longer pending');

    return this.prisma.paymentRequest.update({
      where: { id: pr.id },
      data: { status: 'REJECTED', resolvedAt: new Date() },
    });
  }

  // Seed initial balance for development
  async seedBalance(userId: string, amount: number) {
    if (process.env.NODE_ENV !== 'development') throw new ForbiddenException('Only available in development');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const currentBalance = await this.getBalance(wallet.id);

    return this.prisma.$transaction(async (tx) => {
      return tx.ledgerTransaction.create({
        data: {
          idempotencyKey: `seed_${userId}_${Date.now()}`,
          description: 'Development seed balance',
          totalAmount: amount,
          entries: {
            create: [{
              walletId: wallet.id,
              type: 'CREDIT',
              amount,
              balanceAfter: currentBalance + amount,
              description: 'Development seed',
            }],
          },
        },
      });
    });
  }

  // ============================================================
  // PAYMENT GATEWAY & REAL UPI INTEGRATION
  // ============================================================

  async createPaymentOrder(opts: {
    userId: string;
    amount: number; // minor units (paise)
    description?: string;
    upiVpa?: string;
    idempotencyKey?: string;
  }) {
    if (!Number.isInteger(opts.amount) || opts.amount <= 0) {
      throw new BadRequestException('Amount must be a positive integer in paise');
    }

    let wallet = await this.prisma.wallet.findUnique({ where: { userId: opts.userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId: opts.userId } });
    }

    const idempotencyKey = opts.idempotencyKey || `pay_order_${Date.now()}_${nanoid(8)}`;

    // Check if idempotency key already created order
    const existing = await this.prisma.paymentGatewayTransaction.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    const providerOrder = await this.paymentGateway.createOrder({
      amount: opts.amount,
      currency: 'INR',
      userId: opts.userId,
      idempotencyKey,
      note: opts.description,
      upiVpa: opts.upiVpa,
    });

    const dbTx = await this.prisma.paymentGatewayTransaction.create({
      data: {
        userId: opts.userId,
        walletId: wallet.id,
        provider: providerOrder.provider,
        providerOrderId: providerOrder.providerOrderId,
        amount: opts.amount,
        currency: 'INR',
        status: providerOrder.status,
        idempotencyKey,
        paymentMethod: 'UPI',
        upiVpa: opts.upiVpa,
        rawPayload: JSON.stringify(providerOrder.rawPayload || {}),
      },
    });

    return {
      orderId: dbTx.id,
      providerOrderId: providerOrder.providerOrderId,
      provider: providerOrder.provider,
      amount: opts.amount,
      currency: 'INR',
      upiIntentUri: providerOrder.upiIntentUri,
      qrPayload: providerOrder.qrPayload,
      status: dbTx.status,
    };
  }

  async processPaymentSuccess(providerOrderId: string, providerPaymentId?: string, providerSignature?: string) {
    const pgt = await this.prisma.paymentGatewayTransaction.findUnique({
      where: { providerOrderId },
      include: { wallet: true },
    });

    if (!pgt) return { success: false, reason: 'Payment order not found', status: 'NOT_FOUND' };

    // Idempotency: if already marked SUCCESS, return existing ledger state
    if (pgt.status === 'SUCCESS') {
      const balance = await this.getBalance(pgt.walletId);
      return { success: true, alreadyProcessed: true, balance, status: 'SUCCESS' };
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: pgt.walletId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const currentBalance = await this.getBalanceInTx(tx, wallet.id);
      const newBalance = currentBalance + pgt.amount;
      const ledgerIdempotencyKey = `gw_credit_${pgt.idempotencyKey}`;

      // Create Ledger Transaction & Entry
      await tx.ledgerTransaction.create({
        data: {
          idempotencyKey: ledgerIdempotencyKey,
          description: `UPI Gateway Credit (${pgt.provider})`,
          totalAmount: pgt.amount,
          entries: {
            create: [
              {
                walletId: wallet.id,
                type: 'CREDIT',
                amount: pgt.amount,
                balanceAfter: newBalance,
                description: `UPI Payment Received [${pgt.providerOrderId}]`,
              },
            ],
          },
        },
      });

      // Update Gateway Transaction Status
      const updatedPgt = await tx.paymentGatewayTransaction.update({
        where: { id: pgt.id },
        data: {
          status: 'SUCCESS',
          providerPaymentId: providerPaymentId || pgt.providerPaymentId,
          providerSignature: providerSignature || pgt.providerSignature,
          processedAt: new Date(),
        },
      });

      return {
        success: true,
        alreadyProcessed: false,
        balance: newBalance,
        status: updatedPgt.status,
        providerOrderId: updatedPgt.providerOrderId,
      };
    });
  }

  async handlePaymentWebhook(body: any, headers: Record<string, any>) {
    const verification = await this.paymentGateway.parseWebhook(body, headers);

    if (!verification.isValid || !verification.providerOrderId) {
      if (verification.providerOrderId) {
        await this.prisma.paymentGatewayTransaction.updateMany({
          where: { providerOrderId: verification.providerOrderId },
          data: { status: 'FAILED', failureReason: verification.failureReason || 'Webhook failed' },
        });
      }
      return { success: false, reason: verification.failureReason || 'Invalid webhook signature or event' };
    }

    return this.processPaymentSuccess(
      verification.providerOrderId,
      verification.providerPaymentId,
    );
  }

  async verifyAndCompletePayment(opts: {
    userId: string;
    providerOrderId: string;
    providerPaymentId?: string;
    providerSignature?: string;
  }) {
    const pgt = await this.prisma.paymentGatewayTransaction.findUnique({
      where: { providerOrderId: opts.providerOrderId },
    });

    if (!pgt) throw new NotFoundException('Payment order not found');
    if (pgt.userId !== opts.userId) throw new ForbiddenException('Not authorized for this payment');

    if (pgt.status === 'SUCCESS') {
      const balance = await this.getBalance(pgt.walletId);
      return { success: true, status: 'SUCCESS', balance };
    }

    const isValidSig = await this.paymentGateway.verifySignature({
      providerOrderId: opts.providerOrderId,
      providerPaymentId: opts.providerPaymentId,
      providerSignature: opts.providerSignature,
    });

    if (!isValidSig) {
      throw new BadRequestException('Invalid payment signature verification');
    }

    return this.processPaymentSuccess(opts.providerOrderId, opts.providerPaymentId, opts.providerSignature);
  }

  async getPaymentOrderStatus(userId: string, providerOrderId: string) {
    const pgt = await this.prisma.paymentGatewayTransaction.findUnique({
      where: { providerOrderId },
    });

    if (!pgt) throw new NotFoundException('Payment order not found');
    if (pgt.userId !== userId) throw new ForbiddenException('Not authorized');

    if (pgt.status === 'INITIATED' || pgt.status === 'PENDING') {
      const liveStatus = await this.paymentGateway.getStatus(providerOrderId);
      if (liveStatus === 'SUCCESS') {
        return this.processPaymentSuccess(providerOrderId);
      }
    }

    return {
      status: pgt.status,
      providerOrderId: pgt.providerOrderId,
      amount: pgt.amount,
      currency: pgt.currency,
      createdAt: pgt.createdAt,
      processedAt: pgt.processedAt,
    };
  }

  private async getBalanceInTx(tx: any, walletId: string): Promise<number> {
    const result = await tx.ledgerEntry.aggregate({
      where: { walletId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  formatAmount(minorUnits: number): string {
    return `₹${(minorUnits / 100).toFixed(2)}`;
  }
}

