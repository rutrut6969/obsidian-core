import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  create(dto: CreateFeatureFlagDto) {
    return this.prisma.featureFlag.create({ data: dto });
  }
}
