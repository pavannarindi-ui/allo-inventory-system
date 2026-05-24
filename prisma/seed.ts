import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const warehouse1 =
    await prisma.warehouse.create({
      data: {
        name: "Hyderabad Warehouse",
        location: "Hyderabad",
      },
    });

  const warehouse2 =
    await prisma.warehouse.create({
      data: {
        name: "Chennai Warehouse",
        location: "Chennai",
      },
    });

  const product1 =
    await prisma.product.create({
      data: {
        name: "iPhone 15",
        description: "Apple smartphone",
      },
    });

  const product2 =
    await prisma.product.create({
      data: {
        name: "Samsung S25",
        description: "Samsung flagship phone",
      },
    });

  await prisma.inventory.createMany({
    data: [
      {
        productId: product1.id,
        warehouseId: warehouse1.id,
        totalStock: 10,
      },
      {
        productId: product1.id,
        warehouseId: warehouse2.id,
        totalStock: 5,
      },
      {
        productId: product2.id,
        warehouseId: warehouse1.id,
        totalStock: 8,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });