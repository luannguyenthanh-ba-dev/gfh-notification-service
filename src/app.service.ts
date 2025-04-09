import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.environment,
    };
  }
}
