import { PrismaClient } from '@prisma/client';
import { Pool, types } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Ensure BIGINT is parsed as string/number to prevent serialization issues
types.setTypeParser(20, (val) => parseInt(val, 10));

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
