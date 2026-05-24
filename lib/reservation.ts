import { prisma } from "./prisma";
import { addMinutes } from "date-fns";

export async function createReservation(
  productId: string,
  warehouseId: string,
  quantity: number
) {

  return prisma.$transaction(async (tx) => {

    const inventoryRows =
      await tx.$queryRawUnsafe<any[]>(`
        SELECT *
        FROM "Inventory"
        WHERE "productId" = '${productId}'
        AND "warehouseId" = '${warehouseId}'
        FOR UPDATE
      `);

    const inventory = inventoryRows[0];

    if (!inventory) {
      throw new Error("INVENTORY_NOT_FOUND");
    }

    const availableStock =
      inventory.totalStock -
      inventory.reservedStock;

    if (availableStock < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    await tx.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });

    const reservation =
      await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt: addMinutes(
            new Date(),
            10
          ),
        },
      });

    return reservation;
  });
}