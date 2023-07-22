import { Test, TestingModule } from '@nestjs/testing';
import { JanusResolver } from './janus.resolver';

describe('JanusResolver', () => {
  let resolver: JanusResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JanusResolver],
    }).compile();

    resolver = module.get<JanusResolver>(JanusResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
