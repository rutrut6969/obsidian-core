import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'support_admin' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false, example: 'Can support users across Obsidian apps.' })
  @IsOptional()
  @IsString()
  description?: string;
}
