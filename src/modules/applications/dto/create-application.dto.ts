import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Obsidian Wallet' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'wallet' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
