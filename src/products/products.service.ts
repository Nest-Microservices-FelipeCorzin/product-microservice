import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma.service';
import { RpcException } from '@nestjs/microservices';


@Injectable()
export class ProductsService implements OnModuleInit{
  private readonly logger = new Logger('ProductsService');

  constructor(
    public prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    await this.prismaService.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.prismaService.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.prismaService.product.count({ where: { available: true } });
    const lastPage = Math.ceil( totalPages / limit );
    return {
      data: await this.prismaService.product.findMany({
        skip: ( page - 1 ) * limit,
        take: limit,
        where: {
          available: true
        }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    const product =  await this.prismaService.product.findFirst({
      where:{ id, available: true }
    });

    if ( !product ) {
      throw new NotFoundException(`Product with id #${ id } not found`);
    }

    return product;

  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    const product = await this.prismaService.product.update({
      where: { id },
      data: data,
    });

    return product;
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.product.delete({
    //   where: { id }
    // });

    const product = await this.prismaService.product.update({
      where: { id },
      data: {
        available: false
      }
    });

    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if ( products.length !== ids.length ) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products
  }
}
