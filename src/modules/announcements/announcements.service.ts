import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.platformAnnouncement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateAnnouncementDto) {
    return this.prisma.platformAnnouncement.create({ data: dto });
  }
}
