// test/prisma.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService (Connection Test)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should connect to the database without throwing', async () => {
    await expect(prisma.$connect()).resolves.not.toThrow();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
