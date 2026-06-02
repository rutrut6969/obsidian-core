import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists notifications for the current user.' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findForUser(user.id);
  }

  @Post()
  @Permissions('notifications:send')
  @ApiCreatedResponse({ description: 'Creates a notification for a user.' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }
}
