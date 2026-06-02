import { Module } from '@nestjs/common';
import { ApplicationPermissionsController } from './application-permissions.controller';
import { ApplicationPermissionsService } from './application-permissions.service';

@Module({
  controllers: [ApplicationPermissionsController],
  providers: [ApplicationPermissionsService],
})
export class ApplicationPermissionsModule {}
