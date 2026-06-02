import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({
      include: { members: true, teams: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.organization.findUniqueOrThrow({
      where: { id },
      include: {
        members: { include: { user: { select: this.userSelect() } } },
        teams: true,
      },
    });
  }

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }

  update(id: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  private userSelect() {
    return {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isActive: true,
    } as const;
  }
}
