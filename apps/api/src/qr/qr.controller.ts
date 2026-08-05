import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class ParseQrDto { @IsString() payload: string; }

@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('profile')
  async getProfileQr(@CurrentUser() user: { id: string }) {
    const result = await this.qrService.generateProfileQr(user.id);
    return { success: true, data: result };
  }

  @Post('parse')
  async parseQr(@Body() dto: ParseQrDto) {
    const result = await this.qrService.parseQr(dto.payload);
    return { success: true, data: result };
  }
}
