import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'riley@obsidian.systems' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'riley' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'Riley Stone' })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiProperty({ example: 'correct horse battery staple' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, example: 'https://cdn.example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
