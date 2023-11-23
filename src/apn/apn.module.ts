import { Module } from '@nestjs/common';
import { ApnService } from './apn.service';

@Module({
  providers: [ApnService],
  exports: [ApnService],
})
export class ApnModule {}
