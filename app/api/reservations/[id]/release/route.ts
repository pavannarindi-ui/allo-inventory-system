import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: {
    params: { id: string }
  }
) {

  try {

    await prisma.$transaction(
      async (tx) => {

        const reservation =
          await tx.reservation.findUnique({
            where: {
              id: params.id,
            },
          });

        if (!reservation) {
          throw new Error(
            "NOT_FOUND"
          );
        }

        if (
          reservation.status !==
          "PENDING"
        ) {
          throw new Error(
            "INVALID_STATUS"
          );
        }

        await tx.inventory.update({
          where: {
            productId_warehouseId: {
              productId:
                reservation.productId,

              warehouseId:
                reservation.warehouseId,
            },
          },

          data: {
            reservedStock: {
              decrement:
                reservation.quantity,
            },
          },
        });

        await tx.reservation.update({
          where: {
            id: params.id,
          },

          data: {
            status: "RELEASED",
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
    });

  } catch {

    return NextResponse.json(
      {
        error: "Release failed",
      },
      {
        status: 500,
      }
    );
  }
}