import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'wallet:transactions:read' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
