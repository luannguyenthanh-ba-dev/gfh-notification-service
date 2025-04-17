import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ServiceLogsSchema } from "./logs.model";
import { ServiceLogsSchemaToken } from "./logs.const";
import { ServiceLogsService } from "./logs.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ServiceLogsSchemaToken,
        schema: ServiceLogsSchema,
      },
    ]),
  ],
  providers: [ServiceLogsService],
  exports: [ServiceLogsService],
})
export class ServiceLogsModule {}
