import * as bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedUserInput = {
  username: string;
  password: string;
  displayName?: string;
};

async function main() {
  const users = await seedUsers({
    admin: {
      username: "admin",
      password: "admin123",
      displayName: "Administrator",
    },
    teacher: {
      username: "teacher",
      password: "teacher123",
      displayName: "Teacher One",
    },
    student: {
      username: "student",
      password: "student123",
      displayName: "Student One",
    },
  });

  console.log("Seed completed:", users);
}

async function seedUsers(input: {
  admin: SeedUserInput;
  teacher: SeedUserInput;
  student: SeedUserInput;
}) {
  const [admin, teacher, student] = await Promise.all([
    createUser(input.admin, Role.ADMIN),
    createUser(input.teacher, Role.TEACHER),
    createUser(input.student, Role.STUDENT),
  ]);

  return { admin, teacher, student };
}

async function createUser(input: SeedUserInput, role: Role) {
  const hash = await bcrypt.hash(input.password, 10);

  return prisma.user.upsert({
    where: { username: input.username },
    update: {
      password: hash,
      role,
      displayName: input.displayName ?? null,
    },
    create: {
      username: input.username,
      password: hash,
      role,
      displayName: input.displayName ?? null,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
