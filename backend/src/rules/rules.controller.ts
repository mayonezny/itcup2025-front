import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';

import { RuleEntity } from './rule.entity';
import { UpsertRuleDto } from './rules.dto';
import { RulesService } from './rules.service';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  async findAll(@Query('isActive') isActive?: string): Promise<RuleEntity[]> {
    const parsed =
      isActive === undefined ? undefined : isActive === 'true' || isActive === '1' || isActive === 'yes';
    return this.rulesService.findAll(parsed);
  }

  @Post()
  async create(@Body() payload: UpsertRuleDto): Promise<RuleEntity> {
    return this.rulesService.create(payload);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpsertRuleDto,
  ): Promise<RuleEntity> {
    return this.rulesService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.rulesService.remove(id);
  }

  @Put()
  async normalize(@Body() items: UpsertRuleDto[]): Promise<RuleEntity[]> {
    return this.rulesService.normalize(items);
  }
}
