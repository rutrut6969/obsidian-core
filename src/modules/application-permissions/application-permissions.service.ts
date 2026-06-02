import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationPermissionDto } from './dto/create-application-permission.dto';

@Injectable()
export class ApplicationPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.applicationPermission.findMany({
      include: { application: true },
      orderBy: [{ applicationId: 'asc' }, { permissionName: 'asc' }],
    });
  }

  create(dto: CreateApplicationPermissionDto) {
    return this.prisma.applicationPermission.create({ data: dto });
  }
}
