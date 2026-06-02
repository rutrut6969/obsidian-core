import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists ecosystem applications.' })
  findAll() {
    return this.applicationsService.findAll();
  }

  @Post()
  @Permissions('applications:manage')
  @ApiCreatedResponse({ description: 'Creates an ecosystem application entry.' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }
}
