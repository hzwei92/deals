import { Test, TestingModule } from '@nestjs/testing';
import { DealsController } from './deals.controller';

describe('DealsController', () => {
  let controller: DealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealsController],
    }).compile();

    controller = module.get<DealsController>(DealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
