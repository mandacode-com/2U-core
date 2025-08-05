import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/modules/prisma.module';
import { MessageAdminService } from '../services/admin.service';
import { MessageAdminController } from '../controllers/admin.controller';
import { CredentialModule } from 'src/credential/modules/credential.module';

@Module({
  imports: [PrismaModule, CredentialModule],
  controllers: [MessageAdminController],
  providers: [MessageAdminService],
  exports: [MessageAdminService],
})
export class MessageAdminModule {}
