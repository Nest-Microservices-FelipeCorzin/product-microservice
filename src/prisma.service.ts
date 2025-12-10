import { Injectable, Logger } from '@nestjs/common';
import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger('OrdersService');

  constructor() {
    // const connectionString = `${process.env.DATABASE_URL}`
    // const adapter = new PrismaBetterSqlite3({ connectionString })
    // const prisma = new PrismaClient({ adapter })
    // super({ adapter });
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
  }

  async onModuleInit() {
      await this.$connect();
      this.logger.log('Database connected');
  }
}