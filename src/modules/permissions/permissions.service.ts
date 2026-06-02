import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: dto });
  }
}
