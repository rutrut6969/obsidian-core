import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  update(id: string, dto: UpdateSystemSettingDto) {
    return this.prisma.systemSetting.update({
      where: { id },
      data: {
        value: JSON.parse(dto.value) as Prisma.InputJsonValue,
        description: dto.description,
      },
    });
  }
}
