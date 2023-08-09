import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2022-11-15',
    });
  }

  public async createCustomer({phone, email}: {phone?: string, email?: string}) {
    if (!phone && !email) {
      throw new Error('Must provide either phone or email');
    }
    
    return this.stripe.customers.create({
      email,
      phone,
    });
  }

  public async createPaymentIntent(amount: number) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: this.configService.get('STRIPE_CURRENCY'),
      automatic_payment_methods: {
        enabled: true,
      }
    });

    return paymentIntent.client_secret
  }

  public async charge(amount: number, paymentMethodId: string, customerId: string) {
    return this.stripe.paymentIntents.create({
      amount,
      customer: customerId,
      payment_method: paymentMethodId,
      currency: this.configService.get('STRIPE_CURRENCY'),
      confirm: true
    })
  }
}
