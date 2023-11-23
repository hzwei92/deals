import { ApolloDriver, ApolloDriverConfig,  } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DealsModule } from './deals/deals.module';
import { ImagesModule } from './images/images.module';
import { StripeModule } from './stripe/stripe.module';
import { OrdersModule } from './orders/orders.module';
import { ChannelsModule } from './channels/channels.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PostsModule } from './posts/posts.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object(({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        PORT: Joi.number().default(4000),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_CURRENCY: Joi.string().required(),
        JANUS_URL: Joi.string().required(),
        JANUS_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        IOS_GOOGLE_CLIENT_ID: Joi.string().required(),
        FRONTEND_URL: Joi.string(),
      }))
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: configService.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
        keepConnectionAlive: true,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      //installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
    }),
    UsersModule,
    AuthModule,
    DealsModule,
    ImagesModule,
    StripeModule,
    OrdersModule,
    ChannelsModule,
    PubSubModule,
    MembershipsModule,
    PostsModule,
    DevicesModule,
  ],
})
export class AppModule {}
