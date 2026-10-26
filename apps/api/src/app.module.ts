import { Module } from '@nestjs/common';
import { StorageService } from './common/storage.service.js';
import { HealthController } from './modules/health/health.controller.js';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [StorageService],
})
export class AppModule {}
