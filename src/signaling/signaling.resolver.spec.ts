import { Test, TestingModule } from '@nestjs/testing';
import { SignalingResolver } from './signaling.resolver';

describe('SignalingResolver', () => {
  let resolver: SignalingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignalingResolver],
    }).compile();

    resolver = module.get<SignalingResolver>(SignalingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
