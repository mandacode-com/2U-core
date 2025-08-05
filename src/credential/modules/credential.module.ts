import { Module } from '@nestjs/common';
import { CredentialService } from '../services/credential.service';

@Module({
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}
