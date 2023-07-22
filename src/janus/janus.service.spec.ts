import { Test, TestingModule } from '@nestjs/testing';
import { JanusService } from './janus.service';

describe('JanusService', () => {
  let service: JanusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JanusService],
    }).compile();

    service = module.get<JanusService>(JanusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
