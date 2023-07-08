import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/gql-auth.guard';
import { Image } from 'src/images/image.model';
import { ImagesService } from 'src/images/images.service';
import { Deal } from './deal.model';
import { DealsService } from './deals.service';

@Resolver(() => Deal)
export class DealsResolver {
  constructor(
    private readonly dealsService: DealsService,
    private readonly imagesService: ImagesService,
  ) {}
  
  @ResolveField(() => Image, {name: 'image'})
  async getDealImage(
    @Parent() deal: Deal
  ) {
    const image = await this.imagesService.findOne(deal.imageId);
    const b64encoded = Buffer.from(image.data).toString('base64');
    image.data = b64encoded as any;
    return image;
  }


  //@UseGuards(AuthGuard)
  @Mutation(() => [Deal], {name: 'getDeals'})
  async getDeals() {
    return this.dealsService.findAll();
  }
}
