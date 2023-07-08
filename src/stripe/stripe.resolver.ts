import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { StripeService } from './stripe.service';

@Resolver()
export class StripeResolver {
  constructor(
    private readonly stripeService: StripeService
  ) {}

  @Mutation(() => String, {name: 'createPaymentIntent'})
  async createPaymentIntent(
    @Args('price', { type: () => Int }) price: number,
  ) {
    const clientSecret = await this.stripeService.createPaymentIntent(price);
    return clientSecret;
  }
}
