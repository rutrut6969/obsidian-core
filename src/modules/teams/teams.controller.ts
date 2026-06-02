import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @Permissions('teams:read')
  @ApiOkResponse({ description: 'Lists teams.' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Post()
  @Permissions('teams:manage')
  @ApiCreatedResponse({ description: 'Creates a team.' })
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Get(':id')
  @Permissions('teams:read')
  @ApiOkResponse({ description: 'Returns one team.' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }
}
