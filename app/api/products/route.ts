import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  const products = await prisma.product.findMany({
    include: {
      inventories: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  const formatted = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,

    inventories: product.inventories.map((inv) => ({
      warehouse: inv.warehouse.name,
      totalStock: inv.totalStock,
      reservedStock: inv.reservedStock,
      availableStock:
        inv.totalStock - inv.reservedStock,
      warehouseId: inv.warehouseId,
    })),
  }));

  return NextResponse.json(formatted);
}