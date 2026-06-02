import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Welcome to Obsidian' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'Your account is ready across the Obsidian ecosystem.' })
  @IsString()
  @MinLength(2)
  message: string;

  @ApiProperty({ enum: NotificationType, required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
