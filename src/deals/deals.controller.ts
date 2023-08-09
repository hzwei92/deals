import { Body, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ImagesService } from 'src/images/images.service';
import { DealsService } from './deals.service';
import { User } from 'src/users/user.entity';

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
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req['user'] as User;
    const image = await this.imagesService.createOne(file);
    return this.dealsService.createOne(
      user.id, 
      body.name,
      body.detail, 
      parseInt(body.quantity), 
      parseInt(body.price), 
      image
    );
  }
}
