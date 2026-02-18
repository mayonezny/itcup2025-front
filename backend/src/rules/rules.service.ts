import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RuleEntity } from './rule.entity';
import { UpsertRuleDto } from './rules.dto';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(RuleEntity)
    private readonly rulesRepo: Repository<RuleEntity>,
  ) {}

  async findAll(isActive?: boolean): Promise<RuleEntity[]> {
    const where = isActive === undefined ? {} : { is_active: isActive };
    return this.rulesRepo.find({ where, order: { priority: 'ASC' } });
  }

  async create(payload: UpsertRuleDto): Promise<RuleEntity> {
    const nextId = payload.id ?? (await this.getNextId());
    const entity = this.rulesRepo.create({
      ...payload,
      id: nextId,
    });
    return this.rulesRepo.save(entity);
  }

  async update(id: number, payload: UpsertRuleDto): Promise<RuleEntity> {
    const entity = this.rulesRepo.create({
      ...payload,
      id,
    });
    return this.rulesRepo.save(entity);
  }

  async remove(id: number): Promise<number> {
    await this.rulesRepo.delete(id);
    return id;
  }

  async normalize(items: UpsertRuleDto[]): Promise<RuleEntity[]> {
    const normalized = items.map((item, index) => ({
      ...item,
      id: item.id ?? index + 1,
      priority: index + 1,
    }));

    await this.rulesRepo.clear();
    return this.rulesRepo.save(normalized);
  }

  private async getNextId(): Promise<number> {
    const last = await this.rulesRepo
      .createQueryBuilder('rule')
      .select('MAX(rule.id)', 'max')
      .getRawOne<{ max: string | null }>();

    const maxId = Number(last?.max ?? 0);
    return maxId + 1;
  }
}
