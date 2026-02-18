import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RuleEntity } from './rules/rule.entity';
import { RulesController } from './rules/rules.controller';
import { RulesService } from './rules/rules.service';
import { TransactionEntity } from './transactions/transaction.entity';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'itcup',
      entities: [RuleEntity, TransactionEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([RuleEntity, TransactionEntity]),
  ],
  controllers: [RulesController, TransactionsController],
  providers: [RulesService, TransactionsService],
})
export class AppModule {}
