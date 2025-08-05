import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/modules/prisma.module';
import { ProjectCheckService } from '../services/check.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [ProjectCheckService],
  exports: [ProjectCheckService],
})
export class ProjectCheckModule {}
