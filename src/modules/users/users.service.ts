import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: this.safeSelect(),
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: this.safeSelect(),
    });
  }

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.safeSelect(),
    });
  }

  private safeSelect() {
    return {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: { include: { role: true } },
      applications: { include: { application: true } },
      notificationPreference: true,
    } as const;
  }
}
