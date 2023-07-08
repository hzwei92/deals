import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import CreateChargeDto from './dto/createCharge.dto';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import CreatePaymentIntentDto from './dto/createPaymentIntent.dto';
import { OrdersService } from 'src/orders/orders.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('charge')
  @UseGuards(AuthGuard)
  async createCharge(
    @Body() charge: CreateChargeDto, 
    @Req() request: RequestWithUser,
  ) {
    const stripeResponse = await this.stripeService.charge(charge.amount, charge.paymentMethodId, request.user.stripeCustomerId);
    console.log(stripeResponse);
    let order;
    if (stripeResponse.status === 'succeeded') {
      order = await this.ordersService.createOne(request.user.id, charge.dealId, charge.amount);
    }
    console.log(order)
    return {
      stripeResponse,
      order,
    };
  }
}
