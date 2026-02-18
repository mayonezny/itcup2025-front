import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'rules' })
export class RuleEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'varchar', length: 16 })
  filter_type!: 'alg' | 'ml';

  @Column({ type: 'varchar', length: 255 })
  action!: string;

  @Column({ type: 'jsonb' })
  rule_value!: Record<string, unknown>;

  @Column({ type: 'integer' })
  priority!: number;
}
