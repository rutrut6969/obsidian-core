import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists all platform roles.' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @Permissions('roles:manage')
  @ApiCreatedResponse({ description: 'Creates a new role.' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }
}
