import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { StripeResolver } from './stripe.resolver';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => UsersModule),
    OrdersModule,
  ],
  providers: [StripeService, StripeResolver],
  exports: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
