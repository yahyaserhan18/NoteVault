import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required');
    }

    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    const adminEmail = 'admin@smartmemo.com';

    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existing) {
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: 'ADMIN',
                firstName: 'Admin',
                lastName: 'User',
            },
        });
        console.log('Admin user seeded: admin@smartmemo.com / Admin@123');
    } else {
        console.log('Admin user already exists, skipping seed.');
    }

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
