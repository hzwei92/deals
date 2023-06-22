import { Resolver } from '@nestjs/graphql';
import { Image } from './image.model';
import { ImagesService } from './images.service';

@Resolver(() => Image)
export class ImagesResolver {
  constructor(
    private readonly imagesService: ImagesService,
  ) {}
}
