import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  private internal_service_API_key: string;

  constructor() {
    this.internal_service_API_key = process.env.NOTIFICATION_SERVICE_API_KEY;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const api_key = request.headers["api-key"] as string;

    if (!api_key) {
      throw new UnauthorizedException("API key is missing");
    }

    if (api_key !== this.internal_service_API_key) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }
}
