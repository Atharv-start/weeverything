import { Module } from '@nestjs/common';
import { MiniAppsController } from './mini-apps.controller';

@Module({ controllers: [MiniAppsController] })
export class MiniAppsModule {}
