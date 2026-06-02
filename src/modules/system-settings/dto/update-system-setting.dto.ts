import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiProperty({ example: '{"maintenance":false}' })
  @IsJSON()
  value: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
