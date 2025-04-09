import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const logger = new Logger();
        logger.debug(`Database is: ${process.env.MONGODB_URI}`);
        return {
          uri: process.env.MONGODB_URI,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongoDbModule {}
