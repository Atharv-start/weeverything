import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { nanoid } from 'nanoid';

class TransferDto {
  @IsString() toUserId: string;
  @IsInt() @Min(1) amount: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
}
class PaymentRequestDto {
  @IsString() toUserId: string;
  @IsInt() @Min(1) amount: number;
  @IsOptional() @IsString() description?: string;
}
class SeedDto { @IsInt() @Min(1) amount: number; }

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getBalance(@CurrentUser() user: { id: string }) {
    const result = await this.walletService.getWalletForUser(user.id);
    return { success: true, data: result };
  }

  @Get('history')
  async getHistory(@CurrentUser() user: { id: string }, @Query('cursor') cursor?: string) {
    const result = await this.walletService.getHistory(user.id, cursor);
    return { success: true, data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } };
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferDto, @CurrentUser() user: { id: string }) {
    const result = await this.walletService.transfer({
      fromUserId: user.id,
      toUserId: dto.toUserId,
      amount: dto.amount,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey ?? nanoid(),
    });
    return { success: true, data: result };
  }

  @Post('payment-request')
  async createPaymentRequest(@Body() dto: PaymentRequestDto, @CurrentUser() user: { id: string }) {
    const result = await this.walletService.createPaymentRequest({
      fromUserId: user.id,
      toUserId: dto.toUserId,
      amount: dto.amount,
      description: dto.description,
    });
    return { success: true, data: result };
  }

  @Post('payment-request/:id/accept')
  async acceptPaymentRequest(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.walletService.acceptPaymentRequest(id, user.id);
    return { success: true, data: result };
  }

  @Post('payment-request/:id/reject')
  async rejectPaymentRequest(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.walletService.rejectPaymentRequest(id, user.id);
    return { success: true, data: result };
  }

  @Post('dev/seed')
  async seedBalance(@Body() dto: SeedDto, @CurrentUser() user: { id: string }) {
    const result = await this.walletService.seedBalance(user.id, dto.amount);
    return { success: true, data: result };
  }
}
