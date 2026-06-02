import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'riley@obsidian.systems' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'correct horse battery staple' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, example: 'Isaac Laptop' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ required: false, example: 'desktop' })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiProperty({ required: false, example: 'Windows' })
  @IsOptional()
  @IsString()
  platform?: string;
}
