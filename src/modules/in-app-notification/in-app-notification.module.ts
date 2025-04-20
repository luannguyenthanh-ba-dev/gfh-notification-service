import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InAppNotificationService } from './in-app-notification.service';
import { InAppNotificationController } from './in-app-notification.controller';
import { InAppGateway } from './in-app-notification.gateway';
import { InAppNotificationSchema } from './models/in-app-notification.model';
import { InAppNotificationSchemaToken } from './in-app-notification.const';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InAppNotificationSchemaToken, schema: InAppNotificationSchema },
    ]),
  ],
  controllers: [InAppNotificationController],
  providers: [InAppGateway, InAppNotificationService],
  exports: [InAppNotificationService, InAppGateway],
})
export class InAppNotificationModule {}
