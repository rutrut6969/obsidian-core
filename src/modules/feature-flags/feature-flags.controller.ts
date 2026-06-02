import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { FeatureFlagsService } from './feature-flags.service';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @Permissions('feature-flags:read')
  @ApiOkResponse({ description: 'Lists feature flags.' })
  findAll() {
    return this.featureFlagsService.findAll();
  }

  @Post()
  @Permissions('feature-flags:manage')
  @ApiCreatedResponse({ description: 'Creates a feature flag.' })
  create(@Body() dto: CreateFeatureFlagDto) {
    return this.featureFlagsService.create(dto);
  }
}
