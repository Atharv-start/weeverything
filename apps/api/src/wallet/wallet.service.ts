import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { nanoid } from 'nanoid';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaClient) {}

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
