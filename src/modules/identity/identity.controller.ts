import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { IdentityService } from './identity.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @Post('register')
  @ApiCreatedResponse({ description: 'Registers a shared Obsidian account.' })
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.identityService.register(dto, this.requestContext(request));
  }

  @Public()
  @Post('login')
  @ApiOkResponse({ description: 'Authenticates a user and returns token pair.' })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.identityService.login(dto, this.requestContext(request));
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ description: 'Rotates a refresh token and returns a new token pair.' })
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.identityService.refresh(dto.refreshToken, this.requestContext(request));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Returns the current authenticated user.' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.me(user.id);
  }

  private requestContext(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || request.ip;
    return {
      ipAddress,
      userAgent: request.headers['user-agent'],
    };
  }
}
