import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists current user device sessions.' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionsService.findForUser(user.id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Revokes one current user device session.' })
  revoke(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.sessionsService.revoke(id, user.id);
  }
}
