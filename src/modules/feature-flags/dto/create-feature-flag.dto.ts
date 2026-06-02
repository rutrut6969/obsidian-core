import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateFeatureFlagDto {
  @ApiProperty({ example: 'wallet.enabled' })
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9.:-]+$/)
  key: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
