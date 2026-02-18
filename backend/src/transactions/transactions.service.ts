import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransactionEntity } from './transaction.entity';

type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class TransactionsService implements OnModuleInit {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.txRepo.count();
    if (count > 0) {
      return;
    }

    const seedRows = Array.from({ length: 200 }, (_v, i) => this.makeRow(i + 1));
    await this.txRepo.save(seedRows);
  }

  async findPage(page = 1, pageSize = 20): Promise<Page<TransactionEntity>> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, Math.min(100, pageSize));
    const [items, total] = await this.txRepo.findAndCount({
      order: { timestamp: 'DESC' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

    return {
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  private makeRow(index: number): Omit<TransactionEntity, 'id'> {
    const amount = (100 + ((index * 77) % 9000) + 0.37).toFixed(2);
    const isFraud = index % 7 === 0;
    const now = Date.now();
    const ts = new Date(now - index * 1000 * 60 * 7);

    return {
      correlationId: `corr-${100000 + index}`,
      transactionId: `tx-${500000 + index}`,
      timestamp: ts,
      senderAccount: `40817810${String(10000000 + index)}`,
      receiverAccount: `40817810${String(20000000 + index)}`,
      amount,
      transactionType: index % 2 === 0 ? 'transfer' : 'payment',
      merchantCategory: index % 3 === 0 ? 'electronics' : 'groceries',
      location: index % 4 === 0 ? 'Moscow' : 'Saint Petersburg',
      deviceUsed: index % 2 === 0 ? 'mobile' : 'web',
      isFraud,
      fraudType: isFraud ? 'suspicious_velocity' : null,
      timeSinceLastTransaction: index % 5 === 0 ? null : (index * 11) % 300,
      spendingDeviationScore: index % 6 === 0 ? null : Number(((index * 0.17) % 1).toFixed(3)),
      velocityScore: index % 7 === 0 ? Number(((index * 0.23) % 1).toFixed(3)) : null,
      geoAnomalyScore: index % 8 === 0 ? Number(((index * 0.31) % 1).toFixed(3)) : null,
      paymentChannel: index % 2 === 0 ? 'sbp' : 'card',
      ipAddress: `10.10.${index % 255}.${(index * 3) % 255}`,
      deviceHash: `devhash-${index.toString(16).padStart(8, '0')}`,
      statuses: [
        {
          name: 'received',
          description: 'Message received',
          datetime: new Date(ts.getTime() + 1000).toISOString(),
        },
        {
          name: 'processed',
          description: 'Rules check finished',
          datetime: new Date(ts.getTime() + 5000).toISOString(),
        },
      ],
    };
  }
}
