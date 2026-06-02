import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';

export class CreateApplicationPermissionDto {
  @ApiProperty()
  @IsUUID()
  applicationId: string;

  @ApiProperty({ example: 'wallet.transactions.read' })
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9.:-]+$/)
  permissionName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
