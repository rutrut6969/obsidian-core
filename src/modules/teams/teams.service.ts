import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.team.findMany({
      include: { organization: true, members: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateTeamDto) {
    return this.prisma.team.create({ data: dto });
  }

  findOne(id: string) {
    return this.prisma.team.findUniqueOrThrow({
      where: { id },
      include: {
        organization: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }
}
