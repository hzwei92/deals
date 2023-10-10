import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsResolver } from './memberships.resolver';

describe('MembershipsResolver', () => {
  let resolver: MembershipsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipsResolver],
    }).compile();

    resolver = module.get<MembershipsResolver>(MembershipsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
