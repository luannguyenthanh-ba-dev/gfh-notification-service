import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IServiceLog, IServiceLogsFilters } from "./logs.interface";
import { ServiceLogsSchemaToken } from "./logs.const";

@Injectable()
export class ServiceLogsService {
  private readonly logger = new Logger(ServiceLogsService.name);

  constructor(
    @InjectModel(ServiceLogsSchemaToken)
    private readonly model: Model<IServiceLog>,
  ) {}

  /**
   * Create a new service log
   * @param data The log data
   * @returns The created log
   */
  async create(data: Partial<IServiceLog>): Promise<IServiceLog> {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      this.logger.error(
        `Create service log met error: ${error.message || "Unknown error"}`,
      );
      throw new InternalServerErrorException(error.message || "Unknown error");
    }
  }

  /**
   * Find logs based on filters
   * @param filters The filters to apply
   * @returns The logs matching the filters
   */
  async findMany(
    filters: IServiceLogsFilters,
    options: {
      limit?: number;
      skip?: number;
      sort?: {
        created_at?: 1 | -1;
      };
    },
  ): Promise<IServiceLog[]> {
    try {
      const query: any = {};

      if (filters.feature) {
        query.feature = filters.feature;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.level) {
        query.level = filters.level;
      }

      if (filters.from_time) {
        query.created_at = { $gte: filters.from_time };
      }

      if (filters.to_time) {
        query.created_at = { ...query.created_at, $lte: filters.to_time };
      }

      const limit = options.limit || 100;
      const skip = options.skip || 0;

      const result = await this.model
        .find(query)
        .sort({ created_at: options.sort?.created_at || -1 })
        .skip(skip)
        .limit(limit);

      return result;
    } catch (error) {
      this.logger.error(
        `Find service logs met error: ${error.message || "Unknown error"}`,
      );
      throw new InternalServerErrorException(error.message || "Unknown error");
    }
  }

  /**
   * Find a single log by ID
   * @param id The log ID
   * @returns The log
   */
  async findOne(filters: {
    id?: string;
    object_id?: string;
  }): Promise<IServiceLog> {
    try {
      const result = await this.model.findOne(filters);
      if (!result) {
        throw new BadRequestException("Log not found");
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Find service log by id met error: ${error.message || "Unknown error"}`,
      );
      throw new InternalServerErrorException(error.message || "Unknown error");
    }
  }
}
