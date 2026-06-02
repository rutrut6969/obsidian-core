import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists all platform permissions.' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Post()
  @RequirePermissions('permissions:manage')
  @ApiCreatedResponse({ description: 'Creates a new permission.' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }
}
