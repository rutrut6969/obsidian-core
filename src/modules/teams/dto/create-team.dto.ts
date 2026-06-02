import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: 'Wallet Operations' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
