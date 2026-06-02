import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Scheduled Maintenance' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'Obsidian Core maintenance is scheduled for tonight.' })
  @IsString()
  @MinLength(2)
  message: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
