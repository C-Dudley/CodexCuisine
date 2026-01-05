import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ingredients...");

  await prisma.ingredient.createMany({
    data: [
      { name: "Chicken", unit: "lbs", category: "Meat" },
      { name: "Olive Oil", unit: "cups", category: "Pantry" },
      { name: "Salt", unit: "tsp", category: "Pantry" },
    ],
  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
