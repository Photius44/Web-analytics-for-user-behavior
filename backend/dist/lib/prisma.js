"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
// Ensure BIGINT is parsed as string/number to prevent serialization issues
pg_1.types.setTypeParser(20, (val) => parseInt(val, 10));
const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg_1.Pool({ connectionString });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({ adapter });
};
const prisma = globalThis.prisma ?? prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = prisma;
