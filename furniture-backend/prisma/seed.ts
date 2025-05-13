import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// const userData: Prisma.UserCreateInput[] = [
//   {
//     phone: "788999881",
//     password: "",
//     randomToken: "asdfsadfasdfsadfasdf",
//   },
//   {
//     phone: "788999882",
//     password: "",
//     randomToken: "asdfsadfasdfsadfasdf",
//   },
//   {
//     phone: "788999883",
//     password: "",
//     randomToken: "asdfsadfasdfsadfasdf",
//   },
//   {
//     phone: "788999884",
//     password: "",
//     randomToken: "asdfsadfasdfsadfasdf",
//   },
//   {
//     phone: "788999885",
//     password: "",
//     randomToken: "asdfsadfasdfsadfasdf",
//   },
// ];

export function createRandomUser() {
  return {
    phone: faker.phone.number({ style: "international" }),
    password: "",
    randomToken: faker.internet.jwt(),
  };
}

export const users = faker.helpers.multiple(createRandomUser, { count: 5 });

async function main() {
  console.log("Start Seeding.");
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("12345678", salt);
  for (const u of users) {
    u.password = password;
    await prisma.user.create({ data: u });
  }
}

main()
  .then(async () => {
    console.log("data seedind is finished.");
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log("error", err);
    await prisma.$disconnect();
    process.exit(1);
  });
