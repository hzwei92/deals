import { Test, TestingModule } from '@nestjs/testing';
import { ApnService } from './apn.service';

describe('ApnService', () => {
  let service: ApnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApnService],
    }).compile();

    service = module.get<ApnService>(ApnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
