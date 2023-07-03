import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ImagesService } from 'src/images/images.service';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(
    private readonly dealsService: DealsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post('add-deal')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addDeal(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const image = await this.imagesService.createOne(file);
    return this.dealsService.createOne(body.name, body.detail, parseInt(body.price), parseInt(body.discountPrice), image);
  }
}
