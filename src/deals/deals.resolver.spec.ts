import { Test, TestingModule } from '@nestjs/testing';
import { DealsResolver } from './deals.resolver';

describe('DealsResolver', () => {
  let resolver: DealsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DealsResolver],
    }).compile();

    resolver = module.get<DealsResolver>(DealsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
