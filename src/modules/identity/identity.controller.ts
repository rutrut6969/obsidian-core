import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { IdentityService } from './identity.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @Post('register')
  @ApiCreatedResponse({ description: 'Registers a shared Obsidian account.' })
  register(@Body() dto: RegisterDto) {
    return this.identityService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOkResponse({ description: 'Authenticates a user and returns token pair.' })
  login(@Body() dto: LoginDto) {
    return this.identityService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ description: 'Rotates a refresh token and returns a new token pair.' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.identityService.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Returns the current authenticated user.' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.me(user.id);
  }
}
