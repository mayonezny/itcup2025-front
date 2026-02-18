import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { TransactionEntity } from './transaction.entity';
import { TransactionsService } from './transactions.service';

type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findPage(@Query() query: PageQueryDto): Promise<Page<TransactionEntity>> {
    return this.transactionsService.findPage(query.page ?? 1, query.pageSize ?? 20);
  }
}
