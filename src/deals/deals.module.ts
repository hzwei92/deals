import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsResolver } from './deals.resolver';
import { DealsController } from './deals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';
import { ImagesModule } from 'src/images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal]),
    ImagesModule,
  ],
  providers: [DealsService, DealsResolver],
  controllers: [DealsController]
})
export class DealsModule {}
