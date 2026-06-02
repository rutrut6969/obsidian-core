import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { SystemSettingsService } from './system-settings.service';

@ApiTags('System Settings')
@ApiBearerAuth()
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  @Permissions('system-settings:read')
  @ApiOkResponse({ description: 'Lists system settings.' })
  findAll() {
    return this.systemSettingsService.findAll();
  }

  @Patch(':id')
  @Permissions('system-settings:manage')
  @ApiOkResponse({ description: 'Updates a system setting.' })
  update(@Param('id') id: string, @Body() dto: UpdateSystemSettingDto) {
    return this.systemSettingsService.update(id, dto);
  }
}
