import { Module } from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ProjectController } from '../controllers/project.controller';
import { PrismaModule } from 'src/prisma/modules/prisma.module';
import { MessageAdminModule } from 'src/message/modules/admin.module';

@Module({
  imports: [PrismaModule, MessageAdminModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
