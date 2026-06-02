import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Obsidian Systems LLC' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'obsidian-systems' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
