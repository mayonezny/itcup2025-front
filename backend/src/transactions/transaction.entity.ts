import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type StatusDto = {
  name: string;
  description: string;
  datetime: string;
};

@Entity({ name: 'transactions' })
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 128 })
  correlationId!: string;

  @Column({ type: 'varchar', length: 128 })
  transactionId!: string;

  @Column({ type: 'timestamptz' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 64 })
  senderAccount!: string;

  @Column({ type: 'varchar', length: 64 })
  receiverAccount!: string;

  @Column({ type: 'varchar', length: 32 })
  amount!: string;

  @Column({ type: 'varchar', length: 64 })
  transactionType!: string;

  @Column({ type: 'varchar', length: 64 })
  merchantCategory!: string;

  @Column({ type: 'varchar', length: 64 })
  location!: string;

  @Column({ type: 'varchar', length: 64 })
  deviceUsed!: string;

  @Column({ type: 'boolean' })
  isFraud!: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true })
  fraudType!: string | null;

  @Column({ type: 'integer', nullable: true })
  timeSinceLastTransaction!: number | null;

  @Column({ type: 'double precision', nullable: true })
  spendingDeviationScore!: number | null;

  @Column({ type: 'double precision', nullable: true })
  velocityScore!: number | null;

  @Column({ type: 'double precision', nullable: true })
  geoAnomalyScore!: number | null;

  @Column({ type: 'varchar', length: 64 })
  paymentChannel!: string;

  @Column({ type: 'varchar', length: 64 })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 128 })
  deviceHash!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  statuses!: StatusDto[];
}
