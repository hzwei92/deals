import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import CreateChargeDto from './createCharge.dto';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService
  ) {}
 
  @Post('charge')
  @UseGuards(AuthGuard)
  async createCharge(
    @Body() charge: CreateChargeDto, 
    @Req() request: RequestWithUser,
  ) {
    await this.stripeService.charge(charge.amount, charge.paymentMethodId, request.user.stripeCustomerId);
  }
}
