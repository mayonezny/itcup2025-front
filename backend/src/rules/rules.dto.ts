import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpsertRuleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @IsBoolean()
  is_active!: boolean;

  @IsIn(['alg', 'ml'])
  filter_type!: 'alg' | 'ml';

  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsObject()
  rule_value!: Record<string, unknown>;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  priority!: number;
}

export class NormalizeRulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertRuleDto)
  items!: UpsertRuleDto[];
}
