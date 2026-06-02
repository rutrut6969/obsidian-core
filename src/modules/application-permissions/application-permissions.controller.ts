import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApplicationPermissionsService } from './application-permissions.service';
import { CreateApplicationPermissionDto } from './dto/create-application-permission.dto';

@ApiTags('Application Permissions')
@ApiBearerAuth()
@Controller('application-permissions')
export class ApplicationPermissionsController {
  constructor(private readonly applicationPermissionsService: ApplicationPermissionsService) {}

  @Get()
  @Permissions('application-permissions:read')
  @ApiOkResponse({ description: 'Lists application-scoped permissions.' })
  findAll() {
    return this.applicationPermissionsService.findAll();
  }

  @Post()
  @Permissions('application-permissions:manage')
  @ApiCreatedResponse({ description: 'Creates an application-scoped permission.' })
  create(@Body() dto: CreateApplicationPermissionDto) {
    return this.applicationPermissionsService.create(dto);
  }
}
