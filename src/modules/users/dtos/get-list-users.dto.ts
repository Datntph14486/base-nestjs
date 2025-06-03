import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumber } from 'src/shared/helpers/cast.helper';

export class GetListUsersDto {
  @Transform(({ value }) => toNumber(value, { default: 1 }))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page = 1;

  @Transform(({ value }) => toNumber(value, { default: 10 }))
  @IsNumber()
  @IsOptional()
  @Min(1)
  size = 10;

  @IsOptional()
  @IsString()
  userId?: string;
}
